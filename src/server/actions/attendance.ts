"use server";

import { headers } from "next/headers";
import { and, desc, eq, gte, lte, or, inArray } from "drizzle-orm";
import { db } from "@/db";
import { attendance, studentEnrollments, students, classes, tutors, tutorAttendance, tutorClassAssignments } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";
import { requireRoles, resolveTenantIdForUser } from "@/server/authz";
import { todayInWib, timeInWib } from "@/lib/datetime";

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

/**
 * Kondisi scope tenant untuk staff (admin/tutor):
 * admin -> seluruh siswa lembaganya; tutor -> hanya kelas penugasannya di lembaganya.
 * Dipanggil dengan drizzle `inArray` pada kolom classId/tenantId terkait.
 */
async function tenantScopeConditions(
  session: NonNullable<Awaited<ReturnType<typeof getSessionSafely>>>,
  role: "admin" | "tutor"
): Promise<{ tenantCondition: ReturnType<typeof eq>; assignedClassIds: string[] | null } | null> {
  const tenantId = await resolveTenantIdForUser(session.user.id);
  if (!tenantId) return null; // akun staff tanpa lembaga -> tidak melihat apa pun

  if (role === "admin") {
    return { tenantCondition: eq(students.tenantId, tenantId), assignedClassIds: null };
  }

  const assignedClassIds = await db
    .select({ id: classes.id })
    .from(tutorClassAssignments)
    .innerJoin(tutors, eq(tutors.id, tutorClassAssignments.tutorId))
    .innerJoin(classes, eq(classes.id, tutorClassAssignments.classId))
    .where(and(eq(tutors.userId, session.user.id), eq(classes.tenantId, tenantId)));

  return {
    tenantCondition: eq(students.tenantId, tenantId),
    assignedClassIds: assignedClassIds.map((c) => c.id),
  };
}

