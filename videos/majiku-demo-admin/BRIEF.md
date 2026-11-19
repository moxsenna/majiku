---
workflow: product-launch-video
flow: automation
storyboard: no
message: "Lihat sendiri bagaimana MAJIKU mengelola lembaga — demo dashboard admin nyata"
destination: youtube-landing
aspect: 1920x1080
language: id
length: 45s
angle: demo (screen recording nyata)
narration: yes
audience: prospek pemilik lembaga yang mengeklik "Lihat Demo"
---

## Intent

Demo dashboard admin MAJIKU berbasis **screen recording asli** (bukan rekonstruksi) dari portal
production `admin.majiku.web.id` dengan akun demo simulasi (156 siswa). Corong tengah: konten
untuk tombol "Lihat Demo" di landing page. Empat segmen: dashboard → billing SPP → laporan
harian → penutup CTA. Footage direkam via Playwright (Chrome headless, 1920×1080).

## Assets

- `videos/.tools/footage/s1-dashboard/*.webm` — rekaman dashboard (KPI + aktivitas + scroll).
- `videos/.tools/footage/s3-billing/*.webm` — rekaman halaman Billing SPP.
- `videos/.tools/footage/s4-daily-reports/*.webm` — rekaman halaman Laporan Harian.
- `../majiku-launch/assets/voice/{04,06,07,10}.wav` — VO reuse dari video launching (konsistensi suara; kuota TTS harian habis).
- `../majiku-launch/assets/bgm/track.wav` — musik reuse.

## Customizations

- Label pill capsule di tiap segmen ("DASHBOARD ADMIN", dst.) sebagai wayfinding.
- Zoom push-in halus pada tiap segmen; frame 4 ditutup overlay CTA capsule di atas footage yang diredupkan.
- Deviasi terdokumentasi: frame demo ditulis langsung oleh orchestrator (media contract video),
  bukan via frame-worker packets.

## Notes

- sync-durations TIDAK dijalankan: frame sengaja lebih panjang dari VO (waktu menonton UI);
  VO selalu lebih pendek dari frame sehingga aman.
- Kuota Gemini TTS free tier 10 req/hari habis — audio di-reuse dari project launch.
