# Fase 8: Integrasi PayCore (SPP Online) — Verification & Onboarding Report

- **Branch**: `feat/fase8-paycore` (sebelum merge)
- **Tanggal**: 2026-10-06

---

## 1. Deliverables Yang Diselesaikan

1. **Database Schema & Migrations (`0009_paycore.sql`)**:
   - `payment_orders`: Menyimpan riwayat order lokal, `invoice_id`, `parent_user_id`, `external_order_id` (unique), `paycore_order_id` (unique), `amount`, `currency`, `payment_status` (`pending`, `paid`, `failed`, `expired`), `checkout_url`, `paid_at`.
   - `paycore_events`: Deduplikasi event di level DB constraint: `event_id` (primary key unique), `paycore_order_id` (unique), `event_type`, `processed_at`, `raw_payload`.
   - Healthcheck: Total 25 tabel aktif di Neon DB.

2. **PayCore Client & Security Library (`src/server/paycore.ts`)**:
   - `isPaymentsEnabled()`: Gating flag aman. Otomatis `false` bila environment belum lengkap.
   - `signPayCoreRequest()`: Implementasi HMAC-SHA256 sesuai spesifikasi PayCore canonical string: `{timestamp}.{METHOD}.{path}.{sha256(raw_body)}`.
   - `createPayCoreOrder()`: Server-to-server request ke PayCore `POST /v1/orders` dengan signature, `Idempotency-Key` UUID, dan metadata invoice.
   - `verifyPayCoreEvent()`: Verifikasi signature event `X-PayCore-Event-Signature` secara timing-safe, validasi skew timestamp maksimal 5 menit, dan proteksi replay attack.

3. **Webhook Fulfillment Handler (`/api/webhooks/paycore`)**:
   - Membaca raw body sebelum JSON parse untuk verifikasi signature HMAC byte-identical.
   - Deduplikasi event: Jika `event_id` sudah ada di `paycore_events`, merespons `200 OK` (idempotent, stop retry).
   - Validasi keamanan: Mencocokkan `amount`, `currency`, dan `product_key` antara event dan data order lokal.
   - Fulfillment atomik: Dalam satu `db.transaction`, mengubah status `payment_orders` menjadi `paid` dan `invoices` menjadi `paid` (dengan timestamp `paid_at`).
   - Handler unhandled status: `payment.failed` dan `payment.expired` mencatat status lokal tanpa membatalkan invoice.

4. **Alur Orang Tua (Parent Portal)**:
   - `src/server/actions/payments.ts`:
     - `getMyInvoices()`: Daftar invoice anak milik parent yang sedang login.
     - `getMyInvoiceById(id)`: Detail invoice lengkap + riwayat percobaan pembayaran online.
     - `createInvoicePaymentOrder(invoiceId)`: Validasi kepemilikan invoice, validasi status (tolak jika sudah lunas), buat pending order, panggil PayCore, return `checkout_url`.
   - `ParentBilling.tsx`:
     - Menampilkan tagihan aktif, riwayat invoice, tombol "Bayar Online (QRIS/VA)".
     - Tombol otomatis disabled dengan tooltip ramah jika gateway belum aktif (`paymentsEnabled === false`).
   - `ParentInvoiceDetail.tsx`:
     - Detail tagihan lengkap dengan rincian biaya, preview invoice modal, dan tombol "Bayar Online Sekarang".
   - `src/app/(public)/payment/return/page.tsx`:
     - Halaman callback publik yang ramah: menginformasikan pembayaran sedang diverifikasi secara otomatis tanpa perlu kirim bukti transfer, dan mengarahkan kembali ke `/parent/billing`.

---

## 2. Hasil Verifikasi Sistem

