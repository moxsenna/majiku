# Laporan Audit Launch Produksi MAJIKU

**Tanggal:** 2026-10-11 · **Commit basis:** main @ c07ce87 · **Metode:** audit orchestrated unlazy (4 leaf audit statis + integrasi runtime) + E2E reticle + build produksi

---

## 1. Ringkasan Eksekutif

**Verdict: BELUM SIAP untuk launch produksi real.** Fondasi teknis sehat (typecheck bersih, build produksi sukses, semua halaman publik & portal render tanpa error di production server, 3 login role terbukti live), tetapi ditemukan **99 temuan (37 HIGH, 44 MED, 18 LOW)** — setelah 1 koreksi severity (return_url). Kategori blocker utama:

1. **Isolasi multi-tenant bocor hampir total** — server action admin/tutor/parent umumnya tidak memfilter `tenantId`. Admin lembaga A dapat membaca (dan sebagian menulis) data siswa, tagihan, guru, absensi, laporan, dan foto lembaga B. Profil lembaga (`updateTenantProfile`) bahkan menimpa **baris tenant pertama di DB** milik siapa pun.
2. **Otorisasi API & aksi server bolong** — foto privat anak bisa diunduh siapa pun yang login (`/api/photos/[...key]` hanya cek session); absensi siswa & laporan harian bisa ditulis tanpa verifikasi role/penugasan kelas; data platform vendor bisa dibaca tanpa role `superadmin`.
3. **Fitur palsu/mati di produksi** — scanner QR absensi (admin & tutor) tidak menyimpan apa pun atau simulasi `Math.random()`; 3 modal detail dashboard admin memakai data mock permanen; halaman KPI/Guides/Notifikasi tutor statis; form izin/cuti tidak persist; navigasi buntu 404 (`/tutor/schedule`); `/parent/payment` dead-end (terbukti live); katalog parent mock + terisolasi; banyak tombol vendor hanya toast.
4. **Integrasi PayCore belum kokoh untuk uang nyata** — webhook bisa menimpa status `paid` → `failed`; tenant diaktifkan sebelum bayar; fallback pendaftaran membuat akun admin tanpa password; template env `PAYCORE_RETURN_URL` salah target; halaman return berbicara tentang SPP padahal dipakai untuk langganan SaaS.

Yang **sudah baik**: arsitektur Next 15 + OpenNext/Workers + Neon + R2 konsisten; better-auth + proteksi route per role bekerja (guard 307 terbukti); chat 2 arah parent↔tutor persist nyata; checkout → PayCore → webhook memiliki signature verification HMAC timing-safe + idempotensi event; alur trial CRM (jadwal → observasi → terima jadi murid) persist nyata; billing SPP manual + PayCore QRIS bekerja sampai level order.

---

## 2. Cakupan & Metode

| Bagian | Cakupan | Output |
|---|---|---|
| leaf-1.1 Admin/Lembaga | 17 rute page.tsx + view + server action | `.unlazy/launch-audit/reports/leaf-admin.md` (30 temuan) |
| leaf-1.2 Tutor | 9 rute + view + action | `reports/leaf-tutor.md` (25 temuan) |
| leaf-1.3 Parent | 12 rute + view + action | `reports/leaf-parent.md` (20 temuan) |
| leaf-1.4 Public+Vendor+Integrasi | 13 rute/API + middleware/tenant/paycore/r2 | `reports/leaf-public-vendor.md` (24 temuan) |
| node-1 Integrasi | tsc, build, env, E2E reticle, review manual | laporan ini |

Oracle otomatis: `scripts/audit/check-report.mjs` (coverage rute + validitas file:line setiap temuan — 8/8 PASS saat re-verifikasi independen), `scripts/audit/check-env.mjs`, `npx tsc --noEmit`, `npm run build`. Review manual driver mengonfirmasi ulang 6 temuan HIGH paling kritis dengan membaca kode; 1 temuan direvisi (di §5).

---

## 3. Alur Fitur per Role (Ringkasan)

> Detail langkah demi langkah per halaman (termasuk tombol → server action → tabel DB) ada di 4 laporan leaf. Ringkasan alur utama:

