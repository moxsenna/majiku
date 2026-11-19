---
workflow: product-launch-video
flow: automation
storyboard: no
message: "Operasional daycare rapi dan terhubung — lembaga, guru, dan orang tua dalam satu platform"
destination: youtube-landing
aspect: 1920x1080
language: id
length: 60s
angle: problem-solution
narration: yes
audience: pemilik & pengelola lembaga daycare, TPA, PAUD, dan playgroup di Indonesia
---

## Intent

Video launching MAJIKU untuk memperkenalkan platform ke lembaga daycare dan sejenisnya.
Tone: hangat, profesional, optimis — seperti rekan yang memahami betapa beratnya
mengelola lembaga secara manual, lalu menawarkan ketenangan. Konsep yang dipilih
(pitch otonom): **problem→solution berbentuk day-in-the-life** — buka dengan kelelahan
administrasi manual (absensi buku, tagihan kertas, kabar anak tidak sampai ke orang tua),
tutup dengan hari yang rapi ketika semua peran terhubung dalam satu platform, lalu CTA.
Alternatif yang ditinggalkan: feature tour murni (kurang emosional, tidak diingat).

## Assets

- https://majiku.moxsenna.workers.dev — landing page MAJIKU (capture untuk brand tokens, copy, dan screenshot).
- Portal live sebagai konteks fakta produk: admin.majiku.web.id (admin lembaga), parent.majiku.web.id (orang tua).

## Customizations

- **Musik BGM** diminta user: mood hangat-optimis, modern, ramah (family/edu-tech).
- **SFX** diminta user: cue halus (whoosh, pop, chime, notification, sparkle) untuk
  menegaskan momen UI dan peralihan.
- **VO Bahasa Indonesia** — narasi per frame, ramah perempuan dewasa.

## Notes

- Tanpa kredensial HeyGen (autonomous, offline path): TTS via **Gemini** (`GEMINI_API_KEY`),
  BGM via **Lyria generate + wait-bgm + patch ke audio_meta.json**, SFX dari **bundled library**
  (nama cue harus persis: whoosh, pop, chime, sparkle, notification, ping, click, riser, impact-bass).
- Bahasa: Indonesia untuk VO, caption, dan semua teks di layar.
- Jangan menampilkan data anak palsu yang sensitif; gunakan contoh generik (nama depan saja).
- Frame CTA mengarah ke https://majiku.moxsenna.workers.dev (bisa mention coba gratis).
- Durasi final terukur **73,96s** (bukan 60s): VO Gemini berbicara santai; real duration menang
  (sync-durations mekanis). Tetap dalam sweet spot 30–90s.
- Lyria ditolak untuk API key ini (policy violation) → BGM fallback **MusicGen lokal** (seed 28s
  di-loop ke 73,96s). Jika ingin musik lebih berkualitas: sign-in HeyGen (`npx hyperframes auth login`)
  lalu re-run BGM retrieve.
- majiku.app TIDAK aktif — CTA menampilkan majiku.moxsenna.workers.dev; ganti di frame 09 bila
  domain final sudah ada.
