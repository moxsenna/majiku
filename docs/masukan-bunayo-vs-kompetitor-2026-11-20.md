# Masukan menyeluruh Bunayo/MAJIKU pasca-redesign — vs riset Happy Kamper

* **Author:** ZCode (EGM brainstorm — 5 lens Goldfish: keamanan, billing, daily loop, UX, strategi)
* **Date:** 2026-11-20
* **Objek:** repo `D:\Coding\happy-days` branch `main` @ `dead7fb` (redesign Bunayo sudah merge)
* **Pembanding:** `D:\Coding\riset kompetitor\` — DOKUMENTASI-HAPPYKAMPER.md, PRD-PLATFORM-TANDINGAN.md, GAP-ANALYSIS-MAJIKU.md (17 Nov, pre-merge)
* **Metode:** 5 reviewer subagent membaca kode langsung (read-only). Aplikasi tidak dijalankan.
* **Brief ideasi sebelumnya** (demo mode & mutation lock, sudah ter-ship di `ca740b1`) tetap tersimpan di `concepts_brief.md`.

---

## Overview

Redesign Bunayo yang di-merge ke `main` menaikkan kelas produk secara visual dan informasional: shell baru, IA admin yang lebih masuk akal, dasbor keuangan nyata, trial board 5 tahap, portal ortu/guru mobile-first yang solid, dan demo tenant yang terkunci aman. Ini fondasi yang layak dilanjutkan — tidak perlu rewrite.

Tapi dibanding Happy Kamper dan PRD, **keadaan inti belum bergerak**: dari tiga pilar yang membuat HK "lengket" (billing otomatis, notifikasi, loop harian), nol yang tertutup. Dan satu temuan paling serius justru **memburuk**: celah pengambilalihan data anak kini punya jalur kedua yang lebih mudah dipicu. Ditambah dua risiko bisnis yang belum pernah tercatat di dokumen mana pun: **dana SPP orang tua masuk ke satu rekening merchant platform** (risiko izin PJP BI) dan **harga paket menjanjikan fitur yang tidak di-enforce di kode** (klaim palsu terhadap pelanggan).

Skor kesiapan terhadap MVP PRD masih sekitar 40–45%. Kekuatan nyata MAJIKU tetap fitur yang HK tidak punya: RPP, observasi trial oleh guru, honor tutor, kuota izin gratis — semuanya sinyal kuat untuk vertikal **bimbel & PAUD/TK**, bukan daycare.

---

## Analysis

### 1. Yang membaik pasca-redesign (nilai nyata)

| Yang baik | Bukti |
|---|---|
| Demo tenant `tnt_demo` + lock mutasi server-side di 16 file action mutator | `src/lib/demo.ts:11`, `src/server/authz.ts:29-38,150-154` |
| 4 file action baru (keuangan, siswa, pendaftaran, pengaturan) read-only dan ter-scope tenant dengan baik | `keuangan.ts:118,174,264,376`; `siswa.ts:65,83`; `pendaftaran.ts:108,118`; `pengaturan.ts:51,63,99` |
| Dasbor keuangan K1/K7 nyata dari `invoices` + `payment_orders` (aging, per kelas, per bulan, cara bayar) | `keuangan.ts:117-319,538-638` |
| Trial board 5 tahap + daftar tunggu, statistik bulan berjalan | commit `5fdff5f` |
| IA admin baru + shell, portal ortu/guru mobile-first baik di 390px | `AdminShell.tsx`, `ParentShell.tsx:10-15` |
| Laporan harian batch multi-anak + ≤6 foto R2, tap-chips "pilih semua" | `dailyReports.ts:148-269`, `TutorProgress.tsx:68-83` |
| Empty state jujur, pola skeleton/ErrorBanner/Stale konsisten | `src/components/bunayo/States.tsx` |
| Checkout langganan SaaS end-to-end nyata (tenant dibuat nonaktif → webhook mengaktifkan) | `checkout.ts:35-214`, `webhook/route.ts:137-145` |
| Webhook pembayaran tetap benar (HMAC timing-safe, skew 5 menit, dedupe, validasi nominal dari DB) | `paycore.ts:210-233`, `webhook/route.ts:63-72` |

### 2. Yang memburuk: keamanan (prioritas absolut)

| # | Temuan | Status | Bukti |
|---|---|---|---|
| 2.1 | **🔴 KRITIS — pengambilalihan data anak via email tak terverifikasi, kini 2 jalur.** Jalur lama: registrasi parent auto-`UPDATE students ... WHERE parent_email`. Jalur baru: **auto-heal saat read** — setiap muat dashboard parent mengklaim siswa ber-email cocok dengan `parent_user_id` NULL. Siapa pun yang tahu email ortu (sering tersebar di grup WA) melihat foto, laporan harian, absensi, tagihan, dan chat anak. | Terbuka, diperburuk | `src/server/auth.ts:8` (tanpa `requireEmailVerification`); `authRegistration.ts:169-186`; **baru**: `parentChildren.ts:66-70` |
| 2.2 | Fallback query `parent_email = session.user.email` di 13 titik + 1 auto-heal + rute foto R2 | Terbuka | `billing.ts:72,172`; `chat.ts:197-198`; `attendance.ts:91,162,247`; `dailyReports.ts:474-476`; `payments.ts:69-70,134`; `api/photos/[...key]/route.ts:107`; dll. |
| 2.3 | 🟠 `checkout.ts` adalah **server action publik tanpa sesi, tanpa rate-limit** — siapa pun bisa spam → membuat tenant + order PayCore nyata per panggilan. Ditambah: satu email admin bisa membuat banyak tenant, dan `resolveTenantIdForUser` memilih "baris pertama" → admin bisa mendarat di tenant yang salah. | Baru (HIGH) | `checkout.ts:35-214`; `authz.ts:156,195-200` |
| 2.4 | 🟠 Nomor invoice `INV-YYYYMM-<4 digit acak>` unik global — ±9.000 kombinasi/bulan lintas semua lembaga; tabrakan ≈50% di ±110 invoice/bulan. | Terbuka | `billing.ts:275-276`; `schema.ts:225` |
| 2.5 | 🟠 Model peran/tenant: `user_roles` tanpa `tenant_id`, `tenants.admin_user_id` tunggal, `tutors.user_id` unik, resolve tenant "baris pertama". Guru 2 lembaga / parent-juga-guru tidak bisa dimodelkan. | Terbuka | `schema.ts:106-111,49,131` |
| 2.6 | 🟡 Deteksi demo via pola email hardcoded (bukan flag DB); jika `tnt_demo` tidak ada, fallback ke **tenant operasional pertama**. `ensureDemoAttendanceToday` menulis baris attendance hardcoded ke tabel produksi. | Baru (SEDANG) | `demo.ts:14-27`; `authz.ts:159-162,43-102` |
| 2.7 | 🟡 11 tabel bisnis tanpa `tenant_id` (invoices, attendance, daily_reports, conversations, messages, class_schedules, lesson_plans, tutor_attendance, student_enrollments, dll.); isolasi bergantung pada join; tanpa RLS. | Terbuka | `schema.ts` |
| 2.8 | "Terbitkan massal" = loop client-side tanpa idempotensi: tanpa cek duplikat siswa+periode, tanpa transaksi (gagal di tengah = tagihan setengah terbit), double-klik = tagihan ganda. | Baru (HIGH) | `Penagihan.tsx:109-124`; `billing.ts:248-291` |

### 3. Pilar yang belum berdiri (vs HK & PRD)

**Pilar 1 — Billing otomatis: masih manual, sebagian tidak idempoten.**
Tidak ada cron sama sekali (`wrangler.jsonc` tanpa `triggers`, tidak ada handler `scheduled`). Tidak ada item biaya/paket tagihan (harga melekat di `classes.pricePerMonth`). Invoice per anak, bukan per keluarga (`invoices.studentId` NOT NULL). Tidak ada pengiriman tagihan apa pun — WA hanya deep-link manual. Catat bayar hanya lunas-penuh, tanpa nominal parsial/bukti (UI jujur: "catat di luar aplikasi", `TagihanDetail.tsx:197-204`). Ledger bukan tabel, dihitung per-request. Keluarga 2 anak = 2 tagihan + 2 biaya gateway. Belum ada kuitansi. (BIL-01..06, 08..15, 19, 21 ❌; BIL-04/08 ⚠️; BIL-07/16/17 ✅)

**Pilar 2 — Notifikasi: nol kanal.**
Tidak ada push (Web Push/FCM), tidak ada WA, tidak ada email yang dikirim sistem — tidak ada tabel `notifications`, tidak ada cron, tidak ada email transaksional (padahal pricing menjanjikan "Support via email"). Anak tiba → ortu tidak tahu sampai membuka app. Pesan guru → ortu melewatkan (polling 8 detik, tanpa badge di luar layar chat). Ini pilar termurah untuk ditutup dan yang paling menentukan retensi.

**Pilar 3 — Loop harian di HP: setengah jalan.**
QR scanner tetap placeholder deprecated (`QRCodeScanner.tsx:11-13`); absensi manual; ortu tidak dinotifikasi saat check-in/out (pull-only, `ParentPortal.tsx:206-213`). Check-in guru selalu "hadir" tanpa penilaian tepat waktu (`attendance.ts:460,478,489`); status "terlambat" ada di UI tapi tak pernah ditulis. Ortu tidak bisa: ajukan izin, reschedule, lihat QR anak, lihat progres. Pengumuman broadcast seluruh lembaga tanpa targeting kelas. Tidak ada kerangka belajar/milestone/rapor sama sekali (LRN ❌).

### 4. Permukaan palsu & dead-end yang terlihat pengguna nyata

1. **Katalog ortu mock total** — 6 item hardcode, 5 link `#` mati (`ParentCatalog.tsx:15-99`).
2. **Pendaftaran ortu bocor lintas-tenant + program fiktif** — `getAvailablePrograms` memuat kelas semua lembaga tanpa filter, dan jika kosong mengembalikan 3 program karangan ke ortu nyata (`trial.ts:572-640`) — digabung dengan temuan 2.1, ini bug kepercayaan terbesar.
3. **Bayar online mati diam-diam** — tombol disabled + toast jargon internal "aktifkan PayCore"; "transfer manual" tanpa nomor rekening; admin tidak punya alat membagikan rekening (`ParentBilling.tsx:103,164`; `ParentInvoiceDetail.tsx:107`).
4. **Iklan marketplace salah untuk semua lembaga baru** — `priceFrom:"2000000"` + kota "Jakarta" di-hardcode saat registrasi dan tidak bisa diedit di Pengaturan (`authRegistration.ts:104-105`).
5. **Kotak Masuk admin kosong permanen** sebagai menu (`KotakMasuk.tsx:32-38`) — percakapan hanya wali↔guru, admin kehilangan supervisi keluhan.
6. `/tutor/guides` konten statis tanpa tautan masuk; widget notifikasi guru orphan; `PromoBanner` kode mati.
7. Laporan guru = satu teks identik untuk N anak — detail per anak (inti daycare) hilang (`TutorProgress.tsx:182+`).
8. Register selalu berjudul "Lembaga Daycare Baru" walau bimbel; jenis kelamin wajib di form ortu tapi "disembunyikan" di form admin; role selalu "Pemilik".

