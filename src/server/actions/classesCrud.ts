"use server";

import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { classes, tutorClassAssignments, tutors } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";

export type ClassRecord = typeof classes.$inferSelect;

export interface ClassWithTutorRecord extends ClassRecord {
  tutorId?: string | null;
  tutorName?: string | null;
}

export interface CreateClassInput {
  name: string;
  description?: string | null;
  capacity?: number | null;
  pricePerMonth?: number | string | null;
  sessionsPerMonth?: number | null;
  schedule?: string | null;
  location?: string | null;
  tutorId?: string | null;
}

export interface UpdateClassInput {
  name?: string;
  description?: string | null;
  capacity?: number | null;
  pricePerMonth?: number | string | null;
  sessionsPerMonth?: number | null;
  schedule?: string | null;
  location?: string | null;
  tutorId?: string | null;
}

export async function listClasses(): Promise<ClassRecord[]> {
  const ctx = await requireTenantContext();
  return await db
    .select()
    .from(classes)
    .where(eq(classes.tenantId, ctx.tenantId))
    .orderBy(asc(classes.name));
}

export async function createClass(input: CreateClassInput): Promise<{ id: string }> {
  const ctx = await requireTenantContext();

  if (!input.name || !input.name.trim()) {
    throw new Error("Nama kelas wajib diisi");
  }

  const id = randomUUID();
  const priceStr =
    input.pricePerMonth !== undefined && input.pricePerMonth !== null && String(input.pricePerMonth).trim() !== ""
      ? String(input.pricePerMonth)
      : null;

  await db.insert(classes).values({
    id,
    tenantId: ctx.tenantId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    capacity:
      input.capacity !== undefined && input.capacity !== null && !isNaN(Number(input.capacity))
        ? Number(input.capacity)
        : null,
    pricePerMonth: priceStr,
    sessionsPerMonth:
      input.sessionsPerMonth !== undefined && input.sessionsPerMonth !== null && !isNaN(Number(input.sessionsPerMonth))
        ? Number(input.sessionsPerMonth)
        : null,
    schedule: input.schedule?.trim() || null,
    location: input.location?.trim() || null,
    isActive: true,
  });

  if (input.tutorId && input.tutorId.trim() && input.tutorId !== "none") {
    const [tutor] = await db
      .select({ id: tutors.id })
      .from(tutors)
      .where(and(eq(tutors.id, input.tutorId.trim()), eq(tutors.tenantId, ctx.tenantId)))
      .limit(1);

    if (tutor) {
      await db.insert(tutorClassAssignments).values({
        id: randomUUID(),
        tutorId: tutor.id,
        classId: id,
        ratePerSession: "50000",
        isActive: true,
      }).onConflictDoNothing();
    }
  }

  return { id };
}

