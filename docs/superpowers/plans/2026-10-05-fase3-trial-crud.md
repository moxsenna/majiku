# Fase 3a/3b: Alur Trial + Wiring CRUD — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghidupkan alur trial & seleksi end-to-end (parent mengajukan → admin jadwalkan → tutor review → admin admit → jadi murid+enrollment) sesuai desain `.lovable/plan/alur-trial-dan-seleksi-kelas-2026-10-04.md` (tersimpan di git baseline `2d31281`), lalu menghubungkan halaman CRUD mock (Classes, Students, Tutors, DailyReports) ke Drizzle.

**Architecture:** Semua akses data baru lewat server actions di `src/server/actions/` dengan otorisasi server-side (pola Fase 1: unauth = throw untuk mutasi / array kosong untuk read). Stored procedure `submit_trial_review` & `admit_trial_candidate` adalah satu-satunya jalur review/admit — JANGAN meng-UPDATE status trial langsung selain aksi `scheduleTrial` (submitted→scheduled) dan `markTrialAwaitingReview` (scheduled→awaiting_review). Halaman jadi server page yang fetch data + client view menerima props (pola landing Fase 2).

**Tech Stack:** Next.js 15, Drizzle + Neon, BetterAuth session, TanStack Query (sudah ada), shadcn/ui.

**Desain acuan:** `git show 2d31281:.lovable/plan/alur-trial-dan-seleksi-kelas-2026-10-04.md`

## Global Constraints

1. npm saja; branch `feat/fase3-trial-crud` dari `main`; work in `D:\Coding\happy-days`.
2. **Pemetaan pipeline (desain doc)**: `submitted`=Calon Murid, `scheduled`=Trial Dijadwalkan, `awaiting_review`=Menunggu Review Tutor, `recommended`=Direkomendasikan, `admitted`=Diterima, `repeat_trial`+`not_suitable`=Tidak Lanjut.
3. **Aturan stored procedure (JANGAN dilanggar)**: review hanya oleh tutor yang di-assign (dicek proc via `tutors.user_id`), hanya dari status `scheduled|awaiting_review|repeat_trial`, catatan observasi wajib. Admit hanya admin, hanya dari `recommended`+`suitable`+`class_id` terisi, idempotent. Tidak ada jalur admisi tanpa review.
4. Otorisasi: admin = akses penuh pipeline; tutor = hanya trial yang di-assign kepadanya; parent = hanya pengajuan miliknya (`parent_user_id = session.user.id`).
5. Behavior halaman lain (Dashboard, Attendance, Billing, dll.) tidak boleh berubah. Tab CRM lain (Automation, Campaigns, Tickets, Integrations) tetap mock apa adanya.
6. Interaksi baru memakai pola yang sudah ada: `useToast` (sonner/toast hook lama), shadcn Dialog/Form, `useQuery` untuk read. Server action error → toast error dengan pesan dari exception.
7. `trial_scheduled_at` disimpan UTC; form admin pakai `datetime-local` → konversi `new Date(value)`.

---

## BAGIAN A — Alur Trial

### Task A1: Server actions trial (`src/server/actions/trial.ts`)

**Files:**
- Create: `src/server/actions/trial.ts`

**Interfaces (dipakai A2-A4):**
```ts
// Parent (role parent|admin), session wajib
submitTrialApplication(input: {
  programKey: string; childName: string; childNickname?: string; childBirthDate?: string;
  childGender?: string; allergies?: string; medicalNotes?: string; parentName?: string;
  parentPhone?: string; parentEmail?: string; address?: string; emergencyContact?: string;
  emergencyPhone?: string; requestedStartDate?: string; parentNotes?: string;
}): Promise<{ id: string }>            // INSERT status 'submitted', parent_user_id = session.user.id

// Admin only
scheduleTrial(trialId: string, input: { scheduledAt: string; tutorId: string; classId: string }): Promise<void>
// UPDATE trial_applications SET trial_scheduled_at, tutor_id, class_id, status='scheduled'
// GUARD: WHERE id AND status='submitted' (return 0 rows → throw "Pengajuan tidak ditemukan/sudah dijadwalkan")

// Tutor yang di-assign saja (tutors.user_id = session.user.id)
markTrialAwaitingReview(trialId: string): Promise<void>
// GUARD: WHERE id AND tutor_id = myTutorId AND status='scheduled' → SET status='awaiting_review'

// Reads
getTrialPipeline(): Promise<TrialPipelineRow[]>   // admin|moderator: SEMUA trial, join classes(name), tutors(name)
getMyTrialQueue(): Promise<TrialQueueRow[]>       // tutor: trial WHERE tutor_id = myTutorId AND status IN ('scheduled','awaiting_review','repeat_trial')
getMyTrialApplications(): Promise<TrialApplicationRow[]>  // parent: WHERE parent_user_id = session.user.id ORDER BY created_at DESC
getSchedulingOptions(): Promise<{ tutors: {id,name}[]; classes: {id,name}[] }>  // admin: dari tabel tutors & classes WHERE is_active
```
`TrialPipelineRow` = row trial + `className: string|null` + `tutorName: string|null`. Semua fungsi: `getSessionSafely()` pola `trialProcedures.ts`; role check via `getMyRoles()`; unauth read → `[]`, unauth mutation → throw.

