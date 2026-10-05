# Verifikasi Alur Trial (Fase 3a) & Panduan QA Staging

**Tanggal**: 2026-10-05  
**Branch**: `feat/fase3-trial-crud`  
**Staging URL**: `https://majiku.moxsenna.workers.dev`  
**Wrangler Account**: Moxsenna@gmail.com (`06738739e65bc88a495de618cabfa5ca`)  
**Deployment Tool**: OpenNext Cloudflare (`opennextjs-cloudflare deploy`)  
**Deployed Worker Version ID**: `c00925d8-f17a-420e-8ce8-21a38ff8193e`  
**Status Staging**: Deployed sukses ke Cloudflare Workers; incoming live HTTP requests terkena rate limit kuota harian Workers Free (Error 1027 / HTTP 429), verifikasi browser langsung di staging live ditunda hingga reset kuota harian Cloudflare (UTC midnight). Seluruh verifikasi lokal (typecheck, lint, build, smoke rute public & protected, seed idempotent) 100% lulus.

---

## 1. Hasil Verifikasi Teknis Lokal

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
 ✓ Compiled successfully in 8.4s
   Checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (36/36)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                    8.39 kB         123 kB
├ ○ /_not-found                            146 B         103 kB
├ ƒ /api/auth/[...all]                     146 B         103 kB
├ ○ /attendance                          5.15 kB         155 kB
├ ƒ /auth/[mode]                         7.74 kB         166 kB
├ ○ /billing                             2.96 kB         153 kB
├ ○ /birthdays                           3.09 kB         144 kB
├ ○ /classes                             7.59 kB         175 kB
├ ƒ /crm                                 23.1 kB         183 kB
├ ○ /daily-reports                       3.36 kB         144 kB
├ ○ /dashboard                           24.3 kB         200 kB
├ ○ /gallery                             3.21 kB         144 kB
├ ○ /lesson-plans                        10.9 kB         171 kB
├ ƒ /marketplace                           173 B         106 kB
├ ƒ /marketplace/[slug]                    173 B         106 kB
├ ○ /messages                            5.85 kB         265 kB
├ ƒ /parent                              13.4 kB         134 kB
├ ○ /parent/billing                      9.71 kB         143 kB
├ ○ /parent/catalog                      5.13 kB         129 kB
├ ○ /parent/chat                         5.45 kB         120 kB
├ ƒ /parent/invoice/[id]                 6.07 kB         129 kB
├ ƒ /parent/marketplace                    173 B         106 kB
├ ○ /parent/payment                      6.34 kB         121 kB
├ ○ /parent/profile                      6.21 kB         120 kB
├ ○ /parent/registration                 12.6 kB         162 kB
├ ○ /robots.txt                            146 B         103 kB
├ ○ /schedule                             2.7 kB         143 kB
├ ○ /settings                            3.32 kB         144 kB
├ ƒ /site/[type]                           166 B         106 kB
├ ○ /sitemap.xml                           146 B         103 kB
├ ○ /students                            3.56 kB         144 kB
├ ○ /tutor                               13.2 kB         145 kB
├ ○ /tutor-payout                        5.32 kB         155 kB
├ ○ /tutor/attendance                      13 kB         165 kB
├ ○ /tutor/chat                          6.46 kB         125 kB
├ ○ /tutor/guides                        6.76 kB         121 kB
├ ○ /tutor/kpi                           10.2 kB         126 kB
├ ○ /tutor/progress                      6.38 kB         130 kB
├ ƒ /tutor/trials                        11.8 kB         135 kB
├ ○ /tutors                              6.53 kB         174 kB
└ ○ /vendor                              31.8 kB         296 kB
+ First Load JS shared by all             103 kB

ƒ Middleware                             34.5 kB
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

### D. Seed Demo Trial Pipeline (`scripts/seed-trial-demo.ts`)
Eksekusi idempotent dengan deterministic IDs (`trialsub1`, `trialsch1`, `trialrec1`):
```
┌─────────┬───────────────┬───────┐
│ (index) │ status        │ count │
├─────────┼───────────────┼───────┤
│ 0       │ 'recommended' │ 1     │
│ 1       │ 'scheduled'   │ 1     │
│ 2       │ 'submitted'   │ 2     │
└─────────┴───────────────┴───────┘
```
Status pipeline terdistribusi siap untuk demonstrasi CRM dan Tutor review.

---

