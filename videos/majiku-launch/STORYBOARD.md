---
format: 1920x1080
duration: 75s
message: "Operasional daycare rapi dan terhubung — lembaga, guru, dan orang tua dalam satu platform"
arc: "PAS — hook pain manual → agitation overwhelm → product intro → 3 proof beats (admin, orang tua, billing) → feature breadth → social proof → CTA → brand close"
audience: "pemilik & pengelola daycare, TPA, TK/PAUD, dan bimbel di Indonesia"
mode: autonomous
music: "warm optimistic family edu-tech underscore — bright piano, soft ukulele, glockenspiel sparkle, gentle groove"
---

## Video direction

- **palette system** — dari `frame.md` (Capsule × MAJIKU): kanvas cream `{colors.cream}` dengan radial candy glows + grain 4%; headline **ink** `{colors.ink}` (Plus Jakarta Sans 700, sentence case — warna hanya pada angka stat & isi pill); aksen utama **coral** `{colors.coral}` untuk CTA/accent-line; permen lain (`yellow`, `lime`, `sky`, `peach`, `mint`, `lavender`, `violet`) mengisi pill — sepasang warm+cool, tanpa keluarga sama berdampingan; outline 2px ink pada SEMUA pill; soft offset shadow 8% ink hanya pada konten (floating pill datar).
- **motion grammar + reveal model** — settle long-tail `power3` (smooth over bouncy, tanpa overshoot); **reveal berpacing ke VO**: di t=0 hanya yang sedang diucapkan yang masuk, tiap piece muncul pada cue-nya (window di bawah mengikuti word timing nyata), menyebar ke ~50% belakang frame; hold = diam (maksimal subtle jitter, tanpa breathing, tanpa pan/push paruh belakang); seam internal = velocity-matched cut (cut-catalog).
- **rhythm / held frames** — Frame 3 (logo intro) dan Frame 10 (closing) adalah napas tenang yang di-HOLD; Frame 8 adalah klimaks count-up dengan energik tertinggi; Frame 1–2 intensi ritmis berkat kinetic slam & akumulasi.
- **negative list** — dilarang: slideshow (front-load lalu beku), screensaver (semua elemen mengambang bebas), `back.out`/`bounce.out`/`elastic.out` default, breathing loop, gradient ungu-biru "AI", navbar/browser chrome/kursor asli, headline berwarna, aksen kesepuluh, bayangan blur, container non-pill. Angka di layar hanya dari capture (500+, 25K+, 98%, 156/160, Rp 245 juta, 80% testimoni, 14 hari, 5 menit) — tidak ada angka rekaan lain.

## Frame 1 — Hook: tiga beban manual

- scene: Tiga frasa kinetik menghantam satu per satu di kanvas cream — "Absensi di buku." → "Tagihan di kertas." → "Kabar anak? Sering terlambat." — kata kunci bergantian, framing centered.
- voiceover: "Absensi di buku. Tagihan di kertas. Kabar anak? Sering terlambat."
- duration: 6.16s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Pain validation — realitas harian pengelola lembaga diucapkan apa adanya
- beat: tension + frustration
- blueprint: kinetic-type-beats (Reproduce)
- asset_candidates:
- focal: (typography — baris kinetic adalah hero)
- roles: (tanpa asset; floating-pill wallpaper sebagai atmosfer datar)
- sfx: impact-bass-1, pop, whoosh-short

narrativeRole: Membuka dengan validasi nyeri, bukan profil perusahaan — penonton lembaga merasa "ini gua banget" dalam 4 detik pertama.
keyMessage: Operasional lembaga masih manual dan kabar anak sering telat.

Adapt: keep the kinetic-beat-slam signature — tiga slams berurutan, kata kunci menerima highlight pill candy.
Scene 1 (0.0–2.0s): cream + atmosphere; floating-pill wallpaper (5, datar, tilt) masuk sekali di tepi; frasa "Absensi di buku." mendarat dead-center via kinetic beat-slam (`kinetic-beat-slam`) per kata mulai "Absensi"@0.3 — display ink ~9cqw; "buku" menerima quote-highlight lime pada cue@1.4. Centered, ~50% frame, tanpa kamera.
Scene 2 (2.0–3.7s): hard-cut word-swap (`discrete-text-sequence`) — frasa berganti "Tagihan di kertas." tepat pada cut VO@2.1; "kertas" menerima highlight coral.
Scene 3 (3.7–6.16s): "Kabar anak?" muncul cepat@3.8, lalu "Sering terlambat." slam@4.5 dengan "terlambat" italic coral; baris menetap dan HOLD — diam penuh (stillness preferred, tanpa jitter).

