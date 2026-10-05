# Fase 4b: Galeri & Upload Foto (Cloudflare R2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upload foto nyata via Cloudflare R2: tutor melampirkan foto di laporan harian, foto tampil di feed parent, dan halaman Gallery live (browse + upload + hapus).

**Architecture:** Bucket R2 `majiku-photos` diakses via **binding** `PHOTOS_BUCKET` (bukan kredensial S3) melalui `getCloudflareContext().env` dari `@opennextjs/cloudflare`. Upload lewat route handler `POST /api/photos` (FormData, hindari limit body server action). Penyajian lewat `GET /api/photos/[...key]` yang **wajib sesi** (middleware) — URL capability-based (key = uuid, tidak bisa ditebak), bucket TIDAK publik. DB menyimpan **key** (bukan full URL). Lokal dev: `initOpenNextCloudflareForDev()` menyediakan binding via miniflare (R2 lokal simulasi).

**Tech Stack:** Cloudflare R2 (binding), Next.js Route Handlers, Drizzle, shadcn/ui.

## Global Constraints

1. npm saja; branch `feat/fase4b-galeri-r2` dari `main`; work in `D:\Coding\happy-days`.
2. Bucket TIDAK di-set public; satu-satunya jalur baca = route handler yang butuh sesi.
3. Validasi upload: hanya `image/jpeg|png|webp`, maks 5 MB/file, maks 6 file sekali upload; key format `{prefix}/{crypto.randomUUID()}.{ext}` (prefix `reports/` atau `gallery/`).
4. DB menyimpan key relatif (tanpa domain): `reports/xxx.jpg`. Render selalu `<img src="/api/photos/{key}">` (`images.unoptimized` sudah aktif).
5. daily_reports.photos (jsonb string[]) diisi key; input `createDailyReport` diperluas `photos?: string[]`.
6. Tabel baru `gallery_photos` (id, studentId nullable fk, classId nullable fk, photoKey notNull, caption, uploadedByUserId fk user nullable, createdAt/updatedAt) + migrasi drizzle-kit.
7. Authz: upload (report & gallery) tutor|admin; hapus gallery admin|moderator; listGallery admin|moderator + tutor (tutor lihat semua foto gallery — foto kelas bukan rahasia antar-orang tua di level ini; parent TIDAK di-scope di galeri admin). Feed parent tetap scoped anaknya.
8. Delete objek R2 saat hapus gallery photo / saat report dihapus (best-effort, gagal R2 tidak gagalkan DB — log console).
9. Jangan commit kredensial; binding via wrangler.jsonc + `.dev.vars` tidak perlu (binding lokal otomatis).

---

### Task 1: Infra R2 + helper + route handler baca/tulis

**Files:** Create `src/server/r2.ts`, `src/app/api/photos/route.ts` (POST upload), `src/app/api/photos/[...key]/route.ts` (GET serve); Modify `wrangler.jsonc` (+binding `r2_buckets`), `src/middleware.ts` (matcher + `/api/photos`), `.dev.vars` tidak berubah; CLI `wrangler r2 bucket create majiku-photos`.

**Interfaces:**
```ts
// src/server/r2.ts
getBucket(): R2Bucket                     // getCloudflareContext().env.PHOTOS_BUCKET; throw bila tidak ada
putPhoto(prefix: string, file: File): Promise<string>   // validasi mime/size → put → return key
getPhoto(key: string): Promise<R2ObjectBody | null>     // guard: key tidak boleh mengandung ".." / mulai dengan "/"
```
Route POST `/api/photos`: session wajib (401 bila tidak), FormData `files` (multiple) + `prefix` (`reports`|`gallery`) → `{ keys: string[] }`.
Route GET `/api/photos/[...key]`: session wajib (401), ambil objek, return body dengan `Content-Type` tersimpan + `Cache-Control: private, max-age=31536000, immutable`; 404 bila tidak ada.

