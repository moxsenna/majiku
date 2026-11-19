# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Orang tua (Ortu)** — Bunda/Ayah yang menitipkan anak di daycare, preschool, atau bimbel. Membuka portal di HP Android kelas menengah, sering lewat PWA yang terpasang di layar utama, di sela kerja atau sore saat menjemput. Tugas: tahu anak sudah tiba/pulang, membaca kabar harian (makan, tidur, mood, aktivitas, foto), membalas pesan guru, membayar SPP.
- **Guru / tutor** — memakai HP pribadi di dalam kelas, sering satu tangan sambil mengawasi anak. Tugas: check-in kehadiran diri, absen anak per sesi, memposting kabar harian dan foto ke banyak anak sekaligus, membalas pesan ortu, melihat jadwal dan KPI.
- **Admin lembaga** — memakai portal admin desktop (di luar cakupan redesign Ortu & Guru).

## Product Purpose

Bunayo adalah SaaS manajemen daycare, preschool/TK, dan bimbel di Indonesia. Portal Ortu dan Guru adalah jembatan harian antara kelas dan rumah: guru mencatat sekali, orang tua langsung tahu. Sukses = orang tua merasa dekat dengan hari anaknya dan guru menyelesaikan pencatatan tanpa meninggalkan anak-anak.

## Positioning

Satu sistem lembaga yang sama menghubungkan absen, laporan harian, chat, dan tagihan, sehingga kabar yang dibaca orang tua adalah data nyata dari kelas (bukan grup WhatsApp yang berantakan).

## Operating Context

- Ortu: HP Android menengah, koneksi sering lambat, PWA standalone, buka singkat beberapa kali sehari.
- Guru: HP pribadi di kelas, satu tangan, waktu sangat terbatas, cahaya ruang kelas.
- Lembaga multi-tenant; nama lembaga nyata tampil di portal.
- Pembayaran SPP lewat PayCore (QRIS / Virtual Account).

## Capabilities and Constraints

- Stack: Next.js 15 App Router, React 19, Tailwind + shadcn/Radix, Lucide, Drizzle + Neon, Cloudflare Workers (OpenNext), R2 untuk foto.
- Portal Ortu (`src/app/(parent)`): 4 tab Beranda · Tagihan · Pesan · Profil; pemilih anak; marketplace/katalog/pendaftaran di bawah Profil.
- Portal Guru (`src/app/(tutor)`): 4 tab Hari Ini · Kelas · Pesan · Saya; absen, progres/laporan harian, jadwal, KPI, trial.
- Redesign tampilan saja: server action, alur data, dan route tetap. Tidak boleh ada data palsu (rekening, promo, testimoni).
- Token visual Ortu & Guru di-scope terpisah; portal admin tetap memakai kit Bunayo yang sekarang.
- Performa: koneksi lambat → aset ringan, efek berat dibatasi.

## Brand Commitments

- Nama **Bunayo** dan logonya (`public/brand/`) wajib dipertahankan; warna logo (biru, kuning, hijau, hijau daun) tetap bagian palet.
- Bahasa Indonesia yang hangat; istilah yang sudah ada (Kabar, Tagihan, Hari Ini, Saya, Pesan) dipertahankan.
- Mode terang dan gelap keduanya didukung.
- Target rasa (permintaan user 2026-11-19): aplikasi premium yang ceria saat dibuka di browser mobile/PWA — tidak generik, tidak murahan.

## Evidence on Hand

- Logo & ikon: `public/brand/bunayo-logo.png`, `bunayo-mark.png`, ikon PWA.
- Data nyata dari DB (anak, absen, laporan, foto R2, tagihan). Akun demo memakai data simulasi berlabel.
- Tidak ada testimoni, angka pengguna, atau rekening bank yang boleh dikarang.

## Product Principles

1. Kabar anak dulu: yang paling ingin diketahui orang tua (sudah tiba? bagaimana harinya?) tampil sebelum hal lain.
2. Guru satu tangan: aksi kelas harus selesai dalam beberapa ketukan, target sentuh besar.
3. Jujur: hanya menampilkan data nyata; fitur yang belum ada disembunyikan, bukan dipalsukan.
4. Terasa seperti app, bukan situs: cepat dibuka, stabil di koneksi lambat, nyaman sebagai PWA.

## Accessibility & Inclusion

Kontras teks minimal WCAG AA, target sentuh ≥ 44 px, hormati `prefers-reduced-motion`, bahasa sederhana untuk orang tua dengan literasi digital beragam.
