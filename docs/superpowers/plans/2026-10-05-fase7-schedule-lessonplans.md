# Fase 7: Schedule & Lesson Plans — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghidupkan dua modul admin terakhir yang mock: **Schedule** (jadwal mingguan berulang per kelas) dan **Lesson Plans** (RPP: tujuan, aktivitas ber-checkbox, material).

**Architecture:** Dua tabel baru. Schedule = recurring mingguan (`dayOfWeek` 1–6, tidak terikat tanggal). LessonPlans = dokumen RPP dengan `objectives`/`activities`/`materials` berbasis jsonb (bentuk mengikuti mock yang ada agar view minim perubahan). Semua CRUD admin|moderator via server actions; view props-driven.

**Tech Stack:** Next.js 15, Drizzle + Neon, shadcn/ui, date-fns id.

## Global Constraints

1. npm saja; branch `feat/fase7-schedule-lessonplans` dari `main`.
2. Perubahan skema (generate via drizzle-kit):
   - enum `schedule_type` (`class`,`activity`,`event`,`holiday`); tabel `class_schedules`: id, classId fk classes set null (NULL = kegiatan "Semua Kelas"), title notNull, dayOfWeek integer notNull (1=Senin..6=Sabtu), startTime text "HH:mm" notNull, durationMinutes integer notNull, location text, type scheduleType notNull default 'class', isActive boolean default true, timestamps.
   - enum `plan_status` (`draft`,`upcoming`,`in_progress`,`completed`); tabel `lesson_plans`: id, classId fk classes set null, tutorUserId fk user set null, title notNull, subject text, planDate date notNull, timeRange text, objectives jsonb string[] default [], activities jsonb `{id,title,durationMinutes,description,completed}[]` default [], materials jsonb string[] default [], status planStatus default 'upcoming', timestamps.
3. Authz: semua CRUD admin|moderator; unauth read `[]` / mutation throw.
4. Seed: migrate data mock yang ada (scheduleData 9 event Sen–Jum; 3 lesson plan contoh) ke `scripts/seed-schedule.ts` & `scripts/seed-lessonplans.ts` (idempotent, deterministic ids `sched_1..9`, `plan_1..3`).
5. Warna kartu schedule TIDAK disimpan di DB — diturunkan dari `type` di view (hapus kolom color mock).
6. Aktivitas lesson plan: toggle completed lewat action `updateLessonPlan` partial (client kirim seluruh array activities dengan flag terbaru — read-modify-write server side validasi).
7. Behavior halaman lain tidak berubah; tutor flow pembuatan RPP ditunda (widget tutor tetap mock — catat di verification doc).

---

### Task 1: Schedule — jadwal mingguan

**Files:** Modify `src/db/schema.ts` (+scheduleType enum, classSchedules) + migrasi; Create `src/server/actions/schedules.ts`; Modify `src/app/(admin)/schedule/page.tsx`, `src/views/Schedule.tsx`; Create `scripts/seed-schedule.ts`.

**Interfaces:**
```ts
listSchedules(): Promise<ScheduleRow[]>                    // admin|moderator; ORDER BY dayOfWeek, startTime; unauth []
createClassSchedule(input { title, classId?: string|null, dayOfWeek: number (1..6), startTime: string "HH:mm", durationMinutes: number (5..480), location?: string, type }): Promise<{ id }>
updateClassSchedule(id, partial sama minus dayOfWeek immutable? — boleh ubah semua kecuali id)
deleteClassSchedule(id): Promise<void>
toggleClassScheduleActive(id, isActive): Promise<void>
// semua: validasi (title wajib, dayOfWeek 1..6, startTime regex ^\d{2}:\d{2}$, durationMinutes 5..480, type enum) → throw pesan Indonesia
// ScheduleRow = row + className: string|null
```

