// build-hooks.mjs — generate 5 hook-variant projects from the cutdown project.
import { cpSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SRC = join(ROOT, "majiku-cut-vertical");
const LAUNCH = join(ROOT, "majiku-launch");
const PLV = "C:/Users/bimap/.zcode/skills/product-launch-video/scripts";

// CTA end-card frame (vertical capsule, silent, registered timeline)
const CTA_CARD = (compId, dur) => `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #FFFFFF; }
  @font-face {
    font-family: "Plus Jakarta Sans";
    font-style: normal;
    font-weight: 400;
    font-display: block;
    src: url("assets/fonts/plus-jakarta-sans-400.woff2") format("woff2");
  }
  @font-face {
    font-family: "Plus Jakarta Sans";
    font-style: normal;
    font-weight: 600;
    font-display: block;
    src: url("assets/fonts/plus-jakarta-sans-600.woff2") format("woff2");
  }
  @font-face {
    font-family: "Plus Jakarta Sans";
    font-style: normal;
    font-weight: 700;
    font-display: block;
    src: url("assets/fonts/plus-jakarta-sans-700.woff2") format("woff2");
  }
  #root {
    position: relative;
    width: 1080px;
    height: 1920px;
    overflow: hidden;
    background-color: #FFFFFF;
    container-type: size;
    font-family: "Plus Jakarta Sans", sans-serif;
  }
  .cta-atmo {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 16%, rgba(247, 176, 158, 0.16) 0%, transparent 44%),
      radial-gradient(circle at 82% 80%, rgba(252, 226, 146, 0.18) 0%, transparent 46%);
  }
  .cta-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 76cqw;
    padding: 60px 56px 52px;
    border-radius: 2rem;
    border: 3px solid #1E1E1E;
    background-color: #FFFFFF;
    box-shadow: 12px 12px 0 rgba(26, 26, 26, 0.10);
    text-align: center;
    opacity: 0;
    scale: 0.92;
  }
  .cta-lockup {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-bottom: 16px;
  }
  .cta-mark { width: 54px; height: 54px; display: block; }
  .cta-wordmark {
    font-size: 54px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #32221B;
    line-height: 1;
  }
  .cta-tagline {
    font-size: 26px;
    font-weight: 600;
    color: #32221B;
    margin-bottom: 24px;
    line-height: 1.4;
  }
  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 22px 46px;
    border-radius: 9999px;
    border: 3px solid #1E1E1E;
    background-color: #F06542;
    color: #FFFFFF;
    font-size: 28px;
    font-weight: 700;
    box-shadow: 8px 8px 0 rgba(26, 26, 26, 0.12);
    opacity: 0;
    scale: 0.9;
  }
  .cta-note {
    margin-top: 22px;
    display: inline-block;
    padding: 10px 24px;
    border-radius: 9999px;
    border: 2.5px solid #1E1E1E;
    background-color: #FCE292;
    color: #32221B;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0;
  }
</style>
</head>
<body>
  <div
    id="root"
    data-composition-id="${compId}"
    data-start="0"
    data-duration="${dur}"
    data-width="1080"
    data-height="1920"
  >
    <div class="cta-atmo"></div>
    <div class="cta-card" id="hk-card">
      <div class="cta-lockup">
        <img class="cta-mark" src="assets/logo-65fc9c68.svg" alt="MAJIKU">
        <span class="cta-wordmark">MAJIKU</span>
      </div>
      <div class="cta-tagline">Kelola lembaga pendidikan Anda<br>dengan lebih mudah.</div>
      <div class="cta-button" id="hk-btn"><span>✦ Coba Gratis 14 Hari</span></div>
      <div><span class="cta-note" id="hk-note">Tanpa kartu kredit · Setup 5 menit</span></div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(
        "#hk-card",
        { opacity: 0, scale: 0.92, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out" },
        0.2
      );
      tl.fromTo(
        "#hk-btn",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
        0.8
      );
      tl.fromTo(
        "#hk-note",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
        1.3
      );
      window.__timelines = window.__timelines || {};
      window.__timelines["99-cta-card"] = tl;
    })();
  </script>
</body>
</html>
`;

const hooks = [
  {
    name: "majiku-hook-pain",
    frames: [{ file: "01-hook.html", id: "01-hook", dur: 6.5, voice: "01" }],
    voiceFrom: "cutdown",
    title: "Hook: pain manual",
  },
  {
    name: "majiku-hook-intro",
    frames: [{ file: "02-intro.html", id: "02-intro", dur: 6.0, voice: "02" }],
    voiceFrom: "cutdown",
    title: "Hook: kenalkan MAJIKU",
  },
  {
    name: "majiku-hook-parent",
    frames: [{ file: "03-parent.html", id: "03-parent", dur: 5.7, voice: "03" }],
    voiceFrom: "cutdown",
    title: "Hook: orang tua tenang",
  },
  {
    name: "majiku-hook-proof",
    frames: [{ file: "04-proof.html", id: "04-proof", dur: 4.5, voice: "04" }],
    voiceFrom: "cutdown",
    title: "Hook: 500+ lembaga",
  },
  {
    name: "majiku-hook-cta",
    frames: [{ file: "05-cta.html", id: "05-cta", dur: 6.5, voice: "05" }],
    voiceFrom: "launch09",
    title: "Hook: CTA langsung",
  },
];

function frameBlock(hook, f, idx, dur) {
  const sfx = hook.name === "majiku-hook-cta" ? "click, pop" : "pop";
  return `## Frame ${idx} — ${hook.title}

- scene: ${hook.title} (frame vertikal dari cutdown)
- voiceover: "${hook.name === "majiku-hook-cta" ? "Coba MAJIKU gratis empat belas hari. Tanpa kartu kredit, setup hanya lima menit." : ""}"
- duration: ${dur}s
- transition_in: ${idx === 1 ? "cut" : "crossfade"}
- status: animated
- src: compositions/frames/${f.file}
- type: hook
- persuasion: Pain validation
- beat: tension
- blueprint: kinetic-type-beats (Reproduce)
- asset_candidates:
- sfx: ${sfx}

Beat hook vertikal — dibangun dari project cutdown yang sudah ter-QC.
`;
}

function cardBlock(idx, dur) {
  return `## Frame ${idx} — CTA end-card

- scene: End-card capsule — lockup MAJIKU, tombol coral "Coba Gratis 14 Hari", pill "Tanpa kartu kredit".
- voiceover: ""
- duration: ${dur}s
- transition_in: crossfade
- status: animated
- src: compositions/frames/99-cta-card.html
- type: cta
- persuasion: Risk reversal
- beat: motivation
- blueprint: compose
- asset_candidates: assets/logo-65fc9c68.svg — mark MAJIKU
- sfx: chime

End-card tenang; musik berlanjut; tanpa VO.
`;
}

function storyboardFor(hook, frames) {
  const total = frames.reduce((a, f) => a + f.dur, 0).toFixed(1);
  let blocks = "";
  frames.forEach((f, i) => {
    blocks += "\n" + (f.card ? cardBlock(i + 1, f.dur) : frameBlock(hook, f, i + 1, f.dur));
  });
  return `---
format: 1080x1920
duration: ${total}s
message: "MAJIKU hook varian — ${hook.title}"
arc: "Hook pendek → CTA"
audience: "pemilik & pengelola daycare/TPA/PAUD/bimbel (iklan Reels/TikTok/Status WA)"
mode: autonomous
music: "warm optimistic family edu-tech underscore (reuse track)"
---
${blocks}
`;
}

function audioMetaFor(hook, frames) {
  const cutdown = JSON.parse(readFileSync(join(SRC, "audio_meta.json"), "utf8"));
  const launch = JSON.parse(readFileSync(join(LAUNCH, "audio_meta.json"), "utf8"));
  const voices = [];
  const sfx = [];
  let fIdx = 0;
  for (const f of frames) {
    if (f.card) {
      sfx.push({ frame: fIdx + 1, file: "assets/sfx/chime.mp3", offset_s: 0.4, duration_s: 1.2, volume: 0.5 });
    } else {
      const src = hook.voiceFrom === "launch09" ? launch : cutdown;
      const lf = hook.voiceFrom === "launch09" ? 9 : Number(f.voice);
      const v = src.voices.find((x) => x.frame === lf);
      voices.push({
        frame: fIdx + 1,
        path: `assets/voice/${String(fIdx + 1).padStart(2, "0")}.wav`,
        duration_s: v.duration_s,
        words: v.words,
      });
      if (hook.voiceFrom === "launch09") {
        // H5: cutdown frame 5 cues (click, pop) live on cutdown frame 5
        for (const s of cutdown.sfx || []) {
          if (s.frame === 5) sfx.push({ ...s, frame: fIdx + 1 });
        }
      } else {
        for (const s of cutdown.sfx || []) {
          if (s.frame === lf) sfx.push({ ...s, frame: fIdx + 1 });
        }
      }
    }
    fIdx++;
  }
  return {
    bgm: { path: "assets/bgm/track.wav", volume: 0.14, query: null, duration_s: null },
    bgm_pending: false,
    voices,
    sfx,
  };
}

const onlyHook = process.argv[2] || null;
for (const hook of hooks) {
  if (onlyHook && hook.name !== onlyHook) continue;
  const dst = join(ROOT, hook.name);
  mkdirSync(dst, { recursive: true });
  // Copy project scaffolding + assets (no renders/snapshots/footage)
  for (const f of ["package.json", "hyperframes.json", "meta.json", "frame.md", "AGENTS.md", "CLAUDE.md"]) {
    cpSync(join(SRC, f), join(dst, f));
  }
  cpSync(join(SRC, ".hyperframes"), join(dst, ".hyperframes"), { recursive: true });
  cpSync(join(SRC, "assets"), join(dst, "assets"), { recursive: true });
  if (hook.voiceFrom === "launch09") {
    cpSync(join(LAUNCH, "assets", "voice", "09.wav"), join(dst, "assets", "voice", "01.wav"));
  }
  // Reuse the cutdown's installed node_modules (pinned hyperframes) via junction
  try {
    execSync("cmd /c mklink /J \"" + join(dst, "node_modules") + "\" " + "\"" + join(SRC, "node_modules") + "\"");
  } catch {}

  // Frames: kept cutdown frames + cta-card
  mkdirSync(join(dst, "compositions", "frames"), { recursive: true });
  const frames = [];
  hook.frames.forEach((f) => {
    cpSync(join(SRC, "compositions", "frames", f.file), join(dst, "compositions", "frames", f.file));
    frames.push({ ...f, dur: f.dur });
  });
  frames.push({ file: "99-cta-card.html", card: true, dur: 2.5 });
  writeFileSync(join(dst, "compositions", "frames", "99-cta-card.html"), CTA_CARD("99-cta-card", 2.5));

  // Patch kept frames: root + clip data-duration, timeline registration
  for (const f of hook.frames) {
    const p = join(dst, "compositions", "frames", f.file);
    let s = readFileSync(p, "utf8");
    s = s.replace(/data-composition-id="[^"]*"(\s+)data-start="[^"]*"(\s+)data-duration="[^"]*"/, (m) =>
      m.replace(/data-duration="[^"]*"/, `data-duration="${f.dur}"`),
    );
    s = s.replace(/(class="clip [^"]*"[\s\S]{0,80}?data-duration=")[0-9.]+(")/g, `$1${f.dur}$2`);
    if (!s.includes("__timelines")) {
      s = s.replace(
        /\}\)\(\);\n  <\/script>/,
        `  window.__timelines = window.__timelines || {};\n      window.__timelines["${f.id}"] = tl;\n    })();\n  </script>`,
      );
    }
    writeFileSync(p, s);
  }

  // Storyboard + audio_meta
  writeFileSync(join(dst, "STORYBOARD.md"), storyboardFor(hook, frames));
  writeFileSync(join(dst, "audio_meta.json"), JSON.stringify(audioMetaFor(hook, frames), null, 2));

  // Captions + assemble + transitions + render
  const sh = (cmd) => execSync(cmd, { cwd: dst, stdio: "inherit" });
  sh(`node "${PLV}/captions.mjs" build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json`);
  sh(`node "${PLV}/assemble-index.mjs" --storyboard ./STORYBOARD.md --hyperframes .`);
  sh(`node "${PLV}/transitions.mjs" inject --storyboard ./STORYBOARD.md --hyperframes .`);
  sh(`npx hyperframes check`);
  sh(`npx hyperframes render --skill=product-launch-video --quality high --output renders/video.mp4`);
  console.log(`✓ ${hook.name} rendered`);
}
console.log("ALL HOOKS DONE");
