---
workflow: product-launch-video
flow: automation
storyboard: no
message: "Operasional daycare rapi dan terhubung — dalam 20 detik"
destination: tiktok-reels-status
aspect: 1080x1920
language: id
length: 20s
angle: problem-solution (cutdown)
narration: yes
audience: pemilik & pengelola daycare/TPA/PAUD/bimbel di Indonesia (WhatsApp Status, Reels, TikTok)
---

## Intent

Cutdown vertikal 9:16 (15–25s) dari video launching MAJIKU 74s — memotong 5 beat terkuat
(hook → intro → parent → proof → CTA) untuk WhatsApp Status, Instagram Reels, dan TikTok.
Satu keluarga visual dengan project induk `videos/majiku-launch` (frame.md capsule + token MAJIKU).
Frame di-rebuild native vertikal, bukan crop.

## Assets

- `../majiku-launch/assets/bgm/track.wav` — musik BGM MusicGen 74s (reuse, assembler memotong).
- `../majiku-launch/assets/parent-app-preview.jpg` — screenshot asli portal orang tua (untuk frame phone).

## Customizations

- Musik BGM reuse dari launch video; SFX ringan (whoosh/chime/notification/pop).
- VO Bahasa Indonesia, voice sama (Gemini Aoede) agar satu kampanye terdengar satu suara.

## Notes

- Project baru karena aspek berbeda (aturan hyperframes-studio §5: aspek berbeda = project baru).
- CTA memakai verb + brand (URL panjang workers.dev tidak cocok untuk vertical social — taruh di caption postingan).
