# Design: Production Ready & Isolasi Mock Data Akun Demo vs Akun Riil MAJIKU

- **Tanggal**: 2026-10-09
- **Status**: Disetujui (Approach: Opsi 1 - Flag Demo via Email/Session + Server Actions Bersih)
- **Tujuan Bisnis**: Menjadikan seluruh portal MAJIKU (Admin, Parent, Tutor, Vendor) siap produksi penuh. Akun baru (organik/mandiri) tidak lagi terpapar data mock fiktif. Data mock hanya diisolasi khusus untuk akun demo presentasi.
- **Prasyarat**: Database Neon Postgres aktif (25 tabel), BetterAuth aktif, Cloudflare Workers & R2 terpasang, PayCore Duitku live.

---

## 1. Ringkasan Eksekutif

Audit menyeluruh pada 4 portal mandiri MAJIKU (`admin`, `parent`, `tutor`, `vendor`) menemukan bahwa beberapa halaman inti masih membawa data mockup statis warisan porting awal:
1. **Admin Dashboard (`/dashboard`)**: Seluruh widget (Statistik, Absensi, Billing, Tutor, Kelas, Target, Kuota, Antrean) mengimpor data statis dari `src/lib/demoData.ts`. Pengguna admin baru yang baru mendaftar langsung melihat 156 siswa fiktif dan omzet fiktif.
2. **Parent Portal (`/parent`)**: Header profil anak (`childData`) dan tab Progress & Galeri di-hardcode dengan data "Aisyah Putri" dan foto Unsplash. Akun orang tua baru yang belum mendaftarkan anak tetap melihat profil anak orang lain.
3. **Tutor Dashboard (`/tutor`)**: Widget jadwal mengajar, siswa hari ini, notifikasi, dan estimasi honor diisi array tiruan, bukan query relasi kelas guru di database.
4. **Vendor Portal (`/vendor`)**: Tab Daycare, Pengguna, dan Finansial menampilkan array `demoUsers` dan `demoDaycares`.

Solusi yang disepakati adalah **Isolasi Akun Demo (Opsi 1)**:
- Sistem mendeteksi status demo melalui identitas akun (`isDemoUser(email)`).
- Akun berakhiran `@majiku.test` atau `demo@majiku.id` menampilkan data demo presentasi.
- Akun riil (termasuk owner `moxsenna@gmail.com` dan setiap pendaftar baru) mendapatkan data DB murni. Jika data masih kosong, sistem menyajikan **Empty State & Onboarding UI** yang membimbing pengguna untuk memulai operasional pertama mereka.

---

## 2. Arsitektur Isolasi Data

### 2.1 Modul Utilitas Demo (`src/lib/demo.ts`)
```typescript
export function isDemoEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith("@majiku.test") || normalized === "demo@majiku.id";
}
```

Setiap Server Action yang menyajikan data portal memeriksa email sesi pemanggil. Bila `isDemoEmail(session.user.email) === true`, aksi mengembalikan dataset demo terisolasi. Bila `false`, aksi melakukan query agregat SQL langsung ke Neon DB.

### 2.2 Server Actions Data Riil

#### A. Admin Dashboard (`src/server/actions/adminDashboard.ts`)
- Fungsi: `getAdminDashboardOverview()`
- Mengambil metrik aktual dari Neon:
  - `activeStudentsCount`: `COUNT(students)` where `is_active = true`
  - `activeTutorsCount`: `COUNT(tutors)` where `is_active = true`
  - `activeClassesCount`: `COUNT(classes)` where `is_active = true`
  - `todayAttendanceCount`: `COUNT(attendance)` where `date = CURRENT_DATE`
  - `unpaidInvoicesSum`: `SUM(invoices.total)` where `status IN ('unpaid', 'overdue')`
  - `pendingReportsCount`: `COUNT(daily_reports)` where `status = 'draft'`
  - `recentActivity`: 5 laporan/absensi terakhir
- Untuk akun non-demo baru, jika hasil = 0, kembalikan 0 dan array kosong.

#### B. Parent Children (`src/server/actions/parentChildren.ts`)
- Fungsi: `getMyChildren()`
- Query tabel `students` where `parent_user_id = session.user.id`.
- Join dengan `student_enrollments` dan `classes` untuk mendapatkan nama kelas aktif.
- Menghitung rekap kehadiran dan laporan harian anak yang bersangkutan dari tabel `attendance` dan `daily_reports`.
- Jika parent belum memiliki anak: kembalikan `[]`.

#### C. Tutor Dashboard (`src/server/actions/tutorDashboard.ts`)
- Fungsi: `getTutorDashboardOverview()`
- Cari profil tutor via `tutors.user_id = session.user.id`.
- Query `tutor_class_assignments` join `classes` untuk mendapatkan kelas aktif tutor.
- Query siswa yang terdaftar di kelas-kelas tutor tersebut (`student_enrollments` join `students`).
- Query jadwal mengajar hari ini dari `class_schedules`.
- Jika tutor belum ditugaskan kelas: kembalikan daftar kosong dengan flag penugasan belum ada.

#### D. Vendor Superadmin Data (`src/server/actions/vendorDashboard.ts`)
- Fungsi: `getVendorPlatformOverview()`
- Query tabel `tenants` (daftar daycare/institusi terdaftar).
- Query tabel `user` & `user_roles` (rekap total pengguna dan distribusi role).
- Query rekap transaksi `payment_orders` via PayCore.