### 3.1 Admin / Lembaga (Daycare)
- **Auth:** `admin/register` → `registerDaycareAdminAction` (buat `user` + role `admin` + `tenants`) → auto-login → `/dashboard`. Login `admin/login` → `/dashboard`.
- **Dashboard:** `getAdminDashboardOverview()` — statistik siswa/kehadiran/pendapatan, feed laporan, antrian trial, ulang tahun, tagihan. ⚠️ Modal detail (klik kartu) = data mock.
- **Siswa:** tambah/edit/nonaktif + tautkan akun ortu (`createStudent`, `linkStudentParent` → `students`, `studentEnrollments`).
- **Tutor:** tambah/edit, tautkan akun user, penugasan kelas + tarif per sesi (`assignTutorClass` → `tutorClassAssignments`).
- **Kelas:** CRUD + kapasitas/SPP/jadwal (`classes`).
- **Absensi:** manual check-in/out (`recordStudentCheckIn/Out` → `attendance`), scan QR ⚠️ mati.
- **Laporan harian:** buat/lihat/hapus (foto ke R2).
- **Jadwal & RPP:** CRUD jadwal mingguan (WIB); RPP dengan checklist aktivitas ⚠️ edit membuang field inti.
- **Galeri:** upload ke R2 + metadata `galleryPhotos` → tampil di portal parent.
- **Billing SPP:** terbitkan invoice manual, tandai lunas; PayCore QRIS untuk parent.
- **CRM trial:** pipeline submitted→scheduled→awaiting_review→completed→admitted; `admitTrial` membuat siswa. ⚠️ 4 tab (Automasi/Marketing/Tiket/Integrasi) mock.
- **Broadcast:** kirim/hapus pengumuman → `announcements` ⚠️ target lintas tenant.
- **Gaji tutor:** tarif + bonus + export CSV ⚠️ honor dihitung dari kuota teoritis, bukan sesi nyata.
- **Pengaturan:** profil lembaga ⚠️ menimpa tenant pertama; email operasional tidak tersimpan.

### 3.2 Tutor
- **Auth:** `tutor/login` (tanpa registrasi mandiri — akun dibuat/tautkan admin) → `/tutor`.
- **Dashboard:** siswa hari ini, laporan pending, pesan baru, quick actions. ⚠️ Widget RPP/notifikasi/penghasilan statis; nav "Lihat Jadwal Lengkap" 404.
- **Absensi guru:** check-in/out → `tutor_attendance` (persist nyata); QR ⚠️ simulasi; izin/cuti ⚠️ tidak persist.
- **Upload progress:** pilih murid kelas sendiri → mood/makan/tidur/aktivitas + 6 foto R2 → `createDailyReport` (persist nyata; ⚠️ tanpa cek penugasan kelas di server).
- **Chat:** daftar percakapan + polling 8–30 dtk, `sendMessage` persist nyata.
- **Trial:** antrean observasi → `markTrialAwaitingReview` → `submitTrialReview` (stored procedure `submit_trial_review`).
- **KPI & Guides:** ⚠️ seluruhnya statis/hardcode (Desember 2024).

### 3.3 Parent (Orang Tua)
- **Auth:** `parent/register` → `registerParentAction` (akun + auto-link anak by email + trial sync) → `/parent`.
- **Dashboard:** anak, absensi hari ini, laporan harian, galeri, pengumuman (semua persist nyata; fallback demo hanya untuk `*@majiku.test`).
- **Registration:** wizard 4 langkah → `submitTrialApplication` → `trial_applications` ⚠️ validasi hanya step 1; tanggal lahir anak tidak ada di form register; kuota & deadline fiktif.
- **Marketplace:** daftar tenant aktif dari DB (`listActiveTenants`) ⚠️ tanpa header/bottom-nav (navigasi buntu) dan kartu keluar dari portal.
- **Billing:** `getMyInvoices` (filter milik sendiri ✅), bayar online → `createInvoicePaymentOrder` → PayCore QRIS; invoice detail dengan verifikasi kepemilikan (404 bila bukan miliknya ✅) ⚠️ tombol konfirmasi transfer manual menuju `/parent/payment` yang me-redirect balik ke billing (dead-end, terbukti live).
- **Chat:** sama dengan tutor (persist nyata).
- **Profile:** sign out bekerja ⚠️ menu pengaturan hanya toast.

