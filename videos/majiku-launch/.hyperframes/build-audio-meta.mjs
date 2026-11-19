import { readFileSync, writeFileSync } from "node:fs";

const neutral = JSON.parse(readFileSync("./audio_engine_meta.json", "utf8"));

// Transcription text fixes (audio is correct; captions must read right).
// null = drop the word (timing gap is fine for captions).
const fixes = {
  Building: "billing",
  Automatis: "otomatis",
  sisi: "siswa",
  suatu: null,
  cekin: "check-in",
  "Majiraku.": "MAJIKU.",
  Majiku: "MAJIKU",
  majiku: "MAJIKU",
  set: "setup",
  up: null,
};

for (const v of neutral.voices || []) {
  v.words = (v.words || []).filter((w) => fixes[w.text] !== null);
  for (const w of v.words) {
    if (fixes[w.text] !== undefined) w.text = fixes[w.text];
  }
}

const bgm = neutral.bgm
  ? {
      path: neutral.bgm.path,
      volume: neutral.bgm.volume,
      query: neutral.bgm.query ?? null,
      duration_s: neutral.bgm.duration_s ?? null,
    }
  : null;
const meta = {
  bgm,
  bgm_pending: !!neutral.bgm_pending,
  voices: (neutral.voices || []).map((v) => ({
    frame: Number(v.id),
    path: v.path,
    duration_s: v.duration_s,
    words: (v.words || []).map((w) => ({ id: w.id, text: w.text, start: w.start, end: w.end })),
  })),
  sfx: (neutral.sfx || []).map((s) => ({
    frame: Number(s.id),
    file: s.file,
    offset_s: s.offset_s ?? 0,
    duration_s: s.duration_s ?? 1,
    volume: s.volume ?? 0.35,
  })),
};
writeFileSync("./audio_meta.json", JSON.stringify(meta, null, 2));
console.log("audio_meta.json written:", meta.voices.length, "voices, bgm_pending =", meta.bgm_pending);
