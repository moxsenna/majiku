# Laporan Eksekusi Perbaikan Launch MAJIKU — 2026-10-11

Basis: `docs/launch-audit-2026-10-11.md` (99 temuan). Eksekusi dalam 6 wave terorkestrasi
(unlazy scope `fix-launch`) + integrasi + E2E reticle. Detail per wave:
`.unlazy/fix-launch/reports/wave-{1..6}.md` (semua lolos oracle `check-fixes.mjs`).

## 1. Ringkasan

| Wave | Cakupan | FIX |
|---|---|---|
| W1 (driver) | Fondasi keamanan + PayCore + migrasi multi-tenant | 26 |
| W2 | Tenant-scope 11 file server action | 56 |
| W3 | Portal tutor (QR, izin/cuti, schedule, KPI, widget, login) | 19 |
| W4 | Portal parent (wizard, payment, marketplace, katalog, trial list) | 16 |
| W5 | Portal admin (RPP, modal dashboard, settings, siswa, laporan, CRM) | 18 |
| W6 | Vendor + public (tab vendor, pricing, legal, OG, chat label) | 15 |
| **Total** | | **150 baris FIX** (satu temuan bisa disentuh >1 wave) |

**Integrasi:** `tsc --noEmit` bersih · `npm run build` sukses · migrasi diterapkan & terverifikasi
(`verify-migration.mjs` → `OK: migration`) · 1 regresi lintas-wave ditemukan saat E2E dan
diperbaiki (lihat §4).

## 2. Fondasi Arsitektur Baru (perubahan struktural)

1. **Multi-tenant nyata**: `tenants.admin_user_id` + `tenant_id NOT NULL` di
   classes/tutors/students/announcements/waiting_list/trial_applications (backfill → tnt_1,
   pemilik = moxsenna@gmail.com); tabel turunan di-scope via join. Helper `src/server/authz.ts`
   (`requireTenantContext/requireRoles/resolveTenantIdForUser`) dipakai SEMUA server action.
2. **Otorisasi foto**: `/api/photos/[...key]` default-deny dengan cek relasi (superadmin / admin
   lembaga pemilik / orang tua anak / tutor kelas) + batasan pola key.
3. **Pembayaran**: tenant baru lahir `isActive:false`, aktif hanya di webhook `payment.succeeded`;
   webhook tidak pernah menimpa status `paid`; akun tanpa password tidak pernah dibuat;
   `trustedOrigins` subdomain produksi; `.env.example` return_url benar.
4. **Kejujuran UI**: semua tombol/tabel tanpa backend dihapus atau diganti aksi nyata (wa.me,
   dialog, navigasi); mock hanya tersisa di jalur akun demo (`*@majiku.test`) yang memang
   untuk presentasi.

## 3. Verifikasi E2E (reticle, dev server + production server)

| # | Flow | Hasil |
|---|---|---|
| 1 | Login admin → `/dashboard` (query ter-scope tenant) | **proved**, 0 error |
| 2 | `/attendance` — tombol Scan QR hilang, Manual Check-in tersisa | **terverifikasi DOM** |
| 3 | Search header Enter → `/students?q=Ahmad` | **proved** (route change) |
| 4 | `/settings` — email read-only, tombol logo hilang, menu navigasi nyata; Simpan → toast sukses | **proved** |
| 5 | Login tutor (TutorAuth baru dengan cek role) → `/tutor` | **proved** |
| 6 | `/tutor/schedule` (baru, dulunya 404) — render + empty state jujur | **terverifikasi DOM** |
| 7 | `/tutor/attendance` — tanpa QR, jam WIB server, riwayat dari DB, section izin/cuti | **terverifikasi DOM** |
| 8 | Ajukan cuti (Cuti Tahunan, 13–14 Okt, alasan) → tersimpan | **proved** — query `tutor-leave-requests` `[]`→1 baris (`tlr_47340ade-…`) |
| 9 | Login parent → wizard `/parent/registration` step 2 kosong + Lanjut → 3 error inline muncul, tidak pindah step | **proved** (`ParentRegistration.tsx:445`) |
| 10 | `/parent/payment?invoice=inv_1` — halaman instruksi transfer (bukan redirect loop) | **terverifikasi DOM** |
| 11 | `/parent/marketplace` — bottom nav hadir + data 10 tenant + dialog inline kartu | **terverifikasi DOM** (setelah fix regresi) |
| 12 | Production server (port 3001, build final): `/`, `/terms`, `/privacy`, `/checkout`, `/marketplace`, `/marketplace/majiku-kids`, `/auth/login`, login 4 portal, `/payment/return`, `/site/daycare` | **semua 200**; payment anonim 307 (guard benar) |

## 4. Regresi yang ditemukan & diperbaiki saat E2E

- `hrefOverride={function}` dari Server Component → Client `TenantCard` menyebabkan 500 di
  `/parent/marketplace` (error state "Coba Lagi"). Prop dibuang (href identik dengan default) —
  `MarketplaceContent.tsx` + `TenantCard.tsx`. Re-verify: halaman normal, nav portal muncul.

## 5. Item DEFERRED (dengan alasan, tidak menghalangi launch)

- **Chat per-anak** (`conversations` unik per pasangan ortu–tutor): perubahan model data; mitigasi
  yang diterapkan = label konteks anak di header chat (`ChatShell.tsx`). Perlu keputusan produk
  bila ingin percakapan terpisah per anak.
- **Honor tutor berbasis sesi nyata**: label diubah jujur menjadi "Estimasi Honor (kuota bulanan)";
  perhitungan dari `tutor_attendance` butuh keputusan bisnis (tarif per sesi vs bulanan).
