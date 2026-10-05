"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  dailyReports,
  students,
  classes,
  studentEnrollments,
  tutors,
  tutorClassAssignments,
} from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";
import { isValidDateString, todayInWib } from "@/lib/datetime";
import { deletePhoto } from "@/server/r2";

export interface DailyReportItem {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string | null;
  classId: string | null;
  className: string | null;
  tutorUserId: string | null;
  reportDate: string;
  mood: string | null;
  meals: string | null;
  nap: string | null;
  activities: string | null;
  notes: string | null;
  photos: string[] | null;
  status: "draft" | "submitted";
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type ReportRow = DailyReportItem;

export interface CreateDailyReportInput {
  studentIds: string[];
  reportDate: string;
  mood?: string | null;
  meals?: string | null;
  nap?: string | null;
  activities?: string | null;
  notes?: string | null;
  photos?: string[] | null;
}

export interface MyStudentItem {
  id: string;
  name: string;
  className: string | null;
  hasReportToday: boolean;
}

export interface StudentOption {
  id: string;
  name: string;
}

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

async function requireAdminOrModerator() {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login");
  }
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("admin") && !roles.includes("moderator")) {
    throw new Error("Hanya admin atau moderator yang memiliki akses");
  }
  return session;
}

async function requireTutorOrAdmin() {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login");
  }
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("admin") && !roles.includes("moderator") && !roles.includes("tutor")) {
    throw new Error("Hanya tutor atau admin yang memiliki akses untuk membuat laporan");
  }
  return session;
}

export async function listDailyReports(reportDate: string): Promise<DailyReportItem[]> {
  if (!reportDate || !isValidDateString(reportDate)) return [];

  const session = await getSessionSafely();
  if (!session) return [];

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAuthorized = roles.some((r) => ["admin", "moderator", "tutor"].includes(r));
  if (!isAuthorized) return [];

  const rows = await db
    .select({
      id: dailyReports.id,
      studentId: dailyReports.studentId,
      studentName: students.name,
      studentAvatar: students.photoUrl,
      classId: dailyReports.classId,
      className: classes.name,
      tutorUserId: dailyReports.tutorUserId,
      reportDate: dailyReports.reportDate,
      mood: dailyReports.mood,
      meals: dailyReports.meals,
      nap: dailyReports.nap,
      activities: dailyReports.activities,
      notes: dailyReports.notes,
      photos: dailyReports.photos,
      status: dailyReports.status,
      createdAt: dailyReports.createdAt,
      updatedAt: dailyReports.updatedAt,
    })
    .from(dailyReports)
    .innerJoin(students, eq(dailyReports.studentId, students.id))
    .leftJoin(classes, eq(dailyReports.classId, classes.id))
    .where(eq(dailyReports.reportDate, reportDate))
    .orderBy(desc(dailyReports.createdAt));

  return rows;
}

export async function createDailyReport(
  input: CreateDailyReportInput
): Promise<{ created: number }> {
  const session = await requireTutorOrAdmin();

  if (!input.studentIds || !Array.isArray(input.studentIds) || input.studentIds.length === 0) {
    throw new Error("Pilih minimal satu siswa");
  }

  const studentIds = Array.from(
    new Set(input.studentIds.map((id) => (typeof id === "string" ? id.trim() : "")).filter(Boolean))
  );

  if (studentIds.length === 0) {
    throw new Error("Pilih minimal satu siswa");
  }

  if (!input.reportDate || !isValidDateString(input.reportDate.trim())) {
    throw new Error("Format tanggal laporan tidak valid (harus YYYY-MM-DD)");
  }

  const activities = input.activities?.trim() || null;
  const notes = input.notes?.trim() || null;

  if (!activities && !notes) {
    throw new Error("Isi aktivitas atau catatan");
  }

  const mood = input.mood?.trim() || null;
  const meals = input.meals?.trim() || null;
  const nap = input.nap?.trim() || null;
  const reportDate = input.reportDate.trim();

  const REPORT_PHOTO_KEY_REGEX = /^reports\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/;
  let validatedPhotos: string[] = [];
  if (input.photos && Array.isArray(input.photos)) {
    if (input.photos.length > 6) {
      throw new Error("Maksimal 6 foto per laporan");
    }
    for (const key of input.photos) {
      if (typeof key !== "string" || !REPORT_PHOTO_KEY_REGEX.test(key)) {
        throw new Error("Key foto tidak valid");
      }
    }
    validatedPhotos = [...input.photos];
  }

  // Lookup classId dari student_enrollments aktif per siswa (satu query di awal untuk semua siswa)
  const enrollments = await db
    .select({
      studentId: studentEnrollments.studentId,
      classId: studentEnrollments.classId,
    })
    .from(studentEnrollments)
    .where(
      and(
        inArray(studentEnrollments.studentId, studentIds),
        eq(studentEnrollments.isActive, true)
      )
    );

  const studentClassMap = new Map<string, string>();
  for (const enr of enrollments) {
    if (!studentClassMap.has(enr.studentId) && enr.classId) {
      studentClassMap.set(enr.studentId, enr.classId);
    }
  }

  const rowsToInsert = studentIds.map((studentId) => ({
    id: randomUUID(),
    studentId,
    classId: studentClassMap.get(studentId) || null,
    tutorUserId: session.user.id,
    reportDate,
    mood,
    meals,
    nap,
    activities,
    notes,
    photos: validatedPhotos,
    status: "submitted" as const,
  }));

  await db.transaction(async (tx) => {
    await tx.insert(dailyReports).values(rowsToInsert);
  });

  return { created: studentIds.length };
}

