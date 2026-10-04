# Design: Migrasi MAJIKU ke Next.js + Neon + Cloudflare Workers

- **Tanggal**: 2026-10-04
- **Status**: Disetujui konsep (Approach B, revisi: Neon sejak Fase 1)
- **Tujuan bisnis**: Menang permainan SEO/marketplace melawan Happy Kamper (happykamper.io); lepas dari ekosistem Lovable; infrastruktur serverless murah yang bisa tumbuh jadi multi-tenant SaaS.
- **Prasyarat yang dikonfirmasi**: Data di Supabase bersifat dummy dan **belum pernah ada koneksi produksi** → mulai bersih di Neon, tidak ada migrasi data maupun akun user.

## 1. Ringkasan

Pindahkan MAJIKU dari SPA Vite+React+Supabase ke **Next.js (App Router) + Neon Postgres + Drizzle ORM + BetterAuth**, terdeploy di **Cloudflare Workers** via adapter resmi `@opennextjs/cloudflare`. Migrasi bertahap dengan titik stabil: setiap fase berakhir pada aplikasi yang build, jalan, dan terdeploy.

Kopling yang diganti (hasil audit kode):
| Kopling lama | Volume di kode | Pengganti |
|---|---|---|
| react-router-dom | 36 file, ~122 pemakaian, 6 `useParams` | File-system routing Next |
| supabase-js query | 7 titik `.from()` di 8 file | Drizzle query |
| supabase.auth | 6 panggilan, semua di `useAuth.tsx` (102 baris) | BetterAuth client |
| RLS + `has_role()` | 11 tabel | Cek role di server (middleware + server action/route handler) |
| 2 stored procedure (`submit_trial_review`, `admit_trial_candidate`) | SQL plpgsql | Dipindah hampir apa adanya; referensi `auth.users`/`auth.uid()` diganti user BetterAuth |
| Plugin Lovable (tagger, bridge, HMR-gate, previewAuthStorage) | dev-only | Dihapus, tidak ada pengganti |

**Tidak ada** pemakaian Supabase Realtime, Storage, maupun RPC di kode — risiko tersembunyi rendah.

## 2. Keputusan Arsitektur

1. **Next.js App Router**, TypeScript, Tailwind v3, shadcn/ui tetap. Semua halaman dashboard dipindah sebagai client components (`"use client"`) pada Fase 1 — perilaku identik dulu, optimisasi belakangan.
2. **Struktur route** (route groups):
   - `(public)`: `/`, `/auth/[mode]`, `/site/[type]`, `/marketplace/*` — target SSR di Fase 2.
   - `(admin)`: `/dashboard`, `/students`, `/attendance`, `/billing`, `/tutor-payout`, `/classes`, `/tutors`, `/schedule`, `/birthdays`, `/lesson-plans`, `/crm`, `/messages`, `/daily-reports`, `/gallery`, `/settings`.
   - `(tutor)`: `/tutor`, `/tutor/progress|chat|attendance|kpi|guides`.
   - `(parent)`: `/parent`, `/parent/marketplace|billing|payment|chat|profile|catalog|registration`, `/parent/invoice/[id]`.
   - Route lama `/demo` dan `/vendor/dashboard` → `/vendor` (super-admin SaaS).
   - `not-found.tsx` menggantikan catch-all `*`.
