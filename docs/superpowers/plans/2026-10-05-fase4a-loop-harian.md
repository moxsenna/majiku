# Fase 4a: Loop Operasional Harian — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menutup loop operasional harian MAJIKU: (1) admin menautkan akun BetterAuth ke tutor dari UI, (2) tutor menerbitkan laporan harian nyata lewat `/tutor/progress`, (3) parent melihat laporan anaknya di feed portal.

**Architecture:** Extend action `tutorsCrud.ts` (linking) + `dailyReports.ts` (bulk create, getMyStudents). `/tutor/progress` & ParentPortal feed jadi props-driven dari server page (pola Fase 2/3). Foto laporan sengaja tidak diimplementasi (belum ada storage — R2 menunggu).

**Tech Stack:** Next.js 15, Drizzle + Neon, BetterAuth, shadcn/ui, TanStack Query tidak wajib (pola useTransition + router.refresh yang mapan).

## Global Constraints

1. npm saja; branch `feat/fase4a-loop-harian` dari `main`; work in `D:\Coding\happy-days`.
2. Authz: linking & semua CRUD admin|moderator; createDailyReport tutor|admin; getMyStudents & getReportsForParent scoped session (tutor via tutors.user_id, parent via students.parent_user_id); unauth read `[]`/empty, mutation throw.
3. Satu-satunya perubahan skema: unique constraint pada `tutors.user_id` (Postgres unique index mengizinkan banyak NULL) — generate migrasi via drizzle-kit, jangan edit file migrasi manual.
4. `createDailyReport` di-refactor menerima `studentIds: string[]` (min 1, insert per siswa dalam SATU `db.transaction`) — pemanggil lama (dialog admin DailyReports) diupdate ikut interface baru.
5. Foto upload dihapus dari TutorProgress (simulasi unsplash) — tampilkan catatan "unggah foto menyusul".
6. Like/comment di feed parent DIHAPUS untuk feed nyata (tidak ada backend-nya — jangan tampilkan UI palsu); tab galeri & progres di ParentPortal tetap mock.
7. Behavior halaman lain tidak berubah. WIB: pakai `todayInWib()` dari `@/lib/datetime`.
8. Setelah aksi sukses: toast + `router.refresh()` (pola mapan).

---

### Task 1: Linking akun tutor (admin)

**Files:** Modify `src/db/schema.ts` (tutors.userId + `.unique()`), migrasi, `src/server/actions/tutorsCrud.ts` (+3 action), `src/app/(admin)/tutors/page.tsx` (+users list), `src/views/Tutors.tsx` (dialog tautkan).

**Interfaces:**
```ts
listLinkableUsers(): Promise<{ id: string; name: string; email: string; linkedTutorName: string | null }[]>
// admin|moderator; user BetterAuth + LEFT JOIN tutors (yang sudah tertaut diberi label — berguna untuk menonaktifkan opsi)
linkTutorUser(tutorId: string, userId: string): Promise<void>
// admin|moderator; guard: tutor ada, user ada, user belum tertaut ke tutor lain (cek DB + lempar pesan jelas)
unlinkTutorUser(tutorId: string): Promise<void>
// admin|moderator; SET user_id = NULL (guard: tutor ada)
```

- [ ] Step 1: schema `tutors.userId` tambah `.unique()` → `npx drizzle-kit generate --name tutors_user_unique` → `npx drizzle-kit migrate` → healthcheck tetap 17 tabel.
- [ ] Step 2: 3 action baru (pola authz `studentsCrud.ts`).
- [ ] Step 3: UI — kartu tutor menampilkan email akun tertaut (atau badge "Belum tertaut") + tombol "Tautkan Akun" → Dialog: Select user (options dari `listLinkableUsers`, disable yang `linkedTutorName !== null`, label `name — email (tertaut ke X)`) → `linkTutorUser` → toast + refresh; tombol "Lepas Tautan" bila sudah tertaut.
- [ ] Step 4: tsc + build clean. Commit `feat(tutors): linking akun BetterAuth ke tutor dari UI admin`.

