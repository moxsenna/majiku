"use server";

import { headers } from "next/headers";
import { asc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { classSchedules, classes } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";

export type ScheduleRow = typeof classSchedules.$inferSelect & {
  className: string | null;
};

const SCHEDULE_TYPES = ["class", "activity", "event", "holiday"] as const;
type ScheduleType = (typeof SCHEDULE_TYPES)[number];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

function isAdminOrModerator(roles: AppRole[]): boolean {
  return roles.includes("admin") || roles.includes("moderator");
}

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

export async function listSchedules(): Promise<ScheduleRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles = await getMyRoles().catch(() => [] as AppRole[]);
  if (!isAdminOrModerator(roles)) return [];

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
    .leftJoin(classes, eq(classSchedules.classId, classes.id))
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

async function requireAdminOrModerator() {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login");
  }
  const roles = await getMyRoles().catch(() => [] as AppRole[]);
  if (!isAdminOrModerator(roles)) {
    throw new Error("Hanya admin yang dapat mengelola jadwal");
  }
  return session;
}

async function assertClassExists(classId?: string | null) {
  if (classId === null || classId === undefined || classId === "") return null;
  const rows = await db
    .select({ id: classes.id })
    .from(classes)
    .where(eq(classes.id, classId))
    .limit(1);
  if (rows.length === 0) {
    throw new Error("Kelas tidak ditemukan");
  }
  return classId;
}

export async function createClassSchedule(
  input: CreateScheduleInput
): Promise<{ id: string }> {
  await requireAdminOrModerator();
  const { title } = validateScheduleInput(input);
  const classId = await assertClassExists(input.classId);

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
  await requireAdminOrModerator();

  const existing = await db
    .select()
    .from(classSchedules)
    .where(eq(classSchedules.id, id))
    .limit(1);
  if (existing.length === 0) {
    throw new Error("Jadwal tidak ditemukan");
  }

  const updateValues: Record<string, unknown> = {};

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
    updateValues.classId = await assertClassExists(partial.classId);
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

  if (Object.keys(updateValues).length === 0) return;

  await db
    .update(classSchedules)
    .set(updateValues)
    .where(and(eq(classSchedules.id, id)));
}

export async function deleteClassSchedule(id: string): Promise<void> {
  await requireAdminOrModerator();

  const deleted = await db
    .delete(classSchedules)
    .where(eq(classSchedules.id, id))
    .returning({ id: classSchedules.id });

  if (deleted.length === 0) {
    throw new Error("Jadwal tidak ditemukan");
  }
}

export async function toggleClassScheduleActive(
  id: string,
  isActive: boolean
): Promise<void> {
  await requireAdminOrModerator();

  const updated = await db
    .update(classSchedules)
    .set({ isActive })
    .where(eq(classSchedules.id, id))
    .returning({ id: classSchedules.id });

  if (updated.length === 0) {
    throw new Error("Jadwal tidak ditemukan");
  }
}