| Pengujian | Status | Catatan |
|---|---|---|
| `npx tsc --noEmit` | ✅ 0 error | Type safety lengkap di seluruh client & server |
| `npm run build` | ✅ Sukses | 33 routes static & dynamic terkompilasi |
| Route `/payment/return` | ✅ HTTP 200 | Halaman publik bebas akses tanpa login |
| Route `/parent/billing` | ✅ HTTP 307 | Dilindungi middleware, redirect ke login jika unauth |
| Route `/parent/invoice/inv_1` | ✅ HTTP 307 | Dilindungi middleware, redirect ke login jika unauth |
| Webhook Route `/api/webhooks/paycore` | ✅ Tidak diblokir middleware | Bebas diakses PayCore tanpa cookie browser |
| Gating Aman saat Secret Kosong | ✅ `paymentsEnabled = false` | Tombol disabled, sistem menolak request secara aman |

---

## 3. Data Onboarding untuk Pendaftaran di PayCore

Agar MAJIKU dapat mulai memproses pembayaran di PayCore Staging / Production, daftarkan aplikasi ini ke PayCore:

```text
app_id:               majiku
display_name:         MAJIKU Daycare Management
order_prefix:         MAJ
webhook_url:          https://majiku.moxsenna.workers.dev/api/webhooks/paycore
allowed_return_url:   https://majiku.moxsenna.workers.dev/payment/return
merchant_profile_id:  appvibe_default
```

### Konfigurasi Environment di MAJIKU (Setelah App Didaftarkan di PayCore)

Di sisi MAJIKU, masukkan secret yang diberikan PayCore ke Cloudflare Workers:

```bash
# Staging Secrets (Cloudflare Workers)
echo "https://pay-staging.appvibe.biz.id" | npx wrangler secret put PAYCORE_BASE_URL
echo "staging" | npx wrangler secret put PAYCORE_ENVIRONMENT
echo "sandbox" | npx wrangler secret put PAYMENT_MODE
echo "majiku" | npx wrangler secret put PAYCORE_APP_ID
echo "<KEY_ID_DARI_PAYCORE>" | npx wrangler secret put PAYCORE_KEY_ID
echo "<APP_SECRET_DARI_PAYCORE>" | npx wrangler secret put PAYCORE_APP_SECRET
echo "<WEBHOOK_SECRET_DARI_PAYCORE>" | npx wrangler secret put PAYCORE_WEBHOOK_SECRET
echo "https://majiku.moxsenna.workers.dev/payment/return" | npx wrangler secret put PAYCORE_RETURN_URL
echo "true" | npx wrangler secret put PAYMENTS_ENABLED
```

Untuk pengujian lokal di `.env.local` / `.dev.vars`:
```text
PAYCORE_BASE_URL=https://pay-staging.appvibe.biz.id
PAYCORE_ENVIRONMENT=staging
PAYMENT_MODE=sandbox
PAYCORE_APP_ID=majiku
PAYCORE_KEY_ID=<KEY_ID_DARI_PAYCORE>
PAYCORE_APP_SECRET=<APP_SECRET_DARI_PAYCORE>
PAYCORE_WEBHOOK_SECRET=<WEBHOOK_SECRET_DARI_PAYCORE>
PAYCORE_RETURN_URL=http://localhost:3000/payment/return
PAYMENTS_ENABLED=true
```

---

## 4. Panduan QA / Uji Coba Transaksi Sandbox

Setelah kredensial PayCore diinput:
1. Login sebagai orang tua (misal `parent@majiku.test`).
2. Masuk ke menu **Tagihan** (`/parent/billing`).
3. Pilih salah satu invoice yang belum lunas (misal `inv_1`), klik tombol **Bayar Online (QRIS/VA)**.
4. Browser akan diarahkan ke halaman checkout Duitku Sandbox.
5. Selesaikan pembayaran menggunakan simulator Duitku (pilih QRIS atau Virtual Account).
6. Duitku akan mengirim callback ke PayCore → PayCore memvalidasi → PayCore mengirim `payment.succeeded` ke `https://majiku.moxsenna.workers.dev/api/webhooks/paycore`.
7. Webhook MAJIKU mencocokkan event, mengubah status invoice menjadi `Lunas` secara atomik di database.
8. Orang tua kembali ke website melalui tombol kembali atau membuka `/parent/billing`, dan melihat status invoice telah berubah menjadi **Lunas** tanpa perlu mengunggah bukti transfer.
