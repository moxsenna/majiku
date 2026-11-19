"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { tenants, user, userRoles, paymentOrders } from "@/db/schema";
import { auth } from "@/server/auth";
import { createPayCoreOrder, isPaymentsEnabled } from "@/server/paycore";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptionPlans";

export interface CreateSubscriptionOrderInput {
  planId: "basic" | "pro" | "enterprise";
  billingCycle: "monthly" | "yearly";
  institutionName: string;
  institutionType?: "daycare" | "preschool" | "bimbel";
  adminName: string;
  email: string;
  phone: string;
  password?: string;
  city?: string;
  /** Honeypot anti-bot: wajib kosong dari form sungguhan. */
  website?: string;
  /** Epoch ms ketika form mulai diisi; diisi < 3 detik dianggap bot. */
  formStartedAt?: number;
}

export interface SubscriptionOrderResult {
  success: boolean;
  paymentMode: "paycore" | "manual";
  orderId: string;
  externalOrderId: string;
  amount: number;
  planName: string;
  checkoutUrl?: string | null;
  qrString?: string | null;
  expiresAt?: string;
  /** true bila order ini dipakai ulang dari permintaan duplikat sebelumnya */
  reused?: boolean;
}

const RATE_LIMIT_ORDERS_PER_HOUR = 5;
const PENDING_ORDER_REUSE_WINDOW_MS = 30 * 60 * 1000;
const MIN_FORM_FILL_MS = 3000;