- [ ] **Step 1:** Tulis `src/server/actions/trial.ts` lengkap sesuai interfaces (drizzle `db.update().set().where().returning()` — cek `result.length === 0` untuk guard throw; `db.insert().values().returning()` untuk submit).
- [ ] **Step 2:** `npx tsc --noEmit` clean. Verifikasi manual query dengan tsx script sementara (insert trial dummy sebagai usr_parent → getTrialPipeline perlu session, jadi cukup verifikasi INSERT/UPDATE SQL via drizzle di script lalu hapus baris dummy — ATAU andalkan verifikasi E2E di A2-A4; minimal: tsc + build).
- [ ] **Step 3:** Commit `feat(trial): server actions alur trial — submit, schedule, awaiting-review, queries`

### Task A2: Parent side — wizard submit nyata + status trial

**Files:**
- Modify: `src/views/ParentRegistration.tsx` (ganti simulasi `setTimeout` di submit handler akhir), `src/app/(parent)/parent/registration/page.tsx` (thin server page tetap), `src/app/(parent)/parent/page.tsx` + `src/views/ParentPortal.tsx` (tambah section Status Trial)
- Create: `src/components/parent/TrialStatusList.tsx`

**Detail:**
- Wizard step terakhir: kumpulkan state form → panggil `submitTrialApplication` → sukses: toast "Pengajuan trial terkirim", `router.push("/parent")`; error: toast pesan exception. `programKey` = id program yang dipilih di wizard (toddler/nursery/kg — samakan dengan `programs` array yang ada). Mapping field form wizard → input action sudah 1:1 dengan nama di interface A1.
- `TrialStatusList` (server component, dipakai ParentPortal via server page): props `{ applications: TrialApplicationRow[] }`; render kartu per pengajuan: nama anak, program, tanggal ajukan, **status badge** dengan label pipeline (Global Constraint 2) + satu kalimat "keputusan berikutnya" per status (submitted: "Menunggu dijadwalkan admin"; scheduled: "Trial dijadwalkan {trial_scheduled_at format id-ID}"; awaiting_review: "Menunggu catatan hasil observasi tutor"; recommended: "Direkomendasikan — menunggu keputusan admin"; admitted: "Diterima! Selamat bergabung"; repeat_trial: "Perlu trial ulang — hubungi admin"; not_suitable: "Belum sesuai — hubungi admin untuk tindak lanjut").
- `(parent)/parent/page.tsx` → fetch `getMyTrialApplications()` → pass ke ParentPortal sebagai props → ParentPortal render `<TrialStatusList>` di atas timeline (section baru berjudul "Status Trial & Pendaftaran"; empty state: CTA ke /parent/registration).
- [ ] Steps: implement → dev server login parent test (buat user parent via API sign-up + assign-role) → submit wizard → cek row DB via tsx → status muncul di /parent → commit `feat(trial): parent submit trial nyata + status di portal`

### Task A3: Admin CRM — pipeline operasional

**Files:**
- Modify: `src/app/(admin)/crm/page.tsx` (async server page: fetch getTrialPipeline + getSchedulingOptions → props), `src/views/CRM.tsx` (rewrite tab Pipeline)
- Create: `src/components/crm/ScheduleTrialDialog.tsx` (client)