## Frame 2 — Overwhelm: semua datang bersamaan

- scene: Kartu tengah "Operasional harian Anda" bertahan sementara pill ikon (clipboard absensi, kartu kredit tagihan, bell chat, users siswa) menumpuk dari segala arah hingga menyesakkan, lalu meredup.
- voiceover: "Setiap hari, pengelola lembaga mengejar data siswa, pembayaran, dan pesan orang tua — semuanya datang bersamaan."
- duration: 8.6s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/02-overwhelm.html
- type: pain_point
- persuasion: Pain agitation — menumpuk sampai terasa sesak
- beat: overwhelm
- blueprint: overwhelm-surround (Adapt)
- asset_candidates: assets/svg-3dff9f27.svg — ikon clipboard-check hitam (absensi); assets/svg-74201ed0.svg — ikon kartu kredit hitam (tagihan); assets/svg-007bdb39.svg — ikon lonceng notifikasi hitam (chat masuk); assets/svg-1cb122d5.svg — ikon dua orang hitam (data siswa)
- focal: assets/svg-3dff9f27.svg — ikon clipboard-check hitam (absensi)
- roles: svg-3dff9f27 = pill ikon "Buku absen" · svg-74201ed0 = pill ikon "Tagihan manual" · svg-007bdb39 = pill ikon "Chat menumpuk" · svg-1cb122d5 = pill ikon "Data siswa" · kartu tengah = anchor HTML
- sfx: typing, impact-bass-2, pop

narrativeRole: Memperdalam nyeri menjadi sensasi kewalahan — masalahnya bukan satu pekerjaan berat, tapi banyak hal kecil datang bersamaan.
keyMessage: Tanpa sistem, seluruh operasional menumpuk di satu orang.

Adapt: keep the accumulation + close-in signature; varian clutter-shove tanpa avatar — camera-driven, tidak ada morf avatar.
Scene 1 (0.0–1.6s): pill-card putih "Operasional harian Anda" (card-headline ink) spring masuk lembut@0.3 pada "Setiap hari"; centered, ~55% frame, 1 depth layer + atmosfer.
Scene 2 (1.6–6.5s): pill ikon akumulasi satu per cue dari tepi ke sekeliling kartu — "Buku absen" (clipboard)@2.0, "Data siswa" (users)@3.2, "Tagihan manual" (credit-card)@4.2, "Chat menumpuk" (bell)@5.3 — tiap pill spring-pop-entrance (`spring-pop-entrance`, settle smooth), tilt −20°..+25°, 3 depth layers (ukuran + overlap + shadow), asimetris melingkar.
Scene 3 (6.5–8.6s): pada "semuanya datang bersamaan"@6.7 seluruh cluster menekan INWARD ke kartu (close-in, satu gerak kohesif), kartu tengah meredup ~20%, vignette tipis; HOLD sesak sampai cut — tanpa drift.

## Frame 3 — Kenalkan MAJIKU

- scene: Panggung bersih; mark sparkle MAJIKU merakit diri di tengah (orbit + bloom), wordmark MAJIKU kaskade, lalu tiga pill peran — Lembaga, Guru, Orang Tua — pop berurutan di sekeliling lockup.
- voiceover: "Kenalkan MAJIKU. Satu platform, tiga peran terhubung: lembaga, guru, dan orang tua."
- duration: 8s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/03-intro.html
- type: product_intro
- persuasion: Solution naming — kategori "satu platform, tiga peran"
- beat: curiosity → clarity
- blueprint: logo-assemble-lockup (Reproduce)
- asset_candidates: assets/logo-65fc9c68.svg — mark sparkle empat titik hitam (logo MAJIKU)
- focal: assets/logo-65fc9c68.svg — mark sparkle empat titik hitam (logo MAJIKU)
- roles: logo-65fc9c68 = hero mark (ink, di-scale besar) · tiga pill peran = HTML capsule
- sfx: sparkle, chime, pop

narrativeRole: Jawaban atas overwhelm: satu nama, satu janji, tiga peran yang selama ini terpisah kini terhubung.
keyMessage: MAJIKU = satu platform yang menghubungkan lembaga, guru, orang tua.

