"use server";

import { headers } from "next/headers";
import { desc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { announcements, userRoles } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";

export type AnnouncementRow = typeof announcements.$inferSelect;

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

export interface CreateAnnouncementInput {
  title: string;
  body: string;
}

export async function createAnnouncement(
  input: CreateAnnouncementInput
): Promise<{ id: string; recipientCount: number }> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login untuk mengirim pengumuman");
  }

  const roles = await getMyRoles().catch(() => [] as AppRole[]);
  if (!isAdminOrModerator(roles)) {
    throw new Error("Hanya admin yang dapat mengirim pengumuman");
  }

  const title = (input.title ?? "").trim();
  const body = (input.body ?? "").trim();
  if (title.length < 3 || title.length > 120) {
    throw new Error("Judul harus 3-120 karakter");
  }
  if (body.length < 10 || body.length > 2000) {
    throw new Error("Isi pengumuman harus 10-2000 karakter");
  }

  const parentRows = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(eq(userRoles.role, "parent"));
  const recipientCount = parentRows.length;

  const [row] = await db
    .insert(announcements)
    .values({
      id: crypto.randomUUID(),
      title,
      body,
      sentByUserId: session.user.id,
      recipientCount,
    })
    .returning({ id: announcements.id });

  return { id: row.id, recipientCount };
}

export async function listAnnouncements() {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles = await getMyRoles().catch(() => [] as AppRole[]);
  if (!isAdminOrModerator(roles)) return [];

  return db.select().from(announcements).orderBy(desc(announcements.createdAt));
}

export async function getLatestAnnouncementsForParent() {
  const session = await getSessionSafely();
  if (!session) return [];

  const rows = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .orderBy(desc(announcements.createdAt))
    .limit(5);
  return rows;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login untuk menghapus pengumuman");
  }

  const roles = await getMyRoles().catch(() => [] as AppRole[]);
  if (!isAdminOrModerator(roles)) {
    throw new Error("Hanya admin yang dapat menghapus pengumuman");
  }

  const deleted = await db
    .delete(announcements)
    .where(and(eq(announcements.id, id)))
    .returning({ id: announcements.id });

  if (deleted.length === 0) {
    throw new Error("Pengumuman tidak ditemukan");
  }
}