- [ ] Step 1: schema + generate `--name class_schedules` + migrate (22 tabel).
- [ ] Step 2: actions (pola `classesCrud.ts`).
- [ ] Step 3: page async fetch + view props-driven: grid kolom Sen–Sab dari `dayOfWeek`; kartu event (title, className "Semua Kelas" bila classId null, waktu, durasi format `${m} menit`/`${h} jam`, lokasi, warna dari type); Dialog create/edit (title, Select kelas opsional, Select hari, Input time, Input durasi menit, lokasi, Select type) + toggle aktif + delete (AlertDialog). Hapus mock scheduleData & kolom color.
- [ ] Step 4: seed `scripts/seed-schedule.ts` (9 event mock → classId dari seed kelas: "Kelas Bunga Matahari"→cls_? cocokkan by name dari scripts/seed.ts, NULL utk Semua Kelas). Jalankan 2x.
- [ ] Step 5: tsc + build + smoke 307. Commit `feat(schedule): jadwal mingguan berulang — CRUD & render dari DB`.

### Task 2: Lesson Plans — RPP

**Files:** Modify `src/db/schema.ts` (+planStatus enum, lessonPlans) + migrasi; Create `src/server/actions/lessonPlans.ts`; Modify `src/app/(admin)/lesson-plans/page.tsx`, `src/views/LessonPlans.tsx`; Create `scripts/seed-lessonplans.ts`.

**Interfaces:**
```ts
listLessonPlans(): Promise<LessonPlanRow[]>                // admin|moderator; ORDER BY planDate DESC; unauth []
createLessonPlan(input { title, subject?, classId?, planDate: string (YYYY-MM-DD valid), timeRange?, objectives: string[] (min 1, tiap 1..200), activities: {title, durationMinutes 1..240, description?}[] (min 1), materials?: string[] }): Promise<{ id }>
// status default 'upcoming'; tutorUserId = session (bila pemilik role tutor) atau NULL utk admin
updateLessonPlan(id, partial { status?, activities? (array penuh dgn completed flag, validasi sama) }): Promise<void>
deleteLessonPlan(id): Promise<void>
// LessonPlanRow = row + className: string|null + tutorName: string|null
```

- [ ] Step 1: schema + generate `--name lesson_plans` + migrate (23 tabel).
- [ ] Step 2: actions.
- [ ] Step 3: page + view props-driven: kartu RPP (title, subject badge, kelas, tanggal id-ID, timeRange, tutorName, objectives list, **activities checklist interaktif** — checkbox → `updateLessonPlan` dengan array activities ter-toggle, duration total dihitung, materials chips, status badge + Select ubah status, delete AlertDialog). Dialog create (title, subject, kelas, date picker, timeRange, objectives textarea per baris, activities dynamic rows (title+durasi+desc, tambah/hapus baris), materials textarea per baris). Hapus mock.
- [ ] Step 4: seed `scripts/seed-lessonplans.ts` (3 plan mock → planDate relatif: kemarin (completed), hari ini (in_progress), +3 hari (upcoming); activities completed flags sesuai mock). Jalankan 2x.
- [ ] Step 5: tsc + build + smoke 307. Commit `feat(lesson-plans): RPP nyata — CRUD, checklist aktivitas, status`.

### Task 3: Verifikasi + deploy

- [ ] tsc + build + smoke semua route utama; verification doc `2026-10-05-fase7-schedule-lessonplans-verification.md` (hasil + QA manual: admin tambah jadwal → muncul di kolom hari; admin buat RPP → centang aktivitas → ubah status; hapus). Commit `chore(fase7): verifikasi` + `npm run deploy`.

### Task 4: Final review + merge

- [ ] Final whole-branch review (subagent; bila dispatch gagal berulang → inline review teliti + catat) → fix wave → merge main → hapus branch.

## Self-Review

1. Coverage: schedule ✓(T1), lesson plans ✓(T2), verify ✓(T3), review ✓(T4). Tutor pembuatan RPP + widget tutor ditunda (YAGNI, dicatat).
2. Placeholder: interfaces lengkap; validasi eksplisit; seed dari data mock nyata.
3. Type consistency: ScheduleRow/LessonPlanRow konsisten; jsonb shapes sesuai mock view.