### 5. Brand & dokumen yang berbohong

- **Nama produk kacau:** app menyebut "Bunayo" (`site.ts:2`), domain & metadata majiku.web.id, PDF tagihan semua lembaga memakai `schoolName: "Bunayo"` (`ParentBilling.tsx:100`). Satu sumber brand belum ditentukan.
- **Harga menjanjikan yang tidak dieksekusi:** tidak ada feature gating per paket sama sekali (batas 50/200 siswa tidak di-enforce di mana pun), tidak ada penjejakan perpanjangan (`currentPeriodEnd` tidak ada; order sekali bayar). Pelanggan Basic mendapat fitur yang diiklankan khusus Pro. Saat gating diaktifkan nanti, pelanggan awal akan merasa ditipu — perbaiki sebelum pelanggan pertama masuk.
- **Privacy/terms belum lolos UU PDP sekali pun:** tanpa dasar pemrosesan per peran, hak subjek, kontak DPO, kewajiban pemberitahuan insiden 3×24 jam, dan mekanisme persetujuan orang tua per anak/foto.

### 6. Aliran dana: risiko regulasi terbesar

Satu merchant profile PayCore (`mp_appvibe_duitku_v2`, `paycore.ts:6`) dipakai untuk dua jenis uang: langganan SaaS (sah — itu pendapatanmu) dan **SPP orang tua → lembaga** (berbahaya). Menampung dana pihak ketiga di rekening platform = ranah izin PJP Bank Indonesia. Selama ini berlanjut, fitur pembayaran SPP adalah liability, bukan fitur — apalagi di atas bug takeover data anak.