## 2. Smoke Test Rute (Lokal Production Port 3000)

| Rute | Tipe | Akses Tanpa Cookie | Lokasi Redirect |
|---|---|---|---|
| `/` | Public Landing | `200 OK` | - |
| `/marketplace` | Public Directory | `200 OK` | - |
| `/site/daycare` | Public Microsite | `200 OK` | - |
| `/dashboard` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Fdashboard` |
| `/students` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Fstudents` |
| `/attendance` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Fattendance` |
| `/billing` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Fbilling` |
| `/tutor-payout` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Ftutor-payout` |
| `/classes` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Fclasses` |
| `/tutors` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Ftutors` |
| `/schedule` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Fschedule` |
| `/birthdays` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Fbirthdays` |
| `/lesson-plans` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Flesson-plans` |
| `/crm` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Fcrm` |
| `/settings` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Fsettings` |
| `/vendor` | Protected (Admin) | `307 Temporary Redirect` | `/auth/login?next=%2Fvendor` |
| `/tutor` | Protected (Tutor) | `307 Temporary Redirect` | `/auth/login?next=%2Ftutor` |
| `/tutor/trials` | Protected (Tutor) | `307 Temporary Redirect` | `/auth/login?next=%2Ftutor%2Ftrials` |
| `/parent` | Protected (Parent) | `307 Temporary Redirect` | `/auth/login?next=%2Fparent` |
| `/parent/registration` | Protected (Parent) | `307 Temporary Redirect` | `/auth/login?next=%2Fparent%2Fregistration` |

---

## 3. Panduan QA Manual End-to-End (Alur Lengkap Trial & Seleksi)

Berdasarkan arsitektur dan spesifikasi desain `.lovable/plan/alur-trial-dan-seleksi-kelas-2026-10-04.md`:

### A. Persiapan Akun & Kredensial
User bawaan di seed database (`usr_admin`, `usr_tutor`, `usr_parent`) tidak memiliki password akun BetterAuth. Untuk pengujian manual browser:
1. Buka browser dan arahkan ke `/auth/login` (atau klik "Daftar Akun Baru").
2. Buat 3 akun baru:
   - Akun Parent: e.g. `qa_parent@majiku.test` (password: `Password123!`)
   - Akun Admin: e.g. `qa_admin@majiku.test` (password: `Password123!`)
   - Akun Tutor: e.g. `qa_tutor@majiku.test` (password: `Password123!`)
3. Jalankan assignment role via script:
   - Edit atau sesuaikan `scripts/assign-role.ts` untuk email-email di atas:
     ```ts
     await assign("qa_admin@majiku.test", "admin");
     await assign("qa_tutor@majiku.test", "tutor");
     await assign("qa_parent@majiku.test", "parent");
     ```
   - Jalankan `npx tsx scripts/assign-role.ts`.
4. Untuk akun Tutor: pastikan baris tutor di tabel `tutors` (misal `tut_1`) memiliki `userId` yang merujuk ke user tutor tersebut agar antrean `/tutor/trials` memfilter data miliknya dengan benar.

---

### B. Langkah Pengujian Positif (3 Profil Browser / Incognito)

#### Profil 1 — Sisi Orang Tua (Parent)
1. Login sebagai `qa_parent@majiku.test` di Browser Profil 1.
2. Buka halaman `/parent/registration`.
3. Lengkapi formulir wizard 4 langkah:
   - **Langkah 1 (Program)**: Pilih salah satu program (e.g. Toddler Class).
   - **Langkah 2 (Data Anak)**: Isi nama lengkap anak (e.g. "Arka Pratama"), tanggal lahir, catatan alergi/medis.
   - **Langkah 3 (Data Orang Tua)**: Isi nama orang tua, nomor telepon, alamat, kontak darurat.
   - **Langkah 4 (Konfirmasi)**: Periksa ringkasan dan klik tombol "Kirim Pendaftaran Trial".
4. **Hasil**: Muncul toast "Pengajuan trial terkirim. Tim kami akan segera menghubungi Anda." dan browser otomatis redirect ke `/parent`.
5. Di `/parent`, periksa kartu pada section **"Status Trial & Pendaftaran"**:
   - Status badge: `Calon Murid` (warna kuning).
   - Keterangan: "Menunggu dijadwalkan admin".

---

