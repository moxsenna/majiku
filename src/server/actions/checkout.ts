"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { tenants, user, userRoles, paymentOrders } from "@/db/schema";
import { auth } from "@/server/auth";
import { createPayCoreOrder, isPaymentsEnabled } from "@/server/paycore";

export interface SubscriptionPlan {
  id: "basic" | "pro" | "enterprise";
  name: string;
  badge?: string;
  popular?: boolean;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: "basic",
    name: "Paket Basic",
    description: "Untuk daycare atau bimbel kecil yang baru merintis",
    priceMonthly: 299000,
    priceYearly: 2990000, // Hemat 2 bulan
    features: [
      "Hingga 50 siswa aktif",
      "2 kelas / rombel belajar",
      "Absensi digital & QR Code",
      "Laporan harian & dokumentasi kegiatan",
      "Chat langsung dengan orang tua",
      "Support via email & komunitas",
    ],
  },
  pro: {
    id: "pro",
    name: "Paket Pro",
    badge: "Paling Populer",
    popular: true,
    description: "Untuk lembaga yang siap bertumbuh cepat & profesional",
    priceMonthly: 599000,
    priceYearly: 5990000, // Hemat 2 bulan
    features: [
      "Hingga 200 siswa aktif",
      "10 kelas / rombel belajar",
      "Monitoring kehadiran & QR real-time",
      "Billing SPP otomatis & pembayaran PayCore",
      "Manajemen tutor & kalkulasi honor",
      "Cloud R2 galeri foto tanpa batas",
      "Broadcast pengumuman wali murid",
      "Priority support via WhatsApp",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Paket Enterprise",
    badge: "Franchise & Jaringan",
    description: "Solusi lengkap jaringan cabang lembaga & yayasan",
    priceMonthly: 1500000,
    priceYearly: 15000000, // Hemat 2 bulan
    features: [
      "Unlimited siswa & kelas",
      "Multi-cabang / multi-tenant terpadu",
      "Custom domain & branding mandiri",
      "Integrasi payment gateway Duitku/PayCore",
      "Export data akuntansi & laporan keuangan",
      "Dedicated Account Manager 24/7",
      "Pelatihan & onboarding staf khusus",
    ],
  },
};

export interface CreateSubscriptionOrderInput {
  planId: "basic" | "pro" | "enterprise";
  billingCycle: "monthly" | "yearly";
  institutionName: string;
  institutionType?: "daycare" | "preschool" | "bimbel";
  adminName: string;
  email: string;
  phone: string;
  password?: string;
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
}

export async function createSubscriptionCheckoutOrder(
  input: CreateSubscriptionOrderInput
): Promise<SubscriptionOrderResult> {
  const plan = SUBSCRIPTION_PLANS[input.planId] || SUBSCRIPTION_PLANS.pro;
  const amount =
    input.billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

  const email = input.email?.trim().toLowerCase();
  const adminName = input.adminName?.trim();
  const institutionName = input.institutionName?.trim();
  const phone = input.phone?.trim() || "";

  if (!email || !email.includes("@")) {
    throw new Error("Format email tidak valid");
  }
  if (!adminName || adminName.length < 2) {
    throw new Error("Nama penanggung jawab wajib diisi");
  }
  if (!institutionName || institutionName.length < 2) {
    throw new Error("Nama lembaga daycare / bimbel wajib diisi");
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
    try {
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
    } catch {
      // Fallback: insert manual record
      const newUserId = randomUUID();
      await db.insert(user).values({
        id: newUserId,
        name: adminName,
        email,
      }).onConflictDoNothing();
      await db.insert(userRoles).values({
        id: randomUUID(),
        userId: newUserId,
        role: "admin",
      }).onConflictDoNothing();
      userId = newUserId;
    }
  }

  // 2. Buat / ambil tenant lembaga
  let tenantId: string | null = null;
  const tenantSlug =
    institutionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    randomUUID().slice(0, 6);

  const mappedType =
    input.institutionType === "preschool" || input.institutionType === "bimbel"
      ? input.institutionType
      : "daycare";

  const newTenantId = randomUUID();
  await db
    .insert(tenants)
    .values({
      id: newTenantId,
      name: institutionName,
      slug: tenantSlug,
      type: mappedType,
      city: "Jakarta",
      priceFrom: String(amount),
      whatsapp: phone || null,
      isActive: true,
      isVerified: false,
    })
    .onConflictDoNothing();
  tenantId = newTenantId;

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
        description: `Langganan MAJIKU ${plan.name} (${cycleText}) - ${institutionName}`,
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