export async function getMyStudents(): Promise<MyStudentItem[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const today = todayInWib();

  if (roles.includes("admin") || roles.includes("moderator")) {
    const rows = await db
      .select({
        id: students.id,
        name: students.name,
        className: classes.name,
        reportId: dailyReports.id,
      })
      .from(students)
      .leftJoin(
        studentEnrollments,
        and(
          eq(studentEnrollments.studentId, students.id),
          eq(studentEnrollments.isActive, true)
        )
      )
      .leftJoin(
        classes,
        and(
          eq(classes.id, studentEnrollments.classId),
          eq(classes.isActive, true)
        )
      )
      .leftJoin(
        dailyReports,
        and(
          eq(dailyReports.studentId, students.id),
          eq(dailyReports.reportDate, today)
        )
      )
      .where(eq(students.isActive, true))
      .orderBy(asc(students.name));

    const map = new Map<string, MyStudentItem>();
    for (const row of rows) {
      let entry = map.get(row.id);
      if (!entry) {
        entry = {
          id: row.id,
          name: row.name,
          className: row.className || null,
          hasReportToday: false,
        };
        map.set(row.id, entry);
      }
      if (!entry.className && row.className) {
        entry.className = row.className;
      }
      if (row.reportId) {
        entry.hasReportToday = true;
      }
    }

    return Array.from(map.values());
  }

  if (roles.includes("tutor")) {
    const rows = await db
      .select({
        id: students.id,
        name: students.name,
        className: classes.name,
        reportId: dailyReports.id,
      })
      .from(tutors)
      .innerJoin(
        tutorClassAssignments,
        and(
          eq(tutorClassAssignments.tutorId, tutors.id),
          eq(tutorClassAssignments.isActive, true)
        )
      )
      .innerJoin(
        classes,
        and(
          eq(classes.id, tutorClassAssignments.classId),
          eq(classes.isActive, true)
        )
      )
      .innerJoin(
        studentEnrollments,
        and(
          eq(studentEnrollments.classId, classes.id),
          eq(studentEnrollments.isActive, true)
        )
      )
      .innerJoin(
        students,
        and(
          eq(students.id, studentEnrollments.studentId),
          eq(students.isActive, true)
        )
      )
      .leftJoin(
        dailyReports,
        and(
          eq(dailyReports.studentId, students.id),
          eq(dailyReports.reportDate, today)
        )
      )
      .where(
        and(
          eq(tutors.userId, session.user.id),
          eq(tutors.isActive, true)
        )
      )
      .orderBy(asc(students.name));

    const map = new Map<string, MyStudentItem>();
    for (const row of rows) {
      let entry = map.get(row.id);
      if (!entry) {
        entry = {
          id: row.id,
          name: row.name,
          className: row.className || null,
          hasReportToday: false,
        };
        map.set(row.id, entry);
      }
      if (!entry.className && row.className) {
        entry.className = row.className;
      }
      if (row.reportId) {
        entry.hasReportToday = true;
      }
    }

    return Array.from(map.values());
  }

  return [];
}

export async function deleteDailyReport(id: string): Promise<void> {
  await requireAdminOrModerator();

  if (!id) {
    throw new Error("ID laporan wajib diisi");
  }

  const result = await db
    .delete(dailyReports)
    .where(eq(dailyReports.id, id))
    .returning({ id: dailyReports.id, photos: dailyReports.photos });

  if (result.length === 0) {
    throw new Error("Laporan tidak ditemukan");
  }

  const report = result[0];
  if (report?.photos && Array.isArray(report.photos)) {
    for (const key of report.photos) {
      if (typeof key === "string") {
        await deletePhoto(key).catch((err) =>
          console.error("Gagal hapus foto report R2:", key, err)
        );
      }
    }
  }
}

export async function getReportsForParent(): Promise<DailyReportItem[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("parent") && !roles.includes("admin")) return [];

  const myStudents = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.parentUserId, session.user.id));

  if (myStudents.length === 0) return [];
  const studentIds = myStudents.map((s) => s.id);

  const rows = await db
    .select({
      id: dailyReports.id,
      studentId: dailyReports.studentId,
      studentName: students.name,
      studentAvatar: students.photoUrl,
      classId: dailyReports.classId,
      className: classes.name,
      tutorUserId: dailyReports.tutorUserId,
      reportDate: dailyReports.reportDate,
      mood: dailyReports.mood,
      meals: dailyReports.meals,
      nap: dailyReports.nap,
      activities: dailyReports.activities,
      notes: dailyReports.notes,
      photos: dailyReports.photos,
      status: dailyReports.status,
      createdAt: dailyReports.createdAt,
      updatedAt: dailyReports.updatedAt,
    })
    .from(dailyReports)
    .innerJoin(students, eq(dailyReports.studentId, students.id))
    .leftJoin(classes, eq(dailyReports.classId, classes.id))
    .where(inArray(dailyReports.studentId, studentIds))
    .orderBy(desc(dailyReports.reportDate), desc(dailyReports.createdAt))
    .limit(20);

  return rows;
}

export async function getStudentOptions(): Promise<StudentOption[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAuthorized = roles.some((r) => ["admin", "moderator", "tutor"].includes(r));
  if (!isAuthorized) return [];

  return db
    .select({
      id: students.id,
      name: students.name,
    })
    .from(students)
    .where(eq(students.isActive, true))
    .orderBy(asc(students.name));
}
