import { readFileSync, writeFileSync, rmSync } from "node:fs";

// 1) Voices from the engine sidecar (01, 02, 04 with words)
const neutral = JSON.parse(readFileSync("./audio_engine_meta.json", "utf8"));
const byId = new Map((neutral.voices || []).map((v) => [String(v.id), v]));

// 2) Voice 03 from run-1 wav + fresh transcript
const tr03 = JSON.parse(readFileSync("./trans-03/transcript.json", "utf8"));
byId.set("03", {
  id: "03",
  path: "assets/voice/03.wav",
  duration_s: 5.32,
  words: tr03,
});

// 3) Voice 05 = launch frame-09 wav trimmed to 2.75s; words up to "hari,"
const launch = JSON.parse(
  readFileSync("../majiku-launch/audio_meta.json", "utf8"),
);
const v9 = launch.voices.find((v) => v.frame === 9);
const words05 = v9.words
  .filter((w) => w.start < 2.6)
  .map((w, i) => ({ id: `w${i}`, text: w.text, start: w.start, end: Math.min(w.end, 2.7) }));
byId.set("05", {
  id: "05",
  path: "assets/voice/05.wav",
  duration_s: 2.75,
  words: words05,
});

// Order + text fixes for captions
const fixes = { cekin: "check-in" };
const order = ["01", "02", "03", "04", "05"];
neutral.voices = order.map((id) => {
  const v = byId.get(id);
  return {
    ...v,
    words: (v.words || []).map((w) => ({ ...w, text: fixes[w.text] ?? w.text })),
  };
});
neutral.bgm = {
  path: "assets/bgm/track.wav",
  volume: 0.12,
  mode: "file",
  duration_s: null,
};
neutral.bgm_pending = false;
writeFileSync("./audio_engine_meta.json", JSON.stringify(neutral, null, 2));
rmSync("./trans-03", { recursive: true, force: true });

// 4) Product-launch meta
const meta = {
  bgm: { path: neutral.bgm.path, volume: neutral.bgm.volume, query: null, duration_s: null },
  bgm_pending: false,
  voices: neutral.voices.map((v) => ({
    frame: Number(v.id),
    path: v.path,
    duration_s: v.duration_s,
    words: (v.words || []).map((w) => ({ id: w.id, text: w.text, start: w.start, end: w.end })),
  })),
  sfx: [],
};
writeFileSync("./audio_meta.json", JSON.stringify(meta, null, 2));
console.log(
  "built:",
  meta.voices.map((v) => `0${v.frame}=${v.duration_s}s/${v.words.length}w`).join(" "),
  "| bgm:", meta.bgm.path,
);