#### Profil 2 — Sisi Administrator (CRM Pipeline)
1. Login sebagai `qa_admin@majiku.test` di Browser Profil 2.
2. Buka halaman `/crm` dan pilih tab **"Pipeline Trial"**.
3. Cari kartu "Arka Pratama" pada kolom **Calon Murid** (paling kiri).
4. Klik tombol **"Jadwalkan"** pada kartu.
5. Pada modal `ScheduleTrialDialog`:
   - Tentukan tanggal & jam trial (e.g. besok pukul 09:00).
   - Pilih Tutor pengampu (e.g. Bu Rina Wulandari).
   - Pilih Kelas (e.g. Baby Bee).
   - Klik **"Simpan Jadwal"**.
6. **Hasil**: Muncul toast sukses, halaman me-refresh, dan kartu berpindah ke kolom **"Trial Dijadwalkan"** lengkap dengan badge nama tutor dan kelas.

---

#### Profil 3 — Sisi Tutor (Antrean Observasi & Rekomendasi)
1. Login sebagai `qa_tutor@majiku.test` di Browser Profil 3.
2. Klik menu **"Trial"** di sidebar atau navigasi ke `/tutor/trials`.
3. Di antrean trial, temukan sesi atas nama "Arka Pratama".
4. Klik tombol **"Tandai Sesi Selesai"**.
5. **Hasil**: Status trial berubah menjadi `Menunggu Review Tutor`. Form evaluasi observasi muncul secara inline:
   - Textarea **Catatan Observasi**: Isi "Anak sangat antusias, motorik kasar sesuai usia, nyaman berinteraksi dengan teman sebaya."
   - Pilihan Rekomendasi: Pilih **"Cocok (Direkomendasikan Masuk)"**.
6. Klik **"Kirim Rekomendasi"**.
7. **Hasil**: Stored procedure `submit_trial_review` dieksekusi dengan aman. Toast konfirmasi muncul, dan kartu selesai keluar dari antrean aktif tutor.

---

#### Profil 2 — Sisi Administrator (Admisi Murid Baru)
1. Kembali ke Browser Profil 2 (`/crm`).
2. Periksa kolom **"Direkomendasikan"**: kartu "Arka Pratama" kini berada di kolom ini dengan badge hijau dan nama kelas yang direkomendasikan.
3. Klik tombol **"Terima"** pada kartu.
4. Pada dialog konfirmasi penerimaan:
   - Periksa ringkasan anak & kelas tujuan.
   - Klik konfirmasi "Ya, Daftarkan Murid".
5. **Hasil**: Stored procedure `admit_trial_candidate` berjalan secara transaksional:
   - Status trial berubah menjadi `admitted` (`Diterima`).
   - Kartu trial berpindah ke kolom **"Diterima"**.
6. Buka halaman `/students` (atau periksa tabel `students` & `student_enrollments` di database):
   - Record murid "Arka Pratama" telah tercipta otomatis.
   - Enrollment kelas "Baby Bee" otomatis aktif.
7. Kembali ke Profil 1 (Parent `/parent`): status trial berubah menjadi `Diterima! Selamat bergabung`.

---

### C. Pengujian Kasus Negatif & Guard Kritis

1. **Admisi Tanpa Review (Bypass Guard)**:
   - Tombol "Terima" hanya muncul di kolom Direkomendasikan. Jika `admitTrial` dipanggil langsung dari status `submitted` atau `scheduled`, stored procedure di database menolak dengan exception:
     `Trial must be in 'recommended' status to be admitted`.
2. **Review Tanpa Catatan Observasi**:
   - Jika tutor mencoba mengirim review dengan catatan observasi kosong atau hanya spasi:
     - Client form menolak dengan peringatan validasi.
     - Stored procedure memiliki guard `LENGTH(TRIM(p_notes)) > 0`, melempar error `Observation notes cannot be empty`.
3. **Idempotensi Admisi (Double Admit Guard)**:
   - Jika admin memicu admisi dua kali pada trial yang sama, stored procedure mengecek `v_trial.status = 'admitted'` dan mengembalikan ID murid yang sudah ada tanpa menduplikasi baris siswa atau baris enrollment.
4. **Otorisasi Role Boundary**:
   - Tutor hanya dapat melihat dan me-review trial yang di-assign ke `tutor_id` miliknya (dicek via `tutors.user_id = session.user.id`).
   - Parent hanya dapat melihat trial pengajuan dengan `parent_user_id = session.user.id`.
   - Admin memiliki akses pipeline lengkap.
