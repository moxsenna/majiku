"use server";

import { headers } from "next/headers";
import { sql, eq, and, or, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  students,
  classes,
  studentEnrollments,
  attendance,
  dailyReports,
  galleryPhotos,
} from "@/db/schema";
import { auth } from "@/server/auth";
import { isDemoEmail } from "@/lib/demo";
import { todayInWib } from "@/lib/datetime";
import { ensureDemoAttendanceToday } from "@/server/authz";

export interface ParentChildData {
  id: string;
  name: string;
  nickname: string;
  avatar?: string | null;
  className: string;
  classId?: string | null;
  age: number;
  attendanceToday: boolean;
  checkInTime?: string | null;
  recentPhotos: string[];
}

function calculateAge(birthDateStr?: string | null): number {
  if (!birthDateStr) return 4;
  try {
    const dob = new Date(birthDateStr);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    return Math.max(1, age);
  } catch {
    return 4;
  }
}

export async function getMyChildren(): Promise<ParentChildData[]> {
  let session = null;
  try {
    const h = await headers();
    session = await auth.api.getSession({ headers: h });
  } catch {
    return [];
  }

  if (!session?.user) {
    return [];
  }

  const userEmail = session.user.email;
  const isDemo = isDemoEmail(userEmail);

  if (isDemo) {
    await ensureDemoAttendanceToday().catch(() => {});
  }

  // --- QUERY REAL DATABASE ---
  // Keamanan: siswa HANYA diakses lewat parent_user_id (penautan eksplisit oleh
  // admin lembaga). Tidak ada auto-claim berbasis email — akun yang mendaftar
  // dengan email orang lain tidak boleh melihat data anak.
  const todayDate = todayInWib();

  // Query siswa terdaftar milik parent (parent_user_id; demo memakai id demo)
  const myStudents = await db
    .select({
      id: students.id,
      name: students.name,
      photoUrl: students.photoUrl,
      dateOfBirth: students.dateOfBirth,
      enrollmentId: studentEnrollments.id,
      classId: classes.id,
      className: classes.name,
    })
    .from(students)
    .leftJoin(
      studentEnrollments,
      and(
        eq(studentEnrollments.studentId, students.id),
        eq(studentEnrollments.isActive, true)
      )
    )
    .leftJoin(classes, eq(studentEnrollments.classId, classes.id))
    .where(
      and(
        isDemo
          ? or(
              eq(students.parentUserId, session.user.id),
              eq(students.id, "stu_demo_aisyah")
            )
          : eq(students.parentUserId, session.user.id),
        eq(students.isActive, true)
      )
    );

  // Fallback hanya jika tidak ada data sama sekali di database dan merupakan akun demo
  if (myStudents.length === 0) {
    if (isDemo) {
      return [
        {
          id: "demo-child-1",
          name: "Aisyah Putri",
          nickname: "Aisyah",
          avatar: "/images/avatars/student-aisyah.jpg",
          className: "Kelas Bunga Matahari",
          classId: "cls-1",
          age: 5,
          attendanceToday: true,
          checkInTime: "07:45",
          recentPhotos: [
            "/images/reports/report-aisyah-art.jpg",
            "/images/reports/report-aisyah-sensory.jpg",
            "/images/daycare/daycare-art.jpg",
            "/images/daycare/daycare-outdoor.jpg",
          ],
        },
      ];
    }
    return [];
  }

  // Ambil data absensi hari ini untuk anak-anak tersebut
  const studentIds = myStudents.map((s) => s.id);
  const todayAttendance = await db
    .select({
      studentId: attendance.studentId,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
    })
    .from(attendance)
    .where(
      and(
        eq(attendance.date, todayDate),
        sql`${attendance.studentId} IN ${studentIds}`
      )
    );

  const attendanceMap = new Map<string, { status: string; checkInTime?: string | null }>();
  for (const a of todayAttendance) {
    attendanceMap.set(a.studentId, {
      status: a.status,
      checkInTime: a.checkInTime ? String(a.checkInTime) : null,
    });
  }

  // Ambil foto laporan harian terbaru untuk masing-masing anak
  const recentReports = await db
    .select({
      studentId: dailyReports.studentId,
      photos: dailyReports.photos,
    })
    .from(dailyReports)
    .where(sql`${dailyReports.studentId} IN ${studentIds}`)
    .orderBy(desc(dailyReports.createdAt))
    .limit(10);

  const photosMap = new Map<string, string[]>();
  for (const r of recentReports) {
    if (r.photos && r.photos.length > 0) {
      const existing = photosMap.get(r.studentId) || [];
      photosMap.set(r.studentId, [...existing, ...r.photos]);
    }
  }

  // Ambil foto dokumentasi resmi dari tabel gallery_photos yang diunggah admin untuk anak/kelas ini
  const classIds = myStudents
    .map((s) => s.classId)
    .filter((cid): cid is string => Boolean(cid));

  const galleryConditions = [sql`${galleryPhotos.studentId} IN ${studentIds}`];
  if (classIds.length > 0) {
    galleryConditions.push(sql`${galleryPhotos.classId} IN ${classIds}`);
  }

  const adminPhotos = await db
    .select({
      studentId: galleryPhotos.studentId,
      classId: galleryPhotos.classId,
      photoKey: galleryPhotos.photoKey,
    })
    .from(galleryPhotos)
    .where(or(...galleryConditions))
    .orderBy(desc(galleryPhotos.createdAt))
    .limit(30);

  for (const p of adminPhotos) {
    if (p.studentId) {
      const existing = photosMap.get(p.studentId) || [];
      photosMap.set(p.studentId, [...existing, p.photoKey]);
    } else if (p.classId) {
      for (const s of myStudents) {
        if (s.classId === p.classId) {
          const existing = photosMap.get(s.id) || [];
          photosMap.set(s.id, [...existing, p.photoKey]);
        }
      }
    }
  }

  return myStudents.map((s) => {
    const att = attendanceMap.get(s.id);
    const photos = photosMap.get(s.id) || [];
    return {
      id: s.id,
      name: s.name,
      nickname: s.name.split(" ")[0],
      avatar: s.photoUrl,
      className: s.className || "Belum ada kelas",
      classId: s.classId,
      age: calculateAge(s.dateOfBirth ? String(s.dateOfBirth) : null),
      attendanceToday: att?.status === "present",
      checkInTime: att?.checkInTime,
      recentPhotos: Array.from(new Set(photos)),
    };
  });
}
