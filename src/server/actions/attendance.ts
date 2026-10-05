"use server";

import { headers } from "next/headers";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { attendance, studentEnrollments, students, classes } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";

export interface AttendanceRow {
  id: string;
  date: string;
  status: string;
  studentName: string;
  className: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  permitType: string | null;
  permitReason?: string | null;
  isFreePermit?: boolean | null;
  checkedInBy?: string | null;
  studentId?: string;
  // Backward compatibility aliases for existing UI
  student_id?: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  permit_type?: string | null;
  permit_reason?: string | null;
  is_free_permit?: boolean | null;
  checked_in_by?: string | null;
  students?: { name: string };
  classes?: { name: string };
}

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

export async function getTodayAttendance(): Promise<AttendanceRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAdmin = roles.includes("admin") || roles.includes("moderator");
  const isTutor = roles.includes("tutor");
  const isParent = roles.includes("parent");

  if (!isAdmin && !isTutor && !isParent) return [];

  const today = new Date().toISOString().slice(0, 10);
  const conditions = [eq(attendance.date, today)];

  if (!isAdmin && isParent) {
    conditions.push(eq(students.parentUserId, session.user.id));
  }

  const rows = await db
    .select({
      id: attendance.id,
      date: attendance.date,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      permitType: attendance.permitType,
      permitReason: attendance.permitReason,
      isFreePermit: attendance.isFreePermit,
      checkedInBy: attendance.checkedInBy,
      studentId: attendance.studentId,
      studentName: students.name,
      className: classes.name,
    })
    .from(attendance)
    .innerJoin(students, eq(attendance.studentId, students.id))
    .innerJoin(classes, eq(attendance.classId, classes.id))
    .where(and(...conditions));

  return rows.map((r) => ({
    ...r,
    date: String(r.date),
    student_id: r.studentId,
    check_in_time: r.checkInTime,
    check_out_time: r.checkOutTime,
    permit_type: r.permitType,
    permit_reason: r.permitReason,
    is_free_permit: r.isFreePermit,
    checked_in_by: r.checkedInBy,
    students: { name: r.studentName },
    classes: { name: r.className },
  }));
}

export async function getMonthlyAttendance(year: number, month: number): Promise<AttendanceRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAdmin = roles.includes("admin") || roles.includes("moderator");
  const isTutor = roles.includes("tutor");
  const isParent = roles.includes("parent");

  if (!isAdmin && !isTutor && !isParent) return [];

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const conditions = [
    gte(attendance.date, startDate),
    lte(attendance.date, endDate),
  ];

  if (!isAdmin && isParent) {
    conditions.push(eq(students.parentUserId, session.user.id));
  }

  const rows = await db
    .select({
      id: attendance.id,
      date: attendance.date,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      permitType: attendance.permitType,
      permitReason: attendance.permitReason,
      isFreePermit: attendance.isFreePermit,
      checkedInBy: attendance.checkedInBy,
      studentId: attendance.studentId,
      studentName: students.name,
      className: classes.name,
    })
    .from(attendance)
    .innerJoin(students, eq(attendance.studentId, students.id))
    .innerJoin(classes, eq(attendance.classId, classes.id))
    .where(and(...conditions))
    .orderBy(desc(attendance.date));

  return rows.map((r) => ({
    ...r,
    date: String(r.date),
    student_id: r.studentId,
    check_in_time: r.checkInTime,
    check_out_time: r.checkOutTime,
    permit_type: r.permitType,
    permit_reason: r.permitReason,
    is_free_permit: r.isFreePermit,
    checked_in_by: r.checkedInBy,
    students: { name: r.studentName },
    classes: { name: r.className },
  }));
}

export interface AttendanceEnrollmentRow {
  id: string;
  studentId: string;
  classId: string;
  sessionsQuota: number;
  sessionsUsed: number;
  freePermitsAllowed: number;
  freePermitsUsed: number;
  studentName: string;
  className: string;
  // Aliases for legacy UI
  student_id: string;
  class_id: string;
  sessions_quota: number;
  sessions_used: number;
  free_permits_allowed: number;
  free_permits_used: number;
  students: { name: string };
  classes: { name: string };
}

export async function getAttendanceEnrollments(): Promise<AttendanceEnrollmentRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAdmin = roles.includes("admin") || roles.includes("moderator");
  const isTutor = roles.includes("tutor");
  const isParent = roles.includes("parent");

  if (!isAdmin && !isTutor && !isParent) return [];

  const conditions = [eq(studentEnrollments.isActive, true)];

  if (!isAdmin && isParent) {
    conditions.push(eq(students.parentUserId, session.user.id));
  }

  const rows = await db
    .select({
      id: studentEnrollments.id,
      studentId: studentEnrollments.studentId,
      classId: studentEnrollments.classId,
      sessionsQuota: studentEnrollments.sessionsQuota,
      sessionsUsed: studentEnrollments.sessionsUsed,
      freePermitsAllowed: studentEnrollments.freePermitsAllowed,
      freePermitsUsed: studentEnrollments.freePermitsUsed,
      studentName: students.name,
      className: classes.name,
    })
    .from(studentEnrollments)
    .innerJoin(students, eq(studentEnrollments.studentId, students.id))
    .innerJoin(classes, eq(studentEnrollments.classId, classes.id))
    .where(and(...conditions));

  return rows.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    classId: r.classId,
    sessionsQuota: r.sessionsQuota ?? 0,
    sessionsUsed: r.sessionsUsed ?? 0,
    freePermitsAllowed: r.freePermitsAllowed ?? 0,
    freePermitsUsed: r.freePermitsUsed ?? 0,
    studentName: r.studentName,
    className: r.className,
    student_id: r.studentId,
    class_id: r.classId,
    sessions_quota: r.sessionsQuota ?? 0,
    sessions_used: r.sessionsUsed ?? 0,
    free_permits_allowed: r.freePermitsAllowed ?? 0,
    free_permits_used: r.freePermitsUsed ?? 0,
    students: { name: r.studentName },
    classes: { name: r.className },
  }));
}
