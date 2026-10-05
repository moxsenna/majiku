"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { students, studentEnrollments, classes } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";

export type StudentRecord = typeof students.$inferSelect;

export interface StudentEnrollmentDetail {
  enrollmentId: string;
  classId: string;
  className: string | null;
  sessionsQuota: number | null;
  sessionsUsed: number | null;
}

export interface StudentWithEnrollments {
  student: StudentRecord;
  enrollments: StudentEnrollmentDetail[];
}

export interface CreateStudentInput {
  name: string;
  dateOfBirth?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  parentEmail?: string | null;
  classId?: string;
  sessionsQuota?: number;
  billingDay?: number;
}

export interface UpdateStudentInput {
  name?: string;
  dateOfBirth?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  parentEmail?: string | null;
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

export async function listStudentsWithEnrollments(): Promise<StudentWithEnrollments[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("admin") && !roles.includes("moderator")) return [];

  const rows = await db
    .select({
      student: students,
      enrollmentId: studentEnrollments.id,
      classId: studentEnrollments.classId,
      className: classes.name,
      sessionsQuota: studentEnrollments.sessionsQuota,
      sessionsUsed: studentEnrollments.sessionsUsed,
    })
    .from(students)
    .leftJoin(studentEnrollments, eq(students.id, studentEnrollments.studentId))
    .leftJoin(classes, eq(studentEnrollments.classId, classes.id))
    .orderBy(desc(students.createdAt), asc(students.name));

  const map = new Map<string, StudentWithEnrollments>();
  for (const row of rows) {
    let entry = map.get(row.student.id);
    if (!entry) {
      entry = { student: row.student, enrollments: [] };
      map.set(row.student.id, entry);
    }
    if (row.enrollmentId && row.classId) {
      entry.enrollments.push({
        enrollmentId: row.enrollmentId,
        classId: row.classId,
        className: row.className,
        sessionsQuota: row.sessionsQuota,
        sessionsUsed: row.sessionsUsed,
      });
    }
  }

  return Array.from(map.values());
}

export async function createStudent(input: CreateStudentInput): Promise<{ id: string }> {
  await requireAdminOrModerator();

  if (!input.name || !input.name.trim()) {
    throw new Error("Nama siswa wajib diisi");
  }

  const studentId = randomUUID();
  const today = new Date().toISOString().slice(0, 10);

  await db.transaction(async (tx) => {
    await tx.insert(students).values({
      id: studentId,
      name: input.name.trim(),
      dateOfBirth: input.dateOfBirth?.trim() || null,
      parentName: input.parentName?.trim() || null,
      parentPhone: input.parentPhone?.trim() || null,
      parentEmail: input.parentEmail?.trim() || null,
      registrationDate: today,
      isActive: true,
    });

    if (input.classId?.trim()) {
      await tx.insert(studentEnrollments).values({
        id: randomUUID(),
        studentId,
        classId: input.classId.trim(),
        sessionsQuota:
          input.sessionsQuota !== undefined && !isNaN(Number(input.sessionsQuota))
            ? Number(input.sessionsQuota)
            : 12,
        sessionsUsed: 0,
        billingDay:
          input.billingDay !== undefined && !isNaN(Number(input.billingDay))
            ? Number(input.billingDay)
            : 1,
        enrollmentDate: today,
        isActive: true,
      });
    }
  });

  return { id: studentId };
}

export async function updateStudent(
  id: string,
  partial: UpdateStudentInput
): Promise<void> {
  await requireAdminOrModerator();

  if (!id) {
    throw new Error("ID siswa wajib diisi");
  }

  if (partial.name !== undefined && !partial.name.trim()) {
    throw new Error("Nama siswa tidak boleh kosong");
  }

  const updateValues: Partial<typeof students.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (partial.name !== undefined) updateValues.name = partial.name.trim();
  if (partial.dateOfBirth !== undefined) {
    updateValues.dateOfBirth =
      typeof partial.dateOfBirth === "string" ? partial.dateOfBirth.trim() || null : partial.dateOfBirth;
  }
  if (partial.parentName !== undefined) {
    updateValues.parentName =
      typeof partial.parentName === "string" ? partial.parentName.trim() || null : partial.parentName;
  }
  if (partial.parentPhone !== undefined) {
    updateValues.parentPhone =
      typeof partial.parentPhone === "string" ? partial.parentPhone.trim() || null : partial.parentPhone;
  }
  if (partial.parentEmail !== undefined) {
    updateValues.parentEmail =
      typeof partial.parentEmail === "string" ? partial.parentEmail.trim() || null : partial.parentEmail;
  }

  const result = await db
    .update(students)
    .set(updateValues)
    .where(eq(students.id, id))
    .returning({ id: students.id });

  if (result.length === 0) {
    throw new Error("Siswa tidak ditemukan");
  }
}

export async function toggleStudentActive(id: string, isActive: boolean): Promise<void> {
  await requireAdminOrModerator();

  if (!id) {
    throw new Error("ID siswa wajib diisi");
  }

  const result = await db
    .update(students)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(students.id, id))
    .returning({ id: students.id });

  if (result.length === 0) {
    throw new Error("Siswa tidak ditemukan");
  }
}
