"use server";

import { and, asc, eq, gte, inArray, isNotNull, isNull, lte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  attendance,
  classes,
  dailyReports,
  invoices,
  studentEnrollments,
  students,
  trialApplications,
  tutorAttendance,
  tutorClassAssignments,
  tutorLeaveRequests,
  tutors,
} from "@/db/schema";
import { requireTenantContext } from "@/server/authz";
import { todayInWib } from "@/lib/datetime";
import { getUpcomingBirthdays } from "@/server/actions/birthdays";

/**
 * A1 Hari Ini — satu sumber angka untuk ringkasan admin. Baca-saja.
 *
 * Definisi (dipakai juga oleh label di layar):
 * - Tiba · hari ini      = anak aktif (punya enrollment aktif) yang absennya hari ini Hadir/Terlambat Datang,
 *                          dibagi semua anak aktif. "Belum tiba" = anak aktif tanpa catatan absen hari ini.
 * - Terbit · bulan ini   = tagihan dengan periode bulan berjalan (billing_period_start, atau tanggal dibuat bila kosong).
 * - Diterima · bulan ini = bagian Terbit yang berstatus Lunas. Menunggu = Terbit − Diterima.
 * - Terlambat · semua periode = tagihan belum Lunas yang jatuh temponya sudah lewat (nominal penuh;
 *                          pembayaran sebagian belum tercatat nominalnya).
 * - Perlu ditagih        = anak dengan enrollment aktif tanpa tagihan periode bulan berjalan,
 *                          setelah tanggal tagihnya (billing_day) tiba.
 */

export interface HariIniKelas {
  id: string;
  name: string;
  terdaftar: number;
  tiba: number;
  izin: number;
  sakit: number;
  alpa: number;
  belum: number;
}

export interface HariIniGuru {
  id: string;
  name: string;
  jamMasuk: string | null;
  jamPulang: string | null;
  /** Izin/cuti yang mencakup hari ini */
  izin: { jenis: string; status: string } | null;
}

export interface HariIniTagihanTerlambat {
  keluarga: string;
  total: number;
  hariTerlambat: number;
}

export interface HariIniData {
  isDemo: boolean;
  /** ISO, waktu data diambil */
  diambilPada: string;
  /** "YYYY-MM-DD" WIB */
  tanggal: string;
  periode: { year: number; month: number };
  kosong: boolean;
  kehadiran: { aktif: number; tiba: number; belumTiba: number };
  tagihan: {
    terbit: number;
    terbitKeluarga: number;
    diterima: number;
    diterimaKeluarga: number;
    terlambat: number;
    terlambatKeluarga: number;
    terlambatLama: HariIniTagihanTerlambat[];
  };
  perluDitagih: { anak: number; estimasi: number };
  kelas: HariIniKelas[];
  guru: HariIniGuru[];
  laporanBelum: { kelas: string; belum: number; tiba: number }[];
  trialLewat: { id: string; nama: string; hari: number }[];
  belumPulangKemarin: { nama: string; kelas: string | null }[];
  ulangTahun: { nama: string; umur: number; hari: number }[];
}

function kunciKeluarga() {
  return sql<string>`coalesce(${students.parentUserId}, lower(${students.parentEmail}), ${students.parentName}, ${students.id})`;
}

