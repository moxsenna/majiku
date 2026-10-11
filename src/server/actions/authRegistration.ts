"use server";

import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { user, userRoles, students, tenants, trialApplications, classes } from "@/db/schema";
import { auth } from "@/server/auth";

export interface RegisterAdminInput {
  institutionName: string;
  institutionType: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  password: string;
}

export interface RegisterParentInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  childName?: string;
  childBirthDate?: string;
}

export async function registerDaycareAdminAction(input: RegisterAdminInput) {
  const email = input.email?.trim().toLowerCase();
  const name = input.name?.trim();
  const password = input.password;
  const institutionName = input.institutionName?.trim();

  if (!email || !email.includes("@")) {
    throw new Error("Format email tidak valid");
  }
  if (!name || name.length < 2) {
    throw new Error("Nama lengkap minimal 2 karakter");
  }
  if (!institutionName || institutionName.length < 2) {
    throw new Error("Nama lembaga wajib diisi (minimal 2 karakter)");
  }
  if (!password || password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  // Cek apakah email sudah terdaftar
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Email ini sudah terdaftar. Silakan gunakan menu Masuk.");
  }

  const h = await headers();
  const res = await auth.api.signUpEmail({
    headers: h,
    body: {
      name,
      email,
      password,
    },
  });

  if (!res || !res.user) {
    throw new Error("Gagal mendaftarkan akun lembaga");
  }

  // Berikan role 'admin' (Daycare Admin)
  await db
    .insert(userRoles)
    .values({
      id: crypto.randomUUID(),
      userId: res.user.id,
      role: "admin",
    })
    .onConflictDoNothing();

  // Daftarkan lembaga ke tabel tenants
  const tenantSlug =
    institutionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    crypto.randomUUID().slice(0, 6);

  const mappedType =
    input.institutionType === "preschool" || input.institutionType === "bimbel"
      ? input.institutionType
      : "daycare";

  await db
    .insert(tenants)
    .values({
      id: crypto.randomUUID(),
      name: institutionName,
      slug: tenantSlug,
      type: mappedType,
      // Kota dari input pendaftar; fallback "Jakarta" hanya bila tidak diisi
      city: input.city?.trim() || "Jakarta",
      priceFrom: "2000000",
      whatsapp: input.phone || null,
      isVerified: false,
      isActive: true,
      // Tautkan pemilik lembaga ke akun admin pembuat
      adminUserId: res.user.id,
    })
    .onConflictDoNothing();

  return { success: true, userId: res.user.id, email: res.user.email };
}

export async function registerParentAction(input: RegisterParentInput) {
  const email = input.email?.trim().toLowerCase();
  const name = input.name?.trim();
  const password = input.password;
  const childName = input.childName?.trim();

  if (!email || !email.includes("@")) {
    throw new Error("Format email tidak valid");
  }
  if (!name || name.length < 2) {
    throw new Error("Nama orang tua minimal 2 karakter");
  }
  if (!password || password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  // Cek apakah email sudah terdaftar
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Email ini sudah terdaftar. Silakan gunakan menu Masuk.");
  }

  const h = await headers();
  const res = await auth.api.signUpEmail({
    headers: h,
    body: {
      name,
      email,
      password,
    },
  });

  if (!res || !res.user) {
    throw new Error("Gagal mendaftarkan akun orang tua");
  }

  // Berikan role 'parent' (Orang Tua)
  await db
    .insert(userRoles)
    .values({
      id: crypto.randomUUID(),
      userId: res.user.id,
      role: "parent",
    })
    .onConflictDoNothing();

  // 1. Sinkronisasi otomatis: Hubungkan semua siswa yang telah didaftarkan lembaga dengan email ini
  await db
    .update(students)
    .set({
      parentUserId: res.user.id,
      parentName: name,
      parentPhone: input.phone?.trim() || undefined,
      updatedAt: new Date(),
    })
    .where(eq(students.parentEmail, email));

  // 2. Sinkronisasi otomatis: Hubungkan pengajuan trial yang dibuat dengan email ini
  await db
    .update(trialApplications)
    .set({
      parentUserId: res.user.id,
      updatedAt: new Date(),
    })
    .where(eq(trialApplications.parentEmail, email));

  // 3. Jika menyertakan data anak, buat data profil anak jika belum ada di database.
  // tenantId anak di-derive dari pengajuan trial / anak terhubung (lembaga yang diajak);
  // bila belum ada afiliasi lembaga, pembuatan profil anak ditunda sampai pendaftaran program.
  if (childName) {
    const existing = await db
      .select({ id: students.id })
      .from(students)
      .where(and(eq(students.parentUserId, res.user.id), eq(students.name, childName)))
      .limit(1);

    if (existing.length === 0) {
      // Derive tenant: dari pengajuan trial via email ini -> kelasnya -> lembaganya
      const [trialRow] = await db
        .select({ classId: trialApplications.classId })
        .from(trialApplications)
        .where(eq(trialApplications.parentEmail, email))
        .limit(1);
      let childTenantId: string | null = null;
      if (trialRow?.classId) {
        const [cls] = await db
          .select({ tenantId: classes.tenantId })
          .from(classes)
          .where(eq(classes.id, trialRow.classId))
          .limit(1);
        childTenantId = cls?.tenantId ?? null;
      }
      if (!childTenantId) {
        const [linked] = await db
          .select({ tenantId: students.tenantId })
          .from(students)
          .where(eq(students.parentUserId, res.user.id))
          .limit(1);
        childTenantId = linked?.tenantId ?? null;
      }

      if (childTenantId) {
        await db
          .insert(students)
          .values({
            id: crypto.randomUUID(),
            tenantId: childTenantId,
            name: childName,
            dateOfBirth: input.childBirthDate || null,
            parentUserId: res.user.id,
            parentName: name,
            parentPhone: input.phone?.trim() || null,
            parentEmail: email,
            registrationDate: new Date().toISOString().slice(0, 10),
            isActive: true,
          })
          .onConflictDoNothing();
      }
    }
  }

  return { success: true, userId: res.user.id, email: res.user.email };
}
