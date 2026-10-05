# Fase 6: Birthdays + Messages Hub (Broadcast) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyelesaikan dua modul admin terakhir yang mock: halaman **Birthdays** (dihitung dari data siswa nyata) dan halaman **Messages** sebagai hub **broadcast pengumuman** ke orang tua (diterima di portal parent).

**Architecture:** Birthdays = query murni dari `students.date_of_birth` (tanpa skema baru). Broadcast = tabel baru `announcements`; admin menulis → semua parent (role parent) melihat di portal. **Keputusan desain: admin TIDAK diberi akses membaca chat parent↔tutor** (privasi 1-on-1 Fase 5); pesan langsung admin↔parent ditunda. Komponen mock lama `src/components/messages/*` menjadi orphan → dihapus.

**Tech Stack:** Next.js 15, Drizzle + Neon, shadcn/ui, date-fns id.

## Global Constraints

1. npm saja; branch `feat/fase6-birthdays-messages` dari `main`.
2. Perubahan skema hanya: tabel `announcements` (id, title text notNull, body text notNull, sentByUserId fk user set null, recipientCount integer default 0, createdAt/updatedAt). Generate via drizzle-kit.
3. Authz: broadcast create/list/delete = admin|moderator; parent read = semua pengumuman (tanpa scoping per-user — pengumuman bersifat umum); unauth `[]` / throw.
4. Birthdays: hanya siswa `isActive`; hitung `daysUntil` & `turningAge` di server (TypeScript, basis WIB via `todayInWib()`); jendela 30 hari termasuk hari ini; urutkan daysUntil ASC.
5. Hapus orphan: setelah Messages rewrite, `src/components/messages/ConversationList.tsx`, `ChatArea.tsx`, `RequestAnalyticsChart.tsx`, `FloatingChatNotification.tsx` dihapus bila tidak ada lagi yang mengimpor (grep dulu).
6. Tidak ada UI palsu di area yang disentuh. Behavior halaman lain tidak berubah.
7. Delete announcement (admin|moderator): hapus DB row saja (broadcast terkirim adalah rekam jejak — hard delete diizinkan untuk kesalahan penulisan).

---

### Task 1: Birthdays — wiring dari data siswa

**Files:** Create `src/server/actions/birthdays.ts`; Modify `src/app/(admin)/birthdays/page.tsx` (async server page), `src/views/Birthdays.tsx` (props-driven).

**Interfaces:**
```ts
getUpcomingBirthdays(): Promise<BirthdayEntry[]>
// admin|moderator; unauth → []
// BirthdayEntry = { id, name, className: string|null, birthDate: string, turningAge: number, daysUntil: number, parentName: string|null, parentPhone: string|null }
// sumber: students isActive JOIN student_enrollments aktif JOIN classes utk className (DISTINCT siswa, className gabung bila multi)
// daysUntil: selisih hari ke ulang tahun berikutnya (0 = hari ini); jendela ≤ 30 hari; urut daysUntil ASC lalu name
```

- [ ] Step 1: action (query siswa aktif + enrollment → hitung di JS dengan basis WIB).
- [ ] Step 2: page → props; view: section "Hari Ini" (highlight bila daysUntil 0) + daftar "30 Hari ke Depan" kartu (nama, kelas, umur yang akan dijangkau, tanggal, hari, tombol WhatsApp cepat `https://wa.me/{phone}` bila parentPhone ada). Hapus mock array.
- [ ] Step 3: tsc + build + smoke unauth 307. Commit `feat(birthdays): halaman ulang tahun dari data siswa nyata`.

### Task 2: Messages hub — broadcast pengumuman

**Files:** Modify `src/db/schema.ts` (+announcements) + migrasi; Create `src/server/actions/announcements.ts`; Modify `src/app/(admin)/messages/page.tsx` (async server page), `src/views/Messages.tsx` (rewrite: composer + history); Create `src/components/parent/AnnouncementsCard.tsx`; Modify `src/app/(parent)/parent/page.tsx` + `src/views/ParentPortal.tsx` (card pengumuman); Delete `src/components/messages/*` (4 file orphan).

**Interfaces:**
```ts
createAnnouncement(input { title: string; body: string }): Promise<{ id: string; recipientCount: number }>
// admin|moderator; title 3..120 char, body 10..2000 (throw pesan Indonesia); recipientCount = hitung user ber-role parent (join user_roles); simpan recipientCount
listAnnouncements(): Promise<AnnouncementRow[]>          // admin|moderator; ORDER BY createdAt DESC; unauth []
getLatestAnnouncementsForParent(): Promise<{ id, title, body, createdAt }[]>  // parent|admin; 5 terbaru; unauth []
deleteAnnouncement(id: string): Promise<void>            // admin|moderator
```

- [ ] Step 1: schema + generate `--name announcements` + migrate (21 tabel).
- [ ] Step 2: actions (recipientCount dihitung saat kirim = snapshot jumlah penerima).
- [ ] Step 3: Messages view rewrite: header + stat ringkas (total pengumuman, terkirim bulan ini, penerima terakhir); **Composer** dialog (title + body, preview sebelum kirim, konfirmasi AlertDialog) → createAnnouncement → toast sukses dengan jumlah penerima; **History** list (title, body truncated, tanggal, recipientCount, tombol hapus admin). HAPUS import ConversationList/ChatArea/RequestAnalyticsChart/FloatingChatNotification + mock conversations; hapus 4 file komponen orphan (grep dulu).
- [ ] Step 4: ParentPortal — card "Pengumuman" (latest 3 dari getLatestAnnouncementsForParent, expandable body, empty state); page parent fetch + props.
- [ ] Step 5: tsc + build + smoke unauth 307 (kedua page). Commit `feat(messages): hub broadcast pengumuman + tampil di portal parent`.

### Task 3: Seed + verifikasi + deploy

- [ ] Seed `scripts/seed-announcements.ts` (idempotent, 3 pengumuman contoh) + jalankan.
- [ ] tsc + build + smoke; verification doc `2026-10-05-fase6-birthdays-messages-verification.md` (hasil smoke + QA manual: admin kirim broadcast → parent lihat di portal; birthdays menampilkan siswa seed yang ulang tahunnya di dekat — sesuaikan seed siswa bila perlu menambah 1 siswa ulang tahun hari ini via seed birthdays khusus). Commit `chore(fase6): verifikasi birthdays & broadcast`.
- [ ] Deploy staging (catat kuota bila 1027).

### Task 4: Final review + merge

- [ ] Final whole-branch review (subagent) → fix wave bila perlu → merge main → hapus branch.

## Self-Review

1. Coverage: birthdays ✓(T1), broadcast hub + portal ✓(T2), seed/verifikasi ✓(T3), review ✓(T4). Admin membaca chat privat sengaja TIDAK (privasi); direct chat admin↔parent ditunda.
2. Placeholder: interfaces lengkap; validasi title/body eksplisit; orphan cleanup terjadwal.
3. Type consistency: BirthdayEntry/AnnouncementRow konsisten antar task; recipientCount snapshot.
