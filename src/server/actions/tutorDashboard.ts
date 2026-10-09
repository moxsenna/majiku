"use server";

import { headers } from "next/headers";
import { sql, eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  tutors,
  classes,
  tutorClassAssignments,
  students,
  studentEnrollments,
  attendance,
  dailyReports,
  classSchedules,
} from "@/db/schema";
import { auth } from "@/server/auth";
import { isDemoEmail } from "@/lib/demo";
import { todayInWib } from "@/lib/datetime";

export interface TutorStudentItem {
  id: string;
  name: string;
  class: string;
  avatar?: string | null;
  status: "hadir" | "izin" | "belum";
  needsReport: boolean;
}

export interface TutorScheduleItem {
  id: string;
  date: string;
  dayName: string;
  className: string;
  time: string;
  location: string;
  studentsCount: number;
  status: "today" | "upcoming";
}

export interface TutorDashboardData {
  isDemo: boolean;
  isAssigned: boolean;
  tutorName: string;
  todayPresentCount: number;
  pendingReportsCount: number;
  unreadMessagesCount: number;
  kpiScore: number;
  todayStudents: TutorStudentItem[];
  schedules: TutorScheduleItem[];
}

export async function getTutorDashboardOverview(): Promise<TutorDashboardData> {
  let session = null;
  try {
    const h = await headers();
    session = await auth.api.getSession({ headers: h });
  } catch {
    // fallback
  }

  const userEmail = session?.user?.email;
  const isDemo = isDemoEmail(userEmail);

  // Akun demo (*@majiku.test) menyajikan dataset demo
  if (isDemo) {
    return {
      isDemo: true,
      isAssigned: true,
      tutorName: session?.user?.name || "Bu Rina",
      todayPresentCount: 12,
      pendingReportsCount: 5,
      unreadMessagesCount: 3,
      kpiScore: 92,
      todayStudents: [
        { id: "1", name: "Ahmad Rizki", class: "Kelas Bunga Matahari", avatar: "", status: "hadir", needsReport: true },
        { id: "2", name: "Siti Aisyah", class: "Kelas Bunga Matahari", avatar: "", status: "hadir", needsReport: false },
        { id: "3", name: "Budi Santoso", class: "Kelas Bintang", avatar: "", status: "hadir", needsReport: true },
        { id: "4", name: "Dewi Lestari", class: "Kelas Pelangi", avatar: "", status: "izin", needsReport: false },
      ],
      schedules: [
        { id: "1", date: "Hari ini", dayName: "Hari ini", className: "Kelas Bunga Matahari", time: "08:00 - 12:00", location: "Ruang A1", studentsCount: 15, status: "today" },
        { id: "2", date: "Besok", dayName: "Besok", className: "Kelas Pelangi", time: "08:00 - 12:00", location: "Ruang A2", studentsCount: 12, status: "upcoming" },
      ],
    };
  }

  // --- QUERY REAL DATABASE UNTUK AKUN TUTOR NON-DEMO ---
  if (!session?.user) {
    return {
      isDemo: false,
      isAssigned: false,
      tutorName: "Tutor",
      todayPresentCount: 0,
      pendingReportsCount: 0,
      unreadMessagesCount: 0,
      kpiScore: 0,
      todayStudents: [],
      schedules: [],
    };
  }

  const todayDate = todayInWib();

  // 1. Cari profil tutor dari user ID
  const [tutorRecord] = await db
    .select({
      id: tutors.id,
      name: tutors.name,
    })
    .from(tutors)
    .where(and(eq(tutors.userId, session.user.id), eq(tutors.isActive, true)));

  if (!tutorRecord) {
    return {
      isDemo: false,
      isAssigned: false,
      tutorName: session.user.name || "Tutor",
      todayPresentCount: 0,
      pendingReportsCount: 0,
      unreadMessagesCount: 0,
      kpiScore: 0,
      todayStudents: [],
      schedules: [],
    };
  }

  // 2. Cari kelas yang ditugaskan kepada tutor ini
  const assignedClasses = await db
    .select({
      id: classes.id,
      name: classes.name,
      location: classes.location,
    })
    .from(tutorClassAssignments)
    .innerJoin(classes, eq(classes.id, tutorClassAssignments.classId))
    .where(
      and(
        eq(tutorClassAssignments.tutorId, tutorRecord.id),
        eq(tutorClassAssignments.isActive, true),
        eq(classes.isActive, true)
      )
    );

  if (assignedClasses.length === 0) {
    return {
      isDemo: false,
      isAssigned: false,
      tutorName: tutorRecord.name,
      todayPresentCount: 0,
      pendingReportsCount: 0,
      unreadMessagesCount: 0,
      kpiScore: 0,
      todayStudents: [],
      schedules: [],
    };
  }

  const classIds = assignedClasses.map((c) => c.id);

  // 3. Cari siswa yang aktif terdaftar di kelas-kelas tutor ini
  const enrolledStudents = await db
    .select({
      id: students.id,
      name: students.name,
      avatar: students.photoUrl,
      classId: classes.id,
      className: classes.name,
    })
    .from(studentEnrollments)
    .innerJoin(students, eq(students.id, studentEnrollments.studentId))
    .innerJoin(classes, eq(classes.id, studentEnrollments.classId))
    .where(
      and(
        sql`${studentEnrollments.classId} IN ${classIds}`,
        eq(studentEnrollments.isActive, true),
        eq(students.isActive, true)
      )
    );

  const studentIds = enrolledStudents.map((s) => s.id);

  // 4. Periksa absensi hari ini
  const attendanceToday = studentIds.length > 0
    ? await db
        .select({
          studentId: attendance.studentId,
          status: attendance.status,
        })
        .from(attendance)
        .where(
          and(
            eq(attendance.date, todayDate),
            sql`${attendance.studentId} IN ${studentIds}`
          )
        )
    : [];

  const attMap = new Map<string, string>();
  for (const a of attendanceToday) {
    attMap.set(a.studentId, a.status);
  }

  // 5. Periksa laporan harian hari ini
  const reportsToday = studentIds.length > 0
    ? await db
        .select({
          studentId: dailyReports.studentId,
        })
        .from(dailyReports)
        .where(
          and(
            eq(dailyReports.reportDate, todayDate),
            sql`${dailyReports.studentId} IN ${studentIds}`
          )
        )
    : [];

  const reportedStudentIds = new Set(reportsToday.map((r) => r.studentId));

  const mappedStudents: TutorStudentItem[] = enrolledStudents.map((s) => {
    const rawStatus = attMap.get(s.id);
    let status: "hadir" | "izin" | "belum" = "belum";
    if (rawStatus === "present") status = "hadir";
    else if (rawStatus === "permit" || rawStatus === "absent") status = "izin";

    return {
      id: s.id,
      name: s.name,
      class: s.className,
      avatar: s.avatar,
      status,
      needsReport: !reportedStudentIds.has(s.id),
    };
  });

  const todayPresentCount = mappedStudents.filter((s) => s.status === "hadir").length;

  // 6. Ambil jadwal dari classSchedules
  const schedulesList = await db
    .select({
      id: classSchedules.id,
      dayOfWeek: classSchedules.dayOfWeek,
      startTime: classSchedules.startTime,
      durationMinutes: classSchedules.durationMinutes,
      location: classSchedules.location,
      classId: classes.id,
      className: classes.name,
    })
    .from(classSchedules)
    .innerJoin(classes, eq(classes.id, classSchedules.classId))
    .where(
      and(
        sql`${classSchedules.classId} IN ${classIds}`,
        eq(classSchedules.isActive, true)
      )
    )
    .limit(10);

  const mappedSchedules: TutorScheduleItem[] = schedulesList.map((sch) => ({
    id: sch.id,
    date: `Hari ${sch.dayOfWeek}`,
    dayName: `Hari ${sch.dayOfWeek}`,
    className: sch.className,
    time: `${sch.startTime || "08:00"} (${sch.durationMinutes || 60}m)`,
    location: sch.location || "Ruang Kelas",
    studentsCount: enrolledStudents.filter((s) => s.classId === sch.classId).length,
    status: "today",
  }));

  return {
    isDemo: false,
    isAssigned: true,
    tutorName: tutorRecord.name,
    todayPresentCount,
    pendingReportsCount: mappedStudents.filter((s) => s.needsReport).length,
    unreadMessagesCount: 0,
    kpiScore: 90,
    todayStudents: mappedStudents,
    schedules: mappedSchedules,
  };
}
