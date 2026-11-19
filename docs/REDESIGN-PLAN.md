# Rencana Redesign & Rebranding: MAJIKU → Bunayo

Branch: `redesign/bunayo` · Disusun 18 Nov 2026 · Status: **Fase 0 selesai, menunggu persetujuan**

Sumber desain: `D:\Coding\riset kompetitor\design\` (`_kit/kit.css` = satu-satunya sumber token; `_src/0x.html` = markup per layar).
Legenda data: ✅ tersedia · ⚠️ sebagian · ❌ BARU (belum ada data/backend → disembunyikan atau EmptyState jujur, dicatat di `docs/REDESIGN-BACKLOG.md`).

---

## 1. Inventaris nama "MAJIKU" & logo lama

`grep -ri majiku src public` → **181 kemunculan di 60 file**. Logo lama: tidak ada file logo; brand hanya teks "MAJIKU" + ikon lucide. `public/` hanya berisi `favicon.ico` lama, `placeholder.svg`, `previews/*.png|webp`. **Tidak ada PWA manifest** (perlu dibuat: `src/app/manifest.ts`).

### 1a. Akan diganti → "Bunayo" (teks yang dilihat pengguna)

| Kelompok | File |
|---|---|
| Metadata global | `src/lib/site.ts` (`name`), `src/app/layout.tsx` (pakai `siteConfig`) |
| Metadata halaman (`title`, OG `siteName`) | `(public)/page.tsx`, `marketplace/page.tsx`, `marketplace/[slug]/page.tsx`, `checkout/page.tsx`, `payment/return/page.tsx`, `privacy/page.tsx`, `terms/page.tsx`, `site/[type]/page.tsx`, `admin/login`, `admin/register`, `parent/login`, `parent/register`, `tutor/login`, `vendor/login` |
| Header/sidebar/logo teks | `components/layout/Sidebar.tsx`, `components/layout/TutorLayout.tsx`, `views/ParentPortal.tsx`, `views/VendorDashboard.tsx`, `views/Auth.tsx`, `views/auth/{Admin,Parent,Tutor,Vendor}Auth.tsx`, `privacy`/`terms`/`site/[type]` header |
| Isi legal | `privacy/page.tsx` (13), `terms/page.tsx` (17) |
| Landing & publik | `views/SaasLanding.tsx` (16), `site/[type]/page.tsx`, `views/Checkout.tsx`, `views/VendorSite.tsx` ("Powered by") |
| Template WA / teks pesan | `marketplace/[slug]/page.tsx:85` ("melihat profil Anda di MAJIKU") |
| Teks UI lain | `AdminOnboardingCard`, `DemoAccessModal`, `PaymentModal`, `QRCodeScanner` (default `locationName`), `views/{Gallery,TutorAttendance,TutorDashboard,TutorGuides,ParentProfile,ParentRegistration,ParentCatalog}`, `components/vendor/{HelpCenterTab,PlatformSettingsTab}` |
| Deskripsi order PayCore (terlihat di halaman bayar) | `server/actions/checkout.ts:156` "Langganan MAJIKU …", `server/paycore.ts:111` "Layanan MAJIKU" → **teks deskripsi saja**, logika tidak disentuh |
| Fallback nama sekolah | `lib/invoiceExport.ts:102`, `views/ParentBilling.tsx:131` ("MAJIKU Daycare & Preschool") → diganti nama tenant nyata, bukan nama produk |

### 1b. Sengaja dibiarkan (identifier internal / dilarang diganti)

| Kemunculan | Alasan |
|---|---|
| `majiku.web.id`, `*.majiku.web.id`, `majiku.moxsenna.workers.dev` di `server/auth.ts`, `lib/roleRedirect.ts`, `middleware.ts`, fallback `NEXT_PUBLIC_SITE_URL` | Domain produksi; dilarang diganti. Domain Bunayo belum ditetapkan |
| Cookie domain `.majiku.web.id` (`server/auth.ts:30`) | Nama/domain cookie sesi |
| `majiku-sub-…`, `majiku-inv-…` (`checkout.ts:129`, `payments.ts:212`) | Prefix `external_order_id` PayCore; webhook bergantung padanya |
| Komentar `webhooks/paycore/route.ts:92`, `datetime.ts`, `subscriptionPlans.ts`, `middleware.ts`, `authz.ts`, `adminDashboard.ts:87` | Komentar kode |
| `*@majiku.test`, `demo@majiku.id` (`lib/demo.ts`, `DemoAccessModal`, `demoData.ts`) | Identitas akun demo di DB; deteksi demo bergantung padanya |
| `package.json` `"name": "majiku"`, repo | Dilarang diganti |
| Email `support@majiku.web.id` / `support@majiku.id` (auth views, ParentProfile, PlatformSettingsTab) | **Perlu keputusan** (lihat §6 Q1). Sementara dibiarkan karena alamat ini yang benar-benar menerima email |

### 1c. Tempat yang memuat domain (laporan wajib)

`server/auth.ts:13-19,30` · `lib/roleRedirect.ts:34-39` · `middleware.ts` (komentar) · `(public)/page.tsx:10` · `marketplace/page.tsx:4` · `privacy/page.tsx:6` · `terms/page.tsx:6` · `lib/site.ts` (url) · `views/SaasLanding.tsx:162,171,180,349` (teks "parent.majiku.web.id" dll. di mockup) · `views/Checkout.tsx:280` ("portal admin.majiku.web.id") · `components/vendor/PlatformSettingsTab.tsx:45,82,86` · email support (lihat atas). Tidak satu pun URL diganti sampai domain final diputuskan.

---

## 2. Temuan penting di luar rencana awal (§4 prompt)

1. **View yatim**: `views/VendorSite.tsx`, `views/DaycareMarketplace.tsx`, `views/ParentPayment.tsx` tidak diimpor route mana pun (`/parent/payment` punya halaman sendiri). U2/U3 sebenarnya ada di `components/marketplace/MarketplaceContent` + `(public)/marketplace/[slug]/page.tsx`, bukan `DaycareMarketplace`/`VendorSite`. Usul: tidak di-restyle; dihapus di Fase 5 (setelah konfirmasi). `ParentPayment.tsx` berisi rekening palsu N1.
2. **Route tutor yang tidak ada di tabel §4**: `/tutor/schedule` (→ G3 Kelas saya), `/tutor/trials` (→ G11 Observasi trial).
3. **Data palsu masih ada** (melanggar kejujuran data): `SaasLanding` (testimoni, "500+ Lembaga", N2/N3/N4), `ParentBilling.tsx:435` rekening BCA/Mandiri palsu (N1), `ParentCatalog` (promo "Family Day" statis), `WaitingListManagement.tsx` (array `waitingListData` statis), `TutorGuides` (panduan statis), seluruh tab `components/vendor/*` (mock — portal vendor di luar cakupan, tidak disentuh selain token), `Settings.tsx:80` default `"MAJIKU Daycare"`.
4. **Mode demo**: `adminDashboard.ts`/`tutorDashboard.ts`/`parentChildren.ts` menyajikan dataset mock untuk akun `@majiku.test`. Bukan akun nyata → dipertahankan apa adanya; UI baru menampilkan data yang sama tanpa label periode palsu. Dicatat sebagai risiko (N7–N11).
5. **Auth gate klien** `RoleProtectedRoute` (spinner layar penuh, N31) membungkus layout admin/tutor/parent. Fase 2 mengganti spinner dengan skeleton shell; memindahkan cek sesi ke server = perubahan di luar UI → minta izin terpisah.
6. **Tidak ada PWA manifest**; favicon lama `.ico`.
7. **Mode gelap**: `.dark` di `globals.css` + `sonner.tsx` pakai `next-themes`. Tidak ada toggle tema di UI. Rencana: hapus blok `.dark` (desain tidak menyediakan token gelap), paksa tema terang di sonner.
8. **Font**: `@import` Plus Jakarta Sans di `globals.css:5` → diganti `next/font/google` (Bricolage Grotesque, IBM Plex Sans, IBM Plex Mono) di `app/layout.tsx`.

---

## 3. Pemetaan route → layar desain + status data

Server actions yang ada: lihat `src/server/actions/*` (27 file). Schema: 26 tabel di `src/db/schema.ts`.

### 3a. Admin (`src/app/(admin)`, desktop-first 1440/834/390)

| Route · view | Layar | Data | Catatan data |
|---|---|---|---|
| `/dashboard` · `Dashboard.tsx` | **A1** Hari Ini | ⚠️ | ✅ Tiba hari ini (`attendance`), Diterima/terbit periode & Terlambat (`invoices.status/paid_at/due_date`), kelas & guru hari ini (`classSchedules`, `tutorAttendance`), ulang tahun (`birthdays.ts`), trial dijadwalkan. ❌ "Pesan > 4 jam" (tidak ada kotak masuk admin), "kelas tanpa guru" (tidak ada sesi konkret/pengganti), "tagihan belum terbit sesuai jadwal" (tidak ada jadwal penagihan) |
| ↳ mode | **A1B** antrean fokus | ⚠️ | Opsional; dikerjakan setelah A1, memakai sumber yang sama |
| `/birthdays` · `Birthdays.tsx` | item Info di A1 | ✅ | Redirect `/birthdays` → `/dashboard` |
| `/students` · `Students.tsx` | **S1** Siswa | ✅ | `listStudentsWithEnrollments`; tab Keluarga **S2** ⚠️ (dikelompokkan dari `parentUserId/parentEmail`, tidak ada tabel keluarga) |
| ↳ detail | **A2** Profil anak | ⚠️ | ✅ identitas, kelas, kehadiran, tagihan, laporan. ❌ kesehatan/alergi, penjemput, kontak darurat (tidak ada kolom di `students`; hanya di `trial_applications`) |
| ↳ tambah | **D1** Daftarkan (stepper) / D2 | ⚠️ | ✅ langkah Anak, Keluarga (1 wali), Kelas. ⚠️ Tagihan pertama = `createInvoice` manual (nominal dari `classes.price_per_month` sebagai bawaan). ❌ paket/item biaya, kesehatan, penjemput |
| ↳ impor | **A3** Impor Excel | ❌ | Seluruh alur BARU → tombol disembunyikan |
| ↳ undang | **A6** Undang wali WA | ⚠️ | ✅ tautan `wa.me` + tautan daftar `parent/register` (bisa sekarang). ❌ token sekali pakai, tabel undangan/status |
| `/crm` · `CRM.tsx` | **A4** Pendaftaran & Trial | ✅/⚠️ | `getTrialPipeline`, `waitingList` ✅. ❌ tahap Hadir otomatis, alasan tidak lanjut, statistik konversi |
| ↳ detail | **A5** Detail trial | ✅ | ❌ alasan tidak lanjut |
| `/billing` · `Billing.tsx` | **P1** Penagihan, **K1** Ringkasan | ⚠️ | ✅ tab Menunggu/Terlambat/Lunas/Dibayar Sebagian dari `invoices`; "Perlu Ditagih" = enrollment aktif tanpa invoice periode berjalan (`getBillingEnrollments`) ✅. ❌ aging per kelas, settlement, kolom "pengingat terakhir" |
| ↳ | **P2** Penagihan bulan berjalan | ⚠️ | Terbit massal = loop `createInvoice` (server action ada, satu-satu). Aksi massal "terbitkan" → perlu konfirmasi apakah boleh memanggil action berulang dari klien |
| ↳ | **K2** Tagihan keluarga & ledger | ⚠️ | Daftar invoice per keluarga ✅; ❌ ledger, invoice gabungan |
| ↳ | **K3** Catat bayar manual | ⚠️ | `markInvoicePaid` ✅ (lunas penuh). ❌ bayar sebagian, bukti foto |
| ↳ | **K4** Tagihan sekali | ✅ | `createInvoice` (anak, nominal, jatuh tempo, catatan) |
| ↳ | **K5** Paket & biaya | ❌ | Harga hanya `classes.price_per_month` → tampil read-only dari kelas; editor paket disembunyikan |
| ↳ | **K7** Pembayaran masuk | ⚠️ | `payment_orders` (PayCore) ada, belum ada action admin untuk daftar → perlu action baca baru (read-only, minta izin) |
| `/tutor-payout` · `TutorPayout.tsx` | **K8** Honor guru | ⚠️ | Tarif & bonus ✅. ❌ sesi nyata dari absen guru ("bukan sesi nyata", N16) → tampilkan estimasi dengan label jujur atau sembunyikan total |
| `/settings` · `Settings.tsx` | **K6** Pengaturan penagihan | ❌ | Seluruh pengaturan BARU → disembunyikan. Profil lembaga ✅ (`get/updateTenantProfile`) |
| `/tutors` · `Tutors.tsx` | **O13** Staf & peran (+ O3) | ⚠️ | ✅ daftar guru, tautkan akun, penugasan kelas. ❌ peran per lembaga, undangan |
| `/classes` · `Classes.tsx` | **O1** Kelas & program | ✅ | `listClassesWithTutor`, kapasitas, harga |
| `/schedule` · `Schedule.tsx` | **O2** Kalender sesi | ⚠️ | Jadwal mingguan `class_schedules` ✅. ❌ sesi konkret, deteksi tanpa guru |
| ↳ | **O3** Jadwal guru & pengganti | ⚠️ | Penugasan + `tutor_leave_requests` ✅. ❌ matriks cakupan, saran pengganti |
| ↳ | **O4** Libur | ⚠️ | `class_schedules.type='holiday'` ✅. ❌ dampak ke sesi/kuota/tagihan |
| `/attendance` + `/attendance/guru` · `views/kehadiran/` | **O5** Kehadiran siswa | ⚠️ | Action baca `getKehadiranSiswa` + tab per kelas, filter, tiba/pulang hari ini (action lama), tanggal lalu baca-saja, belum check-out 7 hari. ❌ koreksi dengan audit, scan QR (N27 placeholder) |
| ↳ | **O6** Kehadiran guru | ⚠️ | Action baca `getKehadiranGuru` (jadwal sesi awal, izin, hadir bulan ini) + `getTodayTutorAttendanceList` kini terisolasi tenant. ❌ GPS, penilaian tepat waktu, persetujuan izin (izin ada tapi tanpa action approve) |
| `/daily-reports` + `/gallery` | **O7** Laporan harian & foto | ✅/⚠️ | `dailyReports`, `galleryPhotos` ✅. ❌ feed event berwaktu, ringkasan otomatis 16.00. `/gallery` → redirect ke O7 tab Foto |
| `/lesson-plans` · `LessonPlans.tsx` | **O8** RPP | ✅ | |
| — | **O9** Perkembangan | ❌ | Seluruh modul BARU → tidak dibuat |
| `/messages` · `Messages.tsx` | **O11** Pengumuman | ⚠️ | ✅ buat/daftar/hapus. ❌ audiens, jadwal kirim, tingkat baca |
| ↳ | **O10** Kotak masuk | ❌ | Admin tidak punya percakapan (`conversations` = ortu↔tutor). EmptyState jujur + backlog (N29) |
| — | **O12** Laporan | ⚠️ | Angka yang bisa dihitung dari tabel yang ada (kehadiran, tagihan per periode); ❌ grafik tren butuh query baru (read-only) |

### 3b. Guru (`src/app/(tutor)`, mobile 390)

| Route · view | Layar | Data | Catatan |
|---|---|---|---|
| `/tutor` · `TutorDashboard.tsx` | **GV1** Hari Ini | ✅ | `getTutorDashboardOverview`, absensi diri |
| `/tutor/schedule` | **G3** Kelas saya | ✅ | |
| `/tutor/attendance` · `TutorAttendance.tsx` | **G2** Check-in | ⚠️ | ❌ GPS, penilaian otomatis |
| ↳ absen anak | **GV2** Absen kelas | ✅ | `recordStudentCheckIn/Out` sudah mengizinkan role tutor; belum ada UI tutor |
| `/tutor/progress` · `TutorProgress.tsx` | **GV3** Posting cepat, **G5** Foto, **G6** Log makan | ⚠️ | `createDailyReport` multi-anak ✅. ❌ feed event berwaktu, override per anak (data model satu laporan/anak/hari → override per anak bisa ✅ tanpa schema baru), izin publikasi foto |
| ↳ | **GV4** Profil singkat anak | ⚠️ | ❌ alergi/penjemput |
| `/tutor/chat` · `TutorChat.tsx` | **G8** Pesan, **G9** Percakapan | ✅ | `chat.ts` |
| `/tutor/kpi`, `/tutor/guides`, payout | **G10** Saya | ⚠️ | KPI & absensi ✅, Keluar (N30). `TutorGuides` statis → disembunyikan |
| `/tutor/trials` | **G11** Observasi trial | ✅ | `getMyTrialQueue`, `submitTrialReview` |
| — | G1 undangan, G4 scan QR, G7 penjemput, G12 perkembangan, G13 offline | ❌ | Tidak dibuat |

### 3c. Orang tua (`src/app/(parent)`, mobile 390)

| Route · view | Layar | Data | Catatan |
|---|---|---|---|
| `/parent` · `ParentPortal.tsx` | **OV1** Beranda, **P2** Kabar | ✅/⚠️ | Anak, status tiba (`attendance`), laporan, pengumuman ✅. Promo statis dihapus |
| `/parent/billing` · `ParentBilling.tsx` | **OV2** Tagihan | ✅ | `getMyInvoices`. Rekening palsu N1 **dihapus** |
| `/parent/payment`, `/parent/invoice/[id]` | **OV3** Bayar, **P5** Kuitansi | ✅/⚠️ | Alur PayCore tidak diubah. Kuitansi = detail invoice Lunas (PDF bermerek ❌; `invoiceExport.ts` ada → ⚠️) |
| `/parent/chat` · `ParentChat.tsx` | **P6** Pesan | ⚠️ | Hanya dengan tutor; ❌ dengan lembaga |
| `/parent/profile` · `ParentProfile.tsx` | **P7** Profil, P8, P9 | ⚠️ | Anak (perbaiki N19) ✅. ❌ penjemput, QR jemput, preferensi notifikasi |
| `/parent/marketplace` | Profil › Jelajahi lembaga | ✅ | Tab bawah dipindah |
| `/parent/catalog`, `/parent/registration` | **P11** Program lain | ✅/⚠️ | `getAvailablePrograms`, `submitTrialApplication`. Promo statis di Catalog dihapus |
| — | OV4, P1, P3, P4, P10 | ❌ | Tidak dibuat (P3 izin dari aplikasi = BARU) |

### 3d. Publik

| Route | Layar | Data | Catatan |
|---|---|---|---|
| `/` · `SaasLanding.tsx` | **U1** Landing | ⚠️ | Hapus N2–N6, N10; ❌ trial 30 hari (copy disesuaikan dengan checkout berbayar yang ada) |
| `/marketplace` · `MarketplaceContent` | **U2** | ⚠️ | `tenants` ✅; ❌ filter jarak |
| `/marketplace/[slug]` | **U3** | ⚠️ | ❌ booking trial tanpa akun (CTA WA tetap) |
| `/checkout`, `/admin/register` | **U4** | ⚠️ | ❌ trial tanpa bayar |
| `/admin|parent|tutor/login`, `/auth/[mode]` | G1/P1 layar masuk | ✅ | Restyle saja; OTP WA ❌ |
| `/site/[type]`, `/privacy`, `/terms`, `/payment/return` | pola publik U1 | ✅ | Rebrand + token |
| `/vendor` · `VendorDashboard` | di luar cakupan | — | Ikut token & primitif saja |

---

## 4. Urutan kerja (commit kecil per fase)

0. **Fase 0** — dokumen ini + `REDESIGN-BACKLOG.md`. *(selesai)*
1. **Fondasi** — aset `public/brand/*`, `app/icon.png`/`apple-icon.png`, `app/manifest.ts` (192/512 latar putih via `sharp`/script), metadata global → Bunayo; token `globals.css` dari `bunayo-tokens.css` (+ hapus `.dark`); `tailwind.config.ts`; `next/font`; `lib/format.ts`, `lib/istilah.ts`, `lib/status.ts`; restyle primitif shadcn; komponen `src/components/majiku/*` (nama folder sesuai prompt; isi bermerek Bunayo); halaman `/dev/ui` (404 di produksi).
2. **Shell & navigasi** — `AdminShell` (sidebar 232/rail/nav bawah 5) menggantikan `DashboardLayout`/`Sidebar`/`AdminBottomNav`; redirect `/birthdays`, `/gallery`, `/tutor-payout`, `/tutors` (via `next.config.ts` `redirects()` atau `redirect()` di page); shell guru 4 tab; shell ortu 4 tab + KidSwitcher; skeleton menggantikan spinner `RoleProtectedRoute`.
3. **Admin** — A1 → S1/A2 → D1 → P1/K1/K2/K3 → O5/O6 → O1/O2 → O11/O10 → O7 → O8 → A4/A5 → K6(bagian yang ada)/O13 → O12 → sisanya.
4. **Guru** — GV1 → GV2 → GV3 → GV4 → G8/G9 → G10 → G2 → G3/G11.
5. **Ortu & publik** — OV1 → OV2 → OV3 → P6 → P7 → P2 → P5 → U1 → U2 → U3 → U4; rebrand legal.

Setiap layar: 4 state (isi/kosong/memuat/galat), cek 1440/834/390 (admin) atau 390 (guru/ortu) di app berjalan vs frame desain, catat bukti di §7.

## 5. Risiko

| Risiko | Mitigasi |
|---|---|
| Restyle primitif shadcn mengubah tampilan seluruh app sekaligus (termasuk portal vendor) | Sesuai cakupan; varian lama (`default/outline/ghost/destructive/secondary/link`) dipetakan ke varian kit agar pemanggil lama tidak rusak |
| Views besar (CRM 1291 baris, Students 934, Tutors 929) — rewrite menyeluruh berisiko memutus logika | Pertahankan pemanggilan server action & handler; ganti lapisan presentasi bertahap per section |
| Token `--radius` berubah 12px; kelas `rounded-lg/md/sm` lama berbasis `calc(var(--radius) - x)` | `borderRadius` baru hanya xs/input/DEFAULT/sheet/full; kelas lama `rounded-md/lg/sm` dipetakan ke token terdekat sementara, lalu dibersihkan per layar |
| Data demo (`@majiku.test`) menghasilkan angka mock | Tetap terisolasi di akun demo; tidak muncul di akun nyata |
| Spinner auth N31 butuh pindah ke server | UI: skeleton shell. Perubahan server-side ditunda sampai disetujui |
| Aksi massal (terbitkan/ingatkan) memanggil action berulang | Hanya action yang sudah ada, dengan konfirmasi; tidak ada endpoint baru tanpa izin |
| Build OpenNext/Cloudflare & `next/font` | `next/font/google` di-self-host saat build; verifikasi `npm run build` per fase |
| Logo: hanya PNG tersedia (tanpa SVG) | Pakai `next/image` dari PNG/WebP; ikon PWA dibuat dari `bunayo-mark.png` |

## 6. Pertanyaan untuk disetujui

1. **Domain & email Bunayo**: domain final? Email support (`support@majiku.web.id`) — biarkan sampai ada alamat Bunayo?
2. **View yatim** `VendorSite.tsx`, `DaycareMarketplace.tsx`, `ParentPayment.tsx`: boleh dihapus?
3. **Action baca baru (read-only, tanpa schema baru)** untuk K7 (daftar `payment_orders`), O12 (agregasi), dan A1 (agregasi hari ini bila `getAdminDashboardOverview` kurang): boleh ditambah? Tidak ada tabel/kolom baru.
4. **Nama folder komponen** `src/components/majiku/` (sesuai prompt) — atau `src/components/bunayo/`?
5. **Mode gelap**: hapus blok `.dark` (usul) atau biarkan tak terpakai?

## 7. Bukti verifikasi per layar

_(diisi per fase, gaya GATES.md: CHECK / EXPECT / EVIDENCE)_

### Fase 1 — Fondasi (2026-11-18)

| CHECK | EXPECT | EVIDENCE |
|---|---|---|
| `npm run lint` | 0 error | Lulus. Satu error lama (`no-useless-catch` di `src/server/actions/payments.ts`, sudah ada di `main`) diperbaiki: try/catch yang hanya `throw e` dibuang, perilaku identik. |
| `npm run build` | sukses | Lulus (Next 15, semua route terbangun, middleware 34.9 kB). |
| Hex baru di komponen | 0 | `git diff main -- src` → hex hanya di `globals.css` (token, beserta komentar asal) dan `manifest.ts`/`layout.tsx` (`theme_color` wajib literal). Hex lama yang tersisa: `marketplace/[slug]` (hijau WhatsApp) & `PaymentModal` canvas putih — bukan buatan fase ini, dibereskan di layar masing-masing. |
| `rounded-[..px]` baru | 0 | `git diff main -- src \| grep rounded-\[` → 0. |
| Kontras teks/kontrol | ≥4,5 / ≥3 | Palet terang = kit (sudah teranotasi). Palet gelap (turunan, bukan dari desain) diukur `contrast.mjs`: primary di kartu 4,79, teks di tombol primary 5,16, destructive-soft 4,88. |
| Font | Bricolage/Plex via next/font, @import Plus Jakarta hilang | `src/app/fonts.ts`; screenshot `/dev/ui` 1440 terang & gelap menunjukkan font termuat. |
| Sisa "MAJIKU" yang terlihat pengguna | 0 | Masih 3 file, semuanya data palsu yang dihapus di Fase 5: `ParentBilling.tsx:131,435`, `invoiceExport.ts:102` (fallback nama + alamat/telp palsu, rekening bank palsu N1), `ParentPayment.tsx` (view yatim). Sisanya komentar/identifier yang sengaja dibiarkan (§1b). |
| Katalog komponen | semua komponen kit tampil | `/dev/ui` (hanya `NODE_ENV=development`). |

Catatan utang: ukuran huruf di komponen memakai nilai arbitrer `text-[13px]` dst. karena `kit.css` sendiri menulis `font-size` literal (tak ada token tipografi). Nilainya disalin persis dari kit; bila nanti ingin skala token, cukup tambah `fontSize` di `tailwind.config.ts`.

### Fase 2 — Shell & navigasi (2026-11-18)

| CHECK | EXPECT | EVIDENCE |
|---|---|---|
| Shell admin 1440 | sidebar 232, logo 30, lembaga, cari, 3 grup, sub-menu hanya menu aktif, Pengaturan + tema + Keluar di kaki | screenshot `/dashboard`, `/billing/honor` (sub Tagihan · Honor Guru aktif, penanda Tinta) |
| Shell admin 834 | rail 76, mark "b", label pendek | screenshot `/settings/staff` 834 (Atur aktif) |
| Shell admin 390 | topbar mark + lembaga + cari; nav bawah 5 (Hari Ini, Kehadiran, Pesan, Keuangan, Lainnya) | screenshot `/attendance` 390 (Kehadiran aktif = pil Tinta) |
| Redirect URL lama | `/birthdays`→`/dashboard`, `/gallery`→`/daily-reports/foto`, `/tutor-payout`→`/billing/honor`, `/tutors`→`/settings/staff` | Playwright: URL akhir sesuai (307, `next.config.ts`) |
| Guru 390 | 4 tab melayang Hari Ini · Kelas · Pesan · Saya; Keluar di Saya (N30) | screenshot `/tutor/saya` |
| Ortu 390 | 4 tab Beranda · Tagihan · Pesan · Profil; pemilih anak di header; Marketplace pindah ke Profil › Jelajahi lembaga | screenshot `/parent` (akun demo 2 anak) |
| N31 | tidak ada spinner layar penuh | `RoleProtectedRoute` kini menampilkan kerangka di dalam shell |
| Data palsu di shell | 0 | `NotificationsDropdown` (notifikasi demo statis) & `AdminNavbarActions` dihapus; lonceng tidak ditampilkan sampai ada sumber notifikasi nyata (backlog) |
| `npm run lint` / `npm run build` | lulus | lulus |

Belum diverifikasi: tema gelap pada shell, lembar "Lainnya" (≤560) dibuka, akun admin non-demo nyata.

### Fase 3 · A1 Hari Ini (2026-11-18)

| CHECK | EXPECT | EVIDENCE |
|---|---|---|
| Sumber angka | satu definisi, berlabel periode, bisa diklik ke daftar | `src/server/actions/hariIni.ts` (baca-saja, `requireTenantContext`); definisi di komentar kepala file. Tiba·hari ini → `/attendance`, Diterima·Nov 2026 dari Terbit → `/billing`, Terlambat·semua periode → `/billing` |
| Stabilo | satu per layar | hanya "N hal mendesak" di judul |
| Aksi utama biru | satu | hanya aksi pertama di Mendesak |
| Terisi | 3 kolom 1440 / 2 kolom 834 / 1 kolom 390 | screenshot akun demo pada 1440, 834, 390 |
| Kosong | mengajari langkah berikut | lembaga tanpa kelas & anak → EmptyState "Buat kelas pertama" / "Daftarkan anak" |
| Memuat | skeleton per bagian | tanpa data awal → StatRowSkeleton + 3 panel skeleton |
| Galat | banner + data lama redup | galat saat refetch → ErrorBanner + `Stale`; galat tanpa data → banner + Coba lagi (terlihat pada akun admin yang tidak tertaut lembaga) |
| Data nyata | query jalan pada tenant nyata | dijalankan baca-saja pada lembaga produksi-dev (8 anak): tanpa galat, angka konsisten |
| Akun demo | jelas bukan data nyata | InfoBox "Mode demo"; jalur demo tidak membaca DB |
| Bersih-bersih | — | `views/Dashboard.tsx` + 20 widget dashboard yatim dihapus (termasuk `WaitingListManagement` berarray statis, notifikasi demo) |

### Fase 3 · S1 Siswa, A2 Profil anak, D1 Daftarkan (2026-11-18)

| CHECK | EXPECT | EVIDENCE |
|---|---|---|
| Sumber data | baca-saja, scope tenant | `src/server/actions/siswa.ts` (`listSiswa`, `getProfilSiswa`, `listKelasUntukDaftar`); dijalankan baca-saja pada lembaga nyata (8 anak): tanpa galat, status tagihan "Perlu Ditagih" konsisten dengan A1 |
| Tulis data | tidak ada action tulis baru | D1/A2 memakai `createStudent`, `updateStudent`, `moveStudentClass`, `linkStudentParent`, `toggleStudentActive`, `createInvoice`, `markInvoicePaid` apa adanya |
| S1 4 state | isi / kosong / memuat / galat | tabel + panel; kosong → EmptyState "Daftarkan anak" (screenshot akun demo, lembaga kosong); memuat → DataTableSkeleton; galat → banner + data lama redup |
| Baris aktif | Tinta, bukan stabilo | `activeRowId` → bg-muted + garis Tinta kiri |
| Mobile ≤560 | kartu | `renderCard`; panel profil jadi lembar samping ≤1000 |
| D1 | stepper 4 langkah, satu stabilo (total) | screenshot langkah 1 |
| S1 terisi | tabel + chip + panel sticky, kartu ≤560 | DB uji (`scripts/seed-uji-redesign.ts`, 14 anak): screenshot 1440/834/390; `?q=rahmat` → 3 anak saudara; panel tab Tagihan |
| A2 terisi | kesehatan teratas, kehadiran bulan ini, keluarga + saudara | screenshot Alya Putri 1440/390 (alergi dari trial, saudara Bima) |
| D1 alur penuh | 4 langkah sampai simpan | Playwright: galat validasi → keluarga lama (Rahmat, "akun aktif") → TK B Pelangi (kursi tersisa) → terbit Rp 950.000 → "Nadia sudah terdaftar"; muncul di S1 dengan wali tertaut |
| Perbaikan dari verifikasi | — | `listKelasUntukDaftar` gagal (subquery `"id"` ambigu) dan galatnya ditelan jadi "Belum ada kelas" → query diperbaiki + D1 kini menampilkan ErrorBanner bila loader gagal; tab nonaktif ikut tampil (kelas `flex` menimpa `hidden`) → `TabsContent` `data-[state=inactive]:hidden`; panel S1 sticky; sel sticky baris aktif; inisial "T(" → "TU"; angka Stat tidak pecah baris |
| Keamanan | wali hanya dari lembaga sendiri | `getLinkableParents` dibatasi ke wali yang terkait siswa/trial lembaga (disetujui 2026-11-18) |

**DB uji**: Neon `ep-late-dawn-*`, URL di `.env.test.local` (tidak di-commit). Jalankan dev dengan `export $(grep -v '^#' .env.test.local | xargs -d '\n') && npm run dev`. Akun `admin.uji@ / guru.uji@ / wali.uji@bunayo-uji.test`, sandi `UjiBunayo123!`. Skema: `drizzle-kit migrate` + `push` (tabel `tutor_attendance`, `tutor_leave_requests` belum ada di folder migrasi — catatan untuk rilis).

### Fase 3 · Keuangan — P1 Penagihan, K1 Ringkasan, K2 Detail+ledger, K3 Catat bayar (2026-11-18)

| CHECK | EXPECT | EVIDENCE |
|---|---|---|
| Satu sumber angka | K1 dan P1 selaras | Keduanya dari `src/server/actions/keuangan.ts` (baca-saja, `requireTenantContext`); definisi di komentar kepala file (Ditagihkan/Diterima/Menunggu/Terlambat/Perlu Ditagih/Cara bayar/Uang masuk/Keluarga) |
| P1 4 tab | Perlu Ditagih / Menunggu / Terlambat / Lunas | Tab dengan hitungan; kartu angka mengklik ke tab sumbernya. Terbitkan = action lama `createInvoice` per anak, jatuh tempo +7 hari; sudah diuji: 1 anak uji (Oki) diterbitkan → Menunggu bertambah, angka selaras |
| Aksi massal | bilah gelap + total | Centang baris → "Terbitkan 1 tagihan · Rp 750.000"; baris terpilih Biru lembut |
| Ingatkan | tautan wa.me, jujur | Tombol Ingatkan membuka wa.me bila wali punya nomor; tanpa nomor → "Tanpa nomor WA"; riwayat pengingat disembunyikan (BARU) |
| K2 | rincian + ledger buku kas | `/billing/[id]`: status, jatuh tempo, diskon, anak+kelas; ledger tagihan/bayar/saldo dari invoice keluarga (bayar = nominal penuh; parsial BARU) |
| K3 | catat Lunas penuh | Tombol "Catat pembayaran" → `markInvoicePaid`; diuji: UJI-0020 Lunas, ledger bertambah baris bayar, saldo 0; K1/P1 ikut berubah |
| K1 | stabilo Diterima + grafik + per kelas + tunggakan + cara bayar | Grafik 6 bulan (bulan berjalan s.d. hari ini); per kelas dengan ProgressBar; aging 1–30/31–60/>60; Online vs dicatat admin |
| Kosong | mengajari langkah | Tanpa tagihan → EmptyState "Daftarkan anak" (P1), "Belum ada uang masuk" (K1) |
| Demo | terbaca bukan data nyata | Akun `demo@majiku.id` (DB uji): InfoBox "Mode demo", angka contoh desain; mutasi dinonaktifkan |
| Responsif | 1440/834/390 | 834: kartu angka 2×2 (perbaikan `StatCard`); 390: kartu + tabs; screenshot tersimpan |
| Lint/build | lulus | `npm run lint` 0, `npm run build` sukses |
| Perbaikan menyelinap | — | `waLink`/aging dipindah ke `src/lib/keuangan.ts` (ekspor "use server" wajib async); `any(array)` diganti `inArray` (getTagihanDetail 404); `TabsContent` inactive kini benar-benar tersembunyi; StatCard min-w 46% ≤1000 |

**Belum diverifikasi**: state galat refetch di P1/K1 (pola sama dengan A1 yang sudah diuji); K4 (tagihan sekali), K5 (paket), K6 (pengaturan penagihan), K8 (honor) masih tampilan lama atau belum dibuat — urutan berikutnya.

### Fase 3 · Keuangan — K7 Pembayaran masuk (2026-11-19)

| CHECK | EXPECT | EVIDENCE |
|---|---|---|
| Sumber | data nyata, baca-saja | `getPembayaranMasuk(bulan)` di `keuangan.ts`: tagihan Lunas per `paid_at` (WIB) + `payment_orders` pending untuk tagihan belum Lunas; online = order `paid` (webhook PayCore) |
| Satu definisi | label beda dari "Diterima" K1/P1 | Kartu bernama "Uang masuk" (per tanggal bayar = batang bulan berjalan grafik K1), bukan "Diterima" (tagihan periode berjalan yang Lunas) |
| Periode | label + pemilih | "1–19 Nov 2026" (bulan berjalan s.d. hari ini), pilihan 6 bulan `?bulan=YYYY-MM` |
| Menunggu gateway | baris Matahari muda + chip "Perlu dicek" | `DataTable` prop baru `highlightRow`; InfoBox mencegah catat manual ganda; tombol "Cek status" disembunyikan (webhook memperbarui otomatis) |
| BARU disembunyikan | settlement, QRIS/VA, admin pencatat | Kartu & kolom Pencairan tidak dirender; catatan jujur di bawah tabel; backlog K7 |
| Data uji | order online + pending | `scripts/seed-uji-pembayaran.ts` (hanya DB uji): 4 paid, 1 pending |
| State | isi/kosong/memuat/galat | Isi (DB uji), kosong (`?bulan=2026-07` → EmptyState + Buka Penagihan, Ekspor nonaktif), skeleton & ErrorBanner+Stale (pola sama P1) |
| Demo | baca-saja | InfoBox Mode demo; klik baris dimatikan di demo (juga di P1 — sebelumnya mengarah ke `/billing/demo-*` 404) |
| Responsif | 1440/834/390 | 1440 tabel penuh; 834 kartu 2×2 + tabel, nomor tidak terlipat; 390 mode kartu |

### Fase 3 · Kehadiran — O5 siswa + O6 guru (2026-11-19)

| CHECK | EXPECT | EVIDENCE |
|---|---|---|
| Sumber | data nyata, baca-saja | `kehadiran.ts` (O5+O6, definisi angka selaras A1 di kepala file): baris per enrollment aktif, absen dicocokkan per anak+kelas, sesi = `sessions_used/quota`, belum check-out = 7 hari tanpa jam pulang; guru: jadwal sesi awal hari itu, izin non-rejected, hadir = tanggal unik check-in bulan berjalan |
| Tanggal lalu | baca-saja jujur | `?tanggal=` divalidasi (masa depan → hari ini); InfoBox "Melihat … Kembali ke hari ini"; eyebrow berganti tanggal; tombol Tiba/Pulang hanya saat `bisaCatat` (hari ini & bukan demo) |
| Alur catat | Tiba → Pulang hari ini | Action lama `recordStudentCheckIn/Out`; uji klik nyata di DB uji: toast jam, angka tab & ikon avatar berubah, baris hilang dari filter "Belum tiba" |
| Pemilih tanggal | native + bergaya kit | `<input type="date">` transparan di atas tombol "Hari ini · 19 Nov"; maksimal hari ini |
| Navigasi guru | terjangkau di semua lebar | Sub-menu rail "Siswa/Guru" (adminNav); di ≤1000 (rail tanpa sub) tautan "Kehadiran Guru" di header O5 |
| Belum check-out | InfoBox History | Maks 4 nama + "dan N lainnya", ikon `h-4 w-4 shrink-0` (ukuran tetap — sebelumnya mengecil saat teks panjang menekan) |
| Tenant | tanpa bocor | `getTodayTutorAttendanceList` (dipakai portal guru) kini difilter tenant — sebelumnya mengembalikan guru semua lembaga (bug nyata, ditemukan saat membaca kode) |
| BARU disembunyikan | scan QR, penjemput, sumber pencatatan, koreksi+audit; GPS, tepat waktu, persetujuan izin, aturan | Tidak dirender; catatan jujur di bawah tabel & InfoBox; backlog O5/O6 |
| Demo | baca-saja | InfoBox Mode demo di O5 (pencatatan dinonaktifkan) & O6; data contoh frame desain (bukan lembaga mana pun) |
| State | isi/kosong/memuat/galat | Isi (DB uji), kosong (EmptyState → Daftarkan anak / Staf & Peran), skeleton, ErrorBanner + Stale "data terakhir pukul HH.MM" |
| Responsif | 1440/834/390 | 1440 tabel + InfoBox; 390 mode kartu, filter melipat, bottom nav Kehadiran aktif; screenshot tersimpan |
| Lint/build | lulus | `npm run lint` 0, `npm run build` sukses |

**Belum diverifikasi**: alur izin guru (action approve belum ada).

### Fase 3 · Kelas & Jadwal — O1 Kelas & program + O2 Kalender sesi (2026-11-19)

| CHECK | EXPECT | EVIDENCE |
|---|---|---|
| Sumber | baca-saja, scope tenant, satu sumber jadwal | `kelasJadwal.ts` (`getKelasProgram`, `getKalenderSesi`; definisi di kepala file). Jadwal kartu O1 diringkas dari `class_schedules` aktif ("Sen–Jum 09.00–11.00"); kolom teks `classes.schedule` tidak ditampilkan/ditanyakan lagi (N21) |
| Tulis | hanya action lama | `createClass`/`updateClass`/`toggleClassActive`, `create/update/delete/toggleClassSchedule`. `updateClass` dipanggil dengan `tutorId` hanya bila guru diganti (action menghapus & membuat ulang penugasan → tarif honor kembali bawaan) |
| O1 kartu | krayon kelas, guru·ruang, terisi/kapasitas + bar, ≥90% merah, kursi/daftar tunggu/trial | screenshot DB uji 1440/834/390 + demo ("Playgroup B 11/12 Hampir penuh" merah) |
| O1 → siswa | "Lihat anak" membuka S1 terfilter kelas | `/students?kelas=<id>` → chip kelas aktif (Playwright) |
| O2 grid | minggu berjalan, hari ini stabilo, sesi tumpang tindih berdampingan | Lajur otomatis per hari (demo: Toddler A full-day + Baby Bee + Playgroup B tanpa saling menutupi); Sabtu tampil bila ada sesi Sabtu |
| O2 ≤560 / Agenda | daftar per hari | Mode Agenda (tombol) dan otomatis di 390 |
| Alur tulis | buat kelas → sesi → jeda → nonaktif | Playwright DB uji: kelas baru muncul, sesi Senin 09.00 tampil di grid, Jeda → InfoBox "1 sesi dijeda" (bisa dibuka lagi), kartu kembali "Belum ada jadwal", Nonaktifkan → chip Nonaktif |
| Slot tanpa kelas | dicegah | Action `listSchedules` memfilter tenant lewat kelas (inner join) → slot "Semua kelas" lama tak akan pernah tampil; pilihan itu dihapus dari dialog |
| BARU disembunyikan | sesi konkret per tanggal, navigasi minggu, Tanpa guru + pengganti (O3), libur bertanggal + dampak (O4), batas usia terstruktur, paket per kelas | catatan jujur di bawah kalender; backlog O2/O3/O4 |
| Demo | baca-saja | InfoBox Mode demo, tombol tambah/ubah tidak dirender |
| State | isi/kosong/memuat/galat | EmptyState "Belum ada kelas"→Buat kelas; kalender tanpa kelas → Buka Kelas & Program; tanpa sesi → Tambah sesi; skeleton; ErrorBanner + Stale |
| Bersih-bersih | — | `views/Classes.tsx`, `views/Schedule.tsx` dihapus |

