"use server";

import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { attendance, classes, students } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";
import { todayInWib } from "@/lib/datetime";

/**
 * O12 Laporan kehadiran per bulan — baca-saja, scope tenant (anak milik tenant, kelas aktif maupun nonaktif yang punya catatan).
 * Definisi (bulan kalender WIB):
 * - Hari-anak tercatat = baris attendance anak itu pada tanggal di bulan tsb.
 * - Hadir      = status present + late (terlambat tetap hadir).
 * - Izin/sakit = status permit. Alpa = status absent.
 * - Kehadiran  = hadir ÷ hari-anak tercatat. Hari tanpa catatan absen (libur, belum diabsen) tidak dihitung, karena
 *   kalender libur & sesi per tanggal belum ada — angka ini bukan "÷ hari sekolah terjadwal" seperti di desain.
 * - Hari sekolah = tanggal berbeda yang punya minimal satu catatan.
 * - Rata-rata tiba = rata-rata check_in_time pada catatan hadir yang punya jam tiba.
 * BARU yang disembunyikan: laporan keuangan/pendaftaran/komunikasi di halaman ini, ekspor Excel terjadwal via email.
 */

export interface BarisKelas {
  classId: string;
  name: string;
  hadir: number;
  izin: number;
  alpa: number;
  anak: number;
}

export interface AnakAlpa {
  studentId: string;
  name: string;
  classId: string;
  className: string;
  alpa: number;
  tanggal: string[];
}

export interface LaporanKehadiranData {
  isDemo: boolean;
  diambilPada: string;
  bulan: string;
  bulanIni: string;
  bulanTersedia: string[];
  total: { hadir: number; izin: number; alpa: number; anak: number; hariSekolah: number; rataTibaMenit: number | null };
  kelas: BarisKelas[];
  alpa: AnakAlpa[];
}

function rentang(bulan: string) {
  const [y, m] = bulan.split("-").map(Number);
  const akhir = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { awal: `${bulan}-01`, akhir: `${bulan}-${String(akhir).padStart(2, "0")}` };
}

function bulanSebelum(bulan: string, n: number) {
  const [y, m] = bulan.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 - n, 1));
  return d.toISOString().slice(0, 7);
}

export async function getLaporanKehadiran(bulanDiminta?: string): Promise<LaporanKehadiranData> {
  const ctx = await requireTenantContext();
  const bulanIni = todayInWib().slice(0, 7);
  const bulan = bulanDiminta && /^\d{4}-(0[1-9]|1[0-2])$/.test(bulanDiminta) && bulanDiminta <= bulanIni ? bulanDiminta : bulanIni;
  const bulanTersedia = Array.from({ length: 12 }, (_, i) => bulanSebelum(bulanIni, i));
  if (ctx.isDemo) return demoLaporan(bulan, bulanIni, bulanTersedia);

  const { awal, akhir } = rentang(bulan);
  const anakRows = await db
    .select({ id: students.id, name: students.name })
    .from(students)
    .where(eq(students.tenantId, ctx.tenantId));
  const ids = anakRows.map((a) => a.id);
  const rows = ids.length
    ? await db
        .select({
          studentId: attendance.studentId,
          classId: attendance.classId,
          className: classes.name,
          date: attendance.date,
          status: attendance.status,
          checkInTime: attendance.checkInTime,
        })
        .from(attendance)
        .innerJoin(classes, and(eq(classes.id, attendance.classId), eq(classes.tenantId, ctx.tenantId)))
        .where(and(inArray(attendance.studentId, ids), gte(attendance.date, awal), lte(attendance.date, akhir)))
        .orderBy(asc(classes.name), asc(attendance.date))
    : [];

  const namaAnak = new Map(anakRows.map((a) => [a.id, a.name]));
  const perKelas = new Map<string, BarisKelas & { anakSet: Set<string> }>();
  const perAlpa = new Map<string, AnakAlpa>();
  const hari = new Set<string>();
  const anakSemua = new Set<string>();
  let tibaTotal = 0;
  let tibaN = 0;

  for (const r of rows) {
    hari.add(r.date);
    anakSemua.add(r.studentId);
    let k = perKelas.get(r.classId);
    if (!k) {
      k = { classId: r.classId, name: r.className, hadir: 0, izin: 0, alpa: 0, anak: 0, anakSet: new Set() };
      perKelas.set(r.classId, k);
    }
    k.anakSet.add(r.studentId);
    if (r.status === "present" || r.status === "late") {
      k.hadir++;
      if (r.checkInTime) {
        const [h, m] = r.checkInTime.split(":").map(Number);
        tibaTotal += h * 60 + m;
        tibaN++;
      }
    } else if (r.status === "permit") k.izin++;
    else if (r.status === "absent") {
      k.alpa++;
      const key = `${r.studentId}:${r.classId}`;
      const a = perAlpa.get(key) ?? {
        studentId: r.studentId,
        name: namaAnak.get(r.studentId) ?? "—",
        classId: r.classId,
        className: r.className,
        alpa: 0,
        tanggal: [],
      };
      a.alpa++;
      a.tanggal.push(r.date);
      perAlpa.set(key, a);
    }
  }

  const kelas = [...perKelas.values()].map(({ anakSet, ...k }) => ({ ...k, anak: anakSet.size }));
  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    bulan,
    bulanIni,
    bulanTersedia,
    total: {
      hadir: kelas.reduce((s, k) => s + k.hadir, 0),
      izin: kelas.reduce((s, k) => s + k.izin, 0),
      alpa: kelas.reduce((s, k) => s + k.alpa, 0),
      anak: anakSemua.size,
      hariSekolah: hari.size,
      rataTibaMenit: tibaN ? Math.round(tibaTotal / tibaN) : null,
    },
    kelas,
    alpa: [...perAlpa.values()].sort((a, b) => b.alpa - a.alpa || a.name.localeCompare(b.name)),
  };
}

/* ------------------------------------------------------------------ */
/* Data demo — angka frame desain O12, bukan data lembaga mana pun         */
/* ------------------------------------------------------------------ */

function demoLaporan(bulan: string, bulanIni: string, bulanTersedia: string[]): LaporanKehadiranData {
  const kelas: BarisKelas[] = [
    { classId: "dk1", name: "Baby Bee", hadir: 111, izin: 18, alpa: 3, anak: 6 },
    { classId: "dk2", name: "Toddler A", hadir: 200, izin: 18, alpa: 2, anak: 10 },
    { classId: "dk3", name: "Playgroup B", hadir: 218, izin: 20, alpa: 4, anak: 11 },
    { classId: "dk4", name: "TK A", hadir: 220, izin: 15, alpa: 7, anak: 11 },
  ];
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    bulan,
    bulanIni,
    bulanTersedia,
    total: { hadir: 749, izin: 71, alpa: 16, anak: 38, hariSekolah: 22, rataTibaMenit: 7 * 60 + 51 },
    kelas,
    alpa: [
      { studentId: "da1", name: "Gibran Alfarizi", classId: "dk4", className: "TK A", alpa: 4, tanggal: [] },
      { studentId: "da2", name: "Naila Zahra", classId: "dk3", className: "Playgroup B", alpa: 3, tanggal: [] },
      { studentId: "da3", name: "Arka Pratama", classId: "dk1", className: "Baby Bee", alpa: 2, tanggal: [] },
    ],
  };
}
