"use server";

import { and, asc, desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  attendance,
  classes,
  dailyReports,
  invoices,
  studentEnrollments,
  students,
  trialApplications,
} from "@/db/schema";
import { requireTenantContext } from "@/server/authz";
import { todayInWib } from "@/lib/datetime";

/**
 * S1 Siswa & A2 Profil anak — baca-saja, selalu di-scope ke tenant admin.
 *
 * Definisi:
 * - Tagihan bulan ini = tagihan dengan periode bulan berjalan (billing_period_start, atau tanggal dibuat bila kosong).
 *   Bila ada lebih dari satu, yang paling butuh perhatian yang tampil. Tagihan belum Lunas yang lewat jatuh tempo = Terlambat.
 *   Tanpa tagihan + punya kelas aktif + tanggal tagih sudah tiba = Perlu Ditagih.
 * - Akun wali "Aktif" = siswa tertaut ke akun pengguna orang tua (parent_user_id). Status "Diundang" belum
 *   tercatat di sistem, jadi selain Aktif ditulis "Belum tertaut".
 * - Kesehatan & kontak darurat hanya ada di formulir trial (trial_applications) yang menerima anak ini.
 */

export type StatusTagihanSiswa =
  | { jenis: "invoice"; status: "paid" | "unpaid" | "partial" | "overdue"; hariTerlambat: number }
  | { jenis: "perlu-ditagih" }
  | { jenis: "belum-waktunya" }
  | { jenis: "tanpa-kelas" };

export interface SiswaRow {
  id: string;
  name: string;
  dateOfBirth: string | null;
  photoUrl: string | null;
  isActive: boolean;
  kelas: { id: string; name: string }[];
  wali: { name: string | null; phone: string | null; email: string | null; tertaut: boolean };
  tagihan: StatusTagihanSiswa;
  /** Ringkasan alergi dari formulir trial, bila ada */
  alergi: string | null;
}

const URUTAN_TAGIHAN = { overdue: 0, partial: 1, unpaid: 2, paid: 3 } as const;

function periodeInvoice() {
  return sql<string>`to_char(coalesce(${invoices.billingPeriodStart}, (${invoices.createdAt} AT TIME ZONE 'Asia/Jakarta')::date), 'YYYY-MM')`;
}

function hariSejak(tanggal: string, acuan: string) {
  return Math.round((Date.parse(acuan) - Date.parse(tanggal)) / 86_400_000);
}

function alergiBermakna(v: string | null | undefined) {
  const t = (v ?? "").trim();
  if (!t || /^(-|tidak|tidak ada|ga ada|nggak|none|no)$/i.test(t)) return null;
  return t;
}

export async function listSiswa(): Promise<SiswaRow[]> {
  const ctx = await requireTenantContext();
  const tanggal = todayInWib();
  const ym = tanggal.slice(0, 7);
  const hari = Number(tanggal.slice(8, 10));

  const siswaRows = await db
    .select({
      id: students.id,
      name: students.name,
      dateOfBirth: students.dateOfBirth,
      photoUrl: students.photoUrl,
      isActive: students.isActive,
      parentUserId: students.parentUserId,
      parentName: students.parentName,
      parentPhone: students.parentPhone,
      parentEmail: students.parentEmail,
    })
    .from(students)
    .where(eq(students.tenantId, ctx.tenantId))
    .orderBy(asc(students.name));
  if (siswaRows.length === 0) return [];
  const ids = siswaRows.map((s) => s.id);

  const [enr, inv, trial] = await Promise.all([
    db
      .select({ studentId: studentEnrollments.studentId, classId: classes.id, className: classes.name, billingDay: studentEnrollments.billingDay })
      .from(studentEnrollments)
      .innerJoin(classes, eq(classes.id, studentEnrollments.classId))
      .where(and(inArray(studentEnrollments.studentId, ids), eq(studentEnrollments.isActive, true), eq(classes.tenantId, ctx.tenantId))),
    db
      .select({ studentId: invoices.studentId, status: invoices.status, dueDate: invoices.dueDate })
      .from(invoices)
      .where(and(inArray(invoices.studentId, ids), sql`${periodeInvoice()} = ${ym}`)),
    db
      .select({ studentId: trialApplications.admittedStudentId, allergies: trialApplications.allergies })
      .from(trialApplications)
      .where(and(eq(trialApplications.tenantId, ctx.tenantId), inArray(trialApplications.admittedStudentId, ids))),
  ]);

  return siswaRows.map((s) => {
    const kelas = enr.filter((e) => e.studentId === s.id);
    const tagihanSiswa = inv
      .filter((i) => i.studentId === s.id)
      .map((i) => {
        const telat = i.status !== "paid" && i.dueDate && String(i.dueDate) < tanggal;
        const status = (telat ? "overdue" : i.status) as keyof typeof URUTAN_TAGIHAN;
        return { status, hariTerlambat: telat && i.dueDate ? hariSejak(String(i.dueDate), tanggal) : 0 };
      })
      .sort((a, b) => URUTAN_TAGIHAN[a.status] - URUTAN_TAGIHAN[b.status]);

    let tagihan: StatusTagihanSiswa;
    if (tagihanSiswa[0]) tagihan = { jenis: "invoice", ...tagihanSiswa[0] };
    else if (kelas.length === 0) tagihan = { jenis: "tanpa-kelas" };
    else if (kelas.some((k) => !k.billingDay || k.billingDay <= hari)) tagihan = { jenis: "perlu-ditagih" };
    else tagihan = { jenis: "belum-waktunya" };

    return {
      id: s.id,
      name: s.name,
      dateOfBirth: s.dateOfBirth ? String(s.dateOfBirth) : null,
      photoUrl: s.photoUrl,
      isActive: s.isActive ?? true,
      kelas: kelas.map((k) => ({ id: k.classId, name: k.className })),
      wali: { name: s.parentName, phone: s.parentPhone, email: s.parentEmail, tertaut: !!s.parentUserId },
      tagihan,
      alergi: alergiBermakna(trial.find((t) => t.studentId === s.id)?.allergies),
    };
  });
}

