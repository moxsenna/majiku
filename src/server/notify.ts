import { eq, inArray } from "drizzle-orm";
import * as webpush from "web-push";
import { db } from "@/db";
import { notifications, pushSubscriptions } from "@/db/schema";

/**
 * Lapisan notifikasi v1 — in-app (tabel notifications) + Web Push best-effort.
 * Dipanggil dari server action yang memicu event (check-in, laporan harian,
 * chat, tagihan terbit, pembayaran, pengumuman). Selalu non-blocking: kegagalan
 * tidak boleh menggagalkan aksi utama pemanggil.
 */

export type NotifyType =
  | "attendance"
  | "report"
  | "chat"
  | "invoice"
  | "invoice_due"
  | "invoice_overdue"
  | "payment"
  | "announcement"
  | "reminder";

export interface NotifyInput {
  /** User ID penerima (dedup di dalam). */
  userIds: string[];
  type: NotifyType;
  title: string;
  body?: string;
  /** Path aplikasi untuk dibuka saat notifikasi diklik. */
  link?: string;
  tenantId?: string | null;
}

function vapidConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let vapidReady = false;
function ensureVapid(): void {
  if (vapidReady) return;
  webpush.setVapidDetails(
    "mailto:support@majiku.web.id",
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );
  vapidReady = true;
}

/** Kirim Web Push ke seluruh langganan milik userIds; bersihkan langganan mati. */
async function sendPushToUsers(
  userIds: string[],
  payload: { title: string; body: string; link: string }
): Promise<void> {
  if (!vapidConfigured() || userIds.length === 0) return;
  ensureVapid();

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(inArray(pushSubscriptions.userId, userIds));
  if (subs.length === 0) return;

  await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id)).catch(() => {});
        }
      }
    })
  );
}

/** Tulis notifikasi in-app untuk tiap penerima + push best-effort. */
export async function notifyUsers(input: NotifyInput): Promise<void> {
  const userIds = [...new Set(input.userIds.filter(Boolean))];
  if (userIds.length === 0) return;

  try {
    await db.insert(notifications).values(
      userIds.map((userId) => ({
        id: crypto.randomUUID(),
        userId,
        tenantId: input.tenantId ?? null,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      }))
    );
  } catch (err) {
    console.warn("notifyUsers: gagal menulis notifikasi:", err);
    return;
  }

  try {
    await sendPushToUsers(userIds, {
      title: input.title,
      body: input.body ?? "",
      link: input.link ?? "/",
    });
  } catch (err) {
    console.warn("notifyUsers: push gagal (diabaikan):", err);
  }
}