**Detail:**
- Pipeline tab: 6 kolom sesuai pemetaan (Tidak Lanjut = repeat_trial + not_sanggal digabung). Card per trial: nama anak (+nickname), program_key, kota/parent phone, umur dari child_birth_date, className/tutorName bila ada, tanggal. Kolom "Calon Murid" & "Trial Dijadwalkan": tombol aksi. Kolom "Direkomendasikan": tombol "Terima" (memanggil `admitTrial` dari `trialProcedures.ts`) + dialog konfirmasi.
- `ScheduleTrialDialog`: form datetime-local (trial_scheduled_at), Select tutor (dari schedulingOptions.tutors), Select kelas (classes) → `scheduleTrial`. Dipakai di kolom Calon Murid ("Jadwalkan") dan Trial Dijadwalkan ("Ubah jadwal" — reuse).
- Card di kolom scheduled juga tampil catatan "menunggu tutor menandai observasi".
- Sukses/error semua via toast (pesan exception server ditampilkan). Setelah aksi sukses: `router.refresh()` (server page re-fetch).
- Tab lain (Leads lama, Automation, Campaigns, Tickets, Integrations): Leads tab lama DIHAPUS (digantikan pipeline trial); tab mock lain dibiarkan. Hapus `initialLeads`, tipe `Lead`, `moveLeadToStage` yang tidak lagi dipakai.
- [ ] Steps: implement → seed 1 trial submitted via tsx (parent_user_id usr_parent) → dev: login admin (bikin user admin test via sign-up + assign-role) → jadwalkan → tandai (A4) → admit → murid muncul (cek DB) → commit `feat(crm): pipeline trial operasional — jadwal, admit, data nyata`

### Task A4: Tutor — antrean & form review `/tutor/trials`

**Files:**
- Create: `src/app/(tutor)/tutor/trials/page.tsx` (async server page fetch getMyTrialQueue), `src/components/tutor/TrialReviewCard.tsx` (client: tombol "Mulai Observasi/Selesaikan Sesi" → markTrialAwaitingReview; form catatan observasi + radio rekomendasi → `submitTrialReview`)
- Modify: `src/components/layout/Sidebar.tsx` (nav item "Trial" untuk role tutor, ikon `ClipboardCheck`, href `/tutor/trials`)

**Detail:**
- Card per trial: nama anak, umur, program, jadwal trial (format id-ID), alergi/medical notes (highlight), status badge.
- Tombol: status `scheduled` → "Tandai Sesi Selesai" (markTrialAwaitingReview); status `awaiting_review|repeat_trial` → form review terbuka (Textarea catatan wajib + Select/radio rekomendasi: Cocok / Perlu Trial Ulang / Belum Cocok) → `submitTrialReview` (proc menolak catatan kosong — tampilkan pesannya).
- `repeat_trial` muncul lagi di queue agar bisa direview ulang (sesuai guard proc).
- Sidebar: cek struktur menu tutor yang ada; tambahkan item hanya untuk grup tutor.
- [ ] Steps: implement → seed 1 trial scheduled dengan tutor_id = `tut_1` → verifikasi query getMyTrialQueue via tsx perlu session (lewati), cukup build + curl 307 → commit `feat(trial): antrean & form review tutor /tutor/trials`

### Task A5: Verifikasi alur trial + deploy

- [ ] **E2E script terdokumentasi**: buat `scripts/seed-trial-demo.ts` (idempotent): 1 trial `submitted` (usr_parent), 1 trial `scheduled` (tutor tut_1, class cls_1), 1 trial `recommended` (suitable, class cls_1, reviewed). Jalankan. Commit `test(trial): seed demo pipeline trial`.
- [ ] `npx tsc --noEmit` + `npm run build` + smoke: /crm, /tutor/trials, /parent, /parent/registration → 307 tanpa cookie (protected tetap).
- [ ] Deploy staging `npm run deploy` + update verification doc `docs/superpowers/plans/2026-10-05-fase3a-trial-verification.md` (catat: E2E penuh butuh login manual 3 role di staging — tulis langkah QA dari desain doc).
- [ ] Commit `chore(fase3a): verifikasi alur trial`

---

## BAGIAN B — Wiring CRUD mock

### Task B1: Classes CRUD

**Files:** Create `src/server/actions/classesCrud.ts`; Modify `src/app/(admin)/classes/page.tsx` (server page fetch), `src/views/Classes.tsx` (props-driven).