/* ------------------------------------------------------------------ */
/* A2 Profil anak                                                       */
/* ------------------------------------------------------------------ */

export interface ProfilSiswa {
  tanggal: string;
  siswa: {
    id: string;
    name: string;
    dateOfBirth: string | null;
    photoUrl: string | null;
    isActive: boolean;
    registrationDate: string | null;
    parentUserId: string | null;
    parentName: string | null;
    parentPhone: string | null;
    parentEmail: string | null;
  };
  kelas: { enrollmentId: string; id: string; name: string; sessionsQuota: number | null; sessionsUsed: number | null; billingDay: number | null; pricePerMonth: number | null }[];
  kesehatan: {
    sumber: { tanggal: string | null };
    alergi: string | null;
    catatanMedis: string | null;
    kontakDarurat: string | null;
    teleponDarurat: string | null;
  } | null;
  kehadiranBulanIni: {
    periode: { year: number; month: number };
    hadir: number;
    terlambat: number;
    izin: number;
    sakit: number;
    alpa: number;
    rataTiba: string | null;
    hari: { tanggal: string; status: string; permitType: string | null }[];
  };
  kehadiranTerbaru: { id: string; tanggal: string; status: string; permitType: string | null; checkIn: string | null; checkOut: string | null; kelas: string | null }[];
  tagihan: { id: string; nomor: string; total: number; status: string; periodeMulai: string | null; dueDate: string | null; paidAt: string | null }[];
  laporan: { id: string; tanggal: string; mood: string | null; meals: string | null; nap: string | null; activities: string | null; notes: string | null; fotoCount: number; status: string }[];
  saudara: { id: string; name: string; dateOfBirth: string | null; kelas: string | null }[];
}

