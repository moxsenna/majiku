# Surface brief — Homepage (`/`, route `(public)/page.tsx` → view `SaasLanding.tsx`)

## Scope & visitor mode

- **Mode: Persuade** — landing page B2B. Pengunjung: pemilik lembaga daycare/preschool/TK/bimbel yang memutuskan mencoba platform.
- Aksi yang datang dicari: mencoba platform sebelum bayar → **Coba 14 Hari Gratis** → `/admin/register`.
- Permintaan user 2026-11-20: hapus semua klaim bohong, selaraskan dengan ide bisnis (trial 14 hari dulu), perbaiki UI/UX. Komposisi terpilih: **"Sehari di Bunayo"**.

## Audience, job, proof

- Audience: pemilik/owner lembaga (desktop + mobile), membaca di sela operasional.
- Bukti yang diizinkan (terkonfirmasi user): screenshot portal asli (`/previews/*-real.webp`, beri keterangan data demo), akun demo interaktif (`DemoAccessModal`, aksi kedua), cara kerja + fitur inti.
- **Dihapus karena bohong**: "Platform #1", "500+ Lembaga Aktif/Terverifikasi", "25K+ Siswa Terkelola", "98% Kepuasan", "24/7 Support", 3 testimoni fiktif, "Dipercaya ratusan lembaga", "Bergabung dengan 500+ lembaga".
- Seksi lembaga unggulan (featured tenants) dikeluarkan dari homepage (tidak dipilih sebagai bukti); tetap ada di `/marketplace` via link footer.
- Hindari klaim fitur yang belum betul: jangan klaim QR absensi di landing (scanner QR dilaporkan audit belum berfungsi) — pakai "absensi & kehadiran digital". Harga tetap dari `SUBSCRIPTION_PLANS` (sumber kebenaran billing), tampil penuh format id-ID.

## Direction contract

**THESIS.** Homepage ini adalah satu hari lembaga yang diceritakan jam demi jam — bukan daftar fitur. Kategori SaaS selalu membuka dengan klaim kepemilihan ("Platform #1") dan barisan angka palsu; halaman ini membuka dengan bukti mekanisme: guru mencatat sekali, semua orang tahu. Setiap babak hari memakai warna krayon dan data nyata; apa pun yang tidak bisa ditunjukkan tidak diklaim.

**OWN-WORLD.** Kit Bunayo "Papan Kelas Ceria" penuh: kertas hangat (#FFFCF5) di atas kanvas (#EDE6D9), kartu putih bergaris 1px (radius 12px), Tinta untuk teks, satu aksi biru (#2046C4), enam krayon muncul lewat rail timeline dan ikon ber-tinta, Bricolage Grotesque untuk display, IBM Plex Sans untuk isi, mono tabular untuk jam dan Rupiah. Stabilo hanya sekali. Tanpa gradient text, tanpa glass, tanpa angka karangan.

**STORY.** Pengunjung memahami dalam satu viewport: produk ini menghubungkan kelas dan rumah lewat satu hari nyata (07:15 tiba → kabar → foto → SPP terbayar), bisa dicoba 14 hari gratis tanpa kartu kredit, dan harga aslinya transparan. Yang ia percaya: produknya benar-benar ada (screenshot asli), dan ia bisa melihatnya lebih dulu lewat akun demo sebelum daftar.

**FIRST VIEWPORT.** Nav 64px: logo Bunayo asli (`public/brand/bunayo-mark.png` + wordmark), tautan "Cara kerja · Harga · Masuk Portal (dropdown 3 portal + demo)", tombol biru "Coba 14 hari gratis". Di bawahnya hero dua kolom: kiri headline display (Bricolage 800) tanpa eyebrow, satu paragraf isi, CTA biru besar + tombol outline "Lihat demo interaktif", baris fakta "Gratis 14 hari · tanpa kartu kredit". Kanan: HP (frame tinta) berisi screenshot portal ortu asli + chip notifikasi "07:15 · Sudah tiba" dengan tiba-dot. Babak 07:15 dari timeline mulai tepat di bawah lipatan.

**FORM.** Struktur "Sehari di Bunayo" — pilihan pertama dari lima struktur (lainnya: Papan Kelas split, Krayon-field hero, Ledger editorial, device-led split). seed: none (unavailable) — engine concept-seed tidak tersedia di Windows; roll digantikan hand dengan 3 kartu struktur via pertanyaan terstruktur, dipilih "Sehari di Bunayo".

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
