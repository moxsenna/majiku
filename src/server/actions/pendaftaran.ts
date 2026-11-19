"use server";

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { classes, studentEnrollments, students, trialApplications, tutors, waitingList } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";
import { todayInWib } from "@/lib/datetime";

/**
 * A4/A5 Pendaftaran & Trial — baca-saja, scope tenant. Tulis memakai action lama:
 * trial.ts (scheduleTrial, admitTrial — versi ber-scope tenant), waitingList.ts (create/updateStatus/promote).
 * Definisi:
 * - Kolom papan  = trial_status: Diajukan (submitted) · Terjadwal (scheduled, jadwal belum lewat) ·
 *   Perlu observasi (awaiting_review, atau scheduled yang jadwalnya sudah lewat) · Siap didaftarkan (recommended + repeat_trial) ·
 *   Jadi siswa (admitted). Tidak lanjut = not_suitable.
 * - Terlambat    = Perlu observasi yang jadwal trial-nya lewat > 2 hari tanpa catatan guru.
 * - Kelas penuh  = kapasitas terisi oleh anak aktif dengan enrollment aktif (sama dengan O1).
 * - Statistik    = trial yang diajukan bulan berjalan (WIB); jadi siswa = di antaranya yang admitted;
 *   rata-rata hari = diajukan → admitted untuk semua yang admitted.
 * BARU yang disembunyikan: sumber calon (kolom tidak ada), alasan tidak lanjut, tahap Hadir otomatis dari check-in,
 * tautan booking per lembaga, catat calon oleh admin, ingatkan guru.
 */

export type TahapTrial = "diajukan" | "terjadwal" | "observasi" | "siap" | "siswa" | "tidak";

export interface TrialItem {
  id: string;
  tahap: TahapTrial;
  status: string;
  childName: string;
  childBirthDate: string | null;
  childGender: string | null;
  allergies: string | null;
  medicalNotes: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  address: string | null;
  requestedStartDate: string | null;
  parentNotes: string | null;
  classId: string | null;
  className: string | null;
  tutorId: string | null;
  tutorName: string | null;
  trialScheduledAt: string | null;
  trialCompletedAt: string | null;
  recommendation: string | null;
  observationNotes: string | null;
  reviewedAt: string | null;
  admittedAt: string | null;
  admittedStudentId: string | null;
  createdAt: string | null;
  terlambat: boolean;
}

export interface TungguItem {
  id: string;
  studentName: string;
  parentName: string | null;
  parentPhone: string | null;
  classId: string | null;
  className: string | null;
  status: string;
  priority: number;
  notes: string | null;
  createdAt: string | null;
}

export interface KelasKursi {
  id: string;
  name: string;
  capacity: number | null;
  terisi: number;
}

export interface PendaftaranData {
  isDemo: boolean;
  diambilPada: string;
  bulanIni: string;
  trial: TrialItem[];
  tunggu: TungguItem[];
  kelas: KelasKursi[];
  guru: { id: string; name: string }[];
  statistik: { trialBulanIni: number; jadiSiswaBulanIni: number; rataHariDaftar: number | null };
}

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

function tahapDari(status: string, jadwal: Date | null, sekarang: number): TahapTrial {
  switch (status) {
    case "submitted":
      return "diajukan";
    case "scheduled":
      return jadwal && jadwal.getTime() < sekarang ? "observasi" : "terjadwal";
    case "awaiting_review":
      return "observasi";
    case "recommended":
    case "repeat_trial":
      return "siap";
    case "admitted":
      return "siswa";
    default:
      return "tidak";
  }
}

