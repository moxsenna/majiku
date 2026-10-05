# Fase 6: Birthdays + Broadcast Messages — Verification

- **Branch**: `feat/fase6-birthdays-messages` (sebelum merge)
- **Tanggal**: 2026-10-06

## Deliverables

1. **Birthdays** (`/birthdays`): dihitung dari `students.date_of_birth` nyata (jendela 30 hari, basis WIB), section Hari Ini + 30 Hari ke Depan, CTA WhatsApp ke orang tua.
2. **Messages hub** (`/messages`): broadcast pengumuman ke seluruh orang tua — composer (judul 3–120, isi 10–2000, konfirmasi penerima), riwayat dengan jumlah penerima (snapshot), hapus (admin/moderator). Tabel baru `announcements` (21 tabel Neon).
3. **Portal parent**: card "Pengumuman" (5 terbaru, tanggal relatif) di atas section Status Trial.
4. **Orphan cleanup**: 4 komponen mock `src/components/messages/*` dihapus (tanpa importer tersisa).

## Hasil verifikasi lokal

| Check | Hasil |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ sukses |
| Smoke `/birthdays` unauth | ✅ 307 |
| Smoke `/messages` unauth | ✅ 307 |
| Smoke `/parent` unauth | ✅ 307 |
| Seed `scripts/seed-announcements.ts` (2x) | ✅ idempotent, 3 row, recipientCount 3 |
| DB hitung announcements | ✅ COUNT 3, rc [3,3,3] |

## Panduan QA manual

1. **Broadcast**: login admin → `/messages` → isi judul + isi → Kirim Broadcast → konfirmasi → toast "Terkirim ke N orang tua" → muncul di Riwayat.
2. **Terima di parent**: login parent → `/parent` → card "Pengumuman" menampilkan broadcast terbaru.
3. **Negative**: coba kirim dengan judul < 3 karakter → tombol disabled; coba akses `/messages` tanpa login → redirect login.
4. **Birthdays**: `/birthdays` menampilkan siswa seed; siswa dengan ulang tahun ≤ 30 hari muncul dengan H-{n}; siswa berulang tahun hari ini masuk section Hari Ini.
5. **Privasi**: `/parent/chat` tetap 1-on-1 parent↔tutor — admin tidak punya akses baca percakapan (by design, Fase 5).

## Deploy

- `npm run deploy` → lihat log terlampir untuk Version ID. Jika live check kena Cloudflare Error 1027 (kuota Workers Free harian), verifikasi browser ditunda hingga reset UTC midnight.