---

## 3. UI/UX dan Empty State Specification

### 3.1 Admin Portal
1. **Dashboard Kosong (First-time Admin Onboarding)**:
   - Statscards menampilkan angka `0` dengan indikator netral (bukan minus/error).
   - Menggantikan widget dummy dengan **Onboarding Action Card**:
     - Langkah 1: Buat Kelas Pertama (Tautan cepat ke `/classes` modal tambah kelas).
     - Langkah 2: Tambah Data Siswa / Terima Siswa (Tautan ke `/students` atau `/crm`).
     - Langkah 3: Tugaskan Tutor (Tautan ke `/tutors`).
   - Widget Absensi & Billing menampilkan ilustrasi empty state ramah: "Belum ada catatan absensi hari ini." dan "Belum ada tagihan aktif."

2. **CRM Tabs**:
   - Tab Pipeline tetap operasional penuh (sudah live DB).
   - Tab Automation, Marketing, Tickets, Integrations diberikan badge "Fitur Tambahan / Add-on" dengan tombol konfigurasi atau empty state yang jelas, tanpa mock fiktif yang menyesatkan.

3. **Settings**:
   - Profil daycare menampilkan nama institusi dari tenant aktif atau email admin yang login.
   - Angka ringkasan akun (Total Siswa, Staf, Kelas) diambil dari data aktual DB.

### 3.2 Parent Portal
1. **Header Profil Anak**:
   - Jika akun riil memiliki anak: tampilkan kartu anak dengan nama, kelas, dan status absensi riil.
   - Jika memiliki >1 anak: sediakan dropdown pemilih anak aktif.
   - Jika akun riil **belum memiliki anak terdaftar**:
     - Sembunyikan data palsu "Aisyah Putri".
     - Tampilkan Banner Selamat Datang: "Selamat datang di MAJIKU! Akun Anda belum terhubung dengan data siswa."
     - Tombol Aksi: `Daftar Trial / Kelas Sekarang` (`/parent/registration`).
2. **Tab Progress**:
   - Mengambil rekap nyata dari `daily_reports` anak yang bersangkutan.
   - Jika belum ada laporan: tampilkan state kosong: "Belum ada catatan harian dari guru untuk anak Anda."
3. **Tab Galeri**:
   - Menampilkan foto R2 nyata dari `gallery_photos` atau foto laporan harian anak yang bersangkutan.
   - Hapus gambar Unsplash dan tombol heart fiktif untuk akun non-demo.
4. **Pembersihan Rute Lama**:
   - Route `/parent/payment` diarahkan otomatis (redirect) ke `/parent/billing` untuk menghindari duplikasi UX pembayaran.

### 3.3 Tutor Portal
1. **Dashboard Guru**:
   - Menampilkan nama kelas dan siswa riil yang dibimbing tutor.
   - Jika guru baru login dan belum di-assign oleh admin: tampilkan banner informatif "Akun Anda telah terdaftar sebagai Tutor. Harap hubungi Admin Daycare untuk penugasan kelas."
2. **KPI & Panduan**:
   - KPI dihitung berdasarkan aktivitas nyata (jumlah laporan harian disubmit / absensi tercatat).
   - Panduan menyajikan artikel onboarding standar guru tanpa angka capaian palsu.

---

## 4. Rencana Akun Uji Coba & Verifikasi

Untuk memverifikasi kesiapan produksi dan integritas isolasi data, disiapkan skenario akun:

1. **Akun Demo (Existing/Seeded)**:
   - `admin@majiku.test` -> Melihat dashboard demo penuh (untuk presentasi/sales).
   - `rina@majiku.test` -> Melihat tutor dashboard demo.
   - `parent@majiku.test` -> Melihat parent portal demo (Aisyah Putri).

2. **Akun Produksi / Real Baru (Verification Test Cases)**:
   - **Kasus Uji A (Admin Baru Bersih)**: Signup atau login admin riil -> Dashboard angka 0, onboarding cards tampil, buat 1 kelas & 1 siswa -> angka bertambah secara reaktif di dashboard.
   - **Kasus Uji B (Parent Baru Bersih)**: Signup parent riil -> Header tidak ada Aisyah Putri, ajakan daftar trial muncul, submit wizard trial -> status trial muncul di portal secara dinamis.
   - **Kasus Uji C (Tutor Baru Bersih)**: Signup tutor riil -> Status penugasan kelas bersih, tidak ada jadwal palsu.

---

## 5. Keamanan & Performa

1. **Session & Security Scoping**:
   - Semua Server Action mengambil identitas pemanggil dari `auth.api.getSession({ headers })`. ID user tidak pernah diterima dari payload klien.
   - Query parent difilter ketat `parent_user_id = session.user.id`. Parent dilarang melihat data anak milik parent lain.
2. **Kompatibilitas Cloudflare Workers & Neon HTTP Driver**:
   - Semua query menggunakan stateless HTTP driver neon `@neondatabase/serverless` tanpa stateful transaction locks berlebih.
   - Komponen App Router dioptimalkan dengan React `useQuery` / Server Component props untuk latensi minimal.
