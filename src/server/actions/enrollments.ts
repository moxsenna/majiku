"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { studentEnrollments, students, classes } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";

export interface MoveStudentClassInput {
  studentId: string;
  fromClassId?: string | null;
  toClassId: string;
}

export async function moveStudentClass(input: MoveStudentClassInput): Promise<{ ok: boolean }> {
  const { tenantId } = await requireTenantContext();

  const studentId = input.studentId?.trim();
  const toClassId = input.toClassId?.trim();
  const fromClassId = input.fromClassId?.trim() || null;

  if (!studentId || !toClassId) {
    throw new Error("Student ID dan target Class ID wajib diisi");
  }

  // Verifikasi student milik tenant
  const [student] = await db
    .select({ id: students.id, tenantId: students.tenantId })
    .from(students)
    .where(and(eq(students.id, studentId), eq(students.tenantId, tenantId)))
    .limit(1);

  if (!student) {
    throw new Error("Siswa tidak ditemukan atau bukan milik lembaga Anda");
  }

  // Verifikasi kelas target milik tenant
  const [targetClass] = await db
    .select({
      id: classes.id,
      tenantId: classes.tenantId,
      sessionsPerMonth: classes.sessionsPerMonth,
    })
    .from(classes)
    .where(and(eq(classes.id, toClassId), eq(classes.tenantId, tenantId)))
    .limit(1);

  if (!targetClass) {
    throw new Error("Kelas tujuan tidak ditemukan atau bukan milik lembaga Anda");
  }

  // Nonaktifkan enrollment lama
  if (fromClassId) {
    await db
      .update(studentEnrollments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(studentEnrollments.studentId, studentId),
          eq(studentEnrollments.classId, fromClassId)
        )
      );
  } else {
    // Nonaktifkan seluruh enrollment aktif siswa
    await db
      .update(studentEnrollments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(studentEnrollments.studentId, studentId),
          eq(studentEnrollments.isActive, true)
        )
      );
  }

  // Cek apakah sudah pernah terdaftar di kelas target (unique student_id + class_id)
  const today = new Date().toISOString().slice(0, 10);
  const existingTargetEnrollment = await db
    .select({ id: studentEnrollments.id })
    .from(studentEnrollments)
    .where(
      and(
        eq(studentEnrollments.studentId, studentId),
        eq(studentEnrollments.classId, toClassId)
      )
    )
    .limit(1);

  if (existingTargetEnrollment.length > 0) {
    await db
      .update(studentEnrollments)
      .set({
        isActive: true,
        enrollmentDate: today,
        sessionsQuota: targetClass.sessionsPerMonth ?? 20,
        updatedAt: new Date(),
      })
      .where(eq(studentEnrollments.id, existingTargetEnrollment[0].id));
  } else {
    await db.insert(studentEnrollments).values({
      id: randomUUID(),
      studentId,
      classId: toClassId,
      sessionsQuota: targetClass.sessionsPerMonth ?? 20,
      sessionsUsed: 0,
      freePermitsAllowed: 2,
      freePermitsUsed: 0,
      enrollmentDate: today,
      billingDay: 1,
      isActive: true,
    });
  }

  return { ok: true };
}