### Task 2: Tutor menerbitkan laporan nyata (/tutor/progress)

**Files:** Modify `src/server/actions/dailyReports.ts` (refactor bulk + getMyStudents), `src/app/(tutor)/tutor/progress/page.tsx` (async server page), `src/views/TutorProgress.tsx` (props-driven nyata).

**Interfaces:**
```ts
createDailyReport(input: { studentIds: string[]; reportDate: string; mood?: string; meals?: string; nap?: string; activities?: string; notes?: string }): Promise<{ created: number }>
// tutor|admin; validasi: studentIds non-empty, reportDate valid (isValidDateString), activities ATAU notes minimal satu terisi (throw "Isi aktivitas atau catatan")
// INSERT satu daily_reports per studentId dalam SATU db.transaction; tutorUserId = session.user.id; classId = enrollment kelas aktif siswa (lookup) atau NULL
getMyStudents(): Promise<{ id: string; name: string; className: string | null; hasReportToday: boolean }[]>
// tutor: siswa dari enrollment kelas yang diampu (tutor_class_assignments → tutors.user_id = session), DISTINCT; hasReportToday via LEFT JOIN daily_reports (report_date = todayInWib()); admin|moderator: semua siswa aktif; unauth → []
```

- [ ] Step 1: refactor action + update pemanggil lama (dialog admin DailyReports kirim `studentIds: [id]`).
- [ ] Step 2: server page progress fetch `getMyStudents()` → props. View: daftar siswa selectable (badge "Sudah dilaporkan hari ini" untuk hasReportToday — tetap boleh dipilih untuk laporan tambahan), mood/meals/nap selects (pertahankan opsi emoji yang ada sebagai nilai teks), textarea aktivitas, textarea catatan, HAPUS simulasi foto (ganti kartu abu "Unggah foto — menyusul"). Submit → validasi client → `createDailyReport` → toast "Laporan X siswa terkirim" → reset form + refresh.
- [ ] Step 3: tsc + build; smoke `/tutor/progress` unauth 307. Commit `feat(reports): tutor terbitkan laporan harian nyata + bulk create`.

### Task 3: Feed parent nyata

**Files:** Modify `src/app/(parent)/parent/page.tsx` (+getReportsForParent), `src/views/ParentPortal.tsx` (feed tab dari props).

- [ ] Step 1: server page fetch `getReportsForParent()` → props `reports` ke ParentPortal.
- [ ] Step 2: feed tab render kartu laporan nyata: nama anak, tanggal (format id-ID, "Hari ini"/"Kemarin" bila cocok), mood (emoji mapping dari teks bila cocok opsi), meals/nap/activities/notes, footer "Ditulis oleh tutor • {jam}". Empty state: "Belum ada laporan dari tutor" + copy penjelasan. Hapus `feedItems` mock, like/comment buttons, dan state likedPosts yang relevan (tab Galeri & Progres tetap mock).
- [ ] Step 3: tsc + build. Commit `feat(parent): feed laporan harian nyata di portal parent`.

### Task 4: Verifikasi + deploy + final review + merge

- [ ] Update/append verification doc `docs/superpowers/plans/2026-10-05-fase4a-loop-verification.md`: smoke semua route, panduan QA manual (admin tautkan akun → tutor login → terbitkan laporan → parent lihat feed), seed instruksinya. Commit `chore(fase4a): verifikasi loop harian`.
- [ ] Deploy staging (`npm run deploy`) — catat jika kuota 1027.
- [ ] Final whole-branch review (subagent) → fix wave bila perlu → merge ke main → hapus branch.

## Self-Review

1. Coverage: linking ✓(T1), tutor publish ✓(T2), parent feed ✓(T3), verifikasi ✓(T4). Foto & like/comment sengaja tidak dibangun (YAGNI, Global Constraint 5-6).
2. Placeholder: interface lengkap; pola authz/dialog merujuk file contoh yang ada.
3. Type consistency: `createDailyReport` interface baru dipakai di T2 & dialog admin Task 2 Step 1; `hasReportToday` konsisten T2.