- **Provisioning `www.majiku.web.id`**: route sudah ditambahkan di wrangler.jsonc; finalisasi
  terjadi otomatis saat `npm run deploy` (butuh akses Cloudflare).
- **Tab CRM Automasi/Marketing/Tiket/Integrasi & beberapa tombol vendor**: dihapus dari UI
  sampai backend-nya dibangun (tidak lagi menampilkan data palsu).
- Daftar lengkap per wave di `wave-{1..6}.md` bagian `## Deferred`.

## 6. Catatan operasional pra-deploy

1. `.env.local` masih memakai DB Neon produksi + `PAYMENT_MODE=live` — sebelum deploy, pisahkan
   branch dev di Neon untuk pengujian berikutnya.
2. Jalankan `node scripts/migrate-multitenant.ts` sekali lagi di environment produksi bila
   migrasi dijalankan dari mesin lain (idempoten).
3. `npm run deploy` akan mem-provision domain `www` baru.
4. Verifikasi `PAYCORE_*` di dashboard Cloudflare: `PAYCORE_RETURN_URL` harus
   `https://majiku.moxsenna.workers.dev/payment/return` (atau domain produksi) — bukan
   `parent.majiku.web.id/billing`.

## 7. HASIL DEPLOY PRODUKSI (2026-10-11)

- **Commit** 7 kelompok logis (`ec6e1dc`..`650cf86`) di atas `c07ce87` — working tree bersih.
- **Deploy Cloudflare sukses**: versi worker `f02b54f0-6402-4b9b-844f-345f85ee118d`, 6 custom
  domain aktif — termasuk `www.majiku.web.id` yang baru terprovision.
- **Sweep produksi**: `majiku.web.id` → `/`, `/terms`, `/privacy`, `/checkout`, `/marketplace`,
  `/marketplace/majiku-kids`, `/auth/login`, `/payment/return`, `/site/daycare` semua **200**;
  subdomain `admin/parent/tutor/vendor.` menormalisasi `/x/login` → `/login?next=/x/login` → 200
  (perilaku `?next=` dari perbaikan bekerja); `www.majiku.web.id` → 200.
- **Konten landing produksi terverifikasi**: CTA pricing → `/checkout?plan=basic|pro|enterprise`
  (sinkron master plan), link `/terms` + `/privacy`, meta OG hadir.
- **Nit tersisa**: `og:url` masih menunjuk `majiku.moxsenna.workers.dev` karena
  `NEXT_PUBLIC_SITE_URL` (var CF) belum diubah ke `https://majiku.web.id` — ubah var tersebut
  di dashboard Cloudflare lalu redeploy agar OG url benar.
- **Verifikasi manual yang tersisa untuk pemilik**: nilai `PAYCORE_RETURN_URL` di dashboard
  Cloudflare (secrets tidak bisa dibaca via wrangler) harus menunjuk `/payment/return`.

## 8. Tindak lanjut domain & PayCore (2026-10-11 malam)

- **Akun terverifikasi**: wrangler login = cuanmox@gmail.com, akun `5fec9965…` — sama dengan
  dashboard Cloudflare (6 custom domains Production) dan `account_id` di wrangler.jsonc.
- **Secret worker diperbarui**: `PAYCORE_RETURN_URL` → `https://majiku.web.id/payment/return`,
  `NEXT_PUBLIC_SITE_URL` → `https://majiku.web.id`; `.env.local`/`.env.example` disinkronkan;
  redeploy versi `752eccf1` — `og:url` live kini `https://majiku.web.id` (nilai NEXT_PUBLIC
  di-bake saat build untuk halaman prerender, jadi rebuild diperlukan).
- **TEMUAN KRITIKAL di sisi PayCore** (repo `D:\Coding\paycore`, D1 `paycore-production` akun CF
  `06738739…`): baris `apps` MAJIKU masih `webhook_url` = `https://majiku.moxsenna.workers.dev/...`
  dan allowlist return belum memuat `majiku.web.id` — workers.dev DISABLED, jadi **event
  pembayaran tidak akan terkirim** dan redirect return akan 403. Migrasi siap di-commit
  `migrations/0017_app_majiku_custom_domain.sql` (idempoten). Eksekusi butuh login wrangler
  dengan akun pemilik PayCore:
  `npx wrangler d1 execute paycore-production --remote --env production --file migrations/0017_app_majiku_custom_domain.sql`
- Catatan: allowlist return_url PayCore hanya divalidasi saat redirect (`returns.ts`), bukan saat
  pembuatan order — mengganti secret return_url tidak memblokir order baru.

## 9. Migrasi PayCore diterapkan (2026-10-11 malam) — rantai pembayaran lengkap

- Login wrangler akun PayCore (`06738739…`) dilakukan pemilik; migrasi
  `0017_app_majiku_custom_domain.sql` dieksekusi ke D1 `paycore-production` — **1 baris ditulis**.
- Verifikasi baris `apps` (app_id `majiku`, status active):
  - `webhook_url` = `https://majiku.web.id/api/webhooks/paycore` ✅
  - `allowed_return_urls` = majiku.web.id + workers.dev lama + localhost ✅
- Endpoint webhook MAJIKU produksi terverifikasi reachable & aman: POST tanpa signature → **401
  "Invalid signature"**.
- Sesi wrangler multi-akun dipulihkan & disimpan: `akun1.toml` (PayCore), `akun2.toml`
  (majiku/cuanmox), `default.toml` aktif = akun majiku.
- Rantai pembayaran kini utuh: checkout (HMAC) → PayCore → webhook ke majiku.web.id (signature
  terverifikasi, idempoten, guard status paid) → invoice lunas / tenant aktif; redirect return
  allowlisted ke `/payment/return`.