### 3.4 Public & Vendor
- **Landing:** pricing Basic/Pro/Enterprise → CTA ke `/checkout?plan=…` ✅; lembaga unggulan dari DB.
- **Marketplace publik + detail `[slug]`:** dari DB, SEO (metadata, JSON-LD LocalBusiness) ✅, WA CTA dengan pesan otomatis ✅; `/site/[type]` landing SEO per kategori ✅.
- **Checkout SaaS:** form → `createSubscriptionCheckoutOrder` (buat/pakai akun admin + tenant + order pending) → PayCore `checkout_url` (HMAC) → redirect ⚠️ return_url template salah; tenant aktif prematur; fallback user tanpa password.
- **payment/return:** halaman status "diverifikasi 1–3 menit" ⚠️ copy-nya SPP, bukan langganan.
- **Webhook `/api/webhooks/paycore`:** signature HMAC timing-safe + clock skew 5 menit + idempotensi `paycoreEvents` ✅; validasi nominal/currency/product ✅ ⚠️ failed/expired tanpa guard `paid` → bisa menimpa lunas.
- **Vendor dashboard:** 10 tab; overview dari DB (tanpa cek role ⚠️); sebagian besar tab tombol mati/mock.

---

## 4. Verifikasi Runtime & Produksi (node-1)

| Pemeriksaan | Hasil |
|---|---|
| `npx tsc --noEmit` | ✅ bersih |
| `npm run build` (produksi) | ✅ sukses (middleware 34.9 kB) |
| Env (`scripts/audit/check-env.mjs`) | ✅ 12 var wajib ada & terdokumentasi, binding `PHOTOS_BUCKET`/`majiku-photos` di wrangler.jsonc |
| Login live (reticle, verdict "proved") | ✅ parent→`/parent`, tutor→`/tutor`, admin→`/dashboard`, 0 console error |
| Sweep live 27 rute (3 portal) | ✅ render + 0 console error; invoice preview→detail & chat thread proved |
| Guard anonim | ✅ 307 redirect ke login (`/tutor`, `/schedule`, `/birthdays`, `/settings`) |
| Production server (`next start`) | ✅ `/`, `/auth/login`, `/checkout`, `/marketplace`, `/marketplace/majiku-kids` (slug nyata), `/site/daycare`, `/vendor/login`, `/payment/return` semua 200; slug tidak dikenal 404 (benar) |
| Dev-only 500 (`/`, `/auth/login`, `/marketplace/[slug]`) | Bukan bug aplikasi — artefak "Jest worker" dev server + flakiness koneksi Neon dari mesin lokal (Connect Timeout 10s); produksi 200 |
| Data DB | Neon `ep-silent-voice-…` (ap-southeast-1); **`.env.local` memakai DB yang sama dengan produksi + `PAYMENT_MODE=live` + `PAYCORE_ENVIRONMENT=production`** — hati-hati saat dev lokal; demo account (`*@majiku.test`) melayani mock data tanpa menyentuh DB |

Tidak diuji live (sengaja): penyelesaian transaksi PayCore nyata dan penulisan data produksi — ditutup oleh audit statis.

---

## 5. Temuan — Konsolidasi & Rekonsiliasi

Total 99 temuan dari 4 leaf; setelah deduplikasi lintas-leaf, tema blocker:

### A. Isolasi Multi-Tenant (blocker terbesar)
- Hampir semua server action membaca lintas lembaga: siswa (`studentsCrud.ts:75`), kelas (`classesCrud.ts:68,207`), tutor (`tutorsCrud.ts:65`), invoice (`billing.ts:73`), absensi (`attendance.ts:66`), laporan (`dailyReports.ts:108`), galeri (`gallery.ts:57`), pengumuman (`announcements.ts:52`), ulang tahun (`birthdays.ts:90`), kuota (`attendance.ts:193`).
- `getTenantProfile`/`updateTenantProfile` pakai `limit(1)` tanpa `where` → admin mana pun **menimpa lembaga pertama di DB** (`adminDashboard.ts:337,353`).
- `check-in` memilih kelas sembarang `limit(1)` bila siswa tanpa enrollment (`attendance.ts:278`).
- Tabel `tutors`, `tutor_attendance` tidak punya kolom `tenant_id` (`attendance.ts:461`).
- **Perbaikan struktural:** tambahkan `tenantId` pada semua tabel milik lembaga (atau derivasi dari relasi) + helper `requireTenantSession()` yang dipakai SETIAP server action; sekaligus tambahkan cek role.

