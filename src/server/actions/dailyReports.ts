"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { dailyReports, students, classes } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";
import { isValidDateString } from "@/lib/datetime";

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

export interface CreateDailyReportInput {
  studentId: string;
  reportDate: string;
  classId?: string | null;
  mood?: string | null;
  meals?: string | null;
  nap?: string | null;
  activities?: string | null;
  notes?: string | null;
  photos?: string[];
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
): Promise<{ id: string }> {
  const session = await requireTutorOrAdmin();

  if (!input.studentId || !input.studentId.trim()) {
    throw new Error("Siswa wajib dipilih");
  }
  if (!input.reportDate || !isValidDateString(input.reportDate.trim())) {
    throw new Error("Format tanggal laporan tidak valid (harus YYYY-MM-DD)");
  }

  const reportId = randomUUID();

  await db.insert(dailyReports).values({
    id: reportId,
    studentId: input.studentId.trim(),
    classId: input.classId?.trim() || null,
    tutorUserId: session.user.id,
    reportDate: input.reportDate.trim(),
    mood: input.mood?.trim() || null,
    meals: input.meals?.trim() || null,
    nap: input.nap?.trim() || null,
    activities: input.activities?.trim() || null,
    notes: input.notes?.trim() || null,
    photos: input.photos || [],
    status: "submitted",
  });

  return { id: reportId };
}

export async function deleteDailyReport(id: string): Promise<void> {
  await requireAdminOrModerator();

  if (!id) {
    throw new Error("ID laporan wajib diisi");
  }

  const result = await db
    .delete(dailyReports)
    .where(eq(dailyReports.id, id))
    .returning({ id: dailyReports.id });

  if (result.length === 0) {
    throw new Error("Laporan tidak ditemukan");
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
