"use server";

import { and, asc, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  classSchedules,
  classes,
  studentEnrollments,
  students,
  trialApplications,
  tutorClassAssignments,
  tutors,
  waitingList,
} from "@/db/schema";
import { requireTenantContext } from "@/server/authz";
import { todayInWib } from "@/lib/datetime";

/**
 * O1 Kelas & program + O2 Kalender sesi — baca-saja, scope tenant. Tulis memakai action lama
 * (classesCrud.ts: createClass/updateClass/toggleClassActive; schedules.ts: create/update/toggle/deleteClassSchedule).
 * Definisi:
 * - Terisi          = anak aktif dengan enrollment aktif di kelas itu (sama dengan O5).
 * - Kursi kosong    = kapasitas − terisi (kelas tanpa kapasitas: tidak dihitung).
 * - Daftar tunggu   = waiting_list berstatus waiting/notified untuk kelas itu.
 * - Trial mendatang = trial_applications terjadwal mulai hari ini, belum selesai, untuk kelas itu.
 * - Jadwal          = class_schedules aktif bertipe "class" (satu sumber; kolom teks classes.schedule tidak ditampilkan, N21).
 * - Guru kelas      = penugasan aktif (tutor_class_assignments).
 * O2 menampilkan jadwal mingguan berulang. BARU yang disembunyikan: sesi konkret per tanggal, deteksi "tanpa guru",
 * pengganti, dampak libur ke kuota/tagihan.
 */

export interface GuruRingkas {
  id: string;
  name: string;
}

export interface SlotJadwal {
  id: string;
  classId: string | null;
  title: string;
  dayOfWeek: number;
  startTime: string;
  durationMinutes: number;
  location: string | null;
  type: "class" | "activity" | "event" | "holiday";
  isActive: boolean;
}

export interface KelasProgram {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  pricePerMonth: string | null;
  sessionsPerMonth: number | null;
  location: string | null;
  isActive: boolean;
  guru: GuruRingkas[];
  terisi: number;
  daftarTunggu: number;
  trialMendatang: number;
  jadwal: SlotJadwal[];
}

export interface KelasProgramData {
  isDemo: boolean;
  diambilPada: string;
  kelas: KelasProgram[];
  guruPilihan: GuruRingkas[];
}

export interface KalenderData {
  isDemo: boolean;
  diambilPada: string;
  hariIni: string;
  /** Senin minggu berjalan (YYYY-MM-DD) */
  senin: string;
  kelas: { id: string; name: string; isActive: boolean; guru: GuruRingkas[] }[];
  slot: SlotJadwal[];
}

function seninDari(tanggal: string) {
  const [y, m, d] = tanggal.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  dt.setUTCDate(dt.getUTCDate() - (dow === 0 ? 6 : dow - 1));
  return dt.toISOString().slice(0, 10);
}

async function kelasDanGuru(tenantId: string) {
  const kelasRows = await db
    .select({
      id: classes.id,
      name: classes.name,
      description: classes.description,
      capacity: classes.capacity,
      pricePerMonth: classes.pricePerMonth,
      sessionsPerMonth: classes.sessionsPerMonth,
      location: classes.location,
      isActive: classes.isActive,
    })
    .from(classes)
    .where(eq(classes.tenantId, tenantId))
    .orderBy(asc(classes.name));
  const ids = kelasRows.map((k) => k.id);
  const [penugasan, slot] = ids.length
    ? await Promise.all([
        db
          .select({ classId: tutorClassAssignments.classId, id: tutors.id, name: tutors.name })
          .from(tutorClassAssignments)
          .innerJoin(tutors, eq(tutors.id, tutorClassAssignments.tutorId))
          .where(
            and(
              inArray(tutorClassAssignments.classId, ids),
              eq(tutorClassAssignments.isActive, true),
              eq(tutors.isActive, true),
            ),
          )
          .orderBy(asc(tutors.name)),
        db
          .select({
            id: classSchedules.id,
            classId: classSchedules.classId,
            title: classSchedules.title,
            dayOfWeek: classSchedules.dayOfWeek,
            startTime: classSchedules.startTime,
            durationMinutes: classSchedules.durationMinutes,
            location: classSchedules.location,
            type: classSchedules.type,
            isActive: classSchedules.isActive,
          })
          .from(classSchedules)
          .where(inArray(classSchedules.classId, ids))
          .orderBy(asc(classSchedules.dayOfWeek), asc(classSchedules.startTime)),
      ])
    : [[], []];
  return {
    kelasRows,
    ids,
    penugasan,
    slot: slot.map((s) => ({ ...s, isActive: s.isActive ?? true })),
  };
}

