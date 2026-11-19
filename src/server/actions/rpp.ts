"use server";

import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { classSchedules, classes, lessonPlans, user } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";
import { todayInWib } from "@/lib/datetime";

/**
 * O8 RPP papan mingguan — baca-saja, scope tenant. Tulis memakai action lama lessonPlans.ts
 * (createLessonPlan/updateLessonPlan/deleteLessonPlan).
 * Definisi:
 * - RPP lembaga  = lesson_plans yang kelasnya milik tenant. RPP tanpa kelas tidak punya pemilik lembaga → tidak tampil.
 * - Minggu       = Senin–Sabtu dari tanggal yang diminta (default minggu berjalan, WIB).
 * - Hari bersesi = hari yang punya class_schedules aktif bertipe "class" untuk kelas itu.
 * - Minggu lalu  = RPP kelas itu pada Senin–Sabtu sebelumnya (sumber "Salin dari minggu lalu").
 * BARU yang disembunyikan: libur bertanggal yang mengosongkan hari, tujuan terhubung ke indikator perkembangan,
 * trial yang ikut sesi.
 */

export interface KegiatanRpp {
  id: string;
  title: string;
  durationMinutes: number;
  description?: string;
  completed: boolean;
}

export interface Rpp {
  id: string;
  classId: string;
  title: string;
  subject: string | null;
  planDate: string;
  timeRange: string | null;
  objectives: string[];
  activities: KegiatanRpp[];
  materials: string[];
  status: "draft" | "upcoming" | "in_progress" | "completed";
  penulis: string | null;
}

export interface RppMingguData {
  isDemo: boolean;
  diambilPada: string;
  hariIni: string;
  senin: string;
  kelas: { id: string; name: string }[];
  /** dayOfWeek (1=Sen) yang punya sesi, per kelas */
  hariSesi: Record<string, number[]>;
  rpp: Rpp[];
  mingguLalu: Rpp[];
}

function geser(tgl: string, hari: number) {
  const [y, m, d] = tgl.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + hari)).toISOString().slice(0, 10);
}

function seninDari(tgl: string) {
  const [y, m, d] = tgl.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return geser(tgl, dow === 0 ? -6 : 1 - dow);
}

export async function getRppMinggu(tanggal?: string): Promise<RppMingguData> {
  const ctx = await requireTenantContext();
  const hariIni = todayInWib();
  const acuan = tanggal && /^\d{4}-\d{2}-\d{2}$/.test(tanggal) && !Number.isNaN(Date.parse(tanggal)) ? tanggal : hariIni;
  const senin = seninDari(acuan);
  if (ctx.isDemo) return demoRpp(senin, hariIni);

  const kelas = await db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .where(and(eq(classes.tenantId, ctx.tenantId), eq(classes.isActive, true)))
    .orderBy(asc(classes.name));
  const ids = kelas.map((k) => k.id);
  if (!ids.length) {
    return { isDemo: false, diambilPada: new Date().toISOString(), hariIni, senin, kelas, hariSesi: {}, rpp: [], mingguLalu: [] };
  }

  const [rows, slot] = await Promise.all([
    db
      .select({ plan: lessonPlans, penulis: user.name })
      .from(lessonPlans)
      .leftJoin(user, eq(user.id, lessonPlans.tutorUserId))
      .where(and(inArray(lessonPlans.classId, ids), gte(lessonPlans.planDate, geser(senin, -7)), lte(lessonPlans.planDate, geser(senin, 5))))
      .orderBy(asc(lessonPlans.planDate), asc(lessonPlans.timeRange), asc(lessonPlans.createdAt)),
    db
      .select({ classId: classSchedules.classId, dayOfWeek: classSchedules.dayOfWeek })
      .from(classSchedules)
      .where(and(inArray(classSchedules.classId, ids), eq(classSchedules.isActive, true), eq(classSchedules.type, "class"))),
  ]);

  const hariSesi: Record<string, number[]> = {};
  for (const s of slot) {
    if (!s.classId) continue;
    const arr = (hariSesi[s.classId] ??= []);
    if (!arr.includes(s.dayOfWeek)) arr.push(s.dayOfWeek);
  }

  const rpp: Rpp[] = rows.map(({ plan: p, penulis }) => ({
    id: p.id,
    classId: p.classId!,
    title: p.title,
    subject: p.subject,
    planDate: p.planDate,
    timeRange: p.timeRange,
    objectives: p.objectives ?? [],
    activities: (p.activities ?? []).map((a) => ({ ...a, completed: Boolean(a.completed) })),
    materials: p.materials ?? [],
    status: p.status,
    penulis,
  }));

  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    hariIni,
    senin,
    kelas,
    hariSesi,
    rpp: rpp.filter((r) => r.planDate >= senin),
    mingguLalu: rpp.filter((r) => r.planDate < senin),
  };
}

/* ------------------------------------------------------------------ */
/* Data demo — contoh frame desain O8, bukan data lembaga mana pun        */
/* ------------------------------------------------------------------ */

function demoRpp(senin: string, hariIni: string): RppMingguData {
  const k = (id: string, title: string, durationMinutes: number, completed = false): KegiatanRpp => ({ id, title, durationMinutes, completed });
  const tema = "Tanaman di sekitarku";
  const tujuan = ["Mengenal bagian tanaman", "Motorik halus: menempel", "Bernyanyi bersama"];
  const rpp: Rpp[] = [
    {
      id: "dp1",
      classId: "dk1",
      title: "Menanam biji",
      subject: tema,
      planDate: senin,
      timeRange: "09:00 - 10:45",
      objectives: tujuan,
      activities: [k("a1", 'Lingkaran pagi · lagu "Menanam Jagung"', 20, true), k("a2", "Menanam biji kacang hijau di kapas", 55, true), k("a3", "Bermain pasir kinetik", 30, true)],
      materials: ["kapas", "gelas plastik"],
      status: "completed",
      penulis: "Bu Sari",
    },
    {
      id: "dp2",
      classId: "dk1",
      title: "Mengamati biji",
      subject: tema,
      planDate: geser(senin, 1),
      timeRange: "09:00 - 10:45",
      objectives: tujuan,
      activities: [k("a4", 'Cerita "Si Biji Kecil"', 30, true), k("a5", "Mengamati biji · 3 dari 5 anak tumbuh tunas", 45), k("a6", "Mewarnai daun dengan jari", 30)],
      materials: ["kapas", "gelas plastik", "cat jari"],
      status: "in_progress",
      penulis: "Bu Sari",
    },
    {
      id: "dp3",
      classId: "dk1",
      title: "Kebun belakang",
      subject: tema,
      planDate: geser(senin, 3),
      timeRange: "09:00 - 10:30",
      objectives: tujuan,
      activities: [k("a7", "Jalan-jalan ke kebun belakang", 60), k("a8", "Menempel daun kering", 30)],
      materials: [],
      status: "upcoming",
      penulis: "Bu Sari",
    },
  ];
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    hariIni,
    senin,
    kelas: [
      { id: "dk1", name: "Baby Bee" },
      { id: "dk2", name: "Toddler A" },
      { id: "dk3", name: "Playgroup B" },
    ],
    hariSesi: { dk1: [1, 2, 4, 5], dk2: [1, 2, 3, 4, 5], dk3: [1, 2, 3, 4, 5] },
    rpp,
    mingguLalu: [],
  };
}