function kemarin(tanggal: string): string {
  const [y, m, d] = tanggal.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

export async function getHariIni(): Promise<HariIniData> {
  const ctx = await requireTenantContext();
  if (ctx.isDemo) return demoHariIni();
  return hitungHariIni(ctx.tenantId);
}

/** Hanya dipanggil setelah otorisasi tenant; sengaja tidak diekspor agar tidak menjadi server action. */
async function hitungHariIni(tenantId: string): Promise<HariIniData> {
  const tanggal = todayInWib();
  const [year, month, day] = tanggal.split("-").map(Number);
  const ym = tanggal.slice(0, 7);
  const periodeInvoice = sql`to_char(coalesce(${invoices.billingPeriodStart}, (${invoices.createdAt} AT TIME ZONE 'Asia/Jakarta')::date), 'YYYY-MM')`;

  // ---- Kelas & anak aktif ----
  const kelasRows = await db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .where(and(eq(classes.tenantId, tenantId), eq(classes.isActive, true)))
    .orderBy(asc(classes.name));

  const enrollRows = await db
    .select({
      studentId: studentEnrollments.studentId,
      classId: studentEnrollments.classId,
      billingDay: studentEnrollments.billingDay,
      price: classes.pricePerMonth,
    })
    .from(studentEnrollments)
    .innerJoin(students, eq(students.id, studentEnrollments.studentId))
    .innerJoin(classes, eq(classes.id, studentEnrollments.classId))
    .where(and(eq(students.tenantId, tenantId), eq(students.isActive, true), eq(studentEnrollments.isActive, true)));

  const anakAktif = new Set(enrollRows.map((e) => e.studentId));

  // ---- Kehadiran hari ini ----
  const absenHariIni = await db
    .select({
      studentId: attendance.studentId,
      classId: attendance.classId,
      status: attendance.status,
      permitType: attendance.permitType,
    })
    .from(attendance)
    .innerJoin(students, eq(students.id, attendance.studentId))
    .where(and(eq(students.tenantId, tenantId), eq(attendance.date, tanggal)));

  const statusAnak = new Map(absenHariIni.map((a) => [a.studentId, a]));
  const tibaSet = new Set(absenHariIni.filter((a) => a.status === "present" || a.status === "late").map((a) => a.studentId));
  const tiba = [...anakAktif].filter((id) => tibaSet.has(id)).length;
  const belumTiba = [...anakAktif].filter((id) => !statusAnak.has(id)).length;

  const kelas: HariIniKelas[] = kelasRows.map((k) => {
    const anak = enrollRows.filter((e) => e.classId === k.id).map((e) => e.studentId);
    const hitung = { tiba: 0, izin: 0, sakit: 0, alpa: 0, belum: 0 };
    for (const id of anak) {
      const a = statusAnak.get(id);
      if (!a) hitung.belum++;
      else if (a.status === "present" || a.status === "late") hitung.tiba++;
      else if (a.status === "permit" && a.permitType === "sick") hitung.sakit++;
      else if (a.status === "permit") hitung.izin++;
      else if (a.status === "absent") hitung.alpa++;
    }
    return { id: k.id, name: k.name, terdaftar: anak.length, ...hitung };
  });

  // ---- Tagihan ----
  const [terbit] = await db
    .select({
      total: sql<string>`coalesce(sum(${invoices.total}::numeric), 0)`,
      keluarga: sql<number>`count(distinct ${kunciKeluarga()})::int`,
      diterima: sql<string>`coalesce(sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end), 0)`,
      diterimaKeluarga: sql<number>`count(distinct case when ${invoices.status} = 'paid' then ${kunciKeluarga()} end)::int`,
    })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(and(eq(students.tenantId, tenantId), sql`${periodeInvoice} = ${ym}`));

  const terlambatRows = await db
    .select({
      keluarga: sql<string>`coalesce(${students.parentName}, ${students.name})`,
      kunci: kunciKeluarga(),
      total: invoices.total,
      dueDate: invoices.dueDate,
    })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(and(eq(students.tenantId, tenantId), ne(invoices.status, "paid"), isNotNull(invoices.dueDate), sql`${invoices.dueDate} < ${tanggal}`));

  const perKeluarga = new Map<string, HariIniTagihanTerlambat>();
  for (const r of terlambatRows) {
    const hari = Math.round((Date.parse(tanggal) - Date.parse(String(r.dueDate))) / 86_400_000);
    const cur = perKeluarga.get(r.kunci) ?? { keluarga: r.keluarga, total: 0, hariTerlambat: 0 };
    cur.total += Number(r.total) || 0;
    cur.hariTerlambat = Math.max(cur.hariTerlambat, hari);
    perKeluarga.set(r.kunci, cur);
  }
  const keluargaTerlambat = [...perKeluarga.values()];

  // ---- Perlu ditagih ----
  const sudahDitagih = await db
    .selectDistinct({ studentId: invoices.studentId })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(and(eq(students.tenantId, tenantId), sql`${periodeInvoice} = ${ym}`));
  const ditagihSet = new Set(sudahDitagih.map((r) => r.studentId));
  const perluDitagih = new Map<string, number>();
  for (const e of enrollRows) {
    if (ditagihSet.has(e.studentId)) continue;
    if (e.billingDay && e.billingDay > day) continue;
    perluDitagih.set(e.studentId, (perluDitagih.get(e.studentId) ?? 0) + (Number(e.price) || 0));
  }

  // ---- Guru ----
  const guruRows = await db
    .select({ id: tutors.id, userId: tutors.userId, name: tutors.name })
    .from(tutors)
    .where(and(eq(tutors.tenantId, tenantId), eq(tutors.isActive, true)))
    .orderBy(asc(tutors.name));
  const guruIds = guruRows.map((g) => g.id);
  const guruUserIds = guruRows.map((g) => g.userId).filter((v): v is string => !!v);

  const absenGuru = guruRows.length
    ? await db
        .select({
          tutorId: tutorAttendance.tutorId,
          userId: tutorAttendance.userId,
          checkInTime: tutorAttendance.checkInTime,
          checkOutTime: tutorAttendance.checkOutTime,
        })
        .from(tutorAttendance)
        .where(
          and(
            eq(tutorAttendance.date, tanggal),
            guruUserIds.length
              ? sql`(${inArray(tutorAttendance.tutorId, guruIds)} OR ${inArray(tutorAttendance.userId, guruUserIds)})`
              : inArray(tutorAttendance.tutorId, guruIds),
          ),
        )
    : [];

  const izinGuru = await db
    .select({ tutorId: tutorLeaveRequests.tutorId, jenis: tutorLeaveRequests.leaveType, status: tutorLeaveRequests.status })
    .from(tutorLeaveRequests)
    .where(
      and(
        eq(tutorLeaveRequests.tenantId, tenantId),
        lte(tutorLeaveRequests.startDate, tanggal),
        gte(tutorLeaveRequests.endDate, tanggal),
        ne(tutorLeaveRequests.status, "rejected"),
      ),
    );

  const guru: HariIniGuru[] = guruRows.map((g) => {
    const a = absenGuru.find((r) => r.tutorId === g.id || (g.userId && r.userId === g.userId));
    const iz = izinGuru.find((r) => r.tutorId === g.id);
    return {
      id: g.id,
      name: g.name,
      jamMasuk: a?.checkInTime ?? null,
      jamPulang: a?.checkOutTime ?? null,
      izin: iz ? { jenis: iz.jenis, status: iz.status } : null,
    };
  });

  // ---- Laporan harian hari ini ----
  const laporanHariIni = await db
    .select({ studentId: dailyReports.studentId })
    .from(dailyReports)
    .innerJoin(students, eq(students.id, dailyReports.studentId))
    .where(and(eq(students.tenantId, tenantId), eq(dailyReports.reportDate, tanggal)));
  const sudahLapor = new Set(laporanHariIni.map((r) => r.studentId));
  const laporanBelum = kelasRows
    .map((k) => {
      const tibaDiKelas = enrollRows.filter((e) => e.classId === k.id && tibaSet.has(e.studentId)).map((e) => e.studentId);
      return { kelas: k.name, tiba: tibaDiKelas.length, belum: tibaDiKelas.filter((id) => !sudahLapor.has(id)).length };
    })
    .filter((r) => r.belum > 0);

  // ---- Trial lewat jadwal tanpa observasi ----
  const trialRows = await db
    .select({ id: trialApplications.id, nama: trialApplications.childName, jadwal: trialApplications.trialScheduledAt })
    .from(trialApplications)
    .where(
      and(
        eq(trialApplications.tenantId, tenantId),
        eq(trialApplications.status, "scheduled"),
        isNotNull(trialApplications.trialScheduledAt),
        sql`(${trialApplications.trialScheduledAt} AT TIME ZONE 'Asia/Jakarta')::date < ${tanggal}`,
      ),
    );
  const trialLewat = trialRows.map((t) => ({
    id: t.id,
    nama: t.nama,
    hari: Math.max(1, Math.round((Date.parse(tanggal) - Date.parse(todayInWib(t.jadwal!))) / 86_400_000)),
  }));

  // ---- Belum check-out kemarin ----
  const belumPulang = await db
    .select({ nama: students.name, kelas: classes.name })
    .from(attendance)
    .innerJoin(students, eq(students.id, attendance.studentId))
    .leftJoin(classes, eq(classes.id, attendance.classId))
    .where(
      and(
        eq(students.tenantId, tenantId),
        eq(attendance.date, kemarin(tanggal)),
        inArray(attendance.status, ["present", "late"]),
        isNotNull(attendance.checkInTime),
        isNull(attendance.checkOutTime),
      ),
    );

  // ---- Ulang tahun 7 hari ke depan ----
  const ultah = (await getUpcomingBirthdays().catch(() => []))
    .filter((b) => b.daysUntil <= 7)
    .map((b) => ({ nama: b.name, umur: b.turningAge, hari: b.daysUntil }));

  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    tanggal,
    periode: { year, month },
    kosong: kelasRows.length === 0 && anakAktif.size === 0,
    kehadiran: { aktif: anakAktif.size, tiba, belumTiba },
    tagihan: {
      terbit: Number(terbit?.total ?? 0),
      terbitKeluarga: terbit?.keluarga ?? 0,
      diterima: Number(terbit?.diterima ?? 0),
      diterimaKeluarga: terbit?.diterimaKeluarga ?? 0,
      terlambat: keluargaTerlambat.reduce((s, k) => s + k.total, 0),
      terlambatKeluarga: keluargaTerlambat.length,
      terlambatLama: keluargaTerlambat.filter((k) => k.hariTerlambat > 30).sort((a, b) => b.hariTerlambat - a.hariTerlambat),
    },
    perluDitagih: { anak: perluDitagih.size, estimasi: [...perluDitagih.values()].reduce((s, v) => s + v, 0) },
    kelas,
    guru,
    laporanBelum,
    trialLewat,
    belumPulangKemarin: belumPulang.map((r) => ({ nama: r.nama, kelas: r.kelas })),
    ulangTahun: ultah,
  };
}