**Interfaces:** `listClasses()` (admin), `createClass(input {name, description?, capacity?, pricePerMonth?, sessionsPerMonth?, schedule?, location?})`, `updateClass(id, partial)`, `toggleClassActive(id, isActive)` — semua admin only; guard unique name tidak wajib (biarkan DB). Page: fetch + props → view render dari props, dialog create/edit memanggil action, sukses → `router.refresh()` + toast.
- [ ] Implement → build → commit `feat(classes): CRUD kelas nyata via server actions`

### Task B2: Students CRUD (+enrollment)

**Files:** Create `src/server/actions/studentsCrud.ts`; Modify `src/app/(admin)/students/page.tsx`, `src/views/Students.tsx`.

**Interfaces:** `listStudentsWithEnrollments()` (admin: students + enrollments join classes, kumpulan enrollment per siswa), `createStudent(input {name, dateOfBirth?, parentName?, parentPhone?, parentEmail?} + enrollment? {classId, sessionsQuota?, billingDay?})` (INSERT student, lalu INSERT enrollment bila classId diisi — transaksi `db.transaction`), `updateStudent(id, partial)`, `toggleStudentActive(id, isActive)`. View: table dari props; dialog create dengan optional pilih kelas; parent_user_id TIDAK diset dari sini (kecuali input email cocok — YAGNI: skip linking).
- [ ] Implement → build → commit `feat(students): CRUD siswa + enrollment via server actions`

### Task B3: Tutors CRUD

**Files:** Create `src/server/actions/tutorsCrud.ts`; Modify `src/app/(admin)/tutors/page.tsx`, `src/views/Tutors.tsx`.

**Interfaces:** `listTutorsWithAssignments()` (tutors + tutor_class_assignments join classes), `createTutor(input {name, email?, phone?})` (user_id TIDAK diset — linking akun nanti), `updateTutor(id, partial)`, `toggleTutorActive(id, isActive)`. View: card roster dari props; dialog create/edit.
- [ ] Implement → build → commit `feat(tutors): CRUD tutor via server actions`

### Task B4: DailyReports — tabel baru + wiring

**Files:** Modify `src/db/schema.ts` (+ enum `report_status {draft,submitted}` + tabel `dailyReports`: id, studentId fk, classId fk, tutorUserId fk user nullable, reportDate date, mood text, meals text, nap text, activities text, notes text, photos jsonb string[], status default 'submitted', timestamps) + generate + migrate; Create `src/server/actions/dailyReports.ts`; Modify `src/app/(admin)/daily-reports/page.tsx`, `src/views/DailyReports.tsx`; Create `scripts/seed-reports.ts` (10 laporan hari ini).

**Interfaces:** `listDailyReports(date: string)` (admin: join students), `createDailyReport(input {studentId, reportDate, mood?, meals?, nap?, activities?, notes?})` (tutor|admin; tutor_user_id dari session), `getReportsForParent()` (parent: hanya anaknya — join students WHERE parent_user_id; dipakai ParentPortal feed nanti — cukup actionnya, UI parent feed tetap mock). View admin: filter tanggal (default hari ini) + list kartu + dialog create (pilih siswa).
- [ ] Implement → migrate → seed → build → commit `feat(reports): tabel daily_reports + wiring DailyReports admin/tutor`

### Task B5: Verifikasi akhir Fase 3

- [ ] tsc + build + smoke semua route (lama + /tutor/trials + baru). Update verification doc. Deploy staging (jika kuota tersedia). Commit `chore(fase3): verifikasi akhir`.

---

## Self-Review

1. **Desain doc coverage**: parent ajukan ✓(A2), admin jadwal+tutor+kelas ✓(A3), tutor antrean+observasi+rekomendasi ✓(A4), admin admit hanya dari recommended ✓(A3, proc guard), murid+enrollment dibuat sekali ✓(proc idempotent), parent lihat status ✓(A2), pipeline stage operasional ✓(A3), akses per-role ✓(semua action), mobile-friendly ✓(komponen shadcn responsif).
2. **Placeholder scan**: interfaces lengkap dengan tipe; guard & pesan error eksplisit; pola UI mengikuti file yang ada.
3. **Type consistency**: pemetaan status konsisten di A1/A2/A3/A4; nama action sama antara definisi dan konsumen; `admitTrial`/`submitTrialReview` dari `trialProcedures.ts` dipakai apa adanya.
