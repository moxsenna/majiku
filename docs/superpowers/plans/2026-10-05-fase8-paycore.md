# Fase 8: Integrasi PayCore (SPP Online Payment) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pembayaran SPP online via **AppVibe PayCore** (Duitku): parent klik "Bayar Online" di invoice → redirect checkout Duitku → PayCore verifikasi → webhook `payment.succeeded` ke MAJIKU → invoice otomatis jadi `paid`. Menggantikan ketergantungan upload bukti transfer sebagai satu-satunya jalur bayar.

**Architecture:** MAJIKU adalah **consumer app** PayCore (kontrak: `D:/Coding/paycore/prompt.md` + `docs/external/integration-guide.md`). Alur: server action `createInvoicePaymentOrder` (signed request ke `POST {PAYCORE_BASE_URL}/v1/orders`) → simpan `payment_orders` lokal pending → redirect `checkout_url`. Webhook `POST /api/webhooks/paycore` verifikasi HMAC timing-safe + timestamp skew, dedupe `event_id`/`paycore_order_id` di level DB, fulfillment dalam satu transaction (payment_orders → paid, invoices → paid + paidAt). MAJIKU **tidak pernah** menyentuh Duitku langsung.

**Tech Stack:** Next.js Route Handlers + server actions, Drizzle + Neon, Web Crypto (HMAC/SHA-256), PayCore staging `https://pay-staging.appvibe.biz.id`.

**Sumber kontrak:** `D:/Coding/paycore/prompt.md`, `D:/Coding/paycore/docs/external/integration-guide.md`, `D:/Coding/paycore/src/lib/crypto.ts` (source of truth signature).

## Global Constraints

1. npm saja; branch `feat/fase8-paycore` dari `main`.
2. **Larangan keras (prompt.md §2)**: tidak menyentuh Duitku langsung; tidak menyimpan Duitku keys; tidak memanggil `/webhooks/duitku`; tidak menaruh secret di frontend; tidak percaya return URL/parameter browser sebagai bukti bayar; fulfillment wajib transaction + dedupe; tidak mengubah repo PayCore; tidak ada live payment.
3. Env vars (nama persis): `PAYCORE_BASE_URL`, `PAYCORE_ENVIRONMENT`, `PAYMENT_MODE`, `PAYCORE_APP_ID`, `PAYCORE_KEY_ID`, `PAYCORE_APP_SECRET`, `PAYCORE_WEBHOOK_SECRET`, `PAYCORE_RETURN_URL`, `PAYMENTS_ENABLED`. Belum lengkap → `PAYMENTS_ENABLED=false` → endpoint payment gagal jelas ("Pembayaran online belum tersedia"), JANGAN pakai credential dummy. Secret asli → wrangler secrets (bukan repo).
4. Derivasi identitas (prompt.md §5): app_id = `majiku`; order prefix = `MAJ`; external_order_id = `majiku-inv-{invoiceId}-{uuid8}`; product_key = `spp_invoice`; merchant_profile_id = `appvibe_default`.
5. DB dedupe **di level constraint**: `paycore_events.event_id` PK, `paycore_events.paycore_order_id` UNIQUE (fulfillment sekali), `payment_orders.external_order_id` UNIQUE. Satu invoice boleh punya beberapa order percobaan, tapi fulfillment invoice hanya sekali (guard: invoice.status !== 'paid').
6. Nominal SELALU dari DB (`invoices.total`), tidak pernah dari frontend. Validasi event vs local order: amount, currency, product_key.
7. Middleware: `/api/webhooks/*` TIDAK boleh terblokir (bukan di PROTECTED list — verifikasi).
8. Bukti bayar manual (upload bukti transfer) TETAP ada — online adalah jalur tambahan.

---

### Task 1: Skema + klien PayCore

**Files:** Modify `src/db/schema.ts` (+paymentOrders, +paycoreEvents) + migrasi; Create `src/server/paycore.ts`; Modify `.env.paycore.example` (baru, tanpa secret asli).

**Interfaces:**
```ts
// src/server/paycore.ts
isPaymentsEnabled(): boolean            // PAYMENTS_ENABLED === "true" && semua PAYCORE_* var ada; else false
signPayCoreRequest({secret, timestamp, method, path, rawBody}): Promise<string>   // HMAC canonical {ts}.{METHOD}.{path}.{sha256(body)}
createPayCoreOrder(params { amount: number; invoiceNumber: string; invoiceId: string; customer: {name,email,phone}; }): Promise<{ paycoreOrderId, checkoutUrl, expiresAt? }>
// POST /v1/orders, headers sesuai kontrak, external_order_id & Idempotency-Key dibuat caller
getPayCoreOrder(paycoreOrderId): Promise<{ paymentStatus: string; ... } | null>
verifyPayCoreEvent({webhookSecret, timestampHeader, rawBody, signatureHeader, maxSkewMs}): Promise<boolean>  // timing-safe
```

