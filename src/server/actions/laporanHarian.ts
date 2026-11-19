"use server";

import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { attendance, classes, dailyReports, galleryPhotos, studentEnrollments, students, user } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";
import { todayInWib } from "@/lib/datetime";

/**
 * O7 Laporan harian & foto — baca-saja, scope tenant. Tulis/hapus memakai action lama
 * (dailyReports.ts: createDailyReport/deleteDailyReport; gallery.ts: uploadGalleryPhotos/deleteGalleryPhoto).
 * Definisi:
 * - Baris anak   = enrollment aktif anak aktif di kelas aktif (sama dengan O5); anak 2 kelas tampil di tiap kelas.
 * - Laporan      = daily_reports anak itu pada tanggal dilihat (satu laporan per anak per hari, dicegah action).
 * - Kegiatan tercatat = kolom laporan yang terisi: makan (meals), tidur (nap), bermain (activities), foto (photos), momen (mood/notes).
 * - Tiba / izin  = status absen anak pada tanggal itu (O5).
 * - Penulis      = akun yang mengirim laporan (daily_reports.tutor_user_id).
 * BARU yang disembunyikan: feed event berwaktu per kegiatan, insiden + konfirmasi baca, status "dibaca" orang tua,
 * "kurang makan" setelah jam makan, ringkasan otomatis 16.00, izin publikasi foto.
 */

export interface LaporanAnak {
  id: string;
  mood: string | null;
  meals: string | null;
  nap: string | null;
  activities: string | null;
  notes: string | null;
  photos: string[];
  penulis: string | null;
  dikirim: string | null;
}

export interface BarisLaporan {
  studentId: string;
  name: string;
  photoUrl: string | null;
  classId: string;
  absen: string | null;
  laporan: LaporanAnak | null;
}

export interface LaporanHarianData {
  isDemo: boolean;
  diambilPada: string;
  tanggal: string;
  hariIni: string;
  kelas: { id: string; name: string; terdaftar: number; terlapor: number }[];
  baris: BarisLaporan[];
}

function tanggalValid(t: string | undefined, hariIni: string) {
  if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(t) || Number.isNaN(Date.parse(t))) return hariIni;
  return t > hariIni ? hariIni : t;
}

export async function getLaporanHarian(tanggalDiminta?: string): Promise<LaporanHarianData> {
  const ctx = await requireTenantContext();
  const hariIni = todayInWib();
  const tanggal = tanggalValid(tanggalDiminta, hariIni);
  if (ctx.isDemo) return demoLaporan(tanggal, hariIni);

  const [kelasRows, enrollRows] = await Promise.all([
    db
      .select({ id: classes.id, name: classes.name })
      .from(classes)
      .where(and(eq(classes.tenantId, ctx.tenantId), eq(classes.isActive, true)))
      .orderBy(asc(classes.name)),
    db
      .select({
        studentId: students.id,
        name: students.name,
        photoUrl: students.photoUrl,
        classId: studentEnrollments.classId,
      })
      .from(studentEnrollments)
      .innerJoin(students, eq(students.id, studentEnrollments.studentId))
      .innerJoin(classes, eq(classes.id, studentEnrollments.classId))
      .where(
        and(
          eq(students.tenantId, ctx.tenantId),
          eq(students.isActive, true),
          eq(studentEnrollments.isActive, true),
          eq(classes.isActive, true),
        ),
      )
      .orderBy(asc(students.name)),
  ]);

  const ids = [...new Set(enrollRows.map((e) => e.studentId))];
  const [laporan, absen] = ids.length
    ? await Promise.all([
        db
          .select({
            id: dailyReports.id,
            studentId: dailyReports.studentId,
            mood: dailyReports.mood,
            meals: dailyReports.meals,
            nap: dailyReports.nap,
            activities: dailyReports.activities,
            notes: dailyReports.notes,
            photos: dailyReports.photos,
            penulis: user.name,
            dikirim: dailyReports.createdAt,
          })
          .from(dailyReports)
          .leftJoin(user, eq(user.id, dailyReports.tutorUserId))
          .where(and(inArray(dailyReports.studentId, ids), eq(dailyReports.reportDate, tanggal)))
          .orderBy(desc(dailyReports.createdAt)),
        db
          .select({ studentId: attendance.studentId, status: attendance.status })
          .from(attendance)
          .where(and(inArray(attendance.studentId, ids), eq(attendance.date, tanggal))),
      ])
    : [[], []];

  const baris: BarisLaporan[] = enrollRows.map((e) => {
    const l = laporan.find((r) => r.studentId === e.studentId);
    return {
      ...e,
      absen: absen.find((a) => a.studentId === e.studentId)?.status ?? null,
      laporan: l
        ? {
            id: l.id,
            mood: l.mood,
            meals: l.meals,
            nap: l.nap,
            activities: l.activities,
            notes: l.notes,
            photos: Array.isArray(l.photos) ? l.photos : [],
            penulis: l.penulis,
            dikirim: l.dikirim ? l.dikirim.toISOString() : null,
          }
        : null,
    };
  });

  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    tanggal,
    hariIni,
    kelas: kelasRows.map((k) => {
      const b = baris.filter((r) => r.classId === k.id);
      return { ...k, terdaftar: b.length, terlapor: b.filter((r) => r.laporan).length };
    }),
    baris,
  };
}