export async function getPendaftaran(): Promise<PendaftaranData> {
  const ctx = await requireTenantContext();
  const bulanIni = todayInWib().slice(0, 7);
  if (ctx.isDemo) return demoPendaftaran(bulanIni);

  const [trialRows, tungguRows, kelasRows, guru] = await Promise.all([
    db
      .select({ t: trialApplications, className: classes.name, tutorName: tutors.name })
      .from(trialApplications)
      .leftJoin(classes, eq(classes.id, trialApplications.classId))
      .leftJoin(tutors, eq(tutors.id, trialApplications.tutorId))
      .where(eq(trialApplications.tenantId, ctx.tenantId))
      .orderBy(desc(trialApplications.createdAt)),
    db
      .select({ w: waitingList, className: classes.name })
      .from(waitingList)
      .leftJoin(classes, eq(classes.id, waitingList.classId))
      .where(and(eq(waitingList.tenantId, ctx.tenantId), inArray(waitingList.status, ["waiting", "notified"])))
      .orderBy(desc(waitingList.priority), asc(waitingList.createdAt)),
    db
      .select({ id: classes.id, name: classes.name, capacity: classes.capacity })
      .from(classes)
      .where(and(eq(classes.tenantId, ctx.tenantId), eq(classes.isActive, true)))
      .orderBy(asc(classes.name)),
    db
      .select({ id: tutors.id, name: tutors.name })
      .from(tutors)
      .where(and(eq(tutors.tenantId, ctx.tenantId), eq(tutors.isActive, true)))
      .orderBy(asc(tutors.name)),
  ]);

  const ids = kelasRows.map((k) => k.id);
  const terisiRows = ids.length
    ? await db
        .select({ classId: studentEnrollments.classId, studentId: studentEnrollments.studentId })
        .from(studentEnrollments)
        .innerJoin(students, eq(students.id, studentEnrollments.studentId))
        .where(and(inArray(studentEnrollments.classId, ids), eq(studentEnrollments.isActive, true), eq(students.isActive, true)))
    : [];

  const sekarang = Date.now();
  const trial: TrialItem[] = trialRows.map(({ t, className, tutorName }) => {
    const tahap = tahapDari(t.status, t.trialScheduledAt, sekarang);
    return {
      id: t.id,
      tahap,
      status: t.status,
      childName: t.childName,
      childBirthDate: t.childBirthDate,
      childGender: t.childGender,
      allergies: t.allergies,
      medicalNotes: t.medicalNotes,
      parentName: t.parentName,
      parentPhone: t.parentPhone,
      parentEmail: t.parentEmail,
      address: t.address,
      requestedStartDate: t.requestedStartDate,
      parentNotes: t.parentNotes,
      classId: t.classId,
      className,
      tutorId: t.tutorId,
      tutorName,
      trialScheduledAt: iso(t.trialScheduledAt),
      trialCompletedAt: iso(t.trialCompletedAt),
      recommendation: t.recommendation,
      observationNotes: t.observationNotes,
      reviewedAt: iso(t.reviewedAt),
      admittedAt: iso(t.admittedAt),
      admittedStudentId: t.admittedStudentId,
      createdAt: iso(t.createdAt),
      terlambat: tahap === "observasi" && !!t.trialScheduledAt && sekarang - t.trialScheduledAt.getTime() > 2 * 86_400_000,
    };
  });

  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    bulanIni,
    trial,
    tunggu: tungguRows.map(({ w, className }) => ({
      id: w.id,
      studentName: w.studentName,
      parentName: w.parentName,
      parentPhone: w.parentPhone,
      classId: w.classId,
      className,
      status: w.status,
      priority: w.priority ?? 0,
      notes: w.notes,
      createdAt: iso(w.createdAt),
    })),
    kelas: kelasRows.map((k) => ({ ...k, terisi: terisiRows.filter((r) => r.classId === k.id).length })),
    guru,
    statistik: hitungStatistik(trial, bulanIni),
  };
}

function hitungStatistik(trial: TrialItem[], bulanIni: string) {
  const bulanWib = (s: string | null) => (s ? todayInWib(new Date(s)).slice(0, 7) : null);
  const bulan = trial.filter((t) => bulanWib(t.createdAt) === bulanIni);
  // Data impor lama bisa punya admitted_at sebelum created_at → dikecualikan, bukan dihitung negatif.
  const jadi = trial.filter((t) => t.admittedAt && t.createdAt && Date.parse(t.admittedAt) >= Date.parse(t.createdAt));
  return {
    trialBulanIni: bulan.length,
    jadiSiswaBulanIni: bulan.filter((t) => t.tahap === "siswa").length,
    rataHariDaftar: jadi.length
      ? Math.round(jadi.reduce((s, t) => s + (Date.parse(t.admittedAt!) - Date.parse(t.createdAt!)) / 86_400_000, 0) / jadi.length)
      : null,
  };
}

/* ------------------------------------------------------------------ */
/* Data demo — contoh frame desain A4/A5, bukan data lembaga mana pun      */
/* ------------------------------------------------------------------ */