Registry: `logo-brand-close` (kaskade wordmark → lockup terpusat) diinstal & disesuaikan; signature move kaskade huruf dipertahankan.
Scene 1 (0.0–2.3s): panggung bersih; mark sparkle merakit diri dead-center — SVG self-draw (`svg-path-draw`) + settle orbit (`orbit-3d-entry`) — glow radial atmosfer di belakang mark mencerah (opacity tween pada layer glow, bukan rule) pada "Kenalkan MAJIKU"@0.3–2.2. Centered, mark ~30% frame.
Scene 2 (2.3–5.2s): wordmark "MAJIKU" kaskade huruf-demi-huruf (mekanik `logo-brand-close`) mulai@2.4 pada "satu platform"; pill subtitle "SATU PLATFORM, TIGA PERAN TERHUBUNG" pop@3.5 di bawah lockup.
Scene 3 (5.2–8.0s): tiga pill peran — "Lembaga"@5.3 (coral), "Guru"@6.3 (mint), "Orang Tua"@7.0 (sky) — pop membentuk busur di sekeliling lockup (cluster→outward expansion, `center-outward-expansion`); HOLD tenang sampai cut — frame napas ini sengaja diam.

## Frame 4 — Dashboard admin: semuanya terpantau

- scene: Jendela pill-card berisi screenshot dashboard admin MAJIKU sebagai hero; callout pill muncul satu per satu mengikuti VO — "Kehadiran real-time 156/160", "Tagihan", "Laporan" — kamera zoom-to-target per callout.
- voiceover: "Dari satu dashboard admin: kehadiran real-time, tagihan, dan laporan lembaga, semuanya terpantau."
- duration: 7.28s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-admin.html
- type: feature_showcase
- persuasion: Show-don't-tell proof — interface nyata, angka nyata dari landing
- beat: control + clarity
- blueprint: device-surface-showcase (Adapt)
- asset_candidates: assets/dashboard-preview.jpg — dashboard analytics gelap dengan bar chart teal
- focal: assets/dashboard-preview.jpg — dashboard analytics gelap dengan bar chart teal
- roles: dashboard-preview.jpg = hero (layar jendela, full-color tanpa dim) · callout pills = supporting HTML · label "DASHBOARD ADMIN" = chrome
- sfx: whoosh, ping, click

narrativeRole: Bukti pertama: kontrol penuh lembaga dalam satu layar — kehadiran, uang, laporan.
keyMessage: Satu dashboard memantau seluruh operasional.

Adapt: varian floating-window + stepwise callouts tanpa kursor; screenshot dipajang utuh di jendela pill-card (outline 2px + shadow 0.6cqw), bukan dipotong-potong.
Scene 1 (0.0–2.2s): jendela pill-card (~62% lebar, asimetris 60/40 kiri) berisi dashboard-preview.jpg slide-up lembut@0.0–0.8 pada "Dari satu dashboard admin"; label pill "DASHBOARD ADMIN" pop di atas jendela@1.6.
Scene 2 (2.2–5.7s): callout pill muncul per cue di kanan jendela, tiap pop disertai zoom-to-target kecil (`coordinate-target-zoom`, scale+counter-translate) — "Kehadiran real-time · 156/160 siswa"@2.3 (angka coral), "Tagihan · Rp 245 jt"@3.7, "Laporan & analytics"@4.6.
Scene 3 (5.7–7.28s): kamera kembali ke framing penuh jendela@5.7; baris check-pill hijau "Semuanya terpantau" pop@5.9 di bawah jendela; HOLD — tanpa gerak lanjutan.

## Frame 5 — Portal orang tua: tenang di HP

- scene: Mockup ponsel (pill-card HTML) berisi foto anak bermain cat sebagai layar; notifikasi pill kaskade mengikuti VO — "Aisyah sudah tiba! 08:15", "Foto kegiatan", "Laporan harian" — tiap notifikasi pop dengan cue-nya.
- voiceover: "Orang tua ikut tenang. Notifikasi check-in, foto kegiatan, sampai laporan harian, langsung di ponsel mereka."
- duration: 8.08s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-parent.html
- type: feature_showcase
- persuasion: Feature-to-benefit translation — fitur portal → ketenangan orang tua (dan kepercayaan ke lembaga)
- beat: relief + warmth
- blueprint: device-surface-showcase (Adapt)
- asset_candidates: assets/parent-app-preview.jpg — anak kecil lucu dengan tangan penuh cat, latar hijau gelap hangat
- focal: assets/parent-app-preview.jpg — anak kecil lucu dengan tangan penuh cat, latar hijau gelap hangat
- roles: parent-app-preview.jpg = layar ponsel (hero) · notifikasi pills = supporting HTML (mekanik macos-notification, kulit capsule) · headline kanan = chrome
- sfx: notification, pop, chime

