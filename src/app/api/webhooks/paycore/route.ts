import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices, paymentOrders, paycoreEvents, tenants } from "@/db/schema";
import { verifyPayCoreEvent } from "@/server/paycore";

// Webhook khusus PayCore (bukan Duitku — Duitku callback hanya ke PayCore).
// Kontrak: D:/Coding/paycore/docs/external/payment-events.md

interface PayCoreEventData {
  order_id: string;
  external_order_id: string;
  app_id: string;
  amount: number;
  currency: string;
  product_key: string;
  paid_at?: string;
}

interface PayCoreEventBody {
  event_id: string;
  event_type: string;
  occurred_at?: string;
  data: PayCoreEventData;
}

export async function POST(req: Request) {
  // 1. Raw body HARUS dibaca sebelum parse (signature hash byte-identical)
  const rawBody = await req.text();

  const h = req.headers;
  const timestampHeader = h.get("X-PayCore-Event-Timestamp") ?? "";
  const signatureHeader = h.get("X-PayCore-Event-Signature") ?? "";

  const webhookSecret = process.env.PAYCORE_WEBHOOK_SECRET;
  if (!webhookSecret?.trim()) {
    return Response.json({ error: "Webhook belum dikonfigurasi" }, { status: 503 });
  }

  // 2-4. Verifikasi timestamp skew + HMAC timing-safe
  const valid = await verifyPayCoreEvent({
    webhookSecret,
    timestampHeader,
    rawBody,
    signatureHeader,
  });
  if (!valid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: PayCoreEventBody;
  try {
    body = JSON.parse(rawBody) as PayCoreEventBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event_id: eventId, event_type: eventType, data } = body;
  if (!eventId || !eventType || !data?.order_id) {
    return Response.json({ error: "Payload tidak lengkap" }, { status: 400 });
  }

  // 5. Cek apakah event_id sudah pernah diproses sebelumnya (idempotency check)
  const existingEvent = await db
    .select({ eventId: paycoreEvents.eventId })
    .from(paycoreEvents)
    .where(eq(paycoreEvents.eventId, eventId))
    .limit(1);

  if (existingEvent.length > 0) {
    // Sudah pernah diproses — balas 200 agar PayCore berhenti retry
    return Response.json({ ok: true, note: "already processed" });
  }

  // 6. Cari local order (paycoreOrderId atau externalOrderId)
  const orderRows = await db
    .select()
    .from(paymentOrders)
    .where(eq(paymentOrders.paycoreOrderId, data.order_id))
    .limit(1);

  let localOrder = orderRows[0];
  if (!localOrder) {
    const byExternal = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.externalOrderId, data.external_order_id))
      .limit(1);
    localOrder = byExternal[0];
  }

  if (!localOrder) {
    // Bukan order MAJIKU — jangan retry (200 supaya PayCore tidak spam)
    return Response.json({ ok: true, note: "unknown order" });
  }
  const order = localOrder;

  // 7. Validasi event vs local order (nominal/currency/product dari DB, bukan event)
  const amountMatches = Number(localOrder.amount) === Number(data.amount);
  const currencyMatches = localOrder.currency === (data.currency ?? "IDR");
  const productMatches = localOrder.productKey === (data.product_key ?? localOrder.productKey);
  if (!amountMatches || !currencyMatches || !productMatches) {
    await db
      .update(paymentOrders)
      .set({ paymentStatus: "failed", updatedAt: new Date() })
      .where(eq(paymentOrders.id, order.id));
    return Response.json({ error: "Data order tidak cocok" }, { status: 400 });
  }

  try {
    if (eventType === "payment.succeeded") {
      // 8. Fulfillment: update order + update invoice (jika ada) + aktivasi tenant (jika ada) + catat event dedupe
      await db
        .update(paymentOrders)
        .set({
          paycoreOrderId: data.order_id,
          paymentStatus: "paid",
          paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
          updatedAt: new Date(),
        })
        .where(eq(paymentOrders.id, order.id));

      if (order.invoiceId) {
        await db
          .update(invoices)
          .set({
            status: "paid",
            paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, order.invoiceId));
      }

      if (order.tenantId) {
        await db
          .update(tenants)
          .set({
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, order.tenantId));
      }

      await db
        .insert(paycoreEvents)
        .values({
          eventId,
          paycoreOrderId: data.order_id,
          eventType,
          rawPayload: body as unknown as Record<string, unknown>,
        })
        .onConflictDoNothing();

      return Response.json({ ok: true });
    }

    if (eventType === "payment.failed" || eventType === "payment.expired") {
      const status = eventType === "payment.failed" ? "failed" : "expired";
      await db
        .update(paymentOrders)
        .set({ paymentStatus: status, updatedAt: new Date() })
        .where(eq(paymentOrders.id, order.id));

      await db
        .insert(paycoreEvents)
        .values({
          eventId,
          paycoreOrderId: data.order_id,
          eventType,
          rawPayload: body as unknown as Record<string, unknown>,
        })
        .onConflictDoNothing();

      return Response.json({ ok: true });
    }

    // Event lain dicatat
    await db
      .insert(paycoreEvents)
      .values({
        eventId,
        paycoreOrderId: data.order_id,
        eventType,
        rawPayload: body as unknown as Record<string, unknown>,
      })
      .onConflictDoNothing();

    return Response.json({ ok: true, note: `event ${eventType} dicatat` });
  } catch (err: any) {
    console.error("Gagal memproses webhook paycore:", err);
    return Response.json(
      { error: "Internal error processing webhook", message: err?.message },
      { status: 500 }
    );
  }
}