### B. Otorisasi API/Action
- `/api/photos/[...key]` hanya cek session — foto privat anak bisa diunduh akun login mana pun (`api/photos/[...key]/route.ts:12`).
- `getVendorPlatformOverview` tanpa cek role superadmin (`vendorDashboard.ts:50`).
- `recordStudentCheckIn/Out` tanpa verifikasi role/penugasan (`attendance.ts:248,303`); `createDailyReport` tanpa cek murid milik kelas tutor (`dailyReports.ts:140`).

### C. Fitur Palsu / Mati di Produksi
- QR scanner admin tidak memanggil `recordStudentCheckIn` (`Attendance.tsx:396`); scanner tutor simulasi `Math.random()` (`QRCodeScanner.tsx:25`).
- Modal dashboard mock: `AttendanceDetailModal`, `RevenueDetailModal`, `StudentDetailModal` (array `demo*` permanen + tombol toast palsu).
- Tutor: KPI statis (`TutorKPI.tsx:15`), Guides statis + tombol mati (`TutorGuides.tsx:201,275-302`), notifikasi statis (`TutorDashboard.tsx:33`), widget RPP checklist tidak persist (`TutorLessonPlanWidget.tsx:44`), izin/cuti tidak persist (`TutorAttendance.tsx:121`), nav `/tutor/schedule` 404 (`TutorScheduleWidget.tsx:89`), skor KPI hardcode 90 (`tutorDashboard.ts:330`), jadwal semua ditandai "hari ini" (`tutorDashboard.ts:306`).
- Parent: `/parent/payment` redirect balik ke billing → konfirmasi transfer manual mustahil (`payment/page.tsx:4` + `ParentInvoiceDetail.tsx:335` + `InvoiceModal.tsx:196`) — **terbukti live via reticle**; marketplace tanpa nav portal (`MarketplaceContent.tsx:40`); kartu cabang keluar portal (`TenantCard.tsx:26`); katalog mock + terisolasi (`ParentCatalog.tsx:26,48`); validasi wizard hanya step 1 (`ParentRegistration.tsx:213`); register ortu tanpa input tanggal lahir anak (`ParentAuth.tsx:209`).
- Admin: edit RPP membuang field inti (`LessonPlans.tsx:219` + `lessonPlans.ts:206`); pencarian global header tanpa handler (`DashboardLayout.tsx:90`); ganti logo hanya toast (`Settings.tsx:184`); email operasional tidak tersimpan (`Settings.tsx:147`); pengingat tagihan hanya toast (`AdminNavbarActions.tsx:102`); edit siswa tidak bisa pindah kelas (`Students.tsx:120`); laporan admin tidak bisa upload foto (`DailyReports.tsx:95`); honor dari kuota teoritis (`TutorPayout.tsx:94`); pendapatan bulanan tanpa filter bulan (`adminDashboard.ts:245`).
- Vendor: tombol manajemen daycare/user/finance/platform hanya toast (`DaycareManagementTab.tsx:74`, `UserManagementTab.tsx:90`, `FinanceTab.tsx:96`, `PlatformSettingsTab.tsx:91`); grafik statis (`VendorDashboard.tsx:41`); modal superadmin menampilkan perintah internal `npm run set-demo-passwords` (`VendorAuth.tsx:157`).
- CRM: 4 tab widget mock (`AutoFollowUpWidget.tsx:26`, `MarketingCampaignWidget.tsx:24`, `TicketSystemWidget.tsx:29`, `IntegrationWidget.tsx:17`); waiting list tanpa aksi (`waitingList.ts:65`).