export async function getProfilSiswa(id: string): Promise<ProfilSiswa | null> {
  const ctx = await requireTenantContext();
  if (!id) return null;
  const tanggal = todayInWib();
  const [year, month] = tanggal.split("-").map(Number);
  const awalBulan = `${tanggal.slice(0, 7)}-01`;

  const [s] = await db
    .select()
    .from(students)
    .where(and(eq(students.id, id), eq(students.tenantId, ctx.tenantId)))
    .limit(1);
  if (!s) return null;

  const kunciKeluarga = [
    s.parentUserId ? eq(students.parentUserId, s.parentUserId) : null,
    s.parentEmail ? sql`lower(${students.parentEmail}) = ${s.parentEmail.toLowerCase()}` : null,
    s.parentPhone ? eq(students.parentPhone, s.parentPhone) : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);

  const [kelas, trial, absenBulan, absenTerbaru, tagihan, laporan, saudara] = await Promise.all([
    db
      .select({
        enrollmentId: studentEnrollments.id,
        id: classes.id,
        name: classes.name,
        sessionsQuota: studentEnrollments.sessionsQuota,
        sessionsUsed: studentEnrollments.sessionsUsed,
        billingDay: studentEnrollments.billingDay,
        pricePerMonth: classes.pricePerMonth,
      })
      .from(studentEnrollments)
      .innerJoin(classes, eq(classes.id, studentEnrollments.classId))
      .where(and(eq(studentEnrollments.studentId, id), eq(studentEnrollments.isActive, true), eq(classes.tenantId, ctx.tenantId))),
    db
      .select({
        allergies: trialApplications.allergies,
        medicalNotes: trialApplications.medicalNotes,
        emergencyContact: trialApplications.emergencyContact,
        emergencyPhone: trialApplications.emergencyPhone,
        createdAt: trialApplications.createdAt,
      })
      .from(trialApplications)
      .where(and(eq(trialApplications.tenantId, ctx.tenantId), eq(trialApplications.admittedStudentId, id)))
      .orderBy(desc(trialApplications.createdAt))
      .limit(1),
    db
      .select({ date: attendance.date, status: attendance.status, permitType: attendance.permitType, checkInTime: attendance.checkInTime })
      .from(attendance)
      .where(and(eq(attendance.studentId, id), sql`${attendance.date} >= ${awalBulan}`, sql`${attendance.date} <= ${tanggal}`))
      .orderBy(asc(attendance.date)),
    db
      .select({
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        permitType: attendance.permitType,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        kelas: classes.name,
      })
      .from(attendance)
      .leftJoin(classes, eq(classes.id, attendance.classId))
      .where(eq(attendance.studentId, id))
      .orderBy(desc(attendance.date))
      .limit(30),
    db
      .select({
        id: invoices.id,
        nomor: invoices.invoiceNumber,
        total: invoices.total,
        status: invoices.status,
        periodeMulai: invoices.billingPeriodStart,
        dueDate: invoices.dueDate,
        paidAt: invoices.paidAt,
      })
      .from(invoices)
      .where(eq(invoices.studentId, id))
      .orderBy(desc(sql`coalesce(${invoices.billingPeriodStart}, ${invoices.dueDate})`))
      .limit(24),
    db
      .select({
        id: dailyReports.id,
        tanggal: dailyReports.reportDate,
        mood: dailyReports.mood,
        meals: dailyReports.meals,
        nap: dailyReports.nap,
        activities: dailyReports.activities,
        notes: dailyReports.notes,
        photos: dailyReports.photos,
        status: dailyReports.status,
      })
      .from(dailyReports)
      .where(eq(dailyReports.studentId, id))
      .orderBy(desc(dailyReports.reportDate))
      .limit(20),
    kunciKeluarga.length
      ? db
          .select({ id: students.id, name: students.name, dateOfBirth: students.dateOfBirth, kelas: classes.name })
          .from(students)
          .leftJoin(studentEnrollments, and(eq(studentEnrollments.studentId, students.id), eq(studentEnrollments.isActive, true)))
          .leftJoin(classes, eq(classes.id, studentEnrollments.classId))
          .where(and(eq(students.tenantId, ctx.tenantId), sql`${students.id} <> ${id}`, or(...kunciKeluarga)))
      : Promise.resolve([]),
  ]);

  const hitung = { hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpa: 0 };
  const jamTiba: number[] = [];
  for (const a of absenBulan) {
    if (a.status === "present") hitung.hadir++;
    else if (a.status === "late") hitung.terlambat++;
    else if (a.status === "permit" && a.permitType === "sick") hitung.sakit++;
    else if (a.status === "permit") hitung.izin++;
    else if (a.status === "absent") hitung.alpa++;
    if ((a.status === "present" || a.status === "late") && a.checkInTime) {
      const [h, m] = String(a.checkInTime).split(":").map(Number);
      jamTiba.push(h * 60 + m);
    }
  }
  const rata = jamTiba.length ? Math.round(jamTiba.reduce((x, y) => x + y, 0) / jamTiba.length) : null;

  const t = trial[0];
  const kesehatan = t
    ? {
        sumber: { tanggal: t.createdAt ? todayInWib(t.createdAt) : null },
        alergi: t.allergies?.trim() || null,
        catatanMedis: t.medicalNotes?.trim() || null,
        kontakDarurat: t.emergencyContact?.trim() || null,
        teleponDarurat: t.emergencyPhone?.trim() || null,
      }
    : null;

  const saudaraUnik = new Map<string, ProfilSiswa["saudara"][number]>();
  for (const x of saudara) if (!saudaraUnik.has(x.id)) saudaraUnik.set(x.id, { id: x.id, name: x.name, dateOfBirth: x.dateOfBirth ? String(x.dateOfBirth) : null, kelas: x.kelas });

  return {
    tanggal,
    siswa: {
      id: s.id,
      name: s.name,
      dateOfBirth: s.dateOfBirth ? String(s.dateOfBirth) : null,
      photoUrl: s.photoUrl,
      isActive: s.isActive ?? true,
      registrationDate: s.registrationDate ? String(s.registrationDate) : null,
      parentUserId: s.parentUserId,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      parentEmail: s.parentEmail,
    },
    kelas: kelas.map((k) => ({ ...k, pricePerMonth: k.pricePerMonth === null ? null : Number(k.pricePerMonth) })),
    kesehatan: kesehatan && (kesehatan.alergi || kesehatan.catatanMedis || kesehatan.kontakDarurat) ? kesehatan : null,
    kehadiranBulanIni: {
      periode: { year, month },
      ...hitung,
      rataTiba: rata === null ? null : `${String(Math.floor(rata / 60)).padStart(2, "0")}:${String(rata % 60).padStart(2, "0")}`,
      hari: absenBulan.map((a) => ({ tanggal: String(a.date), status: a.status, permitType: a.permitType })),
    },
    kehadiranTerbaru: absenTerbaru.map((a) => ({
      id: a.id,
      tanggal: String(a.date),
      status: a.status,
      permitType: a.permitType,
      checkIn: a.checkInTime ? String(a.checkInTime) : null,
      checkOut: a.checkOutTime ? String(a.checkOutTime) : null,
      kelas: a.kelas,
    })),
    tagihan: tagihan.map((i) => ({
      id: i.id,
      nomor: i.nomor,
      total: Number(i.total) || 0,
      status: i.status !== "paid" && i.dueDate && String(i.dueDate) < tanggal ? "overdue" : i.status,
      periodeMulai: i.periodeMulai ? String(i.periodeMulai) : null,
      dueDate: i.dueDate ? String(i.dueDate) : null,
      paidAt: i.paidAt ? i.paidAt.toISOString() : null,
    })),
    laporan: laporan.map((r) => ({
      id: r.id,
      tanggal: String(r.tanggal),
      mood: r.mood,
      meals: r.meals,
      nap: r.nap,
      activities: r.activities,
      notes: r.notes,
      fotoCount: r.photos?.length ?? 0,
      status: r.status,
    })),
    saudara: [...saudaraUnik.values()],
  };
}