export async function getTodayAttendance(): Promise<AttendanceRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAdmin = roles.includes("admin") || roles.includes("moderator");
  const isTutor = roles.includes("tutor");
  const isParent = roles.includes("parent");

  if (!isAdmin && !isTutor && !isParent) return [];

  const today = todayInWib();
  const conditions = [eq(attendance.date, today)];

  if (!isAdmin && !isTutor && isParent) {
    conditions.push(
      session.user.email
        ? or(eq(students.parentUserId, session.user.id), eq(students.parentEmail, session.user.email))!
        : eq(students.parentUserId, session.user.id)
    );
  } else if (!isParent) {
    // Isolasi tenant staff: admin lembaga -> lembaganya; tutor -> kelas penugasannya saja
    const scope = await tenantScopeConditions(session, isTutor && !isAdmin ? "tutor" : "admin");
    if (!scope) return [];
    conditions.push(scope.tenantCondition);
    if (scope.assignedClassIds) {
      if (scope.assignedClassIds.length === 0) return [];
      conditions.push(inArray(attendance.classId, scope.assignedClassIds));
    }
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

  if (!isAdmin && !isTutor && isParent) {
    conditions.push(
      session.user.email
        ? or(eq(students.parentUserId, session.user.id), eq(students.parentEmail, session.user.email))!
        : eq(students.parentUserId, session.user.id)
    );
  } else if (!isParent) {
    const scope = await tenantScopeConditions(session, isTutor && !isAdmin ? "tutor" : "admin");
    if (!scope) return [];
    conditions.push(scope.tenantCondition);
    if (scope.assignedClassIds) {
      if (scope.assignedClassIds.length === 0) return [];
      conditions.push(inArray(attendance.classId, scope.assignedClassIds));
    }
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

  if (!isAdmin && !isTutor && isParent) {
    conditions.push(
      session.user.email
        ? or(eq(students.parentUserId, session.user.id), eq(students.parentEmail, session.user.email))!
        : eq(students.parentUserId, session.user.id)
    );
  } else if (!isParent) {
    const scope = await tenantScopeConditions(session, isTutor && !isAdmin ? "tutor" : "admin");
    if (!scope) return [];
    conditions.push(scope.tenantCondition);
    if (scope.assignedClassIds) {
      if (scope.assignedClassIds.length === 0) return [];
      conditions.push(inArray(studentEnrollments.classId, scope.assignedClassIds));
    }
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

export async function recordStudentCheckIn(input: {
  attendanceId?: string;
  studentId: string;
  classId?: string;
}) {
  const session = await requireRoles("admin", "tutor", "moderator");
  const tenantId = await resolveTenantIdForUser(session.user.id);
  if (!tenantId) throw new Error("Forbidden: akun tidak terhubung ke lembaga mana pun");

  // Guard tenant: siswa wajib milik lembaga pemanggil
  const [student] = await db
    .select({ id: students.id, tenantId: students.tenantId })
    .from(students)
    .where(eq(students.id, input.studentId))
    .limit(1);
  if (!student || student.tenantId !== tenantId) {
    throw new Error("Forbidden: siswa bukan milik lembaga Anda");
  }

  const now = new Date();
  const timeStr = timeInWib(now);
  const today = todayInWib(now);

  if (input.attendanceId) {
    // Pastikan record absensi yang diupdate milik lembaga yang sama
    const [record] = await db
      .select({ tenantId: students.tenantId })
      .from(attendance)
      .innerJoin(students, eq(students.id, attendance.studentId))
      .where(eq(attendance.id, input.attendanceId))
      .limit(1);
    if (!record || record.tenantId !== tenantId) {
      throw new Error("Not found: record absensi tidak ditemukan");
    }
    await db
      .update(attendance)
      .set({
        checkInTime: timeStr,
        status: "present",
        checkedInBy: session.user.name || "Admin",
        updatedAt: now,
      })
      .where(eq(attendance.id, input.attendanceId));
    return { success: true, time: timeStr };
  }

  // Create new attendance record — kelas diambil dari enrollment aktif siswa.
  // Tidak ada lagi fallback kelas acak: siswa tanpa kelas ditolak dengan pesan jelas.
  let classId = input.classId;
  if (!classId) {
    const [enrollment] = await db
      .select({ classId: studentEnrollments.classId })
      .from(studentEnrollments)
      .where(and(eq(studentEnrollments.studentId, input.studentId), eq(studentEnrollments.isActive, true)))
      .limit(1);
    classId = enrollment?.classId;
  }

  if (!classId) {
    throw new Error("Siswa belum terdaftar di kelas mana pun — daftarkan kelas terlebih dahulu");
  }

  // Kelas wajib milik lembaga yang sama
  const [classRow] = await db
    .select({ tenantId: classes.tenantId })
    .from(classes)
    .where(eq(classes.id, classId))
    .limit(1);
  if (!classRow || classRow.tenantId !== tenantId) {
    throw new Error("Forbidden: kelas bukan milik lembaga Anda");
  }

  const id = crypto.randomUUID();
  await db.insert(attendance).values({
    id,
    studentId: input.studentId,
    classId,
    date: today,
    status: "present",
    checkInTime: timeStr,
    checkedInBy: session.user.name || "Admin",
  });

  return { success: true, id, time: timeStr };
}

export async function recordStudentCheckOut(input: { attendanceId: string }) {
  const session = await requireRoles("admin", "tutor", "moderator");
  const tenantId = await resolveTenantIdForUser(session.user.id);
  if (!tenantId) throw new Error("Forbidden: akun tidak terhubung ke lembaga mana pun");

  const [record] = await db
    .select({ id: attendance.id, tenantId: students.tenantId })
    .from(attendance)
    .innerJoin(students, eq(students.id, attendance.studentId))
    .where(eq(attendance.id, input.attendanceId))
    .limit(1);
  if (!record || record.tenantId !== tenantId) {
    throw new Error("Not found: record absensi tidak ditemukan");
  }

  const now = new Date();
  const timeStr = timeInWib(now);

  await db
    .update(attendance)
    .set({
      checkOutTime: timeStr,
      updatedAt: now,
    })
    .where(eq(attendance.id, input.attendanceId));

  return { success: true, time: timeStr };
}

export async function recordTutorAttendance(input: {
  type: "check-in" | "check-out";
  time?: string;
  method?: string;
  notes?: string;
}) {
  const session = await getSessionSafely();
  if (!session) throw new Error("Unauthorized");
  const now = new Date();
  // Waktu selalu dari server (WIB) — jangan percaya jam perangkat klien
  const timeStr = timeInWib(now);
  const today = todayInWib(now);

  // Cari profil tutor berdasarkan user_id
  const tutorRows = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(eq(tutors.userId, session.user.id))
    .limit(1);
  const tutorId = tutorRows[0]?.id || null;

  // Cek apakah sudah ada record absensi guru untuk hari ini
  const existingConditions = [
    eq(tutorAttendance.date, today),
    or(
      eq(tutorAttendance.userId, session.user.id),
      tutorId ? eq(tutorAttendance.tutorId, tutorId) : eq(tutorAttendance.userId, session.user.id)
    ),
  ];

  const existing = await db
    .select()
    .from(tutorAttendance)
    .where(and(...existingConditions))
    .limit(1);

  if (existing.length > 0) {
    const recordId = existing[0].id;
    if (input.type === "check-in") {
      await db
        .update(tutorAttendance)
        .set({
          checkInTime: timeStr,
          status: "hadir",
          method: input.method || "manual",
          notes: input.notes || existing[0].notes,
          updatedAt: now,
        })
        .where(eq(tutorAttendance.id, recordId));
    } else {
      await db
        .update(tutorAttendance)
        .set({
          checkOutTime: timeStr,
          updatedAt: now,
        })
        .where(eq(tutorAttendance.id, recordId));
    }
    return { success: true, id: recordId, time: timeStr, type: input.type };
  }

  // Belum ada record hari ini: buat baru
  const id = crypto.randomUUID();
  await db.insert(tutorAttendance).values({
    id,
    tutorId,
    userId: session.user.id,
    date: today,
    checkInTime: input.type === "check-in" ? timeStr : null,
    checkOutTime: input.type === "check-out" ? timeStr : null,
    status: "hadir",
    method: input.method || "manual",
    notes: input.notes || null,
  });

  return { success: true, id, time: timeStr, type: input.type };
}

export async function getMyTutorAttendanceToday() {
  const session = await getSessionSafely();
  if (!session) return null;
  const today = todayInWib();

  const tutorRows = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(eq(tutors.userId, session.user.id))
    .limit(1);
  const tutorId = tutorRows[0]?.id || null;

  const rows = await db
    .select()
    .from(tutorAttendance)
    .where(
      and(
        eq(tutorAttendance.date, today),
        or(
          eq(tutorAttendance.userId, session.user.id),
          tutorId ? eq(tutorAttendance.tutorId, tutorId) : eq(tutorAttendance.userId, session.user.id)
        )
      )
    )
    .limit(1);

  return rows[0] || null;
}

export async function getMyTutorAttendanceHistory(limit = 10) {
  const session = await getSessionSafely();
  if (!session) return [];

  const tutorRows = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(eq(tutors.userId, session.user.id))
    .limit(1);
  const tutorId = tutorRows[0]?.id || null;

  const rows = await db
    .select()
    .from(tutorAttendance)
    .where(
      or(
        eq(tutorAttendance.userId, session.user.id),
        tutorId ? eq(tutorAttendance.tutorId, tutorId) : eq(tutorAttendance.userId, session.user.id)
      )
    )
    .orderBy(desc(tutorAttendance.date))
    .limit(limit);

  return rows;
}

export async function getTodayTutorAttendanceList() {
  const session = await getSessionSafely();
  if (!session) return [];
  const today = todayInWib();

  const allTutors = await db
    .select({
      id: tutors.id,
      name: tutors.name,
      photoUrl: tutors.photoUrl,
    })
    .from(tutors)
    .where(eq(tutors.isActive, true));

  const todayRecords = await db
    .select()
    .from(tutorAttendance)
    .where(eq(tutorAttendance.date, today));

  const recordMap = new Map(todayRecords.map((r) => [r.tutorId || r.userId, r]));

  return allTutors.map((t) => {
    const rec = recordMap.get(t.id);
    return {
      id: t.id,
      name: t.name,
      avatar: t.photoUrl,
      status: rec?.status || (rec?.checkInTime ? "hadir" : "belum"),
      checkInTime: rec?.checkInTime || null,
      checkOutTime: rec?.checkOutTime || null,
    };
  });
}
