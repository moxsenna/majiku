# Verifikasi Fase 4b: Galeri & Upload Foto (Cloudflare R2)

**Tanggal**: 2026-10-05  
**Branch**: `feat/fase4b-galeri-r2`  
**Staging URL**: `https://majiku.moxsenna.workers.dev`  
**Wrangler Account**: Moxsenna@gmail.com (`06738739e65bc88a495de618cabfa5ca`)  
**Deployment Tool**: OpenNext Cloudflare (`opennextjs-cloudflare deploy`)  
**Deployed Worker Version ID**: `8b9b5037-7e88-4777-8b09-3e78856fb334`  
**Binding R2**: `PHOTOS_BUCKET` -> `majiku-photos`  
**Status Staging**: Deployed sukses ke Cloudflare Workers dengan binding R2 aktif. Live HTTP request saat ini terkena rate limit kuota harian Workers Free (Error 1027 / HTTP 429) dan verifikasi browser langsung di staging live ditunda hingga reset kuota harian Cloudflare (UTC midnight). Seluruh verifikasi lokal (typecheck, lint, build, smoke rute public, protected, dan photo API R2) 100% lulus.

---

## 1. Ringkasan Deliverables Fase 4b

1. **Infrastruktur R2 & Route Handlers (`src/server/r2.ts`, `/api/photos`, `/api/photos/[...key]`)**:
   - Binding native R2 `PHOTOS_BUCKET` via Cloudflare context (`majiku-photos`).
   - Route handler upload `POST /api/photos`: proteksi sesi (`tutor` | `admin` | `moderator`), multipart form-data, pre-validasi batch 6 file & 5MB/file, MIME whitelist (`image/jpeg`, `image/png`, `image/webp`).
   - Route handler baca `GET /api/photos/[...key]`: proteksi sesi terautentikasi, validasi key strict regex anti path-traversal, header `X-Content-Type-Options: nosniff`, dan `Cache-Control: private, max-age=31536000, immutable`.
2. **Laporan Harian Tutor & Feed Orang Tua (`src/views/TutorProgress.tsx`, `src/views/ParentPortal.tsx`, `src/server/actions/dailyReports.ts`)**:
   - Input upload foto multi-file (maks 6 file) pada form Daily Report tutor dengan thumbnail preview real-time dan opsi remove sebelum submit.
   - Kolom `daily_reports.photos` (jsonb array key) menyimpan array relative key `reports/{uuid}.{ext}`.
   - Tampilan foto di Feed Parent Portal: grid kartu foto responsif dengan aspect-ratio rapi dan fallback error handling.
3. **Halaman Gallery Live CRUD (`src/db/schema.ts`, `src/server/actions/gallery.ts`, `src/app/(admin)/gallery/page.tsx`, `src/views/Gallery.tsx`)**:
   - Tabel Drizzle `gallery_photos` (18 tabel total di migrasi) dengan foreign key ke `students` dan `classes`.
   - Server Action `listGalleryPhotos`: query relasional lengkap foto galeri dengan nama siswa dan kelas.
   - Server Action `uploadGalleryPhotos`: dukungan tagging siswa (1..n atau umum) dengan batch insert DB.
   - Server Action `deleteGalleryPhoto`: proteksi role admin/moderator, guard multi-siswa (hanya hapus objek R2 jika key tidak lagi direferensikan oleh baris gallery lain), dan best-effort R2 deletion.
   - UI Galeri interaktif: Dialog upload foto dengan preview, badge tag murid, filter, dan AlertDialog konfirmasi hapus.

---

## 2. Hasil Verifikasi Teknis Lokal

### A. Typecheck (`npx tsc --noEmit`)
```
Clean (0 error)
```

### B. Linter (`npm run lint`)
```
Clean (0 error, 0 warning)
```