export async function createSubscriptionCheckoutOrder(
  input: CreateSubscriptionOrderInput
): Promise<SubscriptionOrderResult> {
  // --- Guard anti-abuse (action ini publik, tanpa sesi) ---
  if (input.website?.trim()) {
    // Diam-diam terlihat sukses bagi bot, tidak melakukan apa pun.
    return {
      success: true,
      paymentMode: "manual",
      orderId: "ignored",
      externalOrderId: "ignored",
      amount: 0,
      planName: "",
      checkoutUrl: null,
    };
  }
  if (
    typeof input.formStartedAt === "number" &&
    Date.now() - input.formStartedAt < MIN_FORM_FILL_MS
  ) {
    throw new Error("Formulir terkirim terlalu cepat. Coba lagi.");
  }

  const plan = SUBSCRIPTION_PLANS[input.planId] || SUBSCRIPTION_PLANS.pro;
  const amount =
    input.billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

  const email = input.email?.trim().toLowerCase();
  const adminName = input.adminName?.trim();
  const institutionName = input.institutionName?.trim();
  const phone = input.phone?.trim() || "";
  const city = input.city?.trim() || "Belum diisi";

  if (!email || !email.includes("@")) {
    throw new Error("Format email tidak valid");
  }
  if (!adminName || adminName.length < 2) {
    throw new Error("Nama penanggung jawab wajib diisi");
  }
  if (!institutionName || institutionName.length < 2) {
    throw new Error("Nama lembaga daycare / bimbel wajib diisi");
  }

  // Rate-limit berbasis DB: batasi order baru per email per jam.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ recentCount }] = await db
    .select({ recentCount: sql<number>`count(*)::int` })
    .from(paymentOrders)
    .where(
      and(
        eq(paymentOrders.customerEmail, email),
        gte(paymentOrders.createdAt, oneHourAgo)
      )
    );
  if (recentCount >= RATE_LIMIT_ORDERS_PER_HOUR) {
    throw new Error(
      "Terlalu banyak permintaan pendaftaran dari email ini. Coba lagi nanti."
    );
  }

  // Dedupe: order pending yang sama (email + plan) dalam 30 menit terakhir
  // dipakai ulang, tidak dibuat lagi (idempoten untuk double-submit).
  const reuseWindow = new Date(Date.now() - PENDING_ORDER_REUSE_WINDOW_MS);
  const [pendingOrder] = await db
    .select()
    .from(paymentOrders)
    .where(
      and(
        eq(paymentOrders.customerEmail, email),
        eq(paymentOrders.planKey, input.planId),
        eq(paymentOrders.paymentStatus, "pending"),
        gte(paymentOrders.createdAt, reuseWindow)
      )
    )
    .orderBy(desc(paymentOrders.createdAt))
    .limit(1);

  if (pendingOrder) {
    return {
      success: true,
      paymentMode: pendingOrder.checkoutUrl ? "paycore" : "manual",
      orderId: pendingOrder.id,
      externalOrderId: pendingOrder.externalOrderId,
      amount: Number(pendingOrder.amount ?? amount),
      planName: plan.name,
      checkoutUrl: pendingOrder.checkoutUrl,
      qrString: null,
      reused: true,
    };
  }

  // 1. Registrasi / cari user
  let userId: string | null = null;
  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUser) {
    userId = existingUser.id;
  } else if (input.password && input.password.length >= 8) {
    // Daftarkan user baru via BetterAuth jika ada password
    const signUpRes = await auth.api.signUpEmail({
      body: {
        name: adminName,
        email,
        password: input.password,
      },
    });
    if (signUpRes?.user?.id) {
      userId = signUpRes.user.id;
      await db
        .insert(userRoles)
        .values({
          id: randomUUID(),
          userId: signUpRes.user.id,
          role: "admin",
        })
        .onConflictDoNothing();
    }
  } else {
    // Jangan pernah membuat akun admin tanpa kredensial login
    throw new Error("Kata sandi wajib diisi (minimal 8 karakter) untuk pendaftaran akun baru");
  }

  // 2. Buat / ambil tenant lembaga.
  // Keamanan: SATU email admin = SATU tenant. Bila admin sudah memiliki
  // lembaga, pakai tenant eksisting (jangan membuat tenant duplikat yang
  // membuat resolusi tenant jadi ambigu).
  const mappedType =
    input.institutionType === "preschool" || input.institutionType === "bimbel"
      ? input.institutionType
      : "daycare";

  let tenantId: string | null = null;
  if (userId) {
    const [existingTenant] = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.adminUserId, userId))
      .orderBy(desc(tenants.createdAt))
      .limit(1);
    tenantId = existingTenant?.id ?? null;
  }

  if (!tenantId) {
    const tenantSlug =
      institutionName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      randomUUID().slice(0, 6);

    const newTenantId = randomUUID();
    await db
      .insert(tenants)
      .values({
        id: newTenantId,
        name: institutionName,
        slug: tenantSlug,
        type: mappedType,
        city,
        // Harga layanan lembaga diisi kemudian di Pengaturan; 0 = belum diisi.
        priceFrom: "0",
        whatsapp: phone || null,
        // Lembaga BARU non-aktif sampai pembayaran terkonfirmasi webhook PayCore.
        // Aktivasi hanya terjadi di event payment.succeeded (lihat api/webhooks/paycore).
        isActive: false,
        isVerified: false,
        adminUserId: userId,
      })
      .onConflictDoNothing();
    tenantId = newTenantId;
  }

  // 3. Catat order lokal di payment_orders
  const orderId = randomUUID();
  const externalOrderId = `majiku-sub-${input.planId}-${Date.now().toString(36)}-${randomUUID().slice(0, 6)}`;

  await db.insert(paymentOrders).values({
    id: orderId,
    externalOrderId,
    amount: String(amount),
    currency: "IDR",
    productKey: "saas_subscription",
    paymentStatus: "pending",
    customerName: adminName,
    customerEmail: email,
    customerPhone: phone || null,
    planKey: input.planId,
    tenantId,
    userId,
  });

  // 4. Hubungkan ke PayCore jika payments enabled
  const paymentsActive = isPaymentsEnabled();

  if (paymentsActive) {
    try {
      const cycleText = input.billingCycle === "yearly" ? "1 Tahun" : "1 Bulan";
      const paycoreRes = await createPayCoreOrder({
        externalOrderId,
        amount,
        productKey: "saas_subscription",
        description: `Langganan Bunayo ${plan.name} (${cycleText}) - ${institutionName}`,
        customer: {
          name: adminName,
          email,
          phone,
        },
        fulfillmentData: {
          tenant_id: tenantId,
          plan_id: input.planId,
          billing_cycle: input.billingCycle,
          product_key: "saas_subscription",
        },
      });

      await db
        .update(paymentOrders)
        .set({
          paycoreOrderId: paycoreRes.paycoreOrderId,
          checkoutUrl: paycoreRes.checkoutUrl,
          updatedAt: new Date(),
        })
        .where(eq(paymentOrders.id, orderId));

      return {
        success: true,
        paymentMode: "paycore",
        orderId,
        externalOrderId,
        amount,
        planName: plan.name,
        checkoutUrl: paycoreRes.checkoutUrl,
        qrString: paycoreRes.qrString,
        expiresAt: paycoreRes.expiresAt,
      };
    } catch (err: unknown) {
      console.warn("Gagal menghubungi gateway PayCore, fallback ke mode transfer:", err);
      return {
        success: true,
        paymentMode: "manual",
        orderId,
        externalOrderId,
        amount,
        planName: plan.name,
        checkoutUrl: null,
      };
    }
  }

  // Fallback mode manual jika PayCore disabled di environment
  return {
    success: true,
    paymentMode: "manual",
    orderId,
    externalOrderId,
    amount,
    planName: plan.name,
    checkoutUrl: null,
  };
}