### 7. Posisi kompetitif & pertumbuhan

- HK berkuasa di daycare (feed tidur/makan/toilet, payout, 701 center, sales-led). Melawan moat itu tanpa notifikasi adalah pertarungan yang kalah di awal.
- MAJIKU unggul persis di kebutuhan **bimbel & PAUD/TK**: RPP, observasi trial, honor tutor, kuota izin gratis. Reposisi: *"Sistem operasi bimbel & PAUD — SPP, RPP, honor guru, seleksi trial."*
- Analitik: nol instrumentasi. Tanpa itu, semua keputusan produk = tebakan.
- Produk terdaftar di marketplace Happy Kamper — membangun audiens kompetitor sendiri.

---

## Goals vs. Non-Goals

**In-scope (90 hari):**
1. Menutup celah keamanan kritis (2.1–2.3, 2.4, 2.8) sebelum pelanggan berbayar pertama.
2. Notifikasi v1: tabel `notifications` ditulis sinkron dari action yang sudah ada + badge; kemudian Web Push (VAPID, `web-push`, `nodejs_compat` — tanpa FCM) dan/atau WA; cron Workers untuk pengingat tagihan.
3. Billing inti idempoten: unique index `(student_id, billing_period_start)`, nomor invoice sekuens per tenant, cron penerbitan, catat pembayaran parsial + bukti (`invoice_payments`), invoice gabungan keluarga (`families` + `family_invoices` + `invoice_items`).
4. Aliran dana: split/sub-account per tenant, atau matikan SPP online sementara (manual transfer + nomor rekening di app).
5. Pricing jujur: tier Free (≤20 siswa, tanpa bayar online) / Basic / Pro dengan gating dieksekusi di kode; `planKey` + `currentPeriodEnd`.
6. Onboarding: checklist 5 langkah + impor CSV siswa; hapus program fiktif & katalog mock; perbaiki dead-end bayar.
7. Legal UU PDP + satu nama brand final.
8. PostHog + north star (invoice lunas/minggu) + metrik aktivasi (≥1 invoice & ≥3 ortu terhubung dalam 14 hari).

