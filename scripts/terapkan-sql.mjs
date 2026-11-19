// Pakai: node scripts/terapkan-sql.mjs <env-file> <sql-file...>  (SQL harus idempoten)
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const [envFile, ...files] = process.argv.slice(2);
const env = Object.fromEntries(
  readFileSync(envFile, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "")])
);
const sql = neon(env.NEON_DATABASE_URL);

for (const f of files) {
  const src = readFileSync(f, "utf8").replace(/^\s*--.*$/gm, "");
  const stmts = [];
  let cur = "";
  let dollar = false;
  for (const line of src.split(/\r?\n/)) {
    cur += line + "\n";
    if ((line.match(/\$\$/g) || []).length % 2 === 1) dollar = !dollar;
    if (!dollar && /;\s*$/.test(line)) {
      stmts.push(cur.trim());
      cur = "";
    }
  }
  if (cur.trim()) stmts.push(cur.trim());
  for (const s of stmts) await sql.query(s);
  console.log("ok", f, stmts.length);
}
const t = await sql.query(
  "select table_name from information_schema.tables where table_name in ('notifications','push_subscriptions','invoice_sequences')"
);
console.log(t.map((r) => r.table_name));