### D. Pembayaran PayCore
- Webhook `payment.failed/expired` menimpa status tanpa guard `paid` (`webhooks/paycore/route.ts:150-160`).
- Tenant `isActive: true` saat order dibuat, tidak dimatikan saat gagal (`checkout.ts:131`).
- Fallback signup tanpa kredensial password → akun admin tak bisa login (`checkout.ts:91`).
- **[DIREVISI dari HIGH → MED]** `PAYCORE_RETURN_URL` tidak hardcoded di kode (`paycore.ts:96` membaca env) dan `.env.local` sudah benar (`/payment/return`), tetapi `.env.example:25` mendokumentasikan `https://parent.majiku.web.id/billing` — siapa pun yang deploy dari template akan salah arah.
- Halaman return ber-copy SPP padahal juga dipakai langganan SaaS (`payment/return/page.tsx:36`).
- `paycoreEvents.paycoreOrderId` `.unique()` + `onConflictDoNothing` → event lanjutan tidak tercatat (`schema.ts:434`).
- BetterAuth tanpa `trustedOrigins` subdomain produksi (`auth.ts:15`).

### E. Kualitas Data & UX Lain (MED/LOW pilihan)
- Statistik laporan beranda parent salah hitung (`ParentPortal.tsx:286`); status `repeat_trial` berlabel "Tidak Lanjut" (`TrialStatusList.tsx:30`); nama program UUID mentah (`TrialStatusList.tsx:83`); timezone klien vs WIB (`TutorAttendance.tsx:106`); format jam tidak seragam (`attendance.ts:251`); duplikasi daily report tidak dicegah (`dailyReports.ts:220`); harga landing ≠ master plan (`SaasLanding.tsx:76`); footer legal `href="#"` (`SaasLanding.tsx:764`); OG metadata hilang (`(public)/page.tsx:10`); registrasi selalu kota "Jakarta" & harga 2jt (`authRegistration.ts:95`, `checkout.ts:128`); `www.` tidak terdaftar di wrangler routes.

> Daftar lengkap 99 temuan dengan referensi file:line per role ada di 4 laporan leaf (`.unlazy/launch-audit/reports/`).

---

## 6. E2E Reticle — Bukti

- Verdict "proved": login parent/tutor/admin → masing-masing portal; invoice preview → detail; buka thread chat.
- `/parent/payment` live → route `/parent/billing` (membuktikan dead-end).
- Sweep 27 rute, 0 console error; guard anonim 307.
- Production server: semua rute kunci 200; slug tidak dikenal 404.
- Catatan ops: dev log menunjukkan loop `POST /tutor-payout` ~1 detik (server-action sebagai `queryFn` react-query + refetch saat focus) — benign, tapi boros; pertimbangkan `staleTime`.

## 7. Urutan Perbaikan yang Disarankan (pra-launch)

1. **Minggu 1 — Keamanan:** helper session+tenant+role di semua server action (blok A & B); tambah `tenantId` di `tutors`/`tutor_attendance`; otorisasi foto per relasi keluarga/kelas/tenant; role-check vendor.
2. **Minggu 1 — Uang:** webhook guard status; aktivasi tenant hanya di `payment.succeeded`; perbaiki fallback signup; `.env.example` return_url; trustedOrigins.
3. **Minggu 2 — Fitur inti nyata:** QR scanner persist (atau sembunyikan sampai siap); izin/cuti persist; edit RPP kirim semua field; dead-end payment (arahkan ke invoice detail + instruksi transfer); nav parent di marketplace portal; nav tutor schedule (buat halaman atau hapus link).
4. **Minggu 2–3 — Bersihkan mock:** modal dashboard, KPI/Guides tutor, tab CRM & vendor (sembunyikan yang belum siap daripada tampilkan data palsu).
5. **Polish:** timezone WIB konsisten, validasi wizard, tanggal lahir anak, metadata/OG, dedup label trial.

---

*Laporan leaf lengkap: `.unlazy/launch-audit/reports/leaf-{admin,tutor,parent,public-vendor}.md` · Oracle: `scripts/audit/{check-report,check-env}.mjs` · Ledger: `.unlazy/launch-audit/`*