/* ------------------------------------------------------------------ */
/* Foto (tab kedua O7)                                                  */
/* ------------------------------------------------------------------ */

export interface FotoItem {
  id: string;
  photoKey: string;
  caption: string | null;
  studentName: string | null;
  classId: string | null;
  className: string | null;
  pengunggah: string | null;
  diunggah: string | null;
}

export interface FotoData {
  isDemo: boolean;
  diambilPada: string;
  foto: FotoItem[];
  kelas: { id: string; name: string }[];
  anak: { id: string; name: string }[];
}

export async function getFotoKegiatan(): Promise<FotoData> {
  const ctx = await requireTenantContext();
  if (ctx.isDemo)
    return { isDemo: true, diambilPada: new Date().toISOString(), foto: [], kelas: [], anak: [] };

  const [foto, kelas, anak] = await Promise.all([
    db
      .select({
        id: galleryPhotos.id,
        photoKey: galleryPhotos.photoKey,
        caption: galleryPhotos.caption,
        studentName: students.name,
        classId: galleryPhotos.classId,
        className: classes.name,
        pengunggah: user.name,
        diunggah: galleryPhotos.createdAt,
      })
      .from(galleryPhotos)
      .leftJoin(students, eq(galleryPhotos.studentId, students.id))
      .leftJoin(classes, eq(galleryPhotos.classId, classes.id))
      .leftJoin(user, eq(galleryPhotos.uploadedByUserId, user.id))
      .where(or(eq(students.tenantId, ctx.tenantId), eq(classes.tenantId, ctx.tenantId)))
      .orderBy(desc(galleryPhotos.createdAt))
      .limit(300),
    db
      .select({ id: classes.id, name: classes.name })
      .from(classes)
      .where(and(eq(classes.tenantId, ctx.tenantId), eq(classes.isActive, true)))
      .orderBy(asc(classes.name)),
    db
      .select({ id: students.id, name: students.name })
      .from(students)
      .where(and(eq(students.tenantId, ctx.tenantId), eq(students.isActive, true)))
      .orderBy(asc(students.name)),
  ]);

  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    foto: foto.map((f) => ({ ...f, diunggah: f.diunggah ? f.diunggah.toISOString() : null })),
    kelas,
    anak,
  };
}

/* ------------------------------------------------------------------ */
/* Data demo — contoh frame desain O7, bukan data lembaga mana pun        */
/* ------------------------------------------------------------------ */

function demoLaporan(tanggal: string, hariIni: string): LaporanHarianData {
  const jam = (hhmm: string) => new Date(`${tanggal}T${hhmm}:00+07:00`).toISOString();
  const l = (id: string, isi: Partial<LaporanAnak>): LaporanAnak => ({
    id,
    mood: null,
    meals: null,
    nap: null,
    activities: null,
    notes: null,
    photos: [],
    penulis: "Bu Sari",
    dikirim: jam("09:40"),
    ...isi,
  });
  const baris: BarisLaporan[] = [
    {
      studentId: "dl1",
      name: "Kayla Putri",
      photoUrl: null,
      classId: "dk1",
      absen: "present",
      laporan: l("r1", {
        mood: "Ceria sejak pagi",
        meals: "½ porsi bubur ayam wortel",
        nap: "12.30–14.05, nyenyak",
        activities: "Pasir kinetik bersama Naila",
      }),
    },
    {
      studentId: "dl2",
      name: "Bima Wibowo",
      photoUrl: null,
      classId: "dk1",
      absen: "present",
      laporan: l("r2", { meals: "Habis 1 porsi", nap: "1 jam", activities: "Menyusun balok" }),
    },
    { studentId: "dl3", name: "Naila Zahra", photoUrl: null, classId: "dk1", absen: "late", laporan: null },
    { studentId: "dl4", name: "Gibran Alfarizi", photoUrl: null, classId: "dk1", absen: null, laporan: null },
    { studentId: "dl5", name: "Arka Pratama", photoUrl: null, classId: "dk1", absen: "permit", laporan: null },
    {
      studentId: "dl6",
      name: "Shaka Ramadhan",
      photoUrl: null,
      classId: "dk2",
      absen: "present",
      laporan: l("r3", { activities: "Bermain di halaman", notes: "Lutut lecet ringan pukul 10.20, sudah dibersihkan.", penulis: "Bu Dina" }),
    },
  ];
  const kelas = [
    { id: "dk1", name: "Baby Bee" },
    { id: "dk2", name: "Toddler A" },
  ];
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    tanggal,
    hariIni,
    kelas: kelas.map((k) => {
      const b = baris.filter((r) => r.classId === k.id);
      return { ...k, terdaftar: b.length, terlapor: b.filter((r) => r.laporan).length };
    }),
    baris,
  };
}
