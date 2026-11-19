"use server";

import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { classes, studentEnrollments, students, tutorClassAssignments, tutors, user } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";

/**
 * K6 (bagian yang ada) Pengaturan lembaga + O13 Staf — baca-saja, scope tenant. Tulis memakai action lama:
 * adminDashboard.ts (updateTenantProfile: nama, WhatsApp, alamat), tutorsCrud.ts (create/update/toggle/link/assign/remove).
 * Definisi:
 * - Pemilik      = akun tenants.admin_user_id.
 * - Staf          = baris tutors milik tenant. Status: Aktif (punya akun tertaut) · Belum punya akun (tanpa akun) · Nonaktif.
 * - Kelas staf    = penugasan aktif (tutor_class_assignments) ke kelas aktif.
 * - Ringkasan     = anak aktif ber-enrollment aktif, kelas aktif + total kapasitas, staf aktif.
 * BARU yang disembunyikan: seluruh pengaturan penagihan K6 (jadwal terbit, pengingat, rekening, denda, biaya transaksi),
 * peran per lembaga (Keuangan/Admin), undangan staf, matriks izin, cabang, logo.
 */

export interface StafItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  isActive: boolean;
  akun: { id: string; email: string } | null;
  kelas: { assignmentId: string; classId: string; name: string; ratePerSession: string | null }[];
}

export interface PengaturanData {
  isDemo: boolean;
  diambilPada: string;
  lembaga: {
    name: string;
    slug: string;
    type: "daycare" | "preschool" | "bimbel";
    city: string;
    address: string | null;
    whatsapp: string | null;
    isVerified: boolean;
  };
  pemilik: { name: string; email: string } | null;
  ringkasan: { anakAktif: number; kelasAktif: number; kapasitas: number; stafAktif: number };
  staf: StafItem[];
  kelas: { id: string; name: string }[];
  akunBisaDitaut: { id: string; name: string; email: string }[];
}

export async function getPengaturan(): Promise<PengaturanData> {
  const ctx = await requireTenantContext();
  if (ctx.isDemo) return demoPengaturan();
  const t = ctx.tenant;

  const [pemilik, stafRows, kelasRows] = await Promise.all([
    t.adminUserId
      ? db.select({ name: user.name, email: user.email }).from(user).where(eq(user.id, t.adminUserId)).limit(1)
      : Promise.resolve([]),
    db
      .select({ t: tutors, akunEmail: user.email })
      .from(tutors)
      .leftJoin(user, eq(user.id, tutors.userId))
      .where(eq(tutors.tenantId, ctx.tenantId))
      .orderBy(asc(tutors.name)),
    db
      .select({ id: classes.id, name: classes.name, capacity: classes.capacity })
      .from(classes)
      .where(and(eq(classes.tenantId, ctx.tenantId), eq(classes.isActive, true)))
      .orderBy(asc(classes.name)),
  ]);

  const tutorIds = stafRows.map((r) => r.t.id);
  const classIds = kelasRows.map((k) => k.id);
  const [tugas, anak, akunTertaut] = await Promise.all([
    tutorIds.length && classIds.length
      ? db
          .select({
            assignmentId: tutorClassAssignments.id,
            tutorId: tutorClassAssignments.tutorId,
            classId: tutorClassAssignments.classId,
            ratePerSession: tutorClassAssignments.ratePerSession,
          })
          .from(tutorClassAssignments)
          .where(
            and(
              inArray(tutorClassAssignments.tutorId, tutorIds),
              inArray(tutorClassAssignments.classId, classIds),
              eq(tutorClassAssignments.isActive, true),
            ),
          )
      : Promise.resolve([]),
    classIds.length
      ? db
          .selectDistinct({ id: students.id })
          .from(studentEnrollments)
          .innerJoin(students, eq(students.id, studentEnrollments.studentId))
          .where(
            and(
              eq(students.tenantId, ctx.tenantId),
              eq(students.isActive, true),
              eq(studentEnrollments.isActive, true),
              inArray(studentEnrollments.classId, classIds),
            ),
          )
      : Promise.resolve([]),
    // Akun yang bisa ditautkan: hanya akun yang emailnya sama dengan email staf di lembaga ini dan belum tertaut —
    // tidak membuka daftar seluruh pengguna platform.
    (() => {
      const emails = stafRows.filter((r) => !r.t.userId && r.t.email).map((r) => r.t.email!.toLowerCase());
      return emails.length
        ? db.select({ id: user.id, name: user.name, email: user.email }).from(user).where(inArray(user.email, emails))
        : Promise.resolve([] as { id: string; name: string; email: string }[]);
    })(),
  ]);
  const sudahTertaut = new Set(stafRows.map((r) => r.t.userId).filter(Boolean));
  const namaKelas = new Map(kelasRows.map((k) => [k.id, k.name]));

  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    lembaga: {
      name: t.name,
      slug: t.slug,
      type: t.type,
      city: t.city,
      address: t.address,
      whatsapp: t.whatsapp,
      isVerified: !!t.isVerified,
    },
    pemilik: pemilik[0] ?? null,
    ringkasan: {
      anakAktif: anak.length,
      kelasAktif: kelasRows.length,
      kapasitas: kelasRows.reduce((s, k) => s + (k.capacity ?? 0), 0),
      stafAktif: stafRows.filter((r) => r.t.isActive).length,
    },
    staf: stafRows.map(({ t: s, akunEmail }) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      photoUrl: s.photoUrl,
      isActive: !!s.isActive,
      akun: s.userId && akunEmail ? { id: s.userId, email: akunEmail } : null,
      kelas: tugas
        .filter((a) => a.tutorId === s.id)
        .map((a) => ({ assignmentId: a.assignmentId, classId: a.classId, name: namaKelas.get(a.classId) ?? "", ratePerSession: a.ratePerSession })),
    })),
    kelas: kelasRows.map(({ id, name }) => ({ id, name })),
    akunBisaDitaut: akunTertaut.filter((a) => !sudahTertaut.has(a.id)),
  };
}

