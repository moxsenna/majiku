# MAJIKU — SaaS Manajemen Daycare, Preschool & Bimbel

**MAJIKU** adalah platform SaaS all-in-one untuk manajemen daycare, preschool/TK, dan lembaga bimbingan belajar di Indonesia. Platform ini mencakup sistem manajemen operasional lembaga, portal interaktif orang tua murid, dashboard produktivitas guru/tutor, serta marketplace publik pencarian lembaga.

- **Domain Utama**: [majiku.web.id](https://majiku.web.id)
- **Dokumentasi Kredensial Uji Coba**: [docs/TEST_ACCOUNTS.md](docs/TEST_ACCOUNTS.md)

---

## 4 Portal Mandiri (Subdomain Isolation)

1. **Portal Publik & Marketplace**: [majiku.web.id](https://majiku.web.id)  
   Landing page informatif, katalog direktori lembaga, detail program, dan tombol akses 1-click Demo interaktif.
2. **Admin Daycare**: [admin.majiku.web.id](https://admin.majiku.web.id)  
   Manajemen siswa, rombel/kelas, penugasan tutor, absensi QR code, CRM trial pipeline, tagihan SPP bulanan, dan jadwal mingguan.
3. **Portal Orang Tua**: [parent.majiku.web.id](https://parent.majiku.web.id)  
   Aplikasi mobile untuk orang tua memantau kehadiran anak, membaca laporan harian (makan, tidur, mood, aktivitas), melihat galeri foto kegiatan, dan membayar tagihan SPP online via QRIS/VA.
4. **Portal Guru / Tutor**: [tutor.majiku.web.id](https://tutor.majiku.web.id)  
   Jadwal mengajar harian, absensi siswa per sesi, upload dokumentasi dan laporan perkembangan anak ke Cloudflare R2, serta review trial calon murid.
5. **Super Admin Platform**: [vendor.majiku.web.id](https://vendor.majiku.web.id)  
   Monitoring ekosistem multi-tenant, rekap pengguna seluruh Indonesia, dan analitik transaksi.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Runtime & Deployment**: Cloudflare Workers via `@opennextjs/cloudflare`
- **Database**: Neon PostgreSQL (Serverless HTTP Driver, stateless queries)
- **ORM**: Drizzle ORM
- **Authentication**: BetterAuth (email/password, session cookie cross-subdomain `.majiku.web.id`)
- **Storage**: Cloudflare R2 (`majiku-photos`)
- **Payment Gateway**: AppVibe PayCore (Duitku QRIS & Virtual Account)
- **UI & Styling**: Tailwind CSS, Radix UI, shadcn/ui, Lucide Icons

---

## Kredensial Uji Coba & Demo

Lihat panduan lengkap dan tabel kredensial di [docs/TEST_ACCOUNTS.md](docs/TEST_ACCOUNTS.md).

### Ringkasan Cepat:
- **Admin Daycare (Data Riil)**: `admin.test@gmail.com` / `Password123!`
- **Guru / Tutor (Data Riil)**: `tutor.test@gmail.com` / `Password123!`
- **Orang Tua (Data Riil)**: `parent.test@gmail.com` / `Password123!`
- **Demo Interaktif (Simulasi)**: Akses langsung via tombol **"Lihat Demo"** di landing page [majiku.web.id](https://majiku.web.id) (atau login manual dengan password `Password123!`).

---

## Menjalankan Proyek Secara Lokal

```bash
# 1. Install dependensi
npm install

# 2. Jalankan server development
npm run dev

# 3. Jalankan build produksi Next.js
npm run build

# 4. Verifikasi isolasi akun demo vs data riil
npx tsx scripts/verify-production-isolation.ts
```