**Non-Goals (tunda, jangan kerjakan sekarang):**
- App native (Expo) — PWA + Web Push + WA cukup dulu.
- Kerangka belajar/milestone/rapor (LRN) — setelah billing & notifikasi berdiri.
- Marketplace booking/komisi — direktori SEO saja, zero engineering.
- Reschedule mandiri, deposit/wallet, cicilan, white-label, multi-lokasi penuh.
- Video di feed, kiosk absensi, check-in GPS/geofence (v1 cukup "tepat waktu" dari `classSchedules`).

---

## Alternatives Weighed

| Alternatif | Keputusan | Alasan |
|---|---|---|
| Rewrite vs lanjut kode ada | **Lanjut** | Fondasi data & shell cukup; rewrite membuang redesign yang sudah merge |
| Per-student pricing ala HK vs flat per lembaga | **Flat** | Mental model per-siswa menambah kompleksitas billing yang sedang rapuh; flat lebih mudah dijelaskan di WA |
| SPP online sekarang vs manual sampai split/sub-account | **Manual dulu** | Menampung dana orang tua tanpa struktur PJP = risiko izin BI; manual transfer + nomor rekening jujur di app |
| Langsung app native vs PWA+WA dulu | **PWA+WA** | Ortu Indonesia hidup di WA; push native bisa menyusul lewat PWA (Web Push) tanpa biaya dua platform |
| Serang daycare vs fokus bimbel/PAUD | **Bimbel & PAUD** | Fitur unik yang sudah ada (RPP, honor, observasi trial, izin gratis) adalah kebutuhan vertikal itu; melawan moat daycare HK tanpa notifikasi kalah |
| Marketplace jadi bisnis vs direktori SEO | **Direktori SEO** | Booking/komisi menambah aliran dana pihak ketiga justru saat harus menguranginya |
| Bersaing fitur vs bersaing kepercayaan & kecepatan | **Kepercayaan & kecepatan** | HK sales-led & lambat; keunggulan MAJIKU: self-serve, harga jelas, demo 30 detik, dana langsung ke lembaga |