export async function getKelasProgram(): Promise<KelasProgramData> {
  const ctx = await requireTenantContext();
  if (ctx.isDemo) return demoKelasProgram();

  const hariIni = todayInWib();
  const { kelasRows, ids, penugasan, slot } = await kelasDanGuru(ctx.tenantId);

  const [terisi, tunggu, trial, guruPilihan] = await Promise.all([
    ids.length
      ? db
          .select({ classId: studentEnrollments.classId, n: sql<number>`count(*)::int` })
          .from(studentEnrollments)
          .innerJoin(students, eq(students.id, studentEnrollments.studentId))
          .where(
            and(
              inArray(studentEnrollments.classId, ids),
              eq(studentEnrollments.isActive, true),
              eq(students.isActive, true),
            ),
          )
          .groupBy(studentEnrollments.classId)
      : [],
    ids.length
      ? db
          .select({ classId: waitingList.classId, n: sql<number>`count(*)::int` })
          .from(waitingList)
          .where(
            and(
              eq(waitingList.tenantId, ctx.tenantId),
              inArray(waitingList.classId, ids),
              inArray(waitingList.status, ["waiting", "notified"]),
            ),
          )
          .groupBy(waitingList.classId)
      : [],
    ids.length
      ? db
          .select({ classId: trialApplications.classId, n: sql<number>`count(*)::int` })
          .from(trialApplications)
          .where(
            and(
              eq(trialApplications.tenantId, ctx.tenantId),
              inArray(trialApplications.classId, ids),
              isNotNull(trialApplications.trialScheduledAt),
              gte(sql`(${trialApplications.trialScheduledAt} AT TIME ZONE 'Asia/Jakarta')::date`, hariIni),
              eq(trialApplications.status, "scheduled"),
            ),
          )
          .groupBy(trialApplications.classId)
      : [],
    db
      .select({ id: tutors.id, name: tutors.name })
      .from(tutors)
      .where(and(eq(tutors.tenantId, ctx.tenantId), eq(tutors.isActive, true)))
      .orderBy(asc(tutors.name)),
  ]);

  const hitung = (rows: { classId: string | null; n: number }[], id: string) =>
    rows.find((r) => r.classId === id)?.n ?? 0;

  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    guruPilihan,
    kelas: kelasRows.map((k) => ({
      ...k,
      isActive: k.isActive ?? true,
      guru: penugasan.filter((p) => p.classId === k.id).map((p) => ({ id: p.id, name: p.name })),
      terisi: hitung(terisi, k.id),
      daftarTunggu: hitung(tunggu, k.id),
      trialMendatang: hitung(trial, k.id),
      jadwal: slot.filter((s) => s.classId === k.id && s.type === "class" && s.isActive),
    })),
  };
}

export async function getKalenderSesi(): Promise<KalenderData> {
  const ctx = await requireTenantContext();
  const hariIni = todayInWib();
  if (ctx.isDemo) return demoKalender(hariIni);

  const { kelasRows, penugasan, slot } = await kelasDanGuru(ctx.tenantId);
  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    hariIni,
    senin: seninDari(hariIni),
    kelas: kelasRows.map((k) => ({
      id: k.id,
      name: k.name,
      isActive: k.isActive ?? true,
      guru: penugasan.filter((p) => p.classId === k.id).map((p) => ({ id: p.id, name: p.name })),
    })),
    slot,
  };
}

/* ------------------------------------------------------------------ */
/* Data demo — contoh dari frame desain O1/O2, bukan data lembaga mana pun */
/* ------------------------------------------------------------------ */

const DEMO_KELAS = [
  { id: "dk-baby", name: "Baby Bee", guru: "Bu Sari", ruang: "Ruang Kupu-kupu", cap: 8, isi: 6, harga: "900000", tunggu: 0, trial: 0, mulai: "09:00", durasi: 120 },
  { id: "dk-todd", name: "Toddler A", guru: "Bu Dina", ruang: "Ruang Daun", cap: 12, isi: 10, harga: "1650000", tunggu: 0, trial: 1, mulai: "07:30", durasi: 450 },
  { id: "dk-play", name: "Playgroup B", guru: "Bu Ratna", ruang: "Ruang Langit", cap: 12, isi: 11, harga: "1650000", tunggu: 0, trial: 0, mulai: "10:00", durasi: 60 },
  { id: "dk-tka", name: "TK A", guru: "Pak Yoga", ruang: "Ruang Matahari", cap: 14, isi: 11, harga: "1250000", tunggu: 1, trial: 0, mulai: "11:00", durasi: 60 },
];

function demoSlot(): SlotJadwal[] {
  const out: SlotJadwal[] = [];
  for (const k of DEMO_KELAS)
    for (let d = 1; d <= 5; d++)
      out.push({
        id: `${k.id}-${d}`,
        classId: k.id,
        title: k.name,
        dayOfWeek: d,
        startTime: k.mulai,
        durationMinutes: k.durasi,
        location: k.ruang,
        type: "class",
        isActive: true,
      });
  out.push({
    id: "dk-renang",
    classId: "dk-tka",
    title: "Renang (ekskul)",
    dayOfWeek: 5,
    startTime: "13:00",
    durationMinutes: 60,
    location: null,
    type: "activity",
    isActive: true,
  });
  return out;
}

function demoKelasProgram(): KelasProgramData {
  const slot = demoSlot();
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    guruPilihan: DEMO_KELAS.map((k, i) => ({ id: `dg${i}`, name: k.guru })),
    kelas: DEMO_KELAS.map((k, i) => ({
      id: k.id,
      name: k.name,
      description: null,
      capacity: k.cap,
      pricePerMonth: k.harga,
      sessionsPerMonth: 20,
      location: k.ruang,
      isActive: true,
      guru: [{ id: `dg${i}`, name: k.guru }],
      terisi: k.isi,
      daftarTunggu: k.tunggu,
      trialMendatang: k.trial,
      jadwal: slot.filter((s) => s.classId === k.id && s.type === "class"),
    })),
  };
}

function demoKalender(hariIni: string): KalenderData {
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    hariIni,
    senin: seninDari(hariIni),
    kelas: DEMO_KELAS.map((k, i) => ({ id: k.id, name: k.name, isActive: true, guru: [{ id: `dg${i}`, name: k.guru }] })),
    slot: demoSlot(),
  };
}