function demoPendaftaran(bulanIni: string): PendaftaranData {
  const hari = (offset: number, jam = "09:00") => {
    const d = new Date(`${todayInWib()}T${jam}:00+07:00`);
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toISOString();
  };
  const lahir = (bulanUmur: number) => {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() - bulanUmur);
    return d.toISOString().slice(0, 10);
  };
  const dasar = {
    childGender: null,
    allergies: null,
    medicalNotes: null,
    parentEmail: null,
    address: null,
    requestedStartDate: null,
    parentNotes: null,
    tutorId: null,
    tutorName: null,
    trialScheduledAt: null,
    trialCompletedAt: null,
    recommendation: null,
    observationNotes: null,
    reviewedAt: null,
    admittedAt: null,
    admittedStudentId: null,
    terlambat: false,
  };
  const t = (p: Partial<TrialItem> & Pick<TrialItem, "id" | "tahap" | "status" | "childName">): TrialItem => ({
    ...dasar,
    childBirthDate: null,
    parentName: null,
    parentPhone: null,
    classId: null,
    className: null,
    createdAt: hari(-3),
    ...p,
  });
  const trial: TrialItem[] = [
    t({ id: "dt1", tahap: "diajukan", status: "submitted", childName: "Zara", childBirthDate: lahir(30), parentName: "Ibu Sinta", classId: "dk2", className: "Toddler A", createdAt: hari(-3) }),
    t({ id: "dt2", tahap: "diajukan", status: "submitted", childName: "Fathan", childBirthDate: lahir(48), parentName: "Bapak Rizal", classId: "dk4", className: "TK A", createdAt: hari(-2) }),
    t({ id: "dt3", tahap: "terjadwal", status: "scheduled", childName: "Naira", childBirthDate: lahir(38), parentName: "Ibu Wulan", classId: "dk3", className: "Playgroup B", tutorName: "Bu Ratna", trialScheduledAt: hari(0) }),
    t({ id: "dt4", tahap: "terjadwal", status: "scheduled", childName: "Elang", childBirthDate: lahir(22), parentName: "Ibu Tari", classId: "dk1", className: "Baby Bee", tutorName: "Bu Sari", trialScheduledAt: hari(0) }),
    t({ id: "dt5", tahap: "terjadwal", status: "scheduled", childName: "Gia", childBirthDate: lahir(60), parentName: "Ibu Nina", classId: "dk4", className: "TK A", tutorName: "Pak Yoga", trialScheduledAt: hari(1, "08:00") }),
    t({ id: "dt6", tahap: "observasi", status: "awaiting_review", childName: "Naura", childBirthDate: lahir(36), parentName: "Ibu Dewi", classId: "dk3", className: "Playgroup B", tutorName: "Bu Ratna", trialScheduledAt: hari(-5), terlambat: true }),
    t({ id: "dt7", tahap: "observasi", status: "awaiting_review", childName: "Arsy", childBirthDate: lahir(28), parentName: "Ibu Fitri", classId: "dk2", className: "Toddler A", tutorName: "Bu Dina", trialScheduledAt: hari(0, "08:00") }),
    t({
      id: "dt8",
      tahap: "siap",
      status: "recommended",
      childName: "Keisha Anindya",
      childBirthDate: lahir(32),
      childGender: "Perempuan",
      allergies: "Telur",
      parentName: "Ibu Maya Nugroho",
      parentPhone: "0812-3456-7781",
      classId: "dk2",
      className: "Toddler A",
      tutorName: "Bu Dina",
      trialScheduledAt: hari(-5, "08:00"),
      trialCompletedAt: hari(-5, "11:00"),
      recommendation: "suitable",
      observationNotes:
        "Datang ditemani ibu, 10 menit pertama memeluk ibu lalu ikut bermain balok. Makan snack sendiri. Mau tidur siang di matras. Sudah bisa bilang mau ke toilet.",
      reviewedAt: hari(-4, "15:00"),
      requestedStartDate: hari(5).slice(0, 10),
      createdAt: hari(-7),
    }),
    t({ id: "dt9", tahap: "siap", status: "repeat_trial", childName: "Bagas", childBirthDate: lahir(53), parentName: "Ibu Lia", classId: "dk4", className: "TK A", tutorName: "Pak Yoga", recommendation: "repeat_trial", observationNotes: "Masih menangis lebih dari 30 menit.", reviewedAt: hari(-2) }),
    t({ id: "dt10", tahap: "siswa", status: "admitted", childName: "Kenzo N.", classId: "dk4", className: "TK A", admittedAt: hari(-9), createdAt: hari(-15) }),
    t({ id: "dt11", tahap: "siswa", status: "admitted", childName: "Alya R.", classId: "dk2", className: "Toddler A", admittedAt: hari(-13), createdAt: hari(-18) }),
    t({ id: "dt12", tahap: "tidak", status: "not_suitable", childName: "Raka", classId: "dk1", className: "Baby Bee", recommendation: "not_suitable", observationNotes: "Belum siap berpisah dari orang tua.", reviewedAt: hari(-10) }),
  ];
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    bulanIni,
    trial,
    tunggu: [
      { id: "dw1", studentName: "Fathan", parentName: "Bapak Rizal", parentPhone: null, classId: "dk4", className: "TK A", status: "waiting", priority: 0, notes: null, createdAt: hari(-2) },
      { id: "dw2", studentName: "Mikha", parentName: "Ibu Sari", parentPhone: null, classId: "dk3", className: "Playgroup B", status: "notified", priority: 1, notes: "Siap masuk Januari", createdAt: hari(-12) },
    ],
    kelas: [
      { id: "dk1", name: "Baby Bee", capacity: 8, terisi: 6 },
      { id: "dk2", name: "Toddler A", capacity: 12, terisi: 10 },
      { id: "dk3", name: "Playgroup B", capacity: 12, terisi: 11 },
      { id: "dk4", name: "TK A", capacity: 12, terisi: 12 },
    ],
    guru: [],
    statistik: { trialBulanIni: 11, jadiSiswaBulanIni: 4, rataHariDaftar: 6 },
  };
}
