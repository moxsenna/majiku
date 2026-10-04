# Alur Trial dan Seleksi Kelas

## Tujuan
Membuat alur penerimaan murid yang wajib melewati trial dan penilaian tutor sebelum dapat masuk kelas, dengan tampilan orisinal yang tetap mengikuti gaya MAJIKU.

## Alur pengguna
1. Orang tua memilih program dan mengajukan trial, bukan langsung mendaftar sebagai murid aktif.
2. Admin melengkapi jadwal trial serta menetapkan tutor dan kelas tujuan.
3. Tutor melihat antrean trial, mencatat hasil observasi, lalu memberi rekomendasi: cocok, perlu trial ulang, atau belum cocok.
4. Admin meninjau rekomendasi tutor dan hanya dapat menerima kandidat yang direkomendasikan cocok.
5. Kandidat yang diterima dibuat menjadi murid dan enrollment kelas; kandidat lain tetap tersimpan untuk tindak lanjut.
6. Orang tua dapat melihat status proses dan keputusan berikutnya.

## Tampilan
- Buat ringkasan “Trial & Admission” yang berbeda dari contoh kompetitor: panel alur horizontal, indikator antrean, dan daftar tindakan prioritas; tanpa menyalin blok magenta atau komposisi lima kotak.
- Ubah pipeline CRM menjadi tahap operasional: Calon Murid → Trial Dijadwalkan → Menunggu Review Tutor → Direkomendasikan → Diterima / Tidak Lanjut.
- Tambahkan formulir review tutor dengan catatan observasi dan rekomendasi yang jelas.
- Pastikan nyaman di ponsel dan desktop serta konsisten dengan warna coral MAJIKU.

## Aturan dan data
- Simpan aplikasi trial, jadwal, tutor penilai, hasil review, keputusan admin, dan jejak waktu di database.
- Terapkan akses sesuai peran: admin mengelola seluruh proses, tutor hanya melihat dan menilai trial yang ditugaskan, orang tua hanya melihat pengajuan miliknya.
- Cegah penerimaan langsung tanpa trial selesai dan rekomendasi tutor “cocok”.
- Pembuatan murid/enrollment dilakukan sekali agar tidak ada data ganda.

## QA
- Uji alur lengkap orang tua → admin → tutor → admin → kelas.
- Uji penolakan penerimaan sebelum review, trial ulang, kandidat tidak cocok, dan klik berulang.
- Uji akses tiap peran, tampilan ponsel/desktop, serta error dan status kosong.