/**
 * Akun demo (@majiku.test / demo@majiku.id) tidak membaca data lembaga mana pun;
 * isinya contoh dari frame desain A1 dan layar menandainya "Mode demo".
 */
function demoHariIni(): HariIniData {
  const tanggal = todayInWib();
  const [year, month] = tanggal.split("-").map(Number);
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    tanggal,
    periode: { year, month },
    kosong: false,
    kehadiran: { aktif: 38, tiba: 31, belumTiba: 5 },
    tagihan: {
      terbit: 18_400_000,
      terbitKeluarga: 21,
      diterima: 12_100_000,
      diterimaKeluarga: 14,
      terlambat: 1_900_000,
      terlambatKeluarga: 2,
      terlambatLama: [
        { keluarga: "Putri", total: 1_250_000, hariTerlambat: 47 },
        { keluarga: "Wibowo", total: 650_000, hariTerlambat: 33 },
      ],
    },
    perluDitagih: { anak: 8, estimasi: 8_200_000 },
    kelas: [
      { id: "d1", name: "Baby Bee", terdaftar: 6, tiba: 4, izin: 1, sakit: 0, alpa: 0, belum: 1 },
      { id: "d2", name: "Toddler A", terdaftar: 10, tiba: 9, izin: 0, sakit: 0, alpa: 0, belum: 1 },
      { id: "d3", name: "Playgroup B", terdaftar: 11, tiba: 9, izin: 0, sakit: 0, alpa: 0, belum: 2 },
      { id: "d4", name: "TK A", terdaftar: 11, tiba: 9, izin: 0, sakit: 1, alpa: 0, belum: 1 },
    ],
    guru: [
      { id: "g1", name: "Bu Sari", jamMasuk: "06:52", jamPulang: null, izin: null },
      { id: "g2", name: "Bu Dina", jamMasuk: "07:05", jamPulang: null, izin: null },
      { id: "g3", name: "Bu Ratna", jamMasuk: null, jamPulang: null, izin: { jenis: "sick", status: "pending" } },
      { id: "g4", name: "Pak Yoga", jamMasuk: null, jamPulang: null, izin: null },
    ],
    laporanBelum: [{ kelas: "Baby Bee", belum: 3, tiba: 4 }],
    trialLewat: [{ id: "t1", nama: "Naura", hari: 2 }],
    belumPulangKemarin: [{ nama: "Rafa", kelas: "Toddler A" }],
    ulangTahun: [
      { nama: "Aisyah", umur: 4, hari: 2 },
      { nama: "Bima", umur: 2, hari: 4 },
    ],
  };
}