3. **Neon Postgres + Drizzle ORM**. Dua connection string: *pooled* untuk runtime (driver `@neondatabase/serverless` / `neon-http` — stateless, cocok untuk Workers) dan *direct* untuk `drizzle-kit migrate` (lokal/CI). Hyperdrive ditunda.
4. **Skema**: 11 tabel Supabase dipindah ke Drizzle migrations (enum, unique constraint, trigger `updated_at` ikut). `auth.users` diganti tabel `user` milik BetterAuth; `user_roles` dipertahankan sebagai tabel terpisah `(user_id, role)` agar semantik `hasRole` (admin memenuhi semua role) tidak berubah. FK yang menunjuk `auth.users` menunjuk `user.id` BetterAuth.
5. **Otorisasi tanpa RLS**: semua akses DB hanya dari server (server components / route handlers / server actions) memakai kredensial server. Helper `getSession()` + `hasRole()` di server; middleware Next melindungi prefix `(admin)/(tutor)/(parent)`. Anon key tidak lagi ada di browser — model ini lebih tegas daripada RLS.
6. **BetterAuth**: email+password dulu (magic link/OTP nanti). Plugin `organization` dicatat sebagai kandidat untuk multi-tenant SaaS, **tidak diaktifkan** di Fase 1 (YAGNI).
7. **Deploy**: Cloudflare Workers via `@opennextjs/cloudflare` (`opennextjs-cloudflare dev/build/deploy`), `wrangler.jsonc`, flag `nodejs_compat`, Durable Object untuk incremental cache, `images.unoptimized: true` di Fase 1 (image loader Cloudflare menyusul). Butuh plan Workers Paid (±$5/bln) karena Durable Objects; Neon mulai dari free tier.
8. **Sengaja di luar lingkup** (YAGNI): storage foto (→ Cloudflare R2 saat galeri live), realtime chat (→ Durable Objects saat chat di-release), i18n EN/ID, payment gateway, migrasi data lama.

## 3. Fase & Kriteria Selesai

### Fase 1 — Next.js + Neon + BetterAuth + Workers (titik stabil pertama)
Scaffold Next.js; port 35 halaman + semua komponen sebagai client components; pasang Drizzle + Neon (migrations untuk 11 tabel + 2 stored procedure); pasang BetterAuth (login, signup tenant, logout, session); shim `useAuth`/`hasRole` agar `RoleProtectedRoute` dan halaman berubah minimal; hapus semua dependensi Supabase & Lovable; deploy ke Workers. Komponen yang tidak direferensikan halaman mana pun (daftar di §7) **tidak ikut dipindah** — kode lamanya tetap tersimpan di baseline commit.
**Selesai bila**: `next build` bersih; 35+ route bisa diakses (smoke test daftar route lama vs baru); login/logout + proteksi role berfungsi; 7 titik query lama membaca dari Neon dengan data seed; aplikasi live di URL Workers.

### Fase 2 — SEO & Marketplace layer
Halaman publik jadi server components yang membaca Neon via Drizzle: landing, marketplace daycare (list + detail provider), `/site/[type]`. Halaman `/parent/marketplace` yang lama diarahkan memakai komponen publik yang sama (bukan duplikat). Metadata API per halaman, `sitemap.ts` (halaman publik + detail provider dinamis), `robots.txt`, JSON-LD (`LocalBusiness`, `Course`) pada halaman provider. **Tabel baru `tenants`** (slug, nama, tipe daycare/preschool/bimbel, deskripsi, alamat/geo, harga, foto, status verifikasi) sebagai sumber data marketplace & microsite — ini model data yang belum ada di skema lama dan dibutuhkan agar marketplace bukan mock. Middleware proteksi dipindah ke edge.
**Selesai bila**: HTML halaman publik ter-render server-side (view-source berisi konten); sitemap & metadata valid; detail provider `/marketplace/[slug]` server-rendered dari Neon; Lighthouse SEO ≥ 90 di halaman publik.

### Fase 3 — Hardening (belakangan)
Monitoring (Workers analytics + error tracking), staging environment via Neon branching, image optimization, wire halaman CRUD yang masih mock ke Drizzle, i18n. Dipecah jadi spec sendiri saat tiba.

## 4. Alur Data (Fase 1)

```
Browser (client components + BetterAuth client session)
   │  fetch server actions / route handlers
   ▼
Next.js di Workers (middleware cek session & role)
   │  Drizzle + @neondatabase/serverless (HTTP, pooled URL)
   ▼
Neon Postgres (11 tabel + 2 stored procedure + tabel user BetterAuth)
```

Halaman publik (Fase 2) membaca Neon langsung di server component tanpa lewat browser.

## 5. Penanganan Error & Testing

- **Error DB/query**: server actions melempar error terkontrol; UI menampilkan toast (sonner) — pola yang sudah ada dipertahankan.
- **Auth**: middleware redirect ke `/auth/login?next=...` untuk sesi tidak valid; role salah → redirect ke home role-nya (`roleRedirect` dipindah ke server).
- **Testing**: (a) `tsc --noEmit` + eslint bersih; (b) skrip smoke-test membandingkan 35 route lama vs file route baru; (c) `opennextjs-cloudflare dev` untuk verifikasi parity lokal-vs-Workers sebelum deploy; (d) deploy ke URL staging dulu (`wrangler versions upload`), smoke, baru promote.
- **Seed data**: satu skrip seed (kelas, tutor, siswa, invoice, waiting list) agar 7 titik query bisa diverifikasi tanpa input manual.

