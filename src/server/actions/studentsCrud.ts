"use server";

import { randomUUID } from "node:crypto";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { students, studentEnrollments, classes, user, userRoles } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";

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
  parentUserId?: string | null;
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
  parentUserId?: string | null;
}

export async function listStudentsWithEnrollments(): Promise<StudentWithEnrollments[]> {
  const ctx = await requireTenantContext();

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
    .where(eq(students.tenantId, ctx.tenantId))
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
  const ctx = await requireTenantContext();

  if (!input.name || !input.name.trim()) {
    throw new Error("Nama siswa wajib diisi");
  }

  const studentId = randomUUID();
  const today = new Date().toISOString().slice(0, 10);

  // Otomatis tautkan parent_user_id jika parentUserId disediakan atau email cocok dengan user terdaftar
  let parentUserId: string | null = input.parentUserId?.trim() || null;
  if (!parentUserId && input.parentEmail?.trim()) {
    const matchedUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, input.parentEmail.trim().toLowerCase()))
      .limit(1);
    if (matchedUser.length > 0) {
      parentUserId = matchedUser[0].id;
    }
  }

  await db.insert(students).values({
    id: studentId,
    tenantId: ctx.tenantId,
    name: input.name.trim(),
    dateOfBirth: input.dateOfBirth?.trim() || null,
    parentUserId,
    parentName: input.parentName?.trim() || null,
    parentPhone: input.parentPhone?.trim() || null,
    parentEmail: input.parentEmail?.trim() || null,
    registrationDate: today,
    isActive: true,
  });

  if (input.classId?.trim()) {
    const [targetClass] = await db
      .select({ id: classes.id })
      .from(classes)
      .where(and(eq(classes.id, input.classId.trim()), eq(classes.tenantId, ctx.tenantId)))
      .limit(1);
    if (!targetClass) {
      throw new Error("Kelas tidak ditemukan");
    }

    await db.insert(studentEnrollments).values({
      id: randomUUID(),
      studentId,
      classId: targetClass.id,
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

  return { id: studentId };
}

export async function updateStudent(
  id: string,
  partial: UpdateStudentInput
): Promise<void> {
  const ctx = await requireTenantContext();

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
    const trimmedEmail = typeof partial.parentEmail === "string" ? partial.parentEmail.trim() || null : partial.parentEmail;
    updateValues.parentEmail = trimmedEmail;
    if (partial.parentUserId === undefined && trimmedEmail) {
      const matchedUser = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, trimmedEmail.toLowerCase()))
        .limit(1);
      if (matchedUser.length > 0) {
        updateValues.parentUserId = matchedUser[0].id;
      }
    }
  }

  if (partial.parentUserId !== undefined) {
    updateValues.parentUserId = partial.parentUserId;
  }

  const result = await db
    .update(students)
    .set(updateValues)
    .where(and(eq(students.id, id), eq(students.tenantId, ctx.tenantId)))
    .returning({ id: students.id });

  if (result.length === 0) {
    throw new Error("Siswa tidak ditemukan");
  }
}

export async function linkStudentParent(
  studentId: string,
  parentUserId: string | null
): Promise<void> {
  const ctx = await requireTenantContext();
  if (!studentId) throw new Error("ID siswa wajib diisi");

  const result = await db
    .update(students)
    .set({
      parentUserId: parentUserId || null,
      updatedAt: new Date(),
    })
    .where(and(eq(students.id, studentId), eq(students.tenantId, ctx.tenantId)))
    .returning({ id: students.id });

  if (result.length === 0) {
    throw new Error("Siswa tidak ditemukan");
  }
}

export async function getLinkableParents(): Promise<
  Array<{ id: string; name: string; email: string }>
> {
  await requireTenantContext();
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .innerJoin(userRoles, eq(userRoles.userId, user.id))
    .where(eq(userRoles.role, "parent"))
    .orderBy(asc(user.name));

  return rows;
}

export async function toggleStudentActive(id: string, isActive: boolean): Promise<void> {
  const ctx = await requireTenantContext();

  if (!id) {
    throw new Error("ID siswa wajib diisi");
  }

  const result = await db
    .update(students)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(and(eq(students.id, id), eq(students.tenantId, ctx.tenantId)))
    .returning({ id: students.id });

  if (result.length === 0) {
    throw new Error("Siswa tidak ditemukan");
  }
}
