---
format: 1080x1920
duration: 23s
message: "Operasional daycare rapi dan terhubung — dalam 20 detik"
arc: "Cutdown PAS — hook → intro → parent → proof → CTA"
audience: "pemilik & pengelola daycare, TPA, TK/PAUD, bimbel di Indonesia"
mode: autonomous
music: "warm optimistic family edu-tech underscore (reuse track dari launch)"
---

## Video direction

- Identik dengan `../majiku-launch/STORYBOARD.md` § Video direction (palette capsule × MAJIKU, motion grammar power3, reveal VO-paced, negative list) — dengan adaptasi vertikal 1080x1920: konten tersusun **kolom** (title-pill di atas, hero di tengah ~55% tinggi, penopang di bawah), floating-pill wallpaper 4–5 di pita atas/bawah, caption band bawah ~14% tetap kosong.
- Rhythm: F1 ritmis (slam), F2/F5 napas tenang, F4 klimaks count-up.

## Frame 1 — Hook vertikal

- scene: Tiga frasa kinetik slam berurutan, tersusun vertikal di tengah frame — "Absensi di buku." → "Tagihan di kertas." → "Kabar anak? Sering terlambat."
- voiceover: "Absensi di buku. Tagihan di kertas. Kabar anak? Sering terlambat."
- duration: 6.24s
- transition_in: cut
- status: outline
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Pain validation
- beat: tension + frustration
- blueprint: kinetic-type-beats (Reproduce)
- asset_candidates:
- focal: (typography)
- roles: (floating-pill wallpaper pita atas/bawah)
- sfx: impact-bass-1, pop

narrativeRole: Validasi nyeri dalam 6 detik pertama — penonton vertical scroll berhenti.
keyMessage: Operasional lembaga masih manual.

Scene 1 (0.0–2.2s): cream + atmosphere; floating-pill wallpaper (4) di pita atas & bawah; "Absensi di buku." mendarat center via kinetic beat-slam (`kinetic-beat-slam`) mulai@0.3 — display ink ~10cqw, dua baris; "buku" highlight lime@1.4.
Scene 2 (2.2–3.9s): hard-cut word-swap (`discrete-text-sequence`) — "Tagihan di kertas."@2.1; "kertas" highlight coral.
Scene 3 (3.9–6.5s): "Kabar anak?"@3.8 lalu "Sering terlambat." slam@4.5, "terlambat" italic coral; HOLD diam.

## Frame 2 — Kenalkan MAJIKU

- scene: Mark sparkle merakit diri, wordmark MAJIKU kaskade di bawahnya, tiga pill peran tersusun kolom di bawah lockup.
- voiceover: "Kenalkan MAJIKU — satu platform untuk seluruh operasional daycare."
- duration: 5.72s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/02-intro.html
- type: product_intro
- persuasion: Solution naming
- beat: curiosity → clarity
- blueprint: logo-assemble-lockup (Reproduce)
- asset_candidates: assets/logo-65fc9c68.svg — mark sparkle MAJIKU
- focal: assets/logo-65fc9c68.svg
- roles: logo-65fc9c68 = hero mark · 3 pill peran = HTML kolom
- sfx: sparkle, chime

Scene 1 (0.0–2.3s): mark sparkle self-draw (`svg-path-draw`) + orbit settle (`orbit-3d-entry`) center-atas (~38% tinggi); glow atmosfer mencerah (opacity tween); wordmark "MAJIKU" kaskade huruf mulai@2.4... sesuaikan: cue "Kenalkan MAJIKU"@0.3–2.2 → mark+wordmark bersama; subtitle pill pop@2.6.
Scene 2 (2.3–5.0s): tiga pill peran — Lembaga (coral)@3.4, Guru (mint)@4.0, Orang Tua (sky)@4.5 — pop satu per satu tersusun kolom di bawah lockup (stagger atas→bawah); HOLD.

## Frame 3 — Orang tua terhubung

- scene: Mockup ponsel dengan screenshot asli portal orang tua di tengah; dua notifikasi pill pop di sisinya; headline di bawah.
- voiceover: "Orang tua melihat semua: check-in, foto, dan laporan harian."
- duration: 5.32s
- transition_in: push-slide UP
- status: outline
- src: compositions/frames/03-parent.html
- type: feature_showcase
- persuasion: Feature-to-benefit translation
- beat: relief + warmth
- blueprint: device-surface-showcase (Adapt)
- asset_candidates: assets/parent-app-preview.jpg — screenshot asli portal orang tua (portrait)
- focal: assets/parent-app-preview.jpg
- roles: parent-app-preview.jpg = layar ponsel (hero) · notifikasi pills = supporting
- sfx: notification, pop

Scene 1 (0.0–1.8s): ponsel (rounded, outline tebal, ~62% lebar, center) naik lembut@0.0–0.9 dengan parent-app-preview.jpg sebagai layar (object-fit cover, center top); headline "Orang tua melihat semua." (card-headline, ~34% tinggi bawah) fade-up@0.2 pada "Orang tua"@0.2.
Scene 2 (1.8–4.5s): dua notifikasi pill pop di sisi kanan-atas & kiri-bawah ponsel per cue — "✓ Aisyah sudah tiba! · 08:15"@2.0 (mint, pada "check-in"), "Foto kegiatan baru"@3.2 (sky, pada "foto"); HOLD hangat.

## Frame 4 — 500+ lembaga

- scene: Satu stat-pill raksasa — "500+" count-up coral, label "LEMBAGA AKTIF", bar kecil "25K+ SISWA TERKELOLA" di bawah.
- voiceover: "Sudah 500 lebih lembaga yang memakainya."
- duration: 3.16s
- transition_in: crossfade
- status: outline
- src: compositions/frames/04-proof.html
- type: social_proof
- persuasion: Statistical proof
- beat: trust
- blueprint: dataviz-countup (Reproduce)
- asset_candidates:
- focal: (stat 500+)
- roles: stat-pill = hero
- sfx: impact-bass-1, ping

Scene 1 (0.0–3.0s): stat-pill putih besar center (~70% lebar): angka "500+" count-up 0→500 membesar (`counting-dynamic-scale`) coral mulai@0.5 pada "lima ratus"; label "LEMBAGA AKTIF" pop@1.8; sub-pill "25K+ SISWA TERKELOLA" pop kecil@2.4 pada "memakainya"; HOLD.

## Frame 5 — CTA

- scene: Tombol coral "Coba Gratis 14 Hari" center dengan klik ripple; pill "Tanpa kartu kredit" di bawah; lockup MAJIKU kecil di atas.
- voiceover: "Coba gratis 14 hari — tanpa kartu kredit."
- duration: 2.75s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/05-cta.html
- type: cta
- persuasion: Risk reversal
- beat: urgency-to-act
- blueprint: cta-morph-press (Reproduce)
- asset_candidates: assets/logo-65fc9c68.svg — mark MAJIKU kecil
- focal: assets/logo-65fc9c68.svg
- roles: logo-65fc9c68 = lockup atas · tombol CTA = hero · kursor = press-ripple
- sfx: click, pop

Scene 1 (0.0–1.6s): lockup mark+"MAJIKU" kecil pop di atas (~28% tinggi)@0.2; tombol CTA coral besar "Coba Gratis 14 Hari" scale-swap mendarat center@0.6–1.2 (`scale-swap-transition`).
Scene 2 (1.6–3.5s): kursor press-ripple (`press-ripple`) klik@1.8; pill "Tanpa kartu kredit" (mint) pop@2.6 pada cue-nya; HOLD.