### C. Build (`npm run build`)
```
   ▲ Next.js 15.5.27
   - Environments: .env.local, .env

   Creating an optimized production build ...
 ✓ Compiled successfully in 10.3s
   Checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (32/32)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                    8.39 kB         123 kB
├ ○ /_not-found                            152 B         103 kB
├ ƒ /api/auth/[...all]                     152 B         103 kB
├ ƒ /api/photos                            152 B         103 kB
├ ƒ /api/photos/[...key]                   152 B         103 kB
├ ○ /attendance                          5.15 kB         155 kB
├ ƒ /auth/[mode]                         7.74 kB         166 kB
├ ○ /billing                             2.96 kB         153 kB
├ ○ /birthdays                           3.09 kB         144 kB
├ ƒ /classes                             5.79 kB         166 kB
├ ƒ /crm                                 23.2 kB         183 kB
├ ƒ /daily-reports                       6.61 kB         174 kB
├ ○ /dashboard                           24.3 kB         200 kB
├ ƒ /gallery                             10.2 kB         186 kB
├ ○ /lesson-plans                        10.9 kB         171 kB
├ ƒ /marketplace                           173 B         106 kB
├ ƒ /marketplace/[slug]                    173 B         106 kB
├ ○ /messages                            5.85 kB         265 kB
├ ƒ /parent                                13 kB         134 kB
├ ○ /parent/billing                      9.71 kB         143 kB
├ ○ /parent/catalog                      5.13 kB         129 kB
├ ○ /parent/chat                         5.45 kB         120 kB
├ ƒ /parent/invoice/[id]                 6.07 kB         129 kB
├ ƒ /parent/marketplace                    173 B         106 kB
├ ○ /parent/payment                      6.34 kB         121 kB
├ ○ /parent/profile                      6.21 kB         120 kB
├ ○ /parent/registration                 12.6 kB         162 kB
├ ○ /robots.txt                            152 B         103 kB
├ ○ /schedule                             2.7 kB         143 kB
├ ○ /settings                            3.32 kB         144 kB
├ ƒ /site/[type]                           166 B         106 kB
├ ○ /sitemap.xml                           152 B         103 kB
├ ƒ /students                             6.8 kB         174 kB
├ ○ /tutor                               13.2 kB         145 kB
├ ○ /tutor-payout                        5.32 kB         155 kB
├ ○ /tutor/attendance                      13 kB         165 kB
├ ○ /tutor/chat                          6.46 kB         125 kB
├ ○ /tutor/guides                        6.75 kB         121 kB
├ ○ /tutor/kpi                           10.2 kB         126 kB
├ ƒ /tutor/progress                      8.54 kB         132 kB
├ ƒ /tutor/trials                        11.8 kB         135 kB
├ ƒ /tutors                              6.87 kB         174 kB
└ ○ /vendor                              31.8 kB         296 kB
+ First Load JS shared by all             103 kB

ƒ Middleware                             34.4 kB
○ (Static)   prerendered as static content
ƒ (Dynamic)  server-rendered on demand
```

---

## 3. Smoke Test Rute Lokal (Port 3000)

| Rute / Endpoint | Tipe | Akses Tanpa Sesi | Status Code / Respons |
|---|---|---|---|
| `/` | Public Landing | Tanpa auth | `200 OK` |
| `/marketplace` | Public Directory | Tanpa auth | `200 OK` |
| `/site/daycare` | Public Microsite | Tanpa auth | `200 OK` |
| `/dashboard` | Protected (Admin) | Tanpa cookie | `307 Redirect` -> `/auth/login?next=%2Fdashboard` |
| `/students` | Protected (Admin) | Tanpa cookie | `307 Redirect` -> `/auth/login?next=%2Fstudents` |
| `/attendance` | Protected (Admin) | Tanpa cookie | `307 Redirect` -> `/auth/login?next=%2Fattendance` |
| `/gallery` | Protected (Admin/Tutor) | Tanpa cookie | `307 Redirect` -> `/auth/login?next=%2Fgallery` |
| `/daily-reports` | Protected (Admin/Tutor) | Tanpa cookie | `307 Redirect` -> `/auth/login?next=%2Fdaily-reports` |
| `/tutor` | Protected (Tutor) | Tanpa cookie | `307 Redirect` -> `/auth/login?next=%2Ftutor` |
| `/tutor/progress` | Protected (Tutor) | Tanpa cookie | `307 Redirect` -> `/auth/login?next=%2Ftutor%2Fprogress` |
| `/parent` | Protected (Parent) | Tanpa cookie | `307 Redirect` -> `/auth/login?next=%2Fparent` |
| `POST /api/photos` | R2 Upload Handler | Tanpa cookie | `401 Unauthorized` (`{"error":"Unauthorized"}`) |
| `GET /api/photos/reports/uuid.jpg` | R2 Serve Handler | Tanpa cookie | `401 Unauthorized` (`{"error":"Unauthorized"}`) |
| `GET /api/photos/gallery/uuid.jpg` | R2 Serve Handler | Tanpa cookie | `401 Unauthorized` (`{"error":"Unauthorized"}`) |

---

## 4. Catatan Keamanan Foto & Storage R2

1. **Private R2 Bucket & Strict Session Guard**:
   - Bucket `majiku-photos` tidak dikonfigurasi public access dan tidak memiliki custom domain publik.
   - Akses baca maupun unggah **wajib memiliki sesi aktif** via BetterAuth cookie melalui middleware dan route handler.
2. **Capability-based UUID Keys**:
   - Nama objek R2 di-generate secara kriptografis menggunakan `crypto.randomUUID()`:
     - `reports/${crypto.randomUUID()}.${ext}`
     - `gallery/${crypto.randomUUID()}.${ext}`
   - Key tidak dapat ditebak (unguessable) dan tidak mengekspos identifier internal siswa atau database.
3. **Strict Regex Key Validation (Anti Path-Traversal)**:
   - Route handler penyajian memvalidasi key dengan pola ketat:
     `PHOTO_KEY_REGEX = /^(reports|gallery)\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i`
   - Melindungi dari traversal directory `../`, karakter null byte, atau ekstensi yang tidak diizinkan.
4. **Header `X-Content-Type-Options: nosniff`**:
   - Disematkan pada setiap respons `GET /api/photos/[...key]` untuk mencegah MIME-confusion attack di browser klien.
