"use server";

import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { lessonPlans, classes, user } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";
import { isValidDateString } from "@/lib/datetime";

export type LessonPlanRecord = typeof lessonPlans.$inferSelect;

export type LessonPlanRow = LessonPlanRecord & {
  className: string | null;
  tutorName: string | null;
};

const PLAN_STATUSES = ["draft", "upcoming", "in_progress", "completed"] as const;
type PlanStatus = (typeof PLAN_STATUSES)[number];

const TIME_RANGE_REGEX = /^([01]\d|2[0-3]):[0-5]\d\s*-\s*([01]\d|2[0-3]):[0-5]\d$/;

interface ActivityInput {
  id?: string;
  title: string;
  durationMinutes: number;
  description?: string;
  completed?: boolean;
}

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

async function requireAdminOrModerator() {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login");
  }
  const roles = await getMyRoles().catch(() => [] as AppRole[]);
  if (!isAdminOrModerator(roles)) {
    throw new Error("Hanya admin yang dapat mengelola RPP");
  }
  return session;
}

function validateTitle(title: string): string {
  const t = (title ?? "").trim();
  if (!t || t.length > 150) {
    throw new Error("Judul RPP wajib diisi (maks 150 karakter)");
  }
  return t;
}

function validatePlanDate(planDate: string): string {
  if (!planDate || !isValidDateString(planDate)) {
    throw new Error("Format tanggal RPP tidak valid (harus YYYY-MM-DD)");
  }
  return planDate;
}

function validateObjectives(objectives: string[]): string[] {
  if (!Array.isArray(objectives) || objectives.length === 0) {
    throw new Error("Minimal satu tujuan pembelajaran");
  }
  const cleaned = objectives.map((o) => (o ?? "").trim()).filter(Boolean);
  if (cleaned.length === 0) {
    throw new Error("Minimal satu tujuan pembelajaran");
  }
  if (cleaned.some((o) => o.length > 200)) {
    throw new Error("Tiap tujuan maksimal 200 karakter");
  }
  return cleaned;
}

function validateActivities(activities: ActivityInput[]) {
  if (!Array.isArray(activities) || activities.length === 0) {
    throw new Error("Minimal satu aktivitas");
  }
  return activities.map((a, i) => {
    const title = (a?.title ?? "").trim();
    if (!title) {
      throw new Error(`Judul aktivitas #${i + 1} wajib diisi`);
    }
    const duration = Number(a?.durationMinutes);
    if (!Number.isInteger(duration) || duration < 1 || duration > 240) {
      throw new Error(`Durasi aktivitas #${i + 1} harus 1-240 menit`);
    }
    return {
      id: a?.id || crypto.randomUUID(),
      title,
      durationMinutes: duration,
      description: a?.description?.trim() || undefined,
      completed: Boolean(a?.completed),
    };
  });
}

function validateMaterials(materials?: string[]): string[] {
  if (!materials) return [];
  if (!Array.isArray(materials)) {
    throw new Error("Format material tidak valid");
  }
  return materials.map((m) => (m ?? "").trim()).filter(Boolean);
}

export async function listLessonPlans(): Promise<LessonPlanRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles = await getMyRoles().catch(() => [] as AppRole[]);
  if (!isAdminOrModerator(roles)) return [];

  const rows = await db
    .select({
      plan: lessonPlans,
      className: classes.name,
      tutorName: user.name,
    })
    .from(lessonPlans)
    .leftJoin(classes, eq(lessonPlans.classId, classes.id))
    .leftJoin(user, eq(lessonPlans.tutorUserId, user.id))
    .orderBy(desc(lessonPlans.planDate));

  return rows.map((r) => ({
    ...r.plan,
    className: r.className,
    tutorName: r.tutorName,
  }));
}

export interface CreateLessonPlanInput {
  title: string;
  subject?: string | null;
  classId?: string | null;
  planDate: string;
  timeRange?: string | null;
  objectives: string[];
  activities: ActivityInput[];
  materials?: string[];
}

async function assertClassExists(classId?: string | null): Promise<string | null> {
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

export async function createLessonPlan(
  input: CreateLessonPlanInput
): Promise<{ id: string }> {
  const session = await requireAdminOrModerator();

  const title = validateTitle(input.title);
  const planDate = validatePlanDate(input.planDate);
  const objectives = validateObjectives(input.objectives);
  const activities = validateActivities(input.activities);
  const materials = validateMaterials(input.materials);
  const classId = await assertClassExists(input.classId);

  if (input.timeRange && !TIME_RANGE_REGEX.test(input.timeRange)) {
    throw new Error("Format rentang waktu tidak valid (HH:mm - HH:mm)");
  }

  const roles = await getMyRoles().catch(() => [] as AppRole[]);
  const tutorUserId = roles.includes("tutor") && !isAdminOrModerator(roles)
    ? session.user.id
    : null;

  const [row] = await db
    .insert(lessonPlans)
    .values({
      id: crypto.randomUUID(),
      classId,
      tutorUserId,
      title,
      subject: input.subject?.trim() || null,
      planDate,
      timeRange: input.timeRange?.trim() || null,
      objectives,
      activities,
      materials,
      status: "upcoming",
    })
    .returning({ id: lessonPlans.id });

  return { id: row.id };
}

export async function updateLessonPlan(
  id: string,
  partial: {
    status?: string;
    activities?: ActivityInput[];
  }
): Promise<void> {
  await requireAdminOrModerator();

  const existing = await db
    .select()
    .from(lessonPlans)
    .where(eq(lessonPlans.id, id))
    .limit(1);
  if (existing.length === 0) {
    throw new Error("RPP tidak ditemukan");
  }

  const updateValues: Record<string, unknown> = {};

  if (partial.status !== undefined) {
    if (!PLAN_STATUSES.includes(partial.status as PlanStatus)) {
      throw new Error("Status RPP tidak valid");
    }
    updateValues.status = partial.status;
  }
  if (partial.activities !== undefined) {
    updateValues.activities = validateActivities(partial.activities);
  }

  if (Object.keys(updateValues).length === 0) return;

  await db.update(lessonPlans).set(updateValues).where(eq(lessonPlans.id, id));
}

export async function deleteLessonPlan(id: string): Promise<void> {
  await requireAdminOrModerator();

  const deleted = await db
    .delete(lessonPlans)
    .where(eq(lessonPlans.id, id))
    .returning({ id: lessonPlans.id });

  if (deleted.length === 0) {
    throw new Error("RPP tidak ditemukan");
  }
}

export async function getClassOptions() {
  return db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .where(eq(classes.isActive, true));
}
