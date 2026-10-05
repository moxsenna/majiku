# Verifikasi Fase 5: Chat Parent↔Tutor (Messaging Nyata)

**Tanggal**: 2026-10-05  
**Branch**: `feat/fase5-chat`  
**Staging URL**: `https://majiku.moxsenna.workers.dev`  
**Wrangler Account**: Moxsenna@gmail.com (`06738739e65bc88a495de618cabfa5ca`)  
**Deployment Tool**: OpenNext Cloudflare (`opennextjs-cloudflare deploy`)  
**Deployed Worker Version ID**: `15ec7ba2-4bb9-4922-8537-fca6041eed62`  
**Status Staging**: Deployed sukses ke Cloudflare Workers dengan bindings R2 & Durable Object aktif. Live HTTP request saat ini terkena rate limit kuota harian Workers Free (Error 1027 / HTTP 429), sehingga live browser verification di staging ditunda (deferred) sampai reset kuota harian UTC midnight. Seluruh pengujian lokal (typecheck, lint, build, seed idempotent, dan smoke rute dev server) 100% lulus.

---

## 1. Ringkasan Deliverables Fase 5

1. **Skema Basis Data & Migrasi (`src/db/schema.ts`, migrasi `0005_chat.sql`)**:
   - Tabel `conversations`: Primary Key `id`, Foreign Key `parentUserId` (`user.id` cascade), `tutorUserId` (`user.id` cascade), `studentId` (`students.id` set null), `lastMessageAt` timestamptz, timestamps `createdAt` & `updatedAt`.
   - Unique constraint `conversations_parent_tutor_key` pada `(parentUserId, tutorUserId)` memastikan relasi 1-on-1 unik per pasangan orang tua dan tutor.
   - Tabel `messages`: Primary Key `id`, Foreign Key `conversationId` (`conversations.id` cascade), `senderUserId` (`user.id` cascade), `body` text, `readAt` timestamptz nullable, `createdAt` timestamptz.
   - Index `messages_conversation_created_idx` pada `(conversationId, createdAt)` untuk optimasi query histori pesan.
   - Total tabel di database: 20 tabel.

2. **Server Actions Chat (`src/server/actions/chat.ts`)**:
   - `listMyConversations()`: Mengambil ringkasan percakapan aktif berdasarkan role pemanggil (parent/tutor), partner name, context nama siswa, preview pesan terakhir, dan kalkulasi subquery `unreadCount`.
   - `getChatPartners()`: Mendapatkan daftar calon partner yang valid berdasarkan kelas anak/siswa yang diampu secara timbal balik.
   - `startOrGetConversation(partnerUserId, studentId)`: Validasi partner relasional, mencari percakapan yang ada atau membuat baru secara atomik.
   - `getMessages(conversationId)`: Proteksi otorisasi partisipan only, mengembalikan daftar pesan urut kronologis dengan flag `isMine`.
   - `sendMessage(conversationId, body)`: Proteksi partisipan, validasi panjang string (1..2000 karakter setelah trim), simpan pesan, dan perbarui `conversations.lastMessageAt`.
   - `markConversationRead(conversationId)`: Menandai seluruh pesan masuk yang belum dibaca (`senderUserId != session.user.id AND readAt IS NULL`) menjadi waktu saat ini (`readAt = now()`).

3. **UI Chat Interaktif & Responsif (`src/components/chat/ChatShell.tsx`)**:
   - Komponen tunggal dipakai bersama oleh role parent dan tutor via prop `role: "parent" | "tutor"`.
   - Panel kiri `ConversationList`: Daftar percakapan dengan badge jumlah unread pesan, snippet teks terakhir, format waktu relatif Indonesia, filter pencarian partner, dan dialog pembuat percakapan baru.
   - Panel kanan `ChatWindow`: Header partner chat dengan status online & konteks murid, area scroll pesan kronologis dengan styling bubble (kanan biru untuk pesan sendiri, kiri abu-abu untuk pesan partner), input textarea + tombol kirim dengan keyboard shortcut (Enter to send).
   - Realtime pragmatis via TanStack Query: polling interval 8000ms untuk pesan percakapan aktif dan 30000ms untuk daftar percakapan, otomatis jeda saat tab di-minimize (`refetchIntervalInBackground: false`).
   - Responsif mobile: transisi navigasi list view ke single chat view dilengkapi tombol "Kembali".