export async function updateClass(id: string, partial: UpdateClassInput): Promise<void> {
  const ctx = await requireTenantContext();

  if (!id) {
    throw new Error("ID kelas wajib diisi");
  }

  if (partial.name !== undefined && !partial.name.trim()) {
    throw new Error("Nama kelas tidak boleh kosong");
  }

  const updateValues: Partial<typeof classes.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (partial.name !== undefined) updateValues.name = partial.name.trim();
  if (partial.description !== undefined) {
    updateValues.description =
      typeof partial.description === "string" ? partial.description.trim() || null : partial.description;
  }
  if (partial.capacity !== undefined) {
    updateValues.capacity =
      partial.capacity !== null && !isNaN(Number(partial.capacity)) ? Number(partial.capacity) : null;
  }
  if (partial.pricePerMonth !== undefined) {
    updateValues.pricePerMonth =
      partial.pricePerMonth !== null && String(partial.pricePerMonth).trim() !== ""
        ? String(partial.pricePerMonth).trim()
        : null;
  }
  if (partial.sessionsPerMonth !== undefined) {
    updateValues.sessionsPerMonth =
      partial.sessionsPerMonth !== null && !isNaN(Number(partial.sessionsPerMonth))
        ? Number(partial.sessionsPerMonth)
        : null;
  }
  if (partial.schedule !== undefined) {
    updateValues.schedule =
      typeof partial.schedule === "string" ? partial.schedule.trim() || null : partial.schedule;
  }
  if (partial.location !== undefined) {
    updateValues.location =
      typeof partial.location === "string" ? partial.location.trim() || null : partial.location;
  }

  const result = await db
    .update(classes)
    .set(updateValues)
    .where(and(eq(classes.id, id), eq(classes.tenantId, ctx.tenantId)))
    .returning({ id: classes.id });

  if (result.length === 0) {
    throw new Error("Kelas tidak ditemukan");
  }

  if (partial.tutorId !== undefined) {
    await db.delete(tutorClassAssignments).where(eq(tutorClassAssignments.classId, id));
    if (partial.tutorId && partial.tutorId.trim() && partial.tutorId !== "none") {
      const [tutor] = await db
        .select({ id: tutors.id })
        .from(tutors)
        .where(and(eq(tutors.id, partial.tutorId.trim()), eq(tutors.tenantId, ctx.tenantId)))
        .limit(1);

      if (tutor) {
        await db.insert(tutorClassAssignments).values({
          id: randomUUID(),
          tutorId: tutor.id,
          classId: id,
          ratePerSession: "50000",
          isActive: true,
        }).onConflictDoNothing();
      }
    }
  }
}

export async function assignTutorToClass(classId: string, tutorId: string | null): Promise<void> {
  const ctx = await requireTenantContext();
  if (!classId) throw new Error("ID kelas wajib diisi");

  const [cls] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(and(eq(classes.id, classId), eq(classes.tenantId, ctx.tenantId)))
    .limit(1);

  if (!cls) {
    throw new Error("Kelas tidak ditemukan");
  }

  await db.delete(tutorClassAssignments).where(eq(tutorClassAssignments.classId, classId));
  if (tutorId && tutorId.trim() && tutorId !== "none") {
    const [tutor] = await db
      .select({ id: tutors.id })
      .from(tutors)
      .where(and(eq(tutors.id, tutorId.trim()), eq(tutors.tenantId, ctx.tenantId)))
      .limit(1);

    if (!tutor) throw new Error("Tutor tidak ditemukan");

    await db.insert(tutorClassAssignments).values({
      id: randomUUID(),
      tutorId: tutor.id,
      classId,
      ratePerSession: "50000",
      isActive: true,
    }).onConflictDoNothing();
  }
}

export async function listClassesWithTutor(): Promise<ClassWithTutorRecord[]> {
  const ctx = await requireTenantContext();

  const rows = await db
    .select({
      cls: classes,
      tutorId: tutors.id,
      tutorName: tutors.name,
    })
    .from(classes)
    .leftJoin(
      tutorClassAssignments,
      and(eq(tutorClassAssignments.classId, classes.id), eq(tutorClassAssignments.isActive, true))
    )
    .leftJoin(tutors, eq(tutors.id, tutorClassAssignments.tutorId))
    .where(eq(classes.tenantId, ctx.tenantId))
    .orderBy(asc(classes.name));

  return rows.map((r) => ({
    ...r.cls,
    tutorId: r.tutorId || null,
    tutorName: r.tutorName || null,
  }));
}

export async function listTutorOptions(): Promise<Array<{ id: string; name: string }>> {
  const ctx = await requireTenantContext();

  return await db
    .select({ id: tutors.id, name: tutors.name })
    .from(tutors)
    .where(and(eq(tutors.tenantId, ctx.tenantId), eq(tutors.isActive, true)))
    .orderBy(asc(tutors.name));
}

export async function toggleClassActive(id: string, isActive: boolean): Promise<void> {
  const ctx = await requireTenantContext();

  if (!id) {
    throw new Error("ID kelas wajib diisi");
  }

  const result = await db
    .update(classes)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(and(eq(classes.id, id), eq(classes.tenantId, ctx.tenantId)))
    .returning({ id: classes.id });

  if (result.length === 0) {
    throw new Error("Kelas tidak ditemukan");
  }
}
