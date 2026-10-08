"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user, userRoles, students } from "@/db/schema";
import { auth } from "@/server/auth";

export interface RegisterAdminInput {
  institutionName: string;
  institutionType: string;
  name: string;
  email: string;
  phone?: string;
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

  // Jika menyertakan data anak, buat data profil anak awal
  if (childName) {
    await db
      .insert(students)
      .values({
        id: crypto.randomUUID(),
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

  return { success: true, userId: res.user.id, email: res.user.email };
}