/* ------------------------------------------------------------------ */
/* Data demo — contoh frame desain O13, bukan data lembaga mana pun        */
/* ------------------------------------------------------------------ */

function demoPengaturan(): PengaturanData {
  const s = (id: string, name: string, phone: string, kelas: [string, string][], akun = true, isActive = true): StafItem => ({
    id,
    name,
    email: null,
    phone,
    photoUrl: null,
    isActive,
    akun: akun ? { id: `u-${id}`, email: `${name.split(" ")[0].toLowerCase()}@contoh.id` } : null,
    kelas: kelas.map(([classId, n]) => ({ assignmentId: `a-${id}-${classId}`, classId, name: n, ratePerSession: "50000" })),
  });
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    lembaga: {
      name: "Rumah Pelangi",
      slug: "rumah-pelangi",
      type: "preschool",
      city: "Bandung",
      address: "Jl. Contoh No. 12, Bandung",
      whatsapp: "0812-0000-0000",
      isVerified: true,
    },
    pemilik: { name: "Dewi Lestari", email: "dewi@contoh.id" },
    ringkasan: { anakAktif: 38, kelasAktif: 4, kapasitas: 44, stafAktif: 4 },
    staf: [
      s("ds1", "Sari Wulandari", "0813-2211-7744", [["dk1", "Baby Bee"]]),
      s("ds2", "Dina Marlina", "0857-4410-2219", [["dk2", "Toddler A"]]),
      s("ds3", "Ratna Sari", "0812-9087-1133", [["dk3", "Playgroup B"]]),
      s("ds4", "Yoga Pratama", "0821-3300-5512", [["dk4", "TK A"]], false),
    ],
    kelas: [
      { id: "dk1", name: "Baby Bee" },
      { id: "dk2", name: "Toddler A" },
      { id: "dk3", name: "Playgroup B" },
      { id: "dk4", name: "TK A" },
    ],
    akunBisaDitaut: [],
  };
}
