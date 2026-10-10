import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "node:fs";
import { db } from "../src/db";
import { paymentOrders, tenants, user } from "../src/db/schema";
import { eq } from "drizzle-orm";
import {
  SUBSCRIPTION_PLANS,
} from "@/lib/subscriptionPlans";
import {
  createSubscriptionCheckoutOrder,
} from "../src/server/actions/checkout";

async function main() {
  console.log("=== Verifikasi Alur Checkout LP -> PayCore ===");

  // 1. Cek konfigurasi paket SaaS
  if (!SUBSCRIPTION_PLANS.basic || !SUBSCRIPTION_PLANS.pro || !SUBSCRIPTION_PLANS.enterprise) {
    throw new Error("SUBSCRIPTION_PLANS tidak lengkap!");
  }
  console.log("✓ Definisi paket berlangganan valid:");
  console.log(`  - Basic     : Rp ${SUBSCRIPTION_PLANS.basic.priceMonthly.toLocaleString()} / bln`);
  console.log(`  - Pro       : Rp ${SUBSCRIPTION_PLANS.pro.priceMonthly.toLocaleString()} / bln`);
  console.log(`  - Enterprise: Rp ${SUBSCRIPTION_PLANS.enterprise.priceMonthly.toLocaleString()} / bln`);

  // 2. Cek tombol CTA di SaasLanding.tsx
  const landingCode = fs.readFileSync("src/views/SaasLanding.tsx", "utf-8");
  if (!landingCode.includes("/checkout?plan=")) {
    throw new Error("Tombol CTA di SaasLanding.tsx belum diarahkan ke /checkout?plan=");
  }
  console.log("✓ Tombol CTA di SaasLanding.tsx mengarah ke /checkout?plan=...");

  // 3. Test pembuatan order checkout SaaS
  const testEmail = `test.checkout.${Date.now()}@example.com`;
  console.log(`\nTesting createSubscriptionCheckoutOrder untuk ${testEmail}...`);

  const orderRes = await createSubscriptionCheckoutOrder({
    planId: "pro",
    billingCycle: "monthly",
    institutionName: "Daycare Uji Coba Checkout",
    institutionType: "daycare",
    adminName: "Bapak Penguji",
    email: testEmail,
    phone: "081234567890",
    password: "Password123!",
  });

  if (!orderRes.success) {
    throw new Error("Gagal membuat order checkout subscription!");
  }

  console.log(`✓ Order checkout berhasil dibuat:`);
  console.log(`  - External Order ID : ${orderRes.externalOrderId}`);
  console.log(`  - Amount            : Rp ${orderRes.amount.toLocaleString()}`);
  console.log(`  - Payment Mode      : ${orderRes.paymentMode}`);
  console.log(`  - Plan              : ${orderRes.planName}`);

  // 4. Verifikasi record di database payment_orders
  const [dbOrder] = await db
    .select()
    .from(paymentOrders)
    .where(eq(paymentOrders.externalOrderId, orderRes.externalOrderId));

  if (!dbOrder) {
    throw new Error("Record payment_orders tidak ditemukan di database!");
  }

  if (dbOrder.productKey !== "saas_subscription" || Number(dbOrder.amount) !== 599000) {
    throw new Error(`Data order DB tidak valid: productKey=${dbOrder.productKey}, amount=${dbOrder.amount}`);
  }

  console.log("✓ Record tersimpan di database payment_orders dengan product_key='saas_subscription' & amount=599000!");

  // Cleanup test order & user
  await db.delete(paymentOrders).where(eq(paymentOrders.id, dbOrder.id));
  if (dbOrder.tenantId) {
    await db.delete(tenants).where(eq(tenants.id, dbOrder.tenantId));
  }
  if (dbOrder.userId) {
    await db.delete(user).where(eq(user.id, dbOrder.userId));
  }
  console.log("✓ Cleanup data test berhasil.");

  console.log("\n[SUCCESS] Seluruh pengujian alur Checkout LP & PayCore lulus 100%!");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