5. **Role-Based Upload & Delete Authorization**:
   - Upload route (`/api/photos`): hanya role `admin`, `moderator`, dan `tutor`.
   - Gallery action (`uploadGalleryPhotos`): hanya role `admin`, `moderator`, dan `tutor`.
   - Gallery delete (`deleteGalleryPhoto`): hanya role `admin` dan `moderator`.
6. **Multi-Student Reference Protection on Delete**:
   - Ketika satu foto ditandai ke beberapa siswa, row DB `gallery_photos` dibuat untuk masing-masing siswa dengan `photoKey` yang sama.
   - Saat admin menghapus satu entri siswa, server action mengecek apakah masih ada entri lain dengan `photoKey` yang sama sebelum menghapus objek fisik dari R2. Objek R2 hanya dihapus jika tidak ada lagi referensi.

---

## 5. Panduan QA Manual Staging / Production

### A. Alur 1: Upload Foto di Daily Report Tutor -> Tampil di Feed Orang Tua
1. **Login Sisi Tutor**:
   - Masuk ke aplikasi sebagai Tutor (e.g. `qa_tutor@majiku.test`).
   - Buka halaman **Tutor Progress** (`/tutor/progress`).
2. **Pengisian Laporan & Unggah Foto**:
   - Pilih murid dan kelas yang aktif.
   - Isi form laporan harian (kehadiran, aktivitas, makan, tidur, mood, catatan).
   - Di kartu **Dokumentasi Kegiatan**:
     - Klik tombol / area input file "Pilih Foto".
     - Pilih 1 s/d 3 file gambar (`.jpg` / `.png` / `.webp`).
     - Pastikan thumbnail preview foto muncul langsung di bawah input dengan tombol hapus (X).
   - Klik **Simpan Laporan Harian**.
   - Tunggu konfirmasi toast sukses.
3. **Verifikasi Sisi Orang Tua**:
   - Buka window/profil browser lain, login sebagai Orang Tua dari murid terkait (e.g. `qa_parent@majiku.test`).
   - Masuk ke **Parent Portal** (`/parent`).
   - Di bagian timeline/feed laporan harian anak:
     - Temukan kartu laporan yang baru saja dibuat oleh tutor.
     - Pastikan galeri thumbnail foto tampil di kartu laporan dengan tata letak grid yang rapi.
     - Klik foto untuk melihat ukuran penuh / detail tampilan.

---

### B. Alur 2: Upload Foto Galeri -> Lihat Kartu Galeri -> Hapus Foto (Admin)
1. **Login Sisi Admin/Tutor**:
   - Masuk sebagai Admin (e.g. `qa_admin@majiku.test`) atau Tutor.
   - Buka menu **Galeri** (`/gallery`).
2. **Unggah Foto Galeri**:
   - Klik tombol **"Upload Foto"** di pojok kanan atas untuk membuka modal dialog.
   - Pada modal upload:
     - Pilih siswa terkait (opsional, bisa pilih 1 atau lebih, atau kosongkan untuk kegiatan umum).
     - Isi caption (misal: "Kegiatan Melukis Bersama Kelas Baby Bee").
     - Pilih file gambar (maks 6 foto, masing-masing maks 5 MB).
     - Preview gambar akan muncul di dalam dialog.
   - Klik **"Unggah Foto"**.
   - Toast "Foto berhasil diunggah" muncul dan halaman me-refresh otomatis.
3. **Verifikasi Tampilan Kartu Galeri**:
   - Di grid galeri, pastikan foto yang baru diunggah tampil di baris teratas.
   - Pastikan caption, tag nama murid (jika dipilih), dan tanggal pengunggahan sesuai.
4. **Hapus Foto (Sisi Admin)**:
   - Login sebagai Admin.
   - Pada kartu foto yang ingin dihapus, klik ikon menu atau tombol **Hapus** (tempat sampah).
   - Muncul AlertDialog konfirmasi: "Apakah Anda yakin ingin menghapus foto ini?".
   - Klik tombol konfirmasi **"Hapus"**.
   - Foto hilang dari daftar galeri dan record database serta objek R2 terhapus dengan aman.

---

### C. Alur 3: Uji Akses Incognito / Tanpa Sesi (Proteksi URL Foto)
1. Dapatkan salah satu URL foto yang aktif, contoh:
   - `https://majiku.moxsenna.workers.dev/api/photos/reports/<uuid>.jpg`
   - atau `http://localhost:3000/api/photos/gallery/<uuid>.jpg`
2. Buka tab browser baru dalam mode **Incognito / Private Window** (tanpa cookies sesi login).
3. Paste URL foto tersebut ke address bar dan tekan Enter.
4. **Hasil yang Diharapkan**:
   - Browser TIDAK menampilkan gambar.
   - Server mengembalikan status **`401 Unauthorized`** dengan body:
     ```json
     {"error": "Unauthorized"}
     ```
   - Membuktikan bahwa R2 dilindungi oleh session boundary dan tidak dapat diakses publik secara bebas.
