"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";

export type ClassRecord = typeof classes.$inferSelect;

export interface CreateClassInput {
  name: string;
  description?: string | null;
  capacity?: number | null;
  pricePerMonth?: number | string | null;
  sessionsPerMonth?: number | null;
  schedule?: string | null;
  location?: string | null;
}

export interface UpdateClassInput {
  name?: string;
  description?: string | null;
  capacity?: number | null;
  pricePerMonth?: number | string | null;
  sessionsPerMonth?: number | null;
  schedule?: string | null;
  location?: string | null;
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

export async function listClasses(): Promise<ClassRecord[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("admin") && !roles.includes("moderator")) return [];

  return await db.select().from(classes).orderBy(asc(classes.name));
}

export async function createClass(input: CreateClassInput): Promise<{ id: string }> {
  await requireAdminOrModerator();

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

  return { id };
}

export async function updateClass(id: string, partial: UpdateClassInput): Promise<void> {
  await requireAdminOrModerator();

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
    .where(eq(classes.id, id))
    .returning({ id: classes.id });

  if (result.length === 0) {
    throw new Error("Kelas tidak ditemukan");
  }
}

export async function toggleClassActive(id: string, isActive: boolean): Promise<void> {
  await requireAdminOrModerator();

  if (!id) {
    throw new Error("ID kelas wajib diisi");
  }

  const result = await db
    .update(classes)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(classes.id, id))
    .returning({ id: classes.id });

  if (result.length === 0) {
    throw new Error("Kelas tidak ditemukan");
  }
}