## 6. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| OpenNext punya celah fitur Next (mis. image optimization, ISR) | `images.unoptimized` di Fase 1; hindari ISR di Fase 1; test `opennextjs-cloudflare dev` sebelum deploy |
| Perilaku `next dev` ≠ runtime Workers | Semua verifikasi akhir via `opennextjs-cloudflare dev`/staging, bukan `next dev` saja |
| Middleware di edge runtime tidak bisa akses Neon | Middleware hanya cek session cookie BetterAuth (verifikasi JWT lokal), query role di server component/action |
| Drizzle + stored procedure belum terbiasa | Procedure dipindah sebagai SQL migrations apa adanya; dipanggil via `drizzle.execute(sql\`...\`)` |
| Kecepatan Neon free tier (cold start compute) | Terima di Fase 1; auto-suspend dikonfigurasi; scale-to-zero justru hemat |

## 7. Penanganan Temuan Audit Awal

Prinsip: **migrasi memindahkan perilaku apa adanya, bukan memperbaiki produk**. Perbaikan produk dikeluarkan dari migrasi supaya kalau ada yang rusak, kita tahu penyebabnya infrastruktur — bukan logika baru. Setiap temuan dari audit awal dipetakan eksplisit:

| Temuan awal | Penanganan di migrasi | Kapan |
|---|---|---|
| Alur trial backend sudah jadi, frontend belum nyambung (`ParentRegistration` masih `setTimeout`, `CRM` masih stage demo, `submit_trial_review`/`admit_trial_candidate` belum dipanggil UI mana pun) | Backend (2 stored procedure + tabel `trial_applications`) dipindah apa adanya ke Neon di Fase 1 sehingga tetap siap. **Wiring frontend-nya bukan bagian migrasi** — jadi task produk pertama setelah Fase 1 stabil, berjalan paralel dengan Fase 2 | Setelah Fase 1 |
| Hanya 4 area live query Supabase (Attendance, Billing, TutorPayout, WaitingList = 7 titik query); sisanya hardcoded/`demoData.ts` | Fase 1: 7 titik query diganti Drizzle + data seed; halaman mock dipindah tetap mock (perilaku identik). Wiring halaman mock ke DB masuk Fase 3 hardening | Fase 1 & Fase 3 |
| Komponen orphan (tidak pernah di-import): `CreateInvoiceDialog`, `LeaveManagementWidget`, `PushNotificationSetup`, `ActivityNotificationWidget`, `NavLink`, `AffiliateWidget`, `BrandPlacementWidget`, `ChurnManagementWidget`, `RewardWidget` | **Tidak dipindah** ke Next — mencegah membawa kode mati ke codebase baru; tetap dapat diambil dari baseline commit kalau nanti dibutuhkan | Fase 1 |
| QR scanner masih simulasi (`Math.random`) | Dipindah apa adanya (simulasi). Kamera nyata (client-side, mis. library `html5-qrcode`/zxing) adalah fitur produk baru, bukan migrasi | Backlog produk |
| Chat tanpa realtime | Tetap mock; realtime via Durable Objects di luar lingkup sampai chat dijadwalkan rilis | Deferred (YAGNI) |
| RLS + `has_role()` jadi satu-satunya lapisan keamanan | Diganti model otorisasi server-side (§2 poin 5) — temuan ini justru diselesaikan oleh migrasi itu sendiri | Fase 1 |

## 8. Keputusan Terbuka (default sudah dipilih, bisa diubah saat review)

1. Auth = **BetterAuth** email+password (alternatif yang dilewatkan: Supabase Auth jembatan — tidak relevan lagi; Clerk — vendor lock; Auth.js — DX lebih kasar untuk role).
2. Driver = **neon-http** (alternatif: Hyperdrive + node-postgres — menunggu sampai butuh pooling nyata).
3. `/demo` dilebur ke `/dashboard`; `/vendor/dashboard` → `/vendor`.