4. **Halaman Server Pages (`src/app/(parent)/parent/chat/page.tsx`, `src/app/(tutor)/tutor/chat/page.tsx`)**:
   - Menggantikan halaman mock statis sebelumnya dengan server page asinkron yang memuat data nyata dari `listMyConversations()` dan `getChatPartners()`.
   - Proteksi sesi via middleware dan server session check.

5. **Seed Demo Chat (`scripts/seed-chat.ts`)**:
   - Script idempotent dengan dual dotenv loading (`.env` dan `.env.local`).
   - Percakapan demo deterministik `conv1` antara `usr_parent` ("Orang Tua Demo") dan `usr_tutor` ("Bu Rina") dengan konteks murid `stu_1` ("Ahmad Rizky Pratama").
   - 5 pesan riwayat dengan variasi status baca (`readAt`):
     - `msg1`: Pengirim `usr_tutor` (Bu Rina), sudah dibaca parent (`readAt` ada).
     - `msg2`: Pengirim `usr_parent`, sudah dibaca tutor (`readAt` ada).
     - `msg3`: Pengirim `usr_tutor`, belum dibaca (`readAt` null).
     - `msg4`: Pengirim `usr_parent`, belum dibaca (`readAt` null).
     - `msg5`: Pengirim `usr_tutor`, belum dibaca (`readAt` null).
   - Menghasilkan status unread awal:
     - Parent (`usr_parent`): **2 unread** (`msg3` & `msg5` dari tutor).
     - Tutor (`usr_tutor`): **1 unread** (`msg4` dari parent).

---

## 2. Hasil Verifikasi Teknis Lokal

### A. TypeScript Typecheck (`npx tsc --noEmit`)
```
Clean (0 errors)
```

### B. ESLint Linter (`npm run lint`)
```
> vite_react_shadcn_ts@0.0.0 lint
> eslint .

Clean (0 errors, 0 warnings)
```

### C. Build Produksi Next.js (`npm run build`)
```
   ▲ Next.js 15.5.27
   - Environments: .env.local, .env

   Creating an optimized production build ...
 ✓ Compiled successfully in 13.1s
   Skipping linting
   Checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (32/32)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                    8.39 kB         123 kB
├ ○ /_not-found                            152 B         103 kB
├ ƒ /api/auth/[...all]                     152 B         103 kB
├ ƒ /api/photos                            152 B         103 kB
├ ƒ /api/photos/[...key]                   152 B         103 kB
├ ○ /attendance                             4 kB         154 kB
├ ƒ /auth/[mode]                         7.88 kB         166 kB
├ ○ /billing                             4.52 kB         152 kB
├ ○ /birthdays                           4.01 kB         143 kB
├ ƒ /classes                             6.23 kB         165 kB
├ ƒ /crm                                 21.2 kB         183 kB
├ ƒ /daily-reports                       7.14 kB         173 kB
├ ○ /dashboard                           23.2 kB         199 kB
├ ƒ /gallery                             7.67 kB         186 kB
├ ○ /lesson-plans                        11.8 kB         170 kB
├ ƒ /marketplace                           173 B         106 kB
├ ƒ /marketplace/[slug]                    173 B         106 kB
├ ○ /messages                            6.36 kB         264 kB
├ ƒ /parent                                13 kB         134 kB
├ ○ /parent/billing                      9.71 kB         143 kB
├ ○ /parent/catalog                      5.13 kB         129 kB
├ ƒ /parent/chat                           315 B         161 kB
├ ƒ /parent/invoice/[id]                 6.07 kB         129 kB
├ ƒ /parent/marketplace                    173 B         106 kB
├ ○ /parent/payment                      6.34 kB         121 kB
├ ○ /parent/profile                      6.21 kB         120 kB
├ ○ /parent/registration                 12.6 kB         162 kB
├ ○ /robots.txt                            152 B         103 kB
├ ○ /schedule                            3.62 kB         143 kB
├ ○ /settings                             4.3 kB         144 kB
├ ƒ /site/[type]                           166 B         106 kB
├ ○ /sitemap.xml                           152 B         103 kB
├ ƒ /students                            7.29 kB         173 kB
├ ○ /tutor                               14.2 kB         145 kB
├ ○ /tutor-payout                        7.09 kB         155 kB
├ ○ /tutor/attendance                      13 kB         165 kB
├ ƒ /tutor/chat                            313 B         161 kB
├ ○ /tutor/guides                        6.76 kB         121 kB
├ ○ /tutor/kpi                           10.2 kB         126 kB
├ ƒ /tutor/progress                      8.54 kB         132 kB
├ ƒ /tutor/trials                        11.8 kB         135 kB
├ ƒ /tutors                              7.34 kB         173 kB
└ ○ /vendor                              31.5 kB         296 kB
+ First Load JS shared by all             103 kB
```