/** Kelas aktif lembaga untuk filter & formulir. */
export async function listKelasAktif(): Promise<{ id: string; name: string }[]> {
  const ctx = await requireTenantContext();
  return db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .where(and(eq(classes.tenantId, ctx.tenantId), eq(classes.isActive, true), isNotNull(classes.name)))
    .orderBy(asc(classes.name));
}

export interface KelasUntukDaftar {
  id: string;
  name: string;
  schedule: string | null;
  capacity: number | null;
  terisi: number;
  pricePerMonth: number | null;
  sessionsPerMonth: number | null;
}

/** D1: kelas aktif + kursi terisi (enrollment aktif) + harga, untuk langkah "Kelas". */
export async function listKelasUntukDaftar(): Promise<KelasUntukDaftar[]> {
  const ctx = await requireTenantContext();
  const rows = await db
    .select({
      id: classes.id,
      name: classes.name,
      schedule: classes.schedule,
      capacity: classes.capacity,
      pricePerMonth: classes.pricePerMonth,
      sessionsPerMonth: classes.sessionsPerMonth,
      terisi: sql<number>`(select count(*)::int from ${studentEnrollments} se join ${students} st on st.id = se.student_id where se.class_id = ${classes.id} and se.is_active = true and st.is_active = true)`,
    })
    .from(classes)
    .where(and(eq(classes.tenantId, ctx.tenantId), eq(classes.isActive, true)))
    .orderBy(asc(classes.name));
  return rows.map((r) => ({ ...r, pricePerMonth: r.pricePerMonth === null ? null : Number(r.pricePerMonth) }));
}
