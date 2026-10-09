# Kredensial Akun Test & Akses Demo MAJIKU

Dokumen ini mencatat seluruh akun pengujian dan akun demo simulasi yang terdaftar di database Neon PostgreSQL untuk platform **MAJIKU**.

---

## 1. Akun Test Bersih (Data Riil / Produksi)

Akun-akun ini digunakan untuk menguji fungsionalitas nyata aplikasi dari sudut pandang pengguna baru organik (non-demo). Akun ini **tidak terpapar data mock fiktif**, dan akan menampilkan data nyata dari database atau *Empty State & Onboarding Cards*.

| Portal | URL Login | Email | Password | Role | Kondisi Awal |
|---|---|---|---|---|---|
| **Admin Daycare** | [admin.majiku.web.id/login](https://admin.majiku.web.id/login) | `admin.test@gmail.com` | `Password123!` | `admin` | Data operasional riil DB Neon (siswa, rombel, absensi aktual). Jika 0, menampilkan panduan onboarding 3 langkah. |
| **Guru / Tutor** | [tutor.majiku.web.id/login](https://tutor.majiku.web.id/login) | `tutor.test@gmail.com` | `Password123!` | `tutor` | Akun baru belum ditugaskan kelas. Menampilkan banner informatif menunggu penugasan admin daycare. |
| **Orang Tua / Parent** | [parent.majiku.web.id/login](https://parent.majiku.web.id/login) | `parent.test@gmail.com` | `Password123!` | `parent` | Akun baru tanpa anak terdaftar. Profil fiktif disembunyikan; menampilkan hero ajakan pendaftaran trial/kelas. |
| **Owner / Superadmin** | [admin.majiku.web.id/login](https://admin.majiku.web.id/login) | `moxsenna@gmail.com` | *(kredensial pribadi)* | `admin` | Akun owner platform dengan akses penuh admin daycare. |

---

## 2. Akun Demo Simulasi (Dataset Presentasi & Sales Pitch)

Akun-akun ini terisolasi khusus untuk kebutuhan demonstrasi, presentasi ke calon klien (B2B daycare), dan pitch sales. Sistem secara otomatis mendeteksi domain `@majiku.test` dan menyajikan dataset simulasi lengkap (156 siswa demo, rekap omzet 234M, profil anak Aisyah Putri, rekap laporan harian, dll.).

| Peran Demo | Email | Password | URL Tujuan | Fitur Simulasi yang Tampil |
|---|---|---|---|---|
| **Admin Demo** | `admin@majiku.test` | `Password123!` | `/dashboard` | 156 siswa simulasi, absensi 94%, pending report approval, revenue widgets, kapasitas kelas. |
| **Guru / Tutor Demo** | `rina@majiku.test` | `Password123!` | `/tutor` | Bu Rina mengajar 4 kelas, estimasi gaji/fee mengajar, 4 siswa aktif, laporan harian siap submit. |
| **Orang Tua Demo** | `parent@majiku.test` | `Password123!` | `/parent` | Profil anak Aisyah Putri (5 thn), check-in 07:45, timeline laporan harian, rekap makan & tidur. |
| **General Demo** | `demo@majiku.id` | `Password123!` | `/dashboard` | Alias admin demo serbaguna. |

---

## 3. Akses Demo 1-Click dari Landing Page

Calon pengguna atau investor dapat langsung mencoba demo tanpa perlu registrasi atau mengetikkan kredensial:
1. Kunjungi landing page [majiku.web.id](https://majiku.web.id) (atau `localhost:3000`).
2. Klik tombol **"Lihat Demo"** pada Hero banner, menu navigasi **"Coba Akun Demo"**, atau tombol demo di tiap bagian fitur aplikasi.
3. Modal dialog interaktif akan muncul dengan 3 pilihan peran:
   - **Admin Daycare** -> Otomatis login sebagai `admin@majiku.test` dan masuk ke `/dashboard`.
   - **Orang Tua Siswa** -> Otomatis login sebagai `parent@majiku.test` dan masuk ke `/parent`.
   - **Guru / Tutor** -> Otomatis login sebagai `rina@majiku.test` dan masuk ke `/tutor`.

---

## 4. Script Pemeliharaan Database

Jika database Neon di-reset atau membutuhkan re-seeding akun:

```bash
# 1. Pastikan environment Neon aktif
# (membaca kredensial dari .env.local)

# 2. Buat / perbarui akun test bersih
npx tsx scripts/seed-clean-test-users.ts

# 3. Pastikan password akun demo terpasang
npx tsx scripts/set-demo-passwords.ts

# 4. Jalankan pengujian verifikasi isolasi data
npx tsx scripts/verify-production-isolation.ts
```
Semua skrip di atas idempotent (aman dijalankan berulang kali tanpa membuat duplikasi user).