narrativeRole: Sisi emosional produk: orang tua melihat anaknya setiap hari — alasan utama orang tua percaya dan bertahan di lembaga.
keyMessage: Orang tua selalu terhubung — check-in, foto, laporan harian di HP.

Registry: `macos-notification` diinstal & di-reskin menjadi pill capsule (outline 2px, candy icon-dot) — mekanik banner pop-nya dipertahankan.
Scene 1 (0.0–1.9s): mockup ponsel (rounded 2rem, outline tebal, ~34% lebar, kiri) naik lembut@0.0–0.9 dengan parent-app-preview.jpg sebagai layar; glow peach hangat di belakang; headline "Orang tua ikut tenang." (card-headline ink, kanan 40%) masuk per frasa@0.2.
Scene 2 (1.9–6.4s): tiga notifikasi pill kaskade menumpuk di sisi kanan ponsel per cue — "✓ Aisyah sudah tiba! · 08:15"@2.0 (mint), "Foto kegiatan baru"@3.6 (sky), "Laporan harian siap"@4.9 (yellow) — tiap banner slide-in + settle (mekanik macos-notification), stagger penuh mengikuti VO.
Scene 3 (6.4–8.08s): subheadline kecil "Langsung di ponsel mereka." fade-up@6.5 di bawah headline; notifikasi menetap; HOLD hangat — tanpa drift.

## Frame 6 — Billing otomatis: tanpa dikejar

- scene: Kartu pemicu "Buat invoice bulanan" diklik → status theater "Menerbitkan…" → baris invoice kaskade dan centang "Lunas" berjatuhan satu per satu; pill rekap "Pembayaran masuk" menetap di akhir.
- voiceover: "Tagihan terbit otomatis. Pengingat terkirim sendiri. Pembayaran tercatat, tanpa dikejar satu per satu."
- duration: 7.4s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/06-billing.html
- type: feature_showcase
- persuasion: Friction reduction — pekerjaan mengejar pembayaran hilang
- beat: ease + control
- blueprint: agent-progress-theater (Reproduce)
- asset_candidates:
- focal: (panel invoice rekonstruksi HTML — bukti status mutation)
- roles: trigger card = HTML capsule · invoice rows = HTML capsule dengan badge success-check · rekap pill = supporting
- sfx: notification, click-soft, pop

narrativeRole: Nyeri terbesar pemilik lembaga (menagih) dituntaskan sebagai teater otomasi: terbit → terkirim → tercatat.
keyMessage: Billing berjalan sendiri — invoice, pengingat, catatan pembayaran.

Registry: `success-check` (ring pop + path draw) untuk badge "Lunas"; trigger click pakai `press-release-spring`.
Scene 1 (0.0–2.2s): pill-card trigger "Buat invoice bulanan" + tombol pill coral, pop@0.0 di kiri (asimetris 45/55) pada "Tagihan terbit otomatis"; tekan tombol (button press, `press-release-spring`)@1.5.
Scene 2 (2.2–5.5s): status theater — pill status "Menerbitkan…" dengan spinner dot@2.4 berganti "Pengingat terkirim ✓"@3.6; panel invoice (3 baris rekonstruksi: "Siswa · Paket bulanan · Rp 850.000" dst) kaskade masuk kanan@4.1, tiap baris badge "Lunas" flip via success-check (`success-check` ring pop + path draw), stagger.
Scene 3 (5.5–7.4s): pill rekap "Pembayaran masuk — tercatat otomatis" pop@5.6 di bawah panel; baris menetap; HOLD.

## Frame 7 — Semua yang Anda butuhkan

