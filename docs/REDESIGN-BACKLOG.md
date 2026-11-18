# Backlog Redesign Bunayo — bagian BARU (belum didukung data)

Bagian berikut ada di desain tetapi datanya/backend-nya belum ada. Tidak dibangun tanpa persetujuan. Di UI: disembunyikan, atau EmptyState jujur bila penting bagi alur.

| Layar | Bagian | Data/backend yang dibutuhkan | PRD | Perlakuan UI |
|---|---|---|---|---|
| A1 | Pesan > 4 jam | Kotak masuk admin↔ortu | COM-07, BRF-01 | Disembunyikan |
| A1 | Kelas tanpa guru | Sesi konkret + pengganti | SCH-08, STF-04 | Disembunyikan |
| A1 | Tagihan belum terbit sesuai jadwal | Jadwal penagihan otomatis | BIL-04, BIL-06 | Disembunyikan |
| A2 / GV4 | Kesehatan, alergi, penjemput, kontak darurat | Kolom di `students` / tabel penjemput | STU-07, STU-08 | Disembunyikan |
| A2 | Riwayat perubahan | Audit log | STU-01 | Disembunyikan |
| A3 | Impor Excel (seluruh alur) | Parser + validasi + insert massal | ONB-03 | Tombol disembunyikan |
| A4 | Tahap Hadir otomatis, statistik konversi | Event kehadiran trial, agregasi | GRW-06, GRW-07 | Disembunyikan |
| A4 / A5 | Alasan tidak lanjut | Kolom alasan di `trial_applications` | GRW-05 | Disembunyikan |
| A6 / G1 / P1 | Undangan token sekali pakai, status Diundang/Aktif, OTP WA | Tabel undangan + OTP | RBAC-06, PAR-01 | Hanya tautan `wa.me` + tautan daftar |
| D1 | Paket & item biaya, tanggal mulai tagihan | Tabel paket/item | BIL-01..03, BIL-05 | Nominal bawaan dari harga kelas |
| K1 | Settlement/pencairan (panel "Pencairan ke rekening") | Data settlement PayCore | BIL-18 | Disembunyikan; aging & per kelas sudah ditampilkan (2026-11-18) |
| K2 | Ledger bayar sebagian + kredit lebih bayar | Tabel pembayaran parsial | BIL-13 | Ledger invoice-granular (tagihan/bayar/saldo, bayar = nominal penuh); invoice gabungan keluarga (family_invoices) belum — P1 menerbitkan per anak |
| K3 | Bayar sebagian, bukti foto, metode pembayaran, audit "dicatat oleh" | Tabel pembayaran + kolom metode/catat-oleh | BIL-08, BIL-19, RBAC-05 | Tombol "Catat pembayaran" = Lunas penuh (action lama `markInvoicePaid`) |
| K5 | Paket, item biaya, kuota sesi | Tabel paket | BIL-01..03, BIL-11 | Read-only dari kelas |
| K6 | Seluruh pengaturan penagihan | Tabel pengaturan tenant | BIL-04..10, BIL-21 | Disembunyikan |
| K7 | Settlement | Data settlement PayCore | BIL-17, BIL-18 | Disembunyikan |
| K8 | Sesi nyata dari absen guru | Relasi absen guru ↔ sesi | STF-05 | Label jujur / disembunyikan |
| K1/P1 | Pecahan metode QRIS vs Virtual Account | Kolom metode di `payment_orders` | BIL-17 | Cara bayar hanya Online vs dicatat admin |
| P1 | Pengingat otomatis + riwayat pengingat ("WA 17 Nov · dibuka") | Tabel pengingat + status kirim/baca | BIL-06, BIL-09, N25 | Ingatkan manual via `wa.me`; kolom Pengingat disembunyikan |
| P1 | Jadwal terbit bulanan ("terlewat 2 hari") | Pengaturan jadwal penagihan (K6) | BIL-04, BIL-06, N24 | Tanpa catatan jadwal; daftar Perlu Ditagih ditampilkan apa adanya |
| P1 | Satu tagihan gabungan per keluarga | `family_invoices` + `invoice_items` | BIL-05 | Terbitkan per anak; dicatat di bawah tabel |
| P1/K7 | Ekspor resmi (CSV per header desain) | Format ekspor disepakati | BIL-16 | CSV sederhana dari data tabel aktif |
| O2 | Sesi konkret, deteksi tanpa guru | Tabel sesi | SCH-07, SCH-08 | Jadwal mingguan saja |
| O3 | Matriks cakupan, saran pengganti | Sesi + ketersediaan | SCH-09 | Disembunyikan |
| O4 | Dampak libur ke sesi/kuota/tagihan | Sesi + penagihan | CTR-04 | Disembunyikan |
| O5 | Koreksi dengan audit, scan QR | Audit log, pemindai | ATT-06, ATT-09 | Disembunyikan |
| O6 / G2 | GPS, tepat waktu, persetujuan izin | Kolom lokasi, action approve | STF-01..04 | Disembunyikan |
| O7 / G6 | Feed event berwaktu, ringkasan otomatis 16.00 | Tabel event | COM-02, COM-10 | Disembunyikan |
| O9 / G12 / P10 | Modul perkembangan | Tabel perkembangan | LRN-01..06, PAR-08 | Tidak dibuat |
| O10 / P6 | Kotak masuk admin, percakapan per anak dengan lembaga | Percakapan lembaga | COM-07 | EmptyState jujur |
| O11 | Audiens, jadwal kirim, tingkat baca | Kolom audiens/jadwal/read | COM-08 | Disembunyikan |
| O13 | Peran per lembaga, undangan staf | Tabel peran tenant | RBAC-01, RBAC-02 | Disembunyikan |
| G4 / O5 | Scan QR anak aktif | Pemindai + QR per anak | ATT-01..03 | Disembunyikan (N27) |
| G5 | Izin publikasi foto | Kolom izin per anak | COM-11 | Disembunyikan |
| G7 / P8 | Verifikasi penjemput, QR jemput | Tabel penjemput | ATT-07, STU-08 | Tidak dibuat |
| G13 | Antrean offline | Service worker + antrean | INS-07, ATT-10 | Tidak dibuat |
| OV4 / P9 | Notifikasi layar kunci, preferensi kanal | Push + preferensi | BRF-04, ATT-03 | Tidak dibuat |
| P3 | Izin/sakit dari aplikasi | Action ortu → `attendance.permit` | ATT-04, PAR-05 | Tidak dibuat |
| P4 | Ganti jadwal mandiri | Sesi + aturan | SCH-05, SCH-06 | Tidak dibuat |
| P5 | Kuitansi PDF bermerek lembaga | Template PDF | BIL-19 | Detail invoice Lunas |
| U1 / U4 | Trial 30 hari tanpa bayar | Status trial tenant | ONB-01, ONB-07 | Copy disesuaikan, tanpa klaim |
| U2 | Filter umur, harga, jarak | Data lokasi/umur terstruktur | GRW-01 | Filter yang ada saja |
| U3 | Booking trial tanpa akun | Endpoint publik → CRM | GRW-04, STU-04 | CTA WhatsApp tetap |
| Shell admin | Lonceng notifikasi | Sumber notifikasi admin (izin guru, tagihan terlambat, pesan) + status baca | — | Disembunyikan (versi lama berisi notifikasi demo statis) |
| A1 Hari Ini | Pesan > 4 jam (stat + item Mendesak) | Kotak masuk admin ↔ orang tua + waktu balas | BRF-01 | Disembunyikan |
| A1 Hari Ini | Kelas tanpa guru / Pilih pengganti | Sesi konkret per tanggal + penugasan pengganti | STF-04, SCH-06 | Disembunyikan |
| A1 Hari Ini | Tombol "Tunda" pada item Mendesak | Status tunda per item (tabel baru) | BRF-02 | Disembunyikan |
| A1 Hari Ini | Mode scan QR | Alur scan QR kehadiran (N27) | ATT-02 | Disembunyikan |
| A1 Hari Ini | Setujui izin guru dari Hari Ini | Action approve/reject `tutor_leave_requests` | STF-04 | Status izin tampil (Izin · menunggu), tombol Setujui disembunyikan |
| A1 Hari Ini | "Kirim pengingat" tagihan / "Ingatkan guru" laporan | Pengiriman WA/notifikasi | BIL-09 | Diganti tautan ke daftar sumber |
| S1 Siswa | Impor Excel | Alur A3 (unggah, cocokkan keluarga, periksa) | ONB-03 | Tombol disembunyikan |
| S1 Siswa | Status wali "Diundang" | Tabel undangan + token | RBAC-06 | Hanya "Aktif" (tertaut) / "Belum tertaut" |
| S1/A2 | Kesehatan & kontak darurat untuk anak non-trial | Kolom kesehatan di `students` | STU-08 | Tampil dari formulir trial bila ada; selain itu teks jujur "Belum tercatat" |
| A2 Profil | Penjemput resmi, tab Perkembangan, tab Riwayat, Cuti sementara, Berhenti dengan alasan | Tabel `pickups`, modul perkembangan, log riwayat, status cuti | STU-07, PICK | Disembunyikan; tersedia Nonaktifkan/Aktifkan (action lama) |
| A2 Profil | Ledger keluarga & tagihan gabungan | Ledger per keluarga | BIL-13 | Disembunyikan; daftar tagihan per anak |
| D1 Daftarkan | Nama panggilan, jenis kelamin, alergi, kondisi medis | Kolom di `students` | STU-01, STU-08 | Tidak ditanyakan |
| D1 Daftarkan | Penjemput resmi, paket tagihan, diskon saudara, prorata otomatis, kirim tagihan via WA, simpan draf | Paket & biaya, diskon, notifikasi WA, draf pendaftaran | BIL-02/04/05 | Disembunyikan; nominal = harga kelas (bisa diubah) |
| (temuan) | `getLinkableParents` mengembalikan akun orang tua dari semua lembaga | Batasi ke wali yang terkait lembaga | keamanan | Belum diubah (di luar UI) — perlu persetujuan |
