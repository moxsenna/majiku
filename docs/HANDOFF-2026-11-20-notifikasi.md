# Handoff — Keamanan, Permukaan Palsu, Notifikasi (2026-11-20)

Untuk agen berikutnya. Baca dokumen ini dulu, lalu `docs/PLAN-2026-11-20-keamanan-permukaan-notifikasi.md` (rencana asli) dan `docs/masukan-bunayo-vs-kompetitor-2026-11-20.md` (latar bisnis).

## 1. Permintaan user (sumber kebenaran)

> "lanjut bereskan keamanan, lalu permukaan palsu, kemudian lanjut notifikasi. untuk billing sementara gpp pake akun merchant dulu. nanti kalo user udah banyak baru kita urus perizinan, dll nya."

Artinya:
- Urutan kerja: keamanan → permukaan palsu → notifikasi.
- Billing SPP tetap lewat satu akun merchant PayCore/Duitku (`mp_appvibe_duitku_v2`). **Jangan** kerjakan split/sub-account atau perizinan PJP sekarang.
- Notifikasi v1 = in-app + Web Push. Tanpa vendor WhatsApp/email (belum ada infra email).

## 2. Status: semua tahap SELESAI dan LIVE

- `main` @ `c0a8a10` (sudah di-push ke `origin` = `moxsenna/majiku`).
- Worker produksi `majiku` versi `2ddbee35-8978-41d9-8558-74b6e5259488`, cron `0 0 * * *` aktif.
- Smoke produksi lulus: `/` 200, `/sw.js` 200, `parent.` & `admin.` redirect 307 ke login, `/api/cron/pengingat-tagihan` → 401 tanpa secret, 200 dengan secret (`{"pengingat":0,"overdue":0}`).

### Commit per tahap

| Tahap | Commit | Isi utama |
|---|---|---|
| Keamanan | `13ab60e` (+ sebagian ikut `b4bd5fc`) | Cabut auto-claim parent via email (registrasi + auto-heal `parentChildren.ts`), hapus 14 fallback `parentEmail = session.email`, checkout publik di-harden (reuse tenant, dedupe order 30 mnt, rate-limit 5/jam/email, honeypot `website` + `formStartedAt` ≥ 3 dtk), demo tidak fallback ke tenant operasional |
| Keuangan | `47d556b` | Tabel `invoice_sequences`, nomor `INV/{slug}/{YYYYMM}/{seq}` atomik, `createInvoice` idempoten per (studentId, billingPeriodStart), `issueInvoicesBulk` (maks 200) |
| Permukaan palsu | `a66a121` | Program trial nyata saja, katalog jujur, PromoBanner dihapus, rekening bank tenant (kolom `bank_name/bank_account_number/bank_account_holder`) + form di Pengaturan Lembaga, halaman bayar ortu pakai data nyata + tombol salin rekening + WA, Kotak Masuk admin disembunyikan |
| Notifikasi | **ikut ter-commit di `77af921`** (lihat §5) + `50b455f` | Lihat §3 |

## 3. Arsitektur notifikasi (sudah jadi)

- **Skema** (`src/db/schema.ts`): `notifications` (id, userId, tenantId, type, title, body, link, readAt, createdAt) dan `pushSubscriptions` (endpoint unique, p256dh, auth, userAgent). Migrasi `drizzle/migrations/0013_notifications_push.sql` — **sudah diterapkan ke DB uji & prod**. `0012` (bank + invoice_sequences) juga sudah.
- **Helper** `src/server/notify.ts`: `notifyUsers({ userIds, type, title, body?, link?, tenantId? })` → insert batch in-app + Web Push best-effort (hapus langganan 404/410). Tidak pernah melempar error ke pemanggil. `NotifyType`: attendance, report, chat, invoice, invoice_due, invoice_overdue, payment, announcement, reminder.
- **Pemicu terpasang**:
  - `attendance.ts` — check-in ("X tiba"), check-out ("sudah dijemput") → ortu.
  - `dailyReports.ts` — laporan harian terkirim → ortu.
  - `chat.ts` `sendMessage` → lawan bicara (`/tutor/chat` atau `/parent/chat`).
  - `billing.ts` `createInvoiceOnce` → ortu (tagihan baru).
  - `api/webhooks/paycore/route.ts` → ortu (lunas) + admin `order.userId`.
  - `announcements.ts` → semua ortu tenant.
- **API** `src/server/actions/notifikasi.ts`: `getMyNotifications` (30 terakhir + unread), `getUnreadNotificationCount`, `markAllNotificationsRead`, `markNotificationRead`, `getPushPublicKey`, `savePushSubscription` (upsert by endpoint), `removePushSubscription`.
- **UI** `src/components/bunayo/NotificationBell.tsx`: badge + panel, polling 30 dtk (react-query key `["notifikasi"]`), komponen `AktifkanPush` (minta izin, daftar `/sw.js`, simpan langganan). Dipasang di `ParentPortal.tsx`, `TutorDashboard.tsx`, dan admin via prop `notifSlot` di `src/app/(admin)/layout.tsx`.
- **Service worker** `public/sw.js`: hanya push + `notificationclick` (tanpa cache offline).
- **Cron** `custom-worker.ts` (jadi `main` di `wrangler.jsonc`) membungkus `.open-next/worker.js`, handler `scheduled` POST ke `/api/cron/pengingat-tagihan` dengan header `x-cron-secret`. Route: H-3 & hari-H (status `unpaid`) → pengingat ortu; lewat jatuh tempo → status `overdue` + notifikasi sekali (transisi status menjadikannya idempoten). Tanggal pakai WIB.
- **Secret** (sudah di-`wrangler secret put`, juga ada di `.env.local` & `.env.test.local`, keduanya git-ignored): `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`. Jangan tulis nilainya ke file yang di-commit.

