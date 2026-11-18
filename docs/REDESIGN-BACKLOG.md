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
| K1 | Aging, per kelas, settlement | Query agregasi + data settlement PayCore | BIL-16, BIL-18 | Disembunyikan |
| K2 | Ledger, invoice gabungan keluarga | Tabel ledger / invoice keluarga | BIL-13, BIL-19 | Daftar invoice per keluarga saja |
| K3 | Bayar sebagian, bukti foto | Tabel pembayaran parsial + upload | BIL-08, BIL-19 | Hanya "tandai lunas" |
| K5 | Paket, item biaya, kuota sesi | Tabel paket | BIL-01..03, BIL-11 | Read-only dari kelas |
| K6 | Seluruh pengaturan penagihan | Tabel pengaturan tenant | BIL-04..10, BIL-21 | Disembunyikan |
| K7 | Settlement | Data settlement PayCore | BIL-17, BIL-18 | Disembunyikan |
| K8 | Sesi nyata dari absen guru | Relasi absen guru ↔ sesi | STF-05 | Label jujur / disembunyikan |
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