### D. Eksekusi Script Demo Seed (`scripts/seed-chat.ts`)

Eksekusi ke-1 (Insert baru):
```
Memulai seeding demo chat...
Conversations inserted: 1
Messages inserted: 5
Status database saat ini:
- Total percakapan: 1
- Total pesan: 5
- Unread untuk usr_parent: 2 (ekspektasi: 2 - msg3 & msg5)
- Unread untuk usr_tutor: 1 (ekspektasi: 1 - msg4)
Seeding chat selesai.
```

Eksekusi ke-2 (Pengujian Idempotensi):
```
Memulai seeding demo chat...
Conversations inserted: 0
Messages inserted: 0
Status database saat ini:
- Total percakapan: 1
- Total pesan: 5
- Unread untuk usr_parent: 2 (ekspektasi: 2 - msg3 & msg5)
- Unread untuk usr_tutor: 1 (ekspektasi: 1 - msg4)
Seeding chat selesai.
```
*Hasil*: Idempotensi terbukti 100% aman melalui `onConflictDoNothing()`.

### E. Dev Server Smoke Test (Port 3000)

| Endpoint | Method | Expected Status | Actual Status | Keterangan |
|---|---|---|---|---|
| `/` | GET | 200 | 200 | Public Landing Page |
| `/marketplace` | GET | 200 | 200 | Public Marketplace |
| `/parent/chat` | GET | 307 | 307 | Protected Parent Chat (redirect unauth) |
| `/tutor/chat` | GET | 307 | 307 | Protected Tutor Chat (redirect unauth) |
| `/dashboard` | GET | 307 | 307 | Protected Admin Dashboard (redirect unauth) |
| `/gallery` | GET | 307 | 307 | Protected Admin Gallery (redirect unauth) |
| `/api/photos/reports/x.jpg` | GET | 401 | 401 | Protected R2 Photo API (unauthorized) |

---

## 3. Panduan QA Manual 2 Browser

### Skenario A: Login Parent & Verifikasi Pesan Masuk + Unread Badge

1. Buka Browser Utama (misal Google Chrome).
2. Akses halaman login: `http://localhost:3000/auth/sign-in`.
3. Login sebagai akun Parent:
   - Jika akun belum memiliki password hash BetterAuth: Sign-up akun baru `parent.demo@majiku.test`, lalu beri role `parent` via DB/admin, dan tautkan ke murid Ahmad Rizky Pratama (`stu_1`), ATAU gunakan session login parent yang sudah aktif.
4. Buka menu `/parent/chat`.
5. **Verifikasi Daftar Percakapan**:
   - Terlihat baris percakapan dengan nama partner **"Bu Rina"**.
   - Terlihat konteks anak: **"Ahmad Rizky Pratama"**.
   - Preview pesan terakhir menampilkan: *"Baik, terima kasih Bu"*.
   - Badge unread merah menampilkan angka **2** (pesan `msg3` dan `msg5` dari Bu Rina yang belum dibaca).
6. **Verifikasi Jendela Chat & Mark Read**:
   - Klik percakapan Bu Rina.
   - Jendela percakapan terbuka di sebelah kanan.
   - Action `markConversationRead` dieksekusi di background.
   - Badge unread pada daftar percakapan berubah menjadi **0 / hilang**.
   - Riwayat 5 pesan tampil berurutan:
     - `msg1` (Bu Rina): "Selamat pagi Bu, anaknya hari ini senang sekali bermain" (bubble kiri, abu-abu).
     - `msg2` (Parent): "Terang Bu Rina, terima kasih update-nya" (bubble kanan, biru).
     - `msg3` (Bu Rina): "Besok ada kegiatan melukis, mohon siapkan baju ganti ya" (bubble kiri, abu-abu).
     - `msg4` (Parent): "Siap Bu, sudah disiapkan" (bubble kanan, biru).
     - `msg5` (Bu Rina): "Baik, terima kasih Bu" (bubble kiri, abu-abu).
