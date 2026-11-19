# Plan Eksekusi 2026-11-20 — Keamanan → Permukaan Palsu → Notifikasi

> Otorisasi: user (AFK) menyetujui eksekusi mandiri sampai selesai, 2026-11-20.
> Urutan disetujui: keamanan, permukaan palsu, notifikasi. Model dana SPP tetap
> merchant platform (perizinan ditunda sampai user base tumbuh). Brief strategis:
> `docs/masukan-bunayo-vs-kompetitor-2026-11-20.md`. Versi awal: `dead7fb`.

## Keputusan desain yang diambil tanpa user (AFK)

1. **Verifikasi email TIDAK diaktifkan** — tidak ada infra kirim email di repo;
   memaksa verifikasi akan mengunci semua pendaftaran. Celah dihapus dengan
   mencabut SEMUA penautan data via email: akun parent yang belum ditautkan
   admin tidak melihat apa-apa (empty state jujur). Penautan lewat mekanisme
   admin eksisting ("Tautkan Akun Ortu" / `getLinkableParents`).
2. **Backfill data eksisting**: siswa dengan `parent_user_id` NULL yang
   `parent_email`-nya cocok dengan user parent AKTIF EKSISTING (sudah pernah
   login) ditautkan lewat skrip sekali-jalankan (uji DB dulu → prod), supaya
   parent lama tidak kehilangan akses setelah fallback dihapus.
3. **Skema**: perubahan additive saja (tabel/kolom baru, tidak ada drop/rename).
   Diterapkan via file SQL idempoten (pola migrasi paycore `0017`), uji di DB uji
   Neon (`ep-late-dawn`, `.env.test.local`) sebelum prod (`ep-silent-voice`).
4. **Notifikasi v1**: in-app (tabel `notifications` + badge) + Web Push (PWA).
   TANPA WA/email vendor (tidak ada akun BSP/Resend). Cron pakai `scheduled`
   handler jika adapter OpenNext mendukung; kalau tidak, fallback: cron Cloudflare
   → endpoint internal ber-secret (tanpa vendor eksternal).
5. **Kompat**: nomor invoice lama tidak diubah; format baru
   `INV/{slug-tenant}/{YYYYMM}/{seq}`; dedupe idempoten di level aplikasi
   (tanpa unique index di prod untuk menghindari risiko duplikat lama).

## Workstream S — Keamanan

- **S1** Matikan auto-claim: hapus auto-heal `parentChildren.ts:66-70`; hapus
  auto-link `UPDATE students/trial_applications` di `authRegistration.ts:169-186`;
  jangan timpa `parent_name/phone`. Pendaftaran parent tetap buat akun; UI
  parent tanpa anak → empty state "hubungi lembaga untuk menautkan anak".
- **S2** Hapus fallback `parent_email = session.email` di 13 titik + rute foto
  (`api/photos/[...key]/route.ts:107`) → hanya `parent_user_id`. Grep
  `parentEmail`/`parent_email` sebagai jaring pengaman.
- **S3** Skrip backfill (lihat keputusan 2), jalankan uji → verifikasi → prod.
- **S4** Harden `checkout.ts`: (a) email admin yang sudah punya tenant → pakai
  tenant eksisting (jangan buat baru); (b) order pending sama email+plan
  < 30 menit → kembalikan `checkoutUrl` lama (idempoten); (c) field honeypot +
  waktu isi form minimal; (d) rate-limit sederhana berbasis DB
  (≥5 order/jam/email → tolak).
- **S5** Nomor invoice: tabel `invoice_sequences(tenant_id, period, last)` +
  `INSERT ... ON CONFLICT DO UPDATE SET last = last+1 RETURNING last` (atomik,
  1 statement — aman tanpa transaksi neon-http). Format baru per tenant.
- **S6** Idempoten billing: `createInvoice` cek invoice eksisting
  (student + periode) → kembalikan yang ada; action baru `terbitkanTagihanMassal`
  server-side; UI `Penagihan.tsx` ganti loop client dengan action ini.
- **S7** Demo guard: email demo TIDAK PERNAH fallback ke tenant operasional
  (`authz.ts:159-162` → throw); `ensureDemoAttendanceToday` hanya jalan untuk
  tenant demo; audit jalur tulis demo lain.

## Workstream P — Permukaan palsu

- **P1** `trial.ts getAvailablePrograms` (:572-640): scope tenant dari konteks
  parent (subdomain/cookie), hapus 3 program fiktif, empty state jujur.
- **P2** `ParentCatalog.tsx` mock → render kelas nyata tenant (ada di konteks)
  atau sembunyikan; hapus `PromoBanner.tsx` mati.
- **P3** Rekening manual: kolom `tenants.bank_name/bank_account_number/bank_account_holder`;
  tampil di `ParentInvoiceDetail`/`ParentBilling` (+ tombol salin); form edit di
  `PengaturanLembaga`; toast ortu tanpa jargon "PayCore".
- **P4** Registrasi tidak lagi hardcode `city:"Jakarta"`/`priceFrom:"2000000"`
  (opsional, bisa dikosongkan); `TenantCard` sembunyikan harga/kota kosong;
  Pengaturan bisa isi kota + harga bulanan.
- **P5** Kotak Masuk admin disembunyikan dari nav (route disimpan, pola
  TutorGuides).
- **P6** Judul register per jenis lembaga; gender ortu jadi opsional; perbaiki
  duplikat judul "| Bunayo | Bunayo".
- **P7** Stepper `text-[0px]` → `sr-only`; sweep sisa mock/"Segera Hadir" yang
  terlihat parent/tutor.

## Workstream N — Notifikasi v1

- **N1** Migrasi: `notifications(id, user_id, tenant_id, type, title, body, link,
  read_at, created_at)` + index `(user_id, read_at)`; `push_subscriptions(id,
  user_id, endpoint UNIQUE, p256dh, auth, created_at)`.
- **N2** `src/server/notify.ts`: `notifyUsers(...)` tulis baris (fire-and-forget
  try/catch); push dikirim best-effort kalau terpasang.
- **N3** Hook: check-in/out siswa → parent; laporan harian baru → parent;
  pesan chat baru → penerima; invoice terbit → parent; webhook payment.succeeded
  → admin; pengumuman baru → parents target.
- **N4** Badge unread (polling 30s TanStack Query) di home ortu, home guru, shell
  admin; `markNotificationsRead`.
- **N5** PWA: `public/sw.js` (push handler + navigasi), registrasi SW, langganan
  Web Push (VAPID via `wrangler secret`), `web-push` di worker (`nodejs_compat`).
- **N6** Cron: pengingat jatuh tempo tagihan (H-3/H/H+3) → notifikasi admin.

## Verifikasi & rilis

1. Per task: `tsc`, `npm run build` (atau `npm run lint` bila ada), gate script
   bila relevan; commit terpisah per task (pola SDD inline, gotcha memori).
2. DB uji: seed + skrip verifikasi (pola `verify-*`), Playwright smoke login 3 role.
3. Prod: migrasi SQL idempoten → deploy (`--dangerouslyUseUnsupportedNextVersion`,
   matikan dev server/workerd dulu — gotcha memori) → smoke 200 + verifikasi
   webhook/checkout produksi.
4. Laporan akhir + update memori.

## Batasan

- Tidak menyentuh: aliran dana SPP (keputusan user: biarkan), multi-lokasi,
  memberships refactor, LRN, app native, marketplace booking.
- Tanpa vendor eksternal baru (tanpa Resend/WA BSP/FCM project).
- Semua perubahan additive; tidak ada data dihapus tanpa backup.