- scene: Lima tile pill-card merakit grid kaskade — Manajemen Siswa, Laporan & Analitik, Komunikasi Orang Tua, Billing Otomatis, Manajemen Tutor — tiap tile pop pada cue VO-nya, headline di atas.
- voiceover: "Manajemen siswa, laporan dan analitik, komunikasi orang tua, billing otomatis, semua lengkap dalam satu platform."
- duration: 8.88s
- transition_in: crossfade
- status: animated
- src: compositions/frames/07-features.html
- type: benefit_highlight
- persuasion: Value stacking — keluasan fitur ditumpuk cepat
- beat: confidence
- blueprint: grid-card-assemble (Reproduce)
- asset_candidates: assets/svg-1cb122d5.svg — ikon users hitam; assets/svg-93383a88.svg — ikon clipboard-check hitam; assets/svg-007bdb39.svg — ikon lonceng hitam; assets/svg-74201ed0.svg — ikon kartu kredit hitam
- focal: assets/svg-1cb122d5.svg — ikon users hitam (tile pertama)
- roles: svg-1cb122d5 = icon tile "Manajemen Siswa" · svg-93383a88 = icon tile "Laporan & Analitik" · svg-007bdb39 = icon tile "Komunikasi Orang Tua" · svg-74201ed0 = icon tile "Billing Otomatis" · tile "Manajemen Tutor" = card-icon huruf "T"
- sfx: pop, click-soft, sparkle

narrativeRole: Setelah tiga bukti mendalam, perlihatkan keluasan: platform ini menutup seluruh kebutuhan, bukan satu masalah.
keyMessage: Fitur lengkap — siswa, laporan, komunikasi, billing, tutor — dalam satu platform.

Scene 1 (0.0–0.4s): title-pill "FITUR LENGKAP" + headline "Semua yang Anda butuhkan" (section-headline ink) slide-up@0.0; grid area masih kosong — hanya atmosfer.
Scene 2 (0.4–6.4s): lima tile pill-card (card-icon candy + card-headline + body pendek) kaskade ke grid 3+2 pada cue — "Manajemen Siswa"@0.4 (users, coral), "Laporan & Analitik"@1.7 (clipboard, sky), "Komunikasi Orang Tua"@3.5 (bell, mint), "Billing Otomatis"@5.3 (credit-card, yellow), tile kelima "Manajemen Tutor"@5.9 (letter T, lavender) tiba senyap di ritme — tiap tile spring-pop settle, shadow 0.4cqw.
Scene 3 (6.5–8.88s): payoff pada "semua lengkap dalam satu platform"@6.5 — kelima tile terangkat halus (shadow menguat sekali, bukan glow rule) dan pill "SATU PLATFORM" pop di bawah grid; HOLD.

## Frame 8 — Bukti: angka yang bicara

- scene: Grid stat-pill count-up — "500+ Lembaga Aktif", "25K+ Siswa Terkelola", "80% Waktu Admin Hemat" — angka naik dengan skala membesar; pill atribusi kecil "Pak Hendra — Direktur Bimbel Prestasi" di bawah angka 80%.
- voiceover: "Lebih dari lima ratus lembaga sudah memakainya. Dua puluh lima ribu siswa terkelola. Waktu admin pun hemat hingga delapan puluh persen."
- duration: 8.6s
- transition_in: crossfade
- status: animated
- src: compositions/frames/08-proof.html
- type: social_proof
- persuasion: Statistical proof — angka adopsi + klaim hemat 80% beratribusi
- beat: trust + awe
- blueprint: dataviz-countup (Reproduce)
- asset_candidates:
- focal: (stat-pill 80% — angka terbesar)
- roles: stat-pill 500+ = primary pertama · stat-pill 25K+ = supporting · stat-pill 80% = hero klimaks · atribusi pill = chrome
- sfx: riser, impact-bass-1, ping

narrativeRole: Klimaks kepercayaan: bukan lagi janji, tapi bukti adopsi dan dampak terukur dari pengguna nyata.
keyMessage: Dipercaya 500+ lembaga; billing MAJIKU hemat waktu admin hingga 80%.

Registry: `count-up` (component) untuk mekanik angka; value-scaled counter (`counting-dynamic-scale`) membuat angka membesar saat naik.
Scene 1 (0.0–3.1s): stat-pill 1 "500+ / LEMBAGA AKTIF" pop@0.2 kiri-tengah (asimetris), angka coral count-up 0→500 membesar (`counting-dynamic-scale`) pada "lebih dari lima ratus lembaga"@0.7.
Scene 2 (3.3–5.5s): stat-pill 2 "25K+ / SISWA TERKELOLA" pop@3.3 di sampingnya, angka sky count-up; grid 2-up menetap.
Scene 3 (5.6–8.6s): stat-pill 3 "80% / WAKTU ADMIN HEMAT" mendarat@5.6 sebagai HERO — 3× ukuran tetangganya, angka yellow count-up 0→80 + accent bar terisi (`stat-bars-and-fills`); pill atribusi kecil "Pak Hendra — Direktur Bimbel Prestasi" fade-up@7.4 di bawahnya; HOLD klimaks — masih.