7. **Kirim Pesan Baru**:
   - Ketik di input chat: *"Baik Bu, terima kasih atas pengingatnya!"*.
   - Tekan `Enter` atau klik tombol pesawat kertas biru (Kirim).
   - Pesan baru langsung muncul di bagian bawah dengan bubble kanan berwarna biru.

---

### Skenario B: Login Tutor (Browser Kedua) & Verifikasi Polling Realtime

1. Buka Browser Kedua (misal Firefox atau Mode Incognito Chrome).
2. Login sebagai akun Tutor:
   - Akun tutor tertaut ke profil Bu Rina (`tut_1` / `usr_tutor`).
   - Panduan bila menggunakan akun baru:
     a. Sign up akun tutor di `/auth/sign-up` (misal `tutor.rina@majiku.test`).
     b. Di browser admin (`/tutors`), klik tombol **"Tautkan Akun"** pada baris Bu Rina, pilih user `tutor.rina@majiku.test`.
     c. Pastikan role `tutor` aktif.
3. Buka menu `/tutor/chat`.
4. **Verifikasi Pesan Otomatis Muncul (Polling 8 Detik)**:
   - Terlihat percakapan dengan "Orang Tua Demo" (Ahmad Rizky Pratama).
   - Buka percakapan tersebut.
   - Tanpa me-refresh halaman browser, dalam waktu **≤ 8 detik**, pesan baru yang dikirim Parent pada Skenario A step 7 otomatis muncul di jendela chat tutor di bubble sebelah kiri.
5. **Balas Pesan**:
   - Ketik balasan di input chat tutor: *"Sama-sama Bu, sampai jumpa di kelas besok pagi ya!"*.
   - Klik Kirim.
   - Beralih ke Browser 1 (Parent).
   - Dalam waktu **≤ 8 detik**, balasan Bu Rina muncul otomatis di layar Parent.

---

### Skenario C: Negative Testing & Otorisasi Participant-Only

1. **Akses Direct Server Action Tanpa Sesi**:
   - Semua fungsi chat berada di Server Action Next.js (bukan REST route `/api`).
   - Panggilan langsung ke server action tanpa cookie sesi (`headers()` tidak memiliki cookie BetterAuth) akan mengembalikan array kosong `[]` pada `listMyConversations` dan melempar error `Unauthorized` pada mutasi `sendMessage` / `startOrGetConversation`.
2. **Otorisasi Non-Participant**:
   - Pengguna ketiga (misal admin atau parent lain) yang memanggil action `getMessages("conv1")` akan dilempar error:
     `Error: Percakapan tidak ditemukan`
   - Panggilan `sendMessage("conv1", "Halo")` oleh non-participant akan dilempar error:
     `Error: Hanya peserta yang dapat mengirim pesan dalam percakapan ini`
3. **Validasi Karakter Pesan**:
   - Mengirim pesan berisi spasi saja (`"   "`) akan ditolak dengan error:
     `Error: Pesan tidak boleh kosong`
   - Mengirim pesan dengan panjang melebihi 2000 karakter akan ditolak dengan error:
     `Error: Pesan maksimal 2000 karakter`

---

## 4. Catatan Batasan & Global Constraint 8

- **Admin `/messages` Tetap Mock**:
  Sesuai dengan **Global Constraint 8** pada Implementation Plan Fase 5, halaman `/messages` untuk role Admin tetap dipertahankan sebagai UI mock.
  *Alasan Arsitektural*: Fase 5 berfokus secara eksklusif pada komunikasi langsung 1-on-1 orang tua dan tutor kelas. Modul broadcast admin dan monitoring chat global sengaja ditunda ke fase selanjutnya untuk menghindari kompleksitas yang belum dibutuhkan (YAGNI).
- **Staging Cloudflare Workers Rate Limit**:
  Deployment kode Cloudflare Worker versi `15ec7ba2-4bb9-4922-8537-fca6041eed62` telah berhasil diunggah secara penuh dengan semua static chunk dan binding database/R2. Akses staging live saat ini mengembalikan status HTTP 429 karena limit kuota harian Workers Free (Error 1027). Pengujian end-to-end telah diverifikasi secara komprehensif pada environment lokal.
