#!/usr/bin/env node
// Oracle untuk laporan audit leaf: validasi coverage rute + validitas referensi temuan.
// Usage: node scripts/audit/check-report.mjs --report <md> --routes "src/app/(admin),src/views" [--min-findings N]
// Exit 0 hanya jika semua asersi lulus.
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
function arg(flag) {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
}
const reportArg = arg("--report");
const routesArg = arg("--routes") || "";
const minFindings = parseInt(arg("--min-findings") || "0", 10);
const root = process.cwd();

if (!reportArg || !routesArg) {
  console.error("usage: check-report.mjs --report <md> --routes <dir,dir> [--min-findings N]");
  process.exit(2);
}

const reportPath = path.resolve(root, reportArg);
if (!fs.existsSync(reportPath)) {
  console.error(`FAIL: report tidak ada: ${reportArg}`);
  process.exit(1);
}
const text = fs.readFileSync(reportPath, "utf8");

// 1. Struktur wajib
for (const section of ["## Flows", "## Findings"]) {
  if (!text.includes(section)) {
    console.error(`FAIL: section '${section}' tidak ditemukan di ${reportArg}`);
    process.exit(1);
  }
}
if (/\b(TODO|placeholder|TBD)\b/i.test(text)) {
  console.error("FAIL: report masih berisi TODO/placeholder/TBD");
  process.exit(1);
}

// 2. Coverage: setiap page.tsx di direktori rute wajib disebut di report
const dirList = routesArg.split(",").map((d) => d.trim()).filter(Boolean);
const pages = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "page.tsx" || entry.name === "route.ts") pages.push(full);
  }
}
for (const d of dirList) walk(path.resolve(root, d));
if (pages.length === 0) {
  console.error(`FAIL: tidak ada page.tsx/route.ts di ${routesArg}`);
  process.exit(1);
}
const missing = pages.filter((p) => {
  const rel = path.relative(root, p).split(path.sep).join("/");
  return !text.includes(rel);
});
if (missing.length > 0) {
  console.error(`FAIL: ${missing.length} rute tidak ter-cover di report:`);
  for (const m of missing) console.error(`  - ${path.relative(root, m).split(path.sep).join("/")}`);
  process.exit(1);
}

// 3. Temuan: setiap baris `- [SEV] ...` wajib punya >=1 ref `src/...:NN` yang valid
const findingRe = /^- \[(HIGH|MED|LOW)\]/gm;
const refRe = /`(src\/[^`:]+):(\d+)`/g;
const findings = [];
let m;
while ((m = findingRe.exec(text)) !== null) {
  const lineStart = text.indexOf("\n", m.index);
  const lineEnd = lineStart === -1 ? text.length : lineStart;
  findings.push(text.slice(m.index, lineEnd));
}
if (findings.length < minFindings) {
  console.error(`FAIL: temuan ${findings.length} < minimum ${minFindings}`);
  process.exit(1);
}
const badRefs = [];
for (const f of findings) {
  refRe.lastIndex = 0;
  let ref;
  let anyValid = false;
  let anyRef = false;
  while ((ref = refRe.exec(f)) !== null) {
    anyRef = true;
    const file = path.resolve(root, ref[1]);
    const line = parseInt(ref[2], 10);
    if (fs.existsSync(file)) {
      const lines = fs.readFileSync(file, "utf8").split("\n").length;
      if (line >= 1 && line <= lines) anyValid = true;
    }
  }
  if (!anyRef || !anyValid) badRefs.push(f.slice(0, 100));
}
if (badRefs.length > 0) {
  console.error(`FAIL: ${badRefs.length} temuan tanpa referensi file:line yang valid:`);
  for (const b of badRefs) console.error(`  - ${b}`);
  process.exit(1);
}

console.log(
  `OK: ${path.basename(reportArg)} — ${pages.length} rute ter-cover, ${findings.length} temuan dengan referensi valid`
);
