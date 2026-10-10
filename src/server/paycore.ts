// Klien AppVibe PayCore (source of truth kontrak: D:/Coding/paycore/docs/external/integration-guide.md)
// Pure lib — dipakai server action & route handler. JANGAN beri "use server" (bukan action).
// Secret hanya via env server. Frontend tidak pernah menyentuh PayCore.

const PAYMENT_PRODUCT_KEY = "spp_invoice";
const MERCHANT_PROFILE_ID = "mp_appvibe_duitku_v2";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`Pembayaran online belum tersedia (${name} belum dikonfigurasi)`);
  }
  return v.trim();
}

export function isPaymentsEnabled(): boolean {
  if (process.env.PAYMENTS_ENABLED !== "true") return false;
  const required = [
    "PAYCORE_BASE_URL",
    "PAYCORE_APP_ID",
    "PAYCORE_KEY_ID",
    "PAYCORE_APP_SECRET",
    "PAYCORE_WEBHOOK_SECRET",
    "PAYCORE_RETURN_URL",
  ];
  return required.every((k) => Boolean(process.env[k]?.trim()));
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function signPayCoreRequest(params: {
  secret: string;
  timestamp: string;
  method: string;
  path: string;
  rawBody: string;
}): Promise<string> {
  const bodyHash = await sha256Hex(params.rawBody);
  const message = `${params.timestamp}.${params.method.toUpperCase()}.${params.path}.${bodyHash}`;
  return hmacSha256Hex(params.secret, message);
}

interface PayCoreOrderResponse {
  order_id: string;
  external_order_id: string;
  payment_status: string;
  fulfillment_status: string;
  provider?: string;
  provider_variant?: string | null;
  payment_method?: string | null;
  checkout_url?: string;
  qr_string?: string | null;
  expires_at?: string;
}

export interface CreateOrderParams {
  externalOrderId: string;
  amount: number; // IDR integer, SELALU dari DB/Server — bukan dari frontend
  invoiceNumber?: string;
  invoiceId?: string;
  productKey?: string;
  description?: string;
  customer: { name: string; email: string; phone?: string };
  fulfillmentData?: Record<string, unknown>;
}

export async function createPayCoreOrder(params: CreateOrderParams): Promise<{
  paycoreOrderId: string;
  checkoutUrl: string;
  qrString?: string | null;
  expiresAt?: string;
}> {
  if (!isPaymentsEnabled()) {
    throw new Error("Pembayaran online belum tersedia");
  }

  const baseUrl = requireEnv("PAYCORE_BASE_URL").replace(/\/$/, "");
  const appId = requireEnv("PAYCORE_APP_ID");
  const keyId = requireEnv("PAYCORE_KEY_ID");
  const secret = requireEnv("PAYCORE_APP_SECRET");
  const returnUrl = requireEnv("PAYCORE_RETURN_URL");

  const externalOrderId = params.externalOrderId;
  const customer: Record<string, string> = {
    name: params.customer.name,
    email: params.customer.email,
  };
  if (params.customer.phone && params.customer.phone.trim().length >= 8) {
    customer.phone = params.customer.phone.trim();
  }

  const paymentMethod = process.env.PAYMENT_MODE === "live" ? "SP" : "NQ";
  const productKey = params.productKey || PAYMENT_PRODUCT_KEY;
  const description =
    params.description ||
    (params.invoiceNumber ? `SPP ${params.invoiceNumber}` : "Layanan MAJIKU");
  const fulfillmentData = params.fulfillmentData || {
    invoice_id: params.invoiceId,
    invoice_number: params.invoiceNumber,
    product_key: productKey,
  };

  const body = JSON.stringify({
    external_order_id: externalOrderId,
    merchant_profile_id: MERCHANT_PROFILE_ID,
    product_key: productKey,
    description,
    amount: params.amount,
    currency: "IDR",
    payment_method: paymentMethod,
    customer,
    return_url: returnUrl,
    fulfillment_data: fulfillmentData,
  });

  const timestamp = new Date().toISOString();
  const path = "/v1/orders";
  const signature = await signPayCoreRequest({
    secret,
    timestamp,
    method: "POST",
    path,
    rawBody: body,
  });

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PayCore-App": appId,
      "X-PayCore-Key-Id": keyId,
      "X-PayCore-Timestamp": timestamp,
      "X-PayCore-Signature": `sha256=${signature}`,
      "Idempotency-Key": crypto.randomUUID(),
    },
    body,
  });

  const raw = await res.text();
  if (!res.ok) {
    console.error("PayCore create order gagal:", res.status, raw.slice(0, 500));
    throw new Error(
      `Gagal membuat order pembayaran (PayCore ${res.status}). Silakan coba lagi atau gunakan transfer manual.`
    );
  }

  const data = JSON.parse(raw) as PayCoreOrderResponse;
  if (!data.order_id || !data.checkout_url) {
    throw new Error("Respons PayCore tidak lengkap");
  }

  return {
    paycoreOrderId: data.order_id,
    checkoutUrl: data.checkout_url,
    qrString: data.qr_string ?? null,
    expiresAt: data.expires_at,
  };
}

export async function getPayCoreOrder(
  paycoreOrderId: string
): Promise<{ paymentStatus: string; orderId: string } | null> {
  if (!isPaymentsEnabled()) return null;

  const baseUrl = requireEnv("PAYCORE_BASE_URL").replace(/\/$/, "");
  const appId = requireEnv("PAYCORE_APP_ID");
  const keyId = requireEnv("PAYCORE_KEY_ID");
  const secret = requireEnv("PAYCORE_APP_SECRET");

  const timestamp = new Date().toISOString();
  const path = `/v1/orders/${paycoreOrderId}`;
  const signature = await signPayCoreRequest({
    secret,
    timestamp,
    method: "GET",
    path,
    rawBody: "{}",
  });

  const res = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      "X-PayCore-App": appId,
      "X-PayCore-Key-Id": keyId,
      "X-PayCore-Timestamp": timestamp,
      "X-PayCore-Signature": `sha256=${signature}`,
    },
  });

  if (!res.ok) return null;
  const data = (await res.json()) as PayCoreOrderResponse;
  return { paymentStatus: data.payment_status, orderId: data.order_id };
}

export async function verifyPayCoreEvent(params: {
  webhookSecret: string;
  timestampHeader: string;
  rawBody: string;
  signatureHeader: string;
  maxSkewMs?: number;
}): Promise<boolean> {
  const t = Date.parse(params.timestampHeader);
  if (Number.isNaN(t)) return false;
  const skew = Math.abs(Date.now() - t);
  if (skew > (params.maxSkewMs ?? 5 * 60_000)) return false;

  const message = `${params.timestampHeader}.${params.rawBody}`;
  const expected = await hmacSha256Hex(params.webhookSecret, message);
  const provided = params.signatureHeader?.trim() ?? "";
  const normalized = provided.startsWith("sha256=") ? provided.slice(7) : provided;

  if (normalized.length !== expected.length) return false;
  let out = 0;
  for (let i = 0; i < expected.length; i++) {
    out |= expected.charCodeAt(i) ^ normalized.charCodeAt(i);
  }
  return out === 0;
}