- [ ] Step 1: `npx wrangler r2 bucket create majiku-photos` (catat output; bila gagal karena izin, BLOCKED). Tambah ke `wrangler.jsonc`:
```jsonc
"r2_buckets": [{ "binding": "PHOTOS_BUCKET", "bucket_name": "majiku-photos" }]
```
- [ ] Step 2: `src/server/r2.ts` + 2 route handler (middleware matcher tambah `/api/photos/:path*`).
- [ ] Step 3: Verifikasi: build sukses; `opennextjs-cloudflare dev` tidak wajib — cukup `npm run dev` (binding lokal via initOpenNextCloudflareForDev); curl POST upload dummy image (buat file 1x1 png via base64) WITH session cookie (sign-in via API test user) → 200 `{keys:[...]}`; GET key → 200 image; GET tanpa cookie → 401. Kill server. (Bila login API rumit, minimal: GET tanpa cookie 401 + build sukses, sisanya E2E manual dicatat.)
- [ ] Step 4: Commit `feat(r2): infra foto — bucket binding, upload & serve route handler`.

### Task 2: Foto di laporan harian + feed parent

**Files:** Modify `src/server/actions/dailyReports.ts` (createDailyReport +photos), `src/views/TutorProgress.tsx` (upload nyata), `src/views/ParentPortal.tsx` (render foto di feed).

- [ ] Step 1: `createDailyReport` input + `photos?: string[]` (array key, maks 6, validasi tiap key prefix `reports/`).
- [ ] Step 2: TutorProgress — ganti kartu placeholder dengan input file multiple (accept image/*): pilih file → POST `/api/photos` (prefix `reports`) → keys masuk state preview (`/api/photos/{key}`) → ikut submit. Hapus kartu "menyusul".
- [ ] Step 3: ParentPortal feed — bila `report.photos?.length`, render grid foto `<img src={/api/photos/${key}}>` di kartu laporan.
- [ ] Step 4: tsc + build + commit `feat(reports): lampiran foto laporan via R2 + tampil di feed parent`.

### Task 3: Halaman Gallery live

**Files:** Modify `src/db/schema.ts` (+galleryPhotos) + migrasi; Create `src/server/actions/gallery.ts`; Modify `src/app/(admin)/gallery/page.tsx` (async server page), `src/views/Gallery.tsx` (props-driven); `scripts/seed-gallery.ts` tidak perlu (foto nyata dari upload; seed skip).

**Interfaces:**
```ts
listGalleryPhotos(): Promise<GalleryPhotoRow[]>   // admin|moderator|tutor: gallery_photos JOIN students(name) JOIN classes(name) ORDER BY createdAt DESC; unauth []
uploadGalleryPhotos(input { studentIds: string[]; caption?: string }): Promise<{ created: number }>
// tutor|admin; FormData TIDAK lewat action — client upload dulu ke /api/photos (prefix gallery) → kirim keys + studentIds + caption
// INSERT satu gallery_photos per (studentId, photoKey) kombinasi; uploadedByUserId = session
deleteGalleryPhoto(id: string): Promise<void>     // admin|moderator; hapus DB row + best-effort R2 delete
```
- [ ] Step 1: schema + generate `--name gallery_photos` + migrate (18 tabel).
- [ ] Step 2: actions.
- [ ] Step 3: page + view: grid foto (img /api/photos/key) dengan caption + nama siswa + tanggal; Dialog upload (pilih 1..n siswa optional, caption, input file) → upload ke /api/photos → `uploadGalleryPhotos` → toast + refresh; tombol hapus (admin) dengan AlertDialog.
- [ ] Step 4: tsc + build; smoke `/gallery` unauth 307. Commit `feat(gallery): halaman galeri live — upload & hapus foto via R2`.

### Task 4: Verifikasi + deploy + final review + merge

- [ ] Verification doc `docs/superpowers/plans/2026-10-05-fase4b-galeri-verification.md`: smoke, panduan QA manual (upload report→feed, upload gallery→browse→delete), catatan keamanan foto (capability URL + session).
- [ ] Commit + deploy staging (`npm run deploy`) — catat bila kuota.
- [ ] Final whole-branch review → fix wave bila perlu → merge main → hapus branch.

## Self-Review

1. Coverage: infra R2 ✓(T1), foto laporan + feed ✓(T2), galeri ✓(T3), verifikasi ✓(T4). Video galeri TIDAK (YAGNI — mime gambar saja).
2. Placeholder: interfaces lengkap; handler & action pola mengikuti kode ada.
3. Type consistency: key string dipakai konsisten T1-T3; `photos?: string[]` konsisten di T2; `GalleryPhotoRow` T3.
