# Fase 7: Schedule & Lesson Plans — Verification

- **Branch**: `feat/fase7-schedule-lessonplans` (sebelum merge)
- **Tanggal**: 2026-10-06

## Deliverables

1. **Schedule** (`/schedule`): tabel `class_schedules` (jadwal mingguan berulang, dayOfWeek 1-6) — CRUD admin lengkap (create/edit/toggle/delete via dialog + dropdown), grid mingguan Sen-Sab dengan tanggal minggu berjalan dinamis, warna kartu dari type, "Semua Kelas" untuk classId NULL. Seed 9 event (sched_1..9).
2. **Lesson Plans** (`/lesson-plans`): tabel `lesson_plans` (objectives/activities/materials jsonb) — create RPP (objectives per baris, aktivitas dinamis + durasi, materials), **checklist aktivitas nyata** (toggle → updateLessonPlan), ubah status, search + filter status, delete. Seed 3 RPP (completed/in_progress/upcoming, plan_1..3).
3. Skema: 23 tabel di Neon (migration 0008: enum schedule_type & plan_status).

## Hasil verifikasi lokal

| Check | Hasil |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ sukses (setelah fix: export sync di file "use server") |
| Smoke `/schedule` unauth | ✅ 307 |
| Smoke `/lesson-plans` unauth | ✅ 307 |
| Smoke 11 route utama | ✅ pola sesuai (public 200, protected 307) |
| Seed schedule (2x) | ✅ idempotent, 9 baris |
| Seed lesson plans (2x) | ✅ idempotent, 3 baris (completed/in_progress/upcoming) |
| DB verify | ✅ COUNT 3 plan dengan status & tanggal benar |

## Catatan desain

- Edit RPP v1: hanya **progress aktivitas** (checkbox) dan **status** yang bisa diubah; judul/tanggal immutable (mengurangi kompleksitas form). Ditandai untuk iterasi berikutnya bila perlu edit penuh.
- Tutor membuat RPP: authz action sudah mengizinkan tutor (tutorUserId di-set dari session), tapi halaman masih di route group (admin). Widget tutor tetap mock — deferred.

## Panduan QA manual

1. **Schedule**: login admin → `/schedule` → klik "+ Tambah" di kolom hari → isi → Simpan → kartu muncul; Edit via dropdown; Nonaktifkan → kartu hilang dari grid; Hapus.
2. **Lesson Plans**: `/lesson-plans` → Buat RPP → isi → Simpan → kartu muncul dengan checklist; centang aktivitas → progress ter-update; ubah status via dropdown opsi/kartu edit → badge berubah; Hapus.
3. **Negative**: submit tanpa judul → server menolak; `?date=` tidak berlaku di halaman ini (bukan parameter); akses tanpa login → 307.

## Deploy

- `npm run deploy` → Version ID tercatat di log. Live check bisa kena Cloudflare Error 1027 (kuota harian) — ulangi setelah reset UTC.