---

## Key Decisions & Staging for Next Steps

**Keputusan yang perlu kamu ambil (urutan memblokir kerja):**
1. **Nama brand final** — MAJIKU atau Bunayo; satu sumber di `site.ts`, PDF tagihan pakai nama lembaga.
2. **Model dana** — minta PayCore/Duitku sub-account per tenant, atau SPP manual dulu. Ini memblokir semua keputusan billing online.
3. **Vertikal utama** — setuju reposisi "bimbel & PAUD" sebagai headline landing?
4. **Harga jujur** — setuju tier Free/Basic/Pro dengan gating dieksekusi sebelum pelanggan pertama?

**Urutan eksekusi (90 hari, ringkas):**
- **Minggu 1–2 — Keamanan:** verifikasi email/OTP sebelum auto-link; hapus jalur auto-heal & semua fallback `parent_email` (pakai `parent_user_id`); rate-limit + honeypot di checkout; nomor invoice sekuens per tenant atomik; idempotensi "terbitkan massal" (unique index siswa+periode).
- **Minggu 2 — Bunuh permukaan palsu:** hapus program fiktif & leak lintas-tenant di pendaftaran; hapus katalog mock & dead link; nomor rekening manual di app; edit harga/kota lembaga di Pengaturan.
- **Minggu 3–4 — Uang:** keputusan sub-account; matikan SPP online bila belum; `invoice_payments` (parsial + bukti); tier + gating + `currentPeriodEnd`.
- **Minggu 4 — Legal:** privacy/terms UU PDP; consent foto per anak; keluar dari marketplace HK.
- **Minggu 4–6 — Notifikasi v1:** tabel notifications + badge; push/WA untuk: anak tiba/pulang, chat baru, tagihan terbit & jatuh tempo, laporan harian; cron Workers untuk penerbitan invoice + pengingat.
- **Minggu 6–7 — Reposisi & onboarding:** landing bimbel/PAUD; checklist 5 langkah + impor CSV; claim anak via link WA per wali (sekaligus memecahkan "tagihan tidak pernah dikirim").
- **Minggu 7–8 — Analitik:** PostHog + north star + aktivasi 14 hari.
- **Minggu 8–12 — GTM founder-led:** 20 bimbel di satu kota via WA, migrasi Excel concierge, konversi tahunan; marketplace hanya SEO.

**Hubungan dengan riset kompetitor:** `GAP-ANALYSIS-MAJIKU.md` (17 Nov) masih akurat untuk backend (stale untuk UI — dasbor K1/K7 kini nyata). Temuan barunya: auto-heal parent (`parentChildren.ts:66-70`), checkout publik tanpa auth, idempotensi terbitkan massal, dana SPP di rekening platform, dan pricing tanpa gating — tambahkan ke dokumen itu supaya satu sumber.
