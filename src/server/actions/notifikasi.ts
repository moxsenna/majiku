"use server";

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications, pushSubscriptions } from "@/db/schema";
import { getSessionOrNull } from "@/server/authz";

/**
 * N4 — API notifikasi in-app untuk portal ortu, guru, dan admin.
 * Polling 30 detik dari client; mark-read per item atau semua.
 */

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface MyNotifications {
  items: NotificationItem[];
  unread: number;
  diambilPada: string;
}

export async function getMyNotifications(): Promise<MyNotifications> {
  const session = await getSessionOrNull();
  if (!session) return { items: [], unread: 0, diambilPada: new Date().toISOString() };

  const [rows, [{ unread }]] = await Promise.all([
    db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        body: notifications.body,
        link: notifications.link,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(30),
    db
      .select({ unread: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, session.user.id), isNull(notifications.readAt))),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      body: r.body,
      link: r.link,
      readAt: r.readAt ? r.readAt.toISOString() : null,
      createdAt: (r.createdAt ?? new Date()).toISOString(),
    })),
    unread: unread ?? 0,
    diambilPada: new Date().toISOString(),
  };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const session = await getSessionOrNull();
  if (!session) return 0;
  const [{ unread }] = await db
    .select({ unread: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, session.user.id), isNull(notifications.readAt)));
  return unread ?? 0;
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const session = await getSessionOrNull();
  if (!session) return { success: false };
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, session.user.id), isNull(notifications.readAt)));
  return { success: true };
}

export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  const session = await getSessionOrNull();
  if (!session) return { success: false };
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)));
  return { success: true };
}

/* ---------------- Web Push (N5) ---------------- */

export async function getPushPublicKey(): Promise<string | null> {
  return process.env.VAPID_PUBLIC_KEY || null;
}

export async function savePushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}): Promise<{ success: boolean }> {
  const session = await getSessionOrNull();
  if (!session) return { success: false };
  if (!/^https:\/\//.test(input.endpoint) || !input.p256dh || !input.auth) return { success: false };
  await db
    .insert(pushSubscriptions)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent?.slice(0, 300) ?? null,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId: session.user.id, p256dh: input.p256dh, auth: input.auth },
    });
  return { success: true };
}

export async function removePushSubscription(endpoint: string): Promise<{ success: boolean }> {
  const session = await getSessionOrNull();
  if (!session) return { success: false };
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.userId, session.user.id)));
  return { success: true };
}