- [ ] Step 1: schema — `paymentOrders`: id, invoiceId fk invoices cascade, parentUserId fk user set null, externalOrderId text unique notNull, paycoreOrderId text unique (nullable), productKey text notNull default 'spp_invoice', amount numeric notNull, currency text default 'IDR', paymentStatus text notNull default 'pending', checkoutUrl text, paidAt timestamptz, timestamps. `paycoreEvents`: eventId text pk, paycoreOrderId text notNull unique, eventType text notNull, processedAt timestamptz default now, rawPayload jsonb. → generate `--name paycore` → migrate (25 tabel).
- [ ] Step 2: `src/server/paycore.ts` (crypto pola dari integration-guide §6; config dari process.env; bukan file "use server" — pure lib untuk route handler & action).
- [ ] Step 3: `.env.paycore.example` + tsc + build. Commit `feat(paycore): skema payment + klien signed PayCore`.

### Task 2: Webhook fulfillment `/api/webhooks/paycore`

**Files:** Create `src/app/api/webhooks/paycore/route.ts`.

**Detail (prompt.md §10 — wajib berurutan):**
1. `await req.text()` RAW body sebelum parse.
2. Verifikasi timestamp (skew ≤ 5 menit) + HMAC timing-safe via `verifyPayCoreEvent`.
3. Invalid → 401 (jangan 200).
4. Parse `{event_id, event_type, data}`.
5. Dedupe: INSERT paycoreEvents ON CONFLICT DO NOTHING → bila 0 row (sudah ada) → 200 "already processed".
6. Cari paymentOrders WHERE paycoreOrderId = data.order_id (fallback externalOrderId) → tidak ada → 200 (bukan milik kita, jangan retry).
7. Validasi: amount === data.amount, currency, productKey → mismatch → 400 + jangan fulfill.
8. `event_type === "payment.succeeded"` → **db.transaction**: paymentOrders SET paymentStatus='paid', paidAt; invoices SET status='paid', paidAt WHERE id AND status != 'paid'; bila invoice sudah paid → tetap 200 (idempotent).
9. `payment.failed|expired` → paymentOrders SET status sesuai (invoice TIDAK diubah).
10. Error transient → non-2xx (PayCore retry dengan event_id sama).

- [ ] Implement + verifikasi manual dengan signed request dummy (buat secret dummy di .env.local, POST event signed, cek 401 utk signature salah / 200 utk valid dgn order dummy). Commit `feat(paycore): webhook fulfillment payment.succeeded`.

### Task 3: Alur parent — order + redirect checkout

**Files:** Modify `src/server/actions/payments.ts` (baru: createInvoicePaymentOrder), `src/app/(parent)/parent/payment/page.tsx` + `src/views/ParentPayment.tsx` + `src/views/ParentBilling.tsx` / `ParentInvoiceDetail.tsx` (tombol Bayar Online), Create `src/app/(parent)/payment/return/page.tsx`.

**Detail:**
- `createInvoicePaymentOrder(invoiceId)`: session wajib; invoice milik parent (join students.parentUserId); status unpaid|partial|overdue (paid → throw "Sudah lunas"); amount = Number(invoices.total) dari DB; idempotency-Key = crypto.randomUUID(); externalOrderId = `majiku-inv-{invoiceId}-{8-char uuid}`; INSERT paymentOrders pending dulu → panggil PayCore → UPDATE paycoreOrderId + checkoutUrl → return { checkoutUrl }. PayCore gagal → paymentOrders tetap pending + throw pesan jelas.
- UI: tombol "Bayar Online (QRIS/VA)" pada invoice unpaid — bila `isPaymentsEnabled()` false → tombol disabled dengan tooltip "Pembayaran online belum tersedia". Klik → action → `window.location.href = checkoutUrl`.
- `/payment/return` (return_url PayCore): halaman info "Pembayaran sedang diverifikasi — status akan diperbarui otomatis" + link ke /parent/billing (BUKAN bukti bayar).
- [ ] Implement + tsc + build + smoke (button disabled state karena PAYMENTS_ENABLED belum diset). Commit `feat(payments): alur bayar SPP online — order, redirect checkout, halaman return`.

### Task 4: Verifikasi + deploy + onboarding report + merge

- [ ] Verification doc `2026-10-05-fase8-paycore-verification.md` + **laporan onboarding** (untuk didaftarkan user sebagai operator PayCore):
```text
app_id: majiku
display_name: MAJIKU Daycare Management
order_prefix: MAJ
webhook_url: https://majiku.moxsenna.workers.dev/api/webhooks/paycore
allowed_return_url: https://majiku.moxsenna.workers.dev/payment/return
merchant_profile_id: appvibe_default
```
- [ ] `npm run deploy`; setelah user mendaftarkan app → user jalankan `wrangler secret put` untuk 9 env vars (daftar command disediakan) → E2E test sandbox Duitku (dipandu di doc).
- [ ] Final whole-branch review (subagent; bila API down → inline teliti) → fix wave → merge main → hapus branch.

## Self-Review

1. Kontrak prompt.md terpenuhi semua kecuali kredensial (menunggu onboarding — perilaku aman: disabled). Fulfillment = invoice paid (bukan kredit/entitlement).
2. Placeholder: signature/webhook code dari source of truth PayCore; interfaces lengkap.
3. Type consistency: paycoreOrderId/externalOrderId konsisten T1→T3; event shape sesuai integration-guide §7.
