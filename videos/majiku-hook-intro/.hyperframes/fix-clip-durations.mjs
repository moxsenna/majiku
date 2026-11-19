import { readFileSync, writeFileSync } from "node:fs";

// Extend top-level .clip data-duration to cover the index clip length
// (stale estimates made the runtime clip-gate content early → blank tail).
const targets = {
  "01-hook": 6.8,
  "02-intro": 6.4,
  "03-parent": 6.0,
  "04-proof": 3.7,
  "05-cta": 3.6,
};

for (const [id, target] of Object.entries(targets)) {
  const p = `./compositions/frames/${id}.html`;
  let src = readFileSync(p, "utf8");
  const lines = src.split(/\r?\n/);
  let inClip = false;
  let fixed = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/class="clip /.test(line)) {
      inClip = true;
      // single-line form
      lines[i] = line.replace(/(data-start="0[^0-9][^"]*")?\s*data-duration="[0-9.]+"/, (m) => m);
    }
    if (inClip && /data-start="0(\.0)?"/.test(line)) {
      // next data-duration within the tag gets bumped
      for (let j = i; j < Math.min(i + 4, lines.length); j++) {
        if (/data-duration="/.test(lines[j])) {
          const before = lines[j];
          lines[j] = lines[j].replace(/data-duration="[0-9.]+"/, `data-duration="${target}"`);
          if (lines[j] !== before) fixed++;
          break;
        }
      }
      inClip = false;
    } else if (inClip && /data-duration="/.test(line)) {
      const before = line;
      lines[i] = line.replace(/data-duration="[0-9.]+"/, `data-duration="${target}"`);
      if (lines[i] !== before) fixed++;
      inClip = false;
    }
  }
  writeFileSync(p, lines.join("\n"));
  console.log(`${id}: ${fixed} clip duration(s) → ${target}s`);
}

// Caption typo fix (both meta files)
const fixes = { "Decayr.": "daycare." };
for (const f of ["./audio_meta.json", "./audio_engine_meta.json"]) {
  const m = JSON.parse(readFileSync(f, "utf8"));
  for (const v of m.voices || []) {
    for (const w of v.words || []) {
      if (fixes[w.text] !== undefined) w.text = fixes[w.text];
    }
  }
  writeFileSync(f, JSON.stringify(m, null, 2));
}
console.log("caption word fixed: Decayr. → daycare.");
