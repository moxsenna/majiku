"use server";

import { asc, eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import { classSchedules, classes } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";

export type ScheduleRow = typeof classSchedules.$inferSelect & {
  className: string | null;
};

const SCHEDULE_TYPES = ["class", "activity", "event", "holiday"] as const;
type ScheduleType = (typeof SCHEDULE_TYPES)[number];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateScheduleInput(input: {
  title: string;
  dayOfWeek: number;
  startTime: string;
  durationMinutes: number;
  type: string;
  classId?: string | null;
}) {
  const title = (input.title ?? "").trim();
  if (!title || title.length > 120) {
    throw new Error("Judul wajib diisi (maks 120 karakter)");
  }
  if (!Number.isInteger(input.dayOfWeek) || input.dayOfWeek < 1 || input.dayOfWeek > 6) {
    throw new Error("Hari tidak valid (1=Senin sampai 6=Sabtu)");
  }
  if (!TIME_REGEX.test(input.startTime ?? "")) {
    throw new Error("Format waktu tidak valid (HH:mm)");
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 5 || input.durationMinutes > 480) {
    throw new Error("Durasi harus 5-480 menit");
  }
  if (!SCHEDULE_TYPES.includes(input.type as ScheduleType)) {
    throw new Error("Tipe kegiatan tidak valid");
  }
  return { title };
}

async function assertClassExists(classId: string | null | undefined, tenantId: string) {
  if (classId === null || classId === undefined || classId === "") return null;
  const rows = await db
    .select({ id: classes.id })
    .from(classes)
    .where(and(eq(classes.id, classId), eq(classes.tenantId, tenantId)))
    .limit(1);
  if (rows.length === 0) {
    throw new Error("Kelas tidak ditemukan");
  }
  return classId;
}

export async function listSchedules(): Promise<ScheduleRow[]> {
  const ctx = await requireTenantContext();

  const rows = await db
    .select({
      id: classSchedules.id,
      classId: classSchedules.classId,
      title: classSchedules.title,
      dayOfWeek: classSchedules.dayOfWeek,
      startTime: classSchedules.startTime,
      durationMinutes: classSchedules.durationMinutes,
      location: classSchedules.location,
      type: classSchedules.type,
      isActive: classSchedules.isActive,
      createdAt: classSchedules.createdAt,
      updatedAt: classSchedules.updatedAt,
      className: classes.name,
    })
    .from(classSchedules)
    .innerJoin(classes, eq(classSchedules.classId, classes.id))
    .where(eq(classes.tenantId, ctx.tenantId))
    .orderBy(asc(classSchedules.dayOfWeek), asc(classSchedules.startTime));

  return rows;
}

export interface CreateScheduleInput {
  title: string;
  classId?: string | null;
  dayOfWeek: number;
  startTime: string;
  durationMinutes: number;
  location?: string | null;
  type: string;
}

export async function createClassSchedule(
  input: CreateScheduleInput
): Promise<{ id: string }> {
  const ctx = await requireTenantContext();
  const { title } = validateScheduleInput(input);
  const classId = await assertClassExists(input.classId, ctx.tenantId);

  const [row] = await db
    .insert(classSchedules)
    .values({
      id: crypto.randomUUID(),
      classId,
      title,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      location: input.location?.trim() || null,
      type: input.type as ScheduleType,
    })
    .returning({ id: classSchedules.id });

  return { id: row.id };
}

export async function updateClassSchedule(
  id: string,
  partial: Partial<CreateScheduleInput> & { isActive?: boolean }
): Promise<void> {
  const ctx = await requireTenantContext();

  const existing = await db
    .select({
      id: classSchedules.id,
      dayOfWeek: classSchedules.dayOfWeek,
      startTime: classSchedules.startTime,
      durationMinutes: classSchedules.durationMinutes,
      type: classSchedules.type,
    })
    .from(classSchedules)
    .innerJoin(classes, eq(classSchedules.classId, classes.id))
    .where(and(eq(classSchedules.id, id), eq(classes.tenantId, ctx.tenantId)))
    .limit(1);

  if (existing.length === 0) {
    throw new Error("Jadwal tidak ditemukan");
  }

  const updateValues: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (partial.title !== undefined) {
    const { title } = validateScheduleInput({
      title: partial.title,
      dayOfWeek: existing[0].dayOfWeek,
      startTime: existing[0].startTime,
      durationMinutes: existing[0].durationMinutes,
      type: existing[0].type,
    });
    updateValues.title = title;
  }
  if (partial.classId !== undefined) {
    updateValues.classId = await assertClassExists(partial.classId, ctx.tenantId);
  }
  if (partial.dayOfWeek !== undefined) {
    if (!Number.isInteger(partial.dayOfWeek) || partial.dayOfWeek < 1 || partial.dayOfWeek > 6) {
      throw new Error("Hari tidak valid (1=Senin sampai 6=Sabtu)");
    }
    updateValues.dayOfWeek = partial.dayOfWeek;
  }
  if (partial.startTime !== undefined) {
    if (!TIME_REGEX.test(partial.startTime ?? "")) {
      throw new Error("Format waktu tidak valid (HH:mm)");
    }
    updateValues.startTime = partial.startTime;
  }
  if (partial.durationMinutes !== undefined) {
    if (
      !Number.isInteger(partial.durationMinutes) ||
      partial.durationMinutes < 5 ||
      partial.durationMinutes > 480
    ) {
      throw new Error("Durasi harus 5-480 menit");
    }
    updateValues.durationMinutes = partial.durationMinutes;
  }
  if (partial.location !== undefined) {
    updateValues.location = partial.location?.trim() || null;
  }
  if (partial.type !== undefined) {
    if (!SCHEDULE_TYPES.includes(partial.type as ScheduleType)) {
      throw new Error("Tipe kegiatan tidak valid");
    }
    updateValues.type = partial.type;
  }
  if (partial.isActive !== undefined) {
    updateValues.isActive = partial.isActive;
  }

  const scopedSchedules = db
    .select({ id: classSchedules.id })
    .from(classSchedules)
    .innerJoin(classes, eq(classSchedules.classId, classes.id))
    .where(and(eq(classSchedules.id, id), eq(classes.tenantId, ctx.tenantId)));

  const updated = await db
    .update(classSchedules)
    .set(updateValues)
    .where(inArray(classSchedules.id, scopedSchedules))
    .returning({ id: classSchedules.id });

  if (updated.length === 0) {
    throw new Error("Jadwal tidak ditemukan");
  }
}

export async function deleteClassSchedule(id: string): Promise<void> {
  const ctx = await requireTenantContext();

  const scopedSchedules = db
    .select({ id: classSchedules.id })
    .from(classSchedules)
    .innerJoin(classes, eq(classSchedules.classId, classes.id))
    .where(and(eq(classSchedules.id, id), eq(classes.tenantId, ctx.tenantId)));

  const deleted = await db
    .delete(classSchedules)
    .where(inArray(classSchedules.id, scopedSchedules))
    .returning({ id: classSchedules.id });

  if (deleted.length === 0) {
    throw new Error("Jadwal tidak ditemukan");
  }
}

export async function toggleClassScheduleActive(
  id: string,
  isActive: boolean
): Promise<void> {
  const ctx = await requireTenantContext();

  const scopedSchedules = db
    .select({ id: classSchedules.id })
    .from(classSchedules)
    .innerJoin(classes, eq(classSchedules.classId, classes.id))
    .where(and(eq(classSchedules.id, id), eq(classes.tenantId, ctx.tenantId)));

  const updated = await db
    .update(classSchedules)
    .set({ isActive, updatedAt: new Date() })
    .where(inArray(classSchedules.id, scopedSchedules))
    .returning({ id: classSchedules.id });

  if (updated.length === 0) {
    throw new Error("Jadwal tidak ditemukan");
  }
}
