"use server";

import {
  and,
  asc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import {
  attendance,
  classSchedules,
  classes,
  studentEnrollments,
  students,
  trialApplications,
  tutorAttendance,
  tutorClassAssignments,
  tutorLeaveRequests,
  tutors,
} from "@/db/schema";
import { requireTenantContext } from "@/server/authz";
import { todayInWib, timeInWib } from "@/lib/datetime";
import { formatPeriode } from "@/lib/format";

/**
 * O5 Kehadiran siswa + O6 Kehadiran guru — baca-saja. Definisi sama dengan A1 (hariIni.ts):
 * - Anak terdaftar   = anak aktif dengan enrollment aktif di kelas itu.
 * - Tiba             = absen tanggal itu berstatus Hadir atau Terlambat Datang. "Belum tiba" = tanpa catatan absen.
 * - Sesi terpakai    = student_enrollments.sessions_used / sessions_quota (akumulasi, bukan per bulan).
 * - Belum check-out  = absen 7 hari terakhir (sebelum tanggal dilihat) yang Hadir/Terlambat, ada jam tiba, tanpa jam pulang.
 * - Guru tiba        = guru aktif dengan check-in di tutor_attendance tanggal itu.
 * - Jadwal guru      = jam mulai sesi paling awal hari itu dari kelas yang ditugaskan (class_schedules).
 * - Izin guru        = tutor_leave_requests yang mencakup tanggal itu, kecuali yang ditolak.
 * - Hari hadir guru  = jumlah tanggal dengan check-in di bulan berjalan.
 * BARU yang disembunyikan: scan QR, penjemput/diantar, sumber pencatatan (QR/aplikasi), koreksi + audit log,
 * GPS/lokasi, penilaian tepat waktu, persetujuan izin, aturan absensi guru.
 */

export interface BarisKehadiranSiswa {
  studentId: string;
  name: string;
  classId: string;
  alergi: string | null;
  attendanceId: string | null;
  status: string | null;
  permitType: string | null;
  permitReason: string | null;
  tiba: string | null;
  pulang: string | null;
  dicatatOleh: string | null;
  sesi: { terpakai: number; kuota: number | null };
}

export interface KehadiranSiswaData {
  isDemo: boolean;
  diambilPada: string;
  tanggal: string;
  hariIni: string;
  /** Hanya hari ini yang bisa dicatat; tanggal lalu hanya dilihat */
  bisaCatat: boolean;
  kelas: { id: string; name: string; terdaftar: number; tiba: number }[];
  baris: BarisKehadiranSiswa[];
  belumPulang: { name: string; kelas: string | null; tanggal: string }[];
}

function alergiBermakna(v: string | null | undefined) {
  const t = (v ?? "").trim();
  if (!t || /^(-|tidak|tidak ada|ga ada|nggak|none|no)$/i.test(t)) return null;
  return t;
}

function geserHari(tanggal: string, n: number) {
  const [y, m, d] = tanggal.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function tanggalValid(t: string | undefined, hariIni: string) {
  if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(t) || Number.isNaN(Date.parse(t)))
    return hariIni;
  return t > hariIni ? hariIni : t;
}

export async function getKehadiranSiswa(
  tanggalDiminta?: string,
): Promise<KehadiranSiswaData> {
  const ctx = await requireTenantContext();
  const hariIni = todayInWib();
  const tanggal = tanggalValid(tanggalDiminta, hariIni);
  if (ctx.isDemo) return demoKehadiranSiswa(tanggal, hariIni);

  const [kelasRows, enrollRows] = await Promise.all([
    db
      .select({ id: classes.id, name: classes.name })
      .from(classes)
      .where(
        and(eq(classes.tenantId, ctx.tenantId), eq(classes.isActive, true)),
      )
      .orderBy(asc(classes.name)),
    db
      .select({
        studentId: students.id,
        name: students.name,
        classId: studentEnrollments.classId,
        used: studentEnrollments.sessionsUsed,
        quota: studentEnrollments.sessionsQuota,
      })
      .from(studentEnrollments)
      .innerJoin(students, eq(students.id, studentEnrollments.studentId))
      .where(
        and(
          eq(students.tenantId, ctx.tenantId),
          eq(students.isActive, true),
          eq(studentEnrollments.isActive, true),
        ),
      )
      .orderBy(asc(students.name)),
  ]);

  const ids = [...new Set(enrollRows.map((e) => e.studentId))];
  const [absen, alergi, belumPulang] = await Promise.all([
    ids.length
      ? db
          .select({
            id: attendance.id,
            studentId: attendance.studentId,
            classId: attendance.classId,
            status: attendance.status,
            permitType: attendance.permitType,
            permitReason: attendance.permitReason,
            tiba: attendance.checkInTime,
            pulang: attendance.checkOutTime,
            oleh: attendance.checkedInBy,
          })
          .from(attendance)
          .where(
            and(
              inArray(attendance.studentId, ids),
              eq(attendance.date, tanggal),
            ),
          )
      : [],
    ids.length
      ? db
          .select({
            studentId: trialApplications.admittedStudentId,
            allergies: trialApplications.allergies,
          })
          .from(trialApplications)
          .where(
            and(
              eq(trialApplications.tenantId, ctx.tenantId),
              inArray(trialApplications.admittedStudentId, ids),
            ),
          )
      : [],
    db
      .select({
        name: students.name,
        kelas: classes.name,
        tanggal: attendance.date,
      })
      .from(attendance)
      .innerJoin(students, eq(students.id, attendance.studentId))
      .leftJoin(classes, eq(classes.id, attendance.classId))
      .where(
        and(
          eq(students.tenantId, ctx.tenantId),
          lt(attendance.date, tanggal),
          gte(attendance.date, geserHari(tanggal, -7)),
          inArray(attendance.status, ["present", "late"]),
          isNotNull(attendance.checkInTime),
          isNull(attendance.checkOutTime),
        ),
      )
      .orderBy(sql`${attendance.date} desc`),
  ]);

  // Absen dicocokkan per anak + kelas; anak dengan 2 kelas punya baris per kelas.
  const baris: BarisKehadiranSiswa[] = enrollRows.map((e) => {
    const a =
      absen.find(
        (r) => r.studentId === e.studentId && r.classId === e.classId,
      ) ?? absen.find((r) => r.studentId === e.studentId);
    return {
      studentId: e.studentId,
      name: e.name,
      classId: e.classId,
      alergi: alergiBermakna(
        alergi.find((t) => t.studentId === e.studentId)?.allergies,
      ),
      attendanceId: a?.id ?? null,
      status: a?.status ?? null,
      permitType: a?.permitType ?? null,
      permitReason: a?.permitReason ?? null,
      tiba: a?.tiba ?? null,
      pulang: a?.pulang ?? null,
      dicatatOleh: a?.oleh ?? null,
      sesi: { terpakai: e.used ?? 0, kuota: e.quota ?? null },
    };
  });

  const tibaStatus = (s: string | null) => s === "present" || s === "late";

  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    tanggal,
    hariIni,
    bisaCatat: tanggal === hariIni,
    kelas: kelasRows.map((k) => {
      const b = baris.filter((r) => r.classId === k.id);
      return {
        id: k.id,
        name: k.name,
        terdaftar: b.length,
        tiba: b.filter((r) => tibaStatus(r.status)).length,
      };
    }),
    baris,
    belumPulang: belumPulang.map((r) => ({
      name: r.name,
      kelas: r.kelas,
      tanggal: String(r.tanggal),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* O6 Kehadiran guru                                                    */
/* ------------------------------------------------------------------ */

export interface BarisKehadiranGuru {
  id: string;
  name: string;
  photoUrl: string | null;
  jadwal: string | null;
  masuk: string | null;
  pulang: string | null;
  izin: { jenis: string; status: string; alasan: string | null } | null;
  hariHadirBulanIni: number;
}

export interface KehadiranGuruData {
  isDemo: boolean;
  diambilPada: string;
  tanggal: string;
  jamSekarang: string;
  periode: string;
  hariKerjaBulanIni: number;
  izinMenunggu: number;
  baris: BarisKehadiranGuru[];
}

export async function getKehadiranGuru(): Promise<KehadiranGuruData> {
  const ctx = await requireTenantContext();
  const tanggal = todayInWib();
  const now = new Date();
  if (ctx.isDemo) return demoKehadiranGuru(tanggal, timeInWib(now));

  const awalBulan = `${tanggal.slice(0, 7)}-01`;
  const [y, m, d] = tanggal.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  const guruRows = await db
    .select({
      id: tutors.id,
      userId: tutors.userId,
      name: tutors.name,
      photoUrl: tutors.photoUrl,
    })
    .from(tutors)
    .where(and(eq(tutors.tenantId, ctx.tenantId), eq(tutors.isActive, true)))
    .orderBy(asc(tutors.name));
  const guruIds = guruRows.map((g) => g.id);
  const userIds = guruRows.map((g) => g.userId).filter((v): v is string => !!v);
  const milikGuru = userIds.length
    ? sql`(${inArray(tutorAttendance.tutorId, guruIds.length ? guruIds : ["-"])} OR ${inArray(tutorAttendance.userId, userIds)})`
    : inArray(tutorAttendance.tutorId, guruIds.length ? guruIds : ["-"]);

  const [absenBulan, izin, jadwal] = guruRows.length
    ? await Promise.all([
        db
          .select({
            tutorId: tutorAttendance.tutorId,
            userId: tutorAttendance.userId,
            date: tutorAttendance.date,
            masuk: tutorAttendance.checkInTime,
            pulang: tutorAttendance.checkOutTime,
          })
          .from(tutorAttendance)
          .where(
            and(
              milikGuru,
              gte(tutorAttendance.date, awalBulan),
              lte(tutorAttendance.date, tanggal),
            ),
          ),
        db
          .select({
            tutorId: tutorLeaveRequests.tutorId,
            jenis: tutorLeaveRequests.leaveType,
            status: tutorLeaveRequests.status,
            alasan: tutorLeaveRequests.reason,
          })
          .from(tutorLeaveRequests)
          .where(
            and(
              eq(tutorLeaveRequests.tenantId, ctx.tenantId),
              lte(tutorLeaveRequests.startDate, tanggal),
              gte(tutorLeaveRequests.endDate, tanggal),
              sql`${tutorLeaveRequests.status} <> 'rejected'`,
            ),
          ),
        db
          .select({
            tutorId: tutorClassAssignments.tutorId,
            start: classSchedules.startTime,
          })
          .from(tutorClassAssignments)
          .innerJoin(
            classSchedules,
            eq(classSchedules.classId, tutorClassAssignments.classId),
          )
          .innerJoin(classes, eq(classes.id, classSchedules.classId))
          .where(
            and(
              inArray(tutorClassAssignments.tutorId, guruIds),
              eq(tutorClassAssignments.isActive, true),
              eq(classSchedules.isActive, true),
              eq(classSchedules.dayOfWeek, dow),
              eq(classes.isActive, true),
            ),
          ),
      ])
    : [[], [], []];

  const baris: BarisKehadiranGuru[] = guruRows.map((g) => {
    const punya = (r: { tutorId: string | null; userId: string | null }) =>
      r.tutorId === g.id || (!!g.userId && r.userId === g.userId);
    const hariIni = absenBulan.find(
      (r) => punya(r) && String(r.date) === tanggal,
    );
    const hadirTanggal = new Set(
      absenBulan.filter((r) => punya(r) && r.masuk).map((r) => String(r.date)),
    );
    const iz = izin.find((r) => r.tutorId === g.id);
    const jam =
      jadwal
        .filter((j) => j.tutorId === g.id)
        .map((j) => j.start)
        .sort()[0] ?? null;
    return {
      id: g.id,
      name: g.name,
      photoUrl: g.photoUrl,
      jadwal: jam,
      masuk: hariIni?.masuk ?? null,
      pulang: hariIni?.pulang ?? null,
      izin: iz
        ? { jenis: iz.jenis, status: iz.status, alasan: iz.alasan }
        : null,
      hariHadirBulanIni: hadirTanggal.size,
    };
  });

  // Hari kerja s.d. hari ini (Senin–Sabtu, sama dengan rentang hari jadwal 1–6).
  let hariKerja = 0;
  for (let i = 1; i <= d; i++)
    if (new Date(Date.UTC(y, m - 1, i)).getUTCDay() !== 0) hariKerja++;

  return {
    isDemo: false,
    diambilPada: now.toISOString(),
    tanggal,
    jamSekarang: timeInWib(now),
    periode: formatPeriode(tanggal),
    hariKerjaBulanIni: hariKerja,
    izinMenunggu: baris.filter((b) => b.izin?.status === "pending").length,
    baris,
  };
}

/* ------------------------------------------------------------------ */
/* Data demo — contoh dari frame desain, bukan data lembaga mana pun     */
/* ------------------------------------------------------------------ */

function demoKehadiranSiswa(
  tanggal: string,
  hariIni: string,
): KehadiranSiswaData {
  const k = [
    { id: "dk1", name: "Baby Bee" },
    { id: "dk2", name: "Toddler A" },
  ];
  const b = (
    i: number,
    name: string,
    classId: string,
    extra: Partial<BarisKehadiranSiswa> = {},
  ): BarisKehadiranSiswa => ({
    studentId: `demo-k${i}`,
    name,
    classId,
    alergi: null,
    attendanceId: null,
    status: null,
    permitType: null,
    permitReason: null,
    tiba: null,
    pulang: null,
    dicatatOleh: null,
    sesi: { terpakai: 6, kuota: 8 },
    ...extra,
  });
  const baris = [
    b(1, "Kayla Putri", "dk1", {
      attendanceId: "x1",
      status: "present",
      tiba: "07:42:00",
      dicatatOleh: "Bu Sari",
      sesi: { terpakai: 8, kuota: 8 },
    }),
    b(2, "Bima Wibowo", "dk1", {
      attendanceId: "x2",
      status: "present",
      tiba: "07:55:00",
      dicatatOleh: "Bu Sari",
      alergi: "Alergi kacang",
    }),
    b(3, "Naila Zahra", "dk1", {
      attendanceId: "x3",
      status: "late",
      tiba: "09:08:00",
      dicatatOleh: "Dewi",
      sesi: { terpakai: 7, kuota: 8 },
    }),
    b(4, "Arka Pratama", "dk1", {
      attendanceId: "x4",
      status: "permit",
      permitType: "family",
      permitReason: "Acara keluarga",
      sesi: { terpakai: 4, kuota: 8 },
    }),
    b(5, "Gibran Alfarizi", "dk1"),
    b(6, "Shaka Ramadhan", "dk2", {
      attendanceId: "x6",
      status: "present",
      tiba: "08:47:00",
      dicatatOleh: "Bu Sari",
      alergi: "Alergi susu sapi",
    }),
  ];
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    tanggal,
    hariIni,
    bisaCatat: false,
    kelas: k.map((x) => ({
      ...x,
      terdaftar: baris.filter((r) => r.classId === x.id).length,
      tiba: baris.filter(
        (r) =>
          r.classId === x.id && (r.status === "present" || r.status === "late"),
      ).length,
    })),
    baris,
    belumPulang: [
      { name: "Rafa", kelas: "Toddler A", tanggal: geserHari(tanggal, -1) },
    ],
  };
}

function demoKehadiranGuru(
  tanggal: string,
  jamSekarang: string,
): KehadiranGuruData {
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    tanggal,
    jamSekarang,
    periode: formatPeriode(tanggal),
    hariKerjaBulanIni: 16,
    izinMenunggu: 1,
    baris: [
      {
        id: "dg1",
        name: "Bu Sari",
        photoUrl: null,
        jadwal: "07:00",
        masuk: "06:52",
        pulang: null,
        izin: null,
        hariHadirBulanIni: 16,
      },
      {
        id: "dg2",
        name: "Bu Dina",
        photoUrl: null,
        jadwal: "07:00",
        masuk: "07:05",
        pulang: null,
        izin: null,
        hariHadirBulanIni: 15,
      },
      {
        id: "dg3",
        name: "Bu Ratna",
        photoUrl: null,
        jadwal: "07:00",
        masuk: null,
        pulang: null,
        izin: {
          jenis: "sick",
          status: "pending",
          alasan: "Surat dokter terlampir",
        },
        hariHadirBulanIni: 13,
      },
      {
        id: "dg4",
        name: "Pak Yoga",
        photoUrl: null,
        jadwal: "23:59",
        masuk: null,
        pulang: null,
        izin: null,
        hariHadirBulanIni: 14,
      },
    ],
  };
}
