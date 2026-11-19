import { readFileSync, writeFileSync, copyFileSync } from "node:fs";

// Demo audio_meta built from launch audio (VO reuse): frames 1-4 ← launch 4,7,5,10
const launch = JSON.parse(readFileSync("../majiku-launch/audio_meta.json", "utf8"));
const map = [
  { demo: 1, launch: 4 },
  { demo: 2, launch: 7 },
  { demo: 3, launch: 5 },
  { demo: 4, launch: 10 },
];
const voices = map.map(({ demo, launch: lf }) => {
  const v = launch.voices.find((x) => x.frame === lf);
  return { frame: demo, path: `assets/voice/0${demo}.wav`, duration_s: v.duration_s, words: v.words };
});

const meta = {
  bgm: { path: "assets/bgm/track.wav", volume: 0.12, query: null, duration_s: null },
  bgm_pending: false,
  voices,
  sfx: [],
};
writeFileSync("./audio_meta.json", JSON.stringify(meta, null, 2));

// neutral sidecar — sfx pass later merges into it
const neutral = {
  voices: voices.map((v) => ({
    id: String(v.frame).padStart(2, "0"),
    path: v.path,
    duration_s: v.duration_s,
    words: v.words,
  })),
  bgm: { path: "assets/bgm/track.wav", volume: 0.12, mode: "file", duration_s: null },
  bgm_pending: false,
  sfx: [],
};
writeFileSync("./audio_engine_meta.json", JSON.stringify(neutral, null, 2));
console.log(
  "demo audio:",
  voices.map((v) => `0${v.frame}=${v.duration_s}s/${v.words.length}w`).join(" "),
);