## Frame 9 — CTA: mulai gratis 14 hari

- scene: Mark MAJIKU mengecil menjadi tombol CTA coral "Mulai Gratis 14 Hari"; kursor animasi datang dan klik (ripple); dua pill penopang pop pada cue — "Tanpa kartu kredit", "Setup 5 menit" — pill URL menetap di bawah.
- voiceover: "Coba MAJIKU gratis empat belas hari. Tanpa kartu kredit, setup hanya lima menit."
- duration: 6.04s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/09-cta.html
- type: cta
- persuasion: Risk reversal — gratis 14 hari, tanpa kartu kredit, setup 5 menit
- beat: urgency-to-act + motivation
- blueprint: cta-morph-press (Reproduce)
- asset_candidates: assets/logo-65fc9c68.svg — mark sparkle yang morf menjadi tombol CTA
- focal: assets/logo-65fc9c68.svg — mark sparkle yang morf menjadi tombol CTA
- roles: logo-65fc9c68 = mark sumber morf · tombol CTA coral = hero (HTML) · kursor = press-ripple animasi · pill penopang = supporting
- sfx: click, pop

narrativeRole: Identitas menyempit menjadi satu aksi konkret; hambatan psikologis dibongkar satu per satu.
keyMessage: Mulai gratis 14 hari — tanpa kartu kredit, setup 5 menit.

Registry: `press-ripple` (kursor decel-arrive + ripple) untuk klik; morf mark→tombol pakai scale-swap (`scale-swap-transition`).
Scene 1 (0.0–2.7s): mark sparkle kecil di tengah@0.0–0.4, lalu scale-swap menjadi tombol CTA coral "Mulai Gratis 14 Hari" (pill besar, shadow 0.4cqw)@0.4–1.0 pada "Coba MAJIKU gratis 14 hari"; kursor animasi decel-arrive dari luar kanan (`press-ripple`)@2.0 dan klik@2.4 — ripple ekspansi.
Scene 2 (2.9–4.2s): pill penopang "Tanpa kartu kredit" (mint) pop@2.9 di kiri tombol pada cue-nya.
Scene 3 (4.2–6.04s): pill "Setup 5 menit" (sky) pop@4.2 di kanan tombol; pill URL kecil "majiku.moxsenna.workers.dev" fade-up@5.2 di bawah; HOLD.

## Frame 10 — Closing: kelola dengan lebih mudah

- scene: End card tenang — lockup MAJIKU + sparkle di tengah, tagline "Kelola lembaga pendidikan Anda dengan lebih mudah." dengan frasa "lebih mudah" di-highlight pill candy; floating-pill wallpaper; hold sampai akhir.
- voiceover: "MAJIKU. Kelola lembaga pendidikan Anda dengan lebih mudah."
- duration: 4.92s
- transition_in: crossfade
- status: animated
- src: compositions/frames/10-closing.html
- type: branding
- persuasion: Brand promise echo — menutup dengan kalimat H1 landing sebagai janji
- beat: peace of mind
- blueprint: titlecard-reveal (Reproduce)
- asset_candidates: assets/logo-65fc9c68.svg — mark sparkle MAJIKU untuk lockup akhir
- focal: assets/logo-65fc9c68.svg — mark sparkle MAJIKU untuk lockup akhir
- roles: logo-65fc9c68 = mark lockup (hero) · tagline = chrome · quote-highlight pill = penekanan
- sfx: chime, sparkle

narrativeRole: Kembali ke janji brand dengan tenang — kalimat terakhir yang diingat, identitas di-HOLD sampai frame terakhir.
keyMessage: MAJIKU — kelola lembaga pendidikan dengan lebih mudah.

Scene 1 (0.0–1.6s): cream + atmosphere; floating-pill wallpaper (6, datar) settle masuk sekali; lockup "MAJIKU" + sparkle mark mendarat center@0.4 pada "MAJIKU" — spring settle smooth tanpa bounce; title-pill "PLATFORM DAYCARE & BIMBEL" pop kecil di atas.
Scene 2 (1.7–3.5s): tagline "Kelola lembaga pendidikan Anda" fade-up per frasa@1.7 (card-headline ink, centered).
Scene 3 (3.5–4.92s): frasa "lebih mudah" membungkus diri dalam quote-highlight lime@3.8 pada cue VO; accent-line coral di bawah; HOLD penuh sampai akhir video — final frame, exit alami.
