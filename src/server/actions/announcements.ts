"use server";

import { headers } from "next/headers";
import { desc, eq, and, or, inArray } from "drizzle-orm";
import { db } from "@/db";
import { announcements, students } from "@/db/schema";
import { auth } from "@/server/auth";
import { requireTenantContext } from "@/server/authz";

export type AnnouncementRow = typeof announcements.$inferSelect;

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
}

export async function createAnnouncement(
  input: CreateAnnouncementInput
): Promise<{ id: string; recipientCount: number }> {
  const ctx = await requireTenantContext();

  const title = (input.title ?? "").trim();
  const body = (input.body ?? "").trim();
  if (title.length < 3 || title.length > 120) {
    throw new Error("Judul harus 3-120 karakter");
  }
  if (body.length < 10 || body.length > 2000) {
    throw new Error("Isi pengumuman harus 10-2000 karakter");
  }

  const parentRows = await db
    .selectDistinct({ parentUserId: students.parentUserId })
    .from(students)
    .where(and(eq(students.tenantId, ctx.tenantId), eq(students.isActive, true)));
  const recipientCount = parentRows.filter((r) => r.parentUserId !== null).length;

  const [row] = await db
    .insert(announcements)
    .values({
      id: crypto.randomUUID(),
      tenantId: ctx.tenantId,
      title,
      body,
      sentByUserId: ctx.session.user.id,
      recipientCount,
    })
    .returning({ id: announcements.id });

  return { id: row.id, recipientCount };
}

export async function listAnnouncements() {
  const ctx = await requireTenantContext();
  return db
    .select()
    .from(announcements)
    .where(eq(announcements.tenantId, ctx.tenantId))
    .orderBy(desc(announcements.createdAt));
}

export async function getLatestAnnouncementsForParent() {
  const session = await getSessionSafely();
  if (!session) return [];

  const myStudents = await db
    .selectDistinct({ tenantId: students.tenantId })
    .from(students)
    .where(
      and(
        session.user.email
          ? or(eq(students.parentUserId, session.user.id), eq(students.parentEmail, session.user.email))
          : eq(students.parentUserId, session.user.id),
        eq(students.isActive, true)
      )
    );

  const tenantIds = myStudents.map((s) => s.tenantId);
  if (tenantIds.length === 0) return [];

  const rows = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .where(inArray(announcements.tenantId, tenantIds))
    .orderBy(desc(announcements.createdAt))
    .limit(5);

  return rows;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const ctx = await requireTenantContext();

  const deleted = await db
    .delete(announcements)
    .where(and(eq(announcements.id, id), eq(announcements.tenantId, ctx.tenantId)))
    .returning({ id: announcements.id });

  if (deleted.length === 0) {
    throw new Error("Pengumuman tidak ditemukan");
  }
}
