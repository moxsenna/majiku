#!/usr/bin/env node
// Oracle node-1 G3: konfigurasi env & binding produksi.
// Exit 0 hanya jika semua var wajib ada, terdokumentasi, dan binding R2 terkonfigurasi.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
function readKeys(file) {
  const p = path.resolve(root, file);
  if (!fs.existsSync(p)) return null;
  const keys = {};
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_0-9]+)\s*=/);
    if (m)
      keys[m[1]] = (line.split("=").slice(1).join("=") || "")
        .trim()
        .replace(/^["']+|["']+$/g, "");
  }
  return keys;
}

const local = readKeys(".env.local");
const example = readKeys(".env.example");
const problems = [];

// 1. Var wajib runtime ada di .env.local (dev/preview)
const requiredLocal = [
  "NEON_DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "PAYCORE_BASE_URL",
  "PAYCORE_APP_ID",
  "PAYCORE_APP_SECRET",
  "PAYCORE_KEY_ID",
  "PAYCORE_WEBHOOK_SECRET",
  "PAYCORE_RETURN_URL",
  "PAYCORE_ENVIRONMENT",
  "PAYMENTS_ENABLED",
  "PAYMENT_MODE",
];
if (local === null) problems.push(".env.local tidak ada");
else for (const k of requiredLocal) {
  if (!(k in local)) problems.push(`.env.local: ${k} hilang`);
  else if (local[k] === "" && !["PAYMENTS_ENABLED", "PAYMENT_MODE"].includes(k))
    problems.push(`.env.local: ${k} kosong`);
}

// 2. Setiap var yang dirujuk kode wajib terdokumentasi di .env.example
const codeUsed = ["NEON_DATABASE_URL", "NEXT_PUBLIC_SITE_URL", "PAYCORE_WEBHOOK_SECRET", "PAYMENTS_ENABLED", "PAYMENT_MODE"];
if (example === null) problems.push(".env.example tidak ada");
else for (const k of codeUsed) if (!(k in example)) problems.push(`.env.example: ${k} tidak terdokumentasi`);

// 3. Nilai flag masuk akal
if (local) {
  if (local.PAYMENTS_ENABLED !== undefined && !["true", "false"].includes(local.PAYMENTS_ENABLED))
    problems.push(`.env.local: PAYMENTS_ENABLED='${local.PAYMENTS_ENABLED}' bukan true/false`);
  if (local.PAYMENT_MODE !== undefined && !["sandbox", "live", "disabled"].includes(local.PAYMENT_MODE))
    problems.push(`.env.local: PAYMENT_MODE='${local.PAYMENT_MODE}' bukan sandbox|live|disabled`);
}

// 4. Binding R2 di wrangler.jsonc
const wranglerPath = path.resolve(root, "wrangler.jsonc");
if (!fs.existsSync(wranglerPath)) problems.push("wrangler.jsonc tidak ada");
else {
  const w = fs.readFileSync(wranglerPath, "utf8");
  if (!w.includes("PHOTOS_BUCKET")) problems.push("wrangler.jsonc: binding PHOTOS_BUCKET tidak ada");
  if (!w.includes("majiku-photos")) problems.push("wrangler.jsonc: bucket majiku-photos tidak ada");
}

if (problems.length > 0) {
  console.error("FAIL: env");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("OK: env — var wajib lengkap, terdokumentasi, binding R2 ada");
