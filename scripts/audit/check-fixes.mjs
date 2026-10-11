#!/usr/bin/env node
// Oracle wave report perbaikan: setiap baris fix/deferred wajib punya referensi file:line valid.
// Usage: node scripts/audit/check-fixes.mjs --report .unlazy/fix-launch/reports/wave-1.md --min-fixes N
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
function arg(f) { const i = args.indexOf(f); return i === -1 ? null : args[i + 1]; }
const reportArg = arg("--report");
const minFixes = parseInt(arg("--min-fixes") || "1", 10);
const root = process.cwd();

if (!reportArg) { console.error("usage: check-fixes.mjs --report <md> [--min-fixes N]"); process.exit(2); }
const p = path.resolve(root, reportArg);
if (!fs.existsSync(p)) { console.error(`FAIL: report tidak ada: ${reportArg}`); process.exit(1); }
const text = fs.readFileSync(p, "utf8");

for (const section of ["## Fixes", "## Deferred"]) {
  if (!text.includes(section)) { console.error(`FAIL: section '${section}' tidak ada`); process.exit(1); }
}
if (/\b(TODO|placeholder|TBD)\b/i.test(text)) { console.error("FAIL: masih ada TODO/placeholder/TBD"); process.exit(1); }

const refRe = /`([^`\n]+):(\d+)`/g;
const fixRe = /^- \[(FIX|DEFERRED)\]/gm;
let m; let fixes = 0; let deferred = 0; const bad = [];
while ((m = fixRe.exec(text)) !== null) {
  const lineEnd = text.indexOf("\n", m.index);
  const line = text.slice(m.index, lineEnd === -1 ? text.length : lineEnd);
  if (m[1] === "FIX") fixes++; else deferred++;
  refRe.lastIndex = 0;
  let ok = false; let r;
  while ((r = refRe.exec(line)) !== null) {
    const file = path.resolve(root, r[1]);
    if (fs.existsSync(file)) {
      const n = fs.readFileSync(file, "utf8").split("\n").length;
      const ln = parseInt(r[2], 10);
      if (ln >= 1 && ln <= n) { ok = true; break; }
    }
  }
  if (!ok) bad.push(line.slice(0, 110));
}
if (fixes < minFixes) { console.error(`FAIL: FIX ${fixes} < minimum ${minFixes}`); process.exit(1); }
if (bad.length > 0) {
  console.error(`FAIL: ${bad.length} baris tanpa referensi file:line valid:`);
  for (const b of bad) console.error(`  - ${b}`);
  process.exit(1);
}
console.log(`OK: ${path.basename(reportArg)} — ${fixes} FIX, ${deferred} DEFERRED, semua referensi valid`);