## 4. Sisa pekerjaan (urut prioritas)

1. **Lonceng admin di desktop.** `notifSlot` hanya dirender di topbar mobile (`AdminShell.tsx` ±baris 363). Di layar ≥561px admin tidak melihat lonceng. Render juga di sidebar/topbar desktop. Catatan: `AdminShell.tsx` sering disentuh sesi lain — edit minimal, stage eksplisit.
2. **Uji push end-to-end di perangkat nyata** (Android Chrome + iOS Safari PWA). Belum pernah diuji: izin → langganan tersimpan di `push_subscriptions` → picu check-in → notifikasi muncul → klik membuka link. Pastikan `web-push` jalan di Workers (`nodejs_compat` aktif); bila gagal, in-app tetap jalan karena push best-effort — periksa log `npx wrangler tail`.
3. **Smoke Playwright/Reticle** alur: admin check-in anak → lonceng ortu bertambah → "Tandai dibaca" → badge hilang. Gunakan akun di `docs/TEST_ACCOUNTS.md` (`*.test@gmail.com` / `Password123!`).
4. **Pengingat jatuh tempo untuk admin** belum ada (cron hanya ke ortu). Opsional: ringkasan harian "N tagihan lewat jatuh tempo" ke pemilik tenant.
5. **Preferensi notifikasi** (matikan per jenis) belum ada — tunda kecuali user minta.
6. Perbarui checklist di `docs/PLAN-2026-11-20-keamanan-permukaan-notifikasi.md` bila pekerjaan di atas selesai.

## 5. Jebakan lingkungan (WAJIB dibaca)

- **Sesi agen paralel aktif di folder yang sama.** Mereka menjalankan `next dev -p 3000`, `next build`, dan pernah `git add -A` (commit `b4bd5fc` dan `77af921` menyeret kerja notifikasi). Aturan:
  - Selalu `git add <file eksplisit>`; jangan `git add -A` / `git commit -a`.
  - Cek `git log` sebelum commit — kerja Anda mungkin sudah ter-commit orang lain.
  - Jangan rewrite riwayat yang sudah di-push.
- **WIP asing di working tree — JANGAN commit**: `src/views/SaasLanding.tsx`, `src/lib/subscriptionPlans.ts`, `src/components/bunayo/Logo.tsx`, `.impeccable/surfaces/`, `public/previews/*`, `src/components/kokonutui/`. Error `tsc` baseline yang boleh diabaikan: `SaasLanding.tsx(339,52)`.
- **Deploy**: build bentrok dengan sesi lain (`.next`/`.open-next` direbut). Cara yang terbukti berhasil:
  ```bash
  cd /d/Coding && rm -rf hd-deploy && git clone -q happy-days hd-deploy
  cd hd-deploy && cp ../happy-days/.env.local . && npm ci --no-audit --no-fund
  npm rebuild esbuild sharp workerd   # install-scripts diblokir npm, wajib manual
  npm run deploy                      # sudah memakai --dangerouslyUseUnsupportedNextVersion
  cd .. && rm -rf hd-deploy
  ```
  **Jangan** pakai `git worktree` + junction `node_modules`: `git worktree remove` menghapus isi `node_modules` asli (sudah terjadi; dipulihkan dengan `npm install` berulang karena EPERM transien).
- **Migrasi DB**: jangan `drizzle-kit push` (pernah menyasar DB produksi). Tulis SQL idempoten di `drizzle/migrations/NNNN_*.sql`, lalu:
  ```bash
  node scripts/terapkan-sql.mjs .env.test.local drizzle/migrations/NNNN_x.sql   # uji dulu
  node scripts/terapkan-sql.mjs .env.local      drizzle/migrations/NNNN_x.sql   # lalu prod
  ```
  Runner membaca `NEON_DATABASE_URL` dan aman untuk blok `DO $$ ... $$`.
- **Skema DB**: Neon `neon-http` tanpa transaksi — pakai `onConflictDoUpdate`/upsert untuk atomisitas.
- Identitas parent **hanya** `students.parent_user_id`. Jangan menambah fallback pencocokan email (itu celah keamanan yang baru ditutup).
- Windows: `tsx` kadang crash saat exit; matikan `workerd` sebelum deploy bila folder terkunci.

## 6. Keputusan bisnis yang masih menggantung (jangan diputuskan sendiri)

- Brand final MAJIKU vs Bunayo (app memakai "Bunayo", domain `majiku.web.id`).
- **Domain Bunayo belum ada** — ingatkan user.
- Model dana SPP jangka panjang (split/sub-account vs perizinan) — ditunda oleh user sampai pengguna banyak.
- Tier harga dengan feature gating nyata (belum ada gating).

## 7. Verifikasi cepat sebelum mulai

```bash
git pull && git log --oneline -5
npx tsc --noEmit 2>&1 | grep error | grep -v SaasLanding   # harus kosong
curl -s -o /dev/null -w '%{http_code}\n' https://majiku.web.id/sw.js   # 200
```
