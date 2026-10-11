import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { Client } from "@neondatabase/serverless";
import fs from "node:fs";

// Oracle G4 (fix-launch): verifikasi migrasi multi-tenant diterapkan di DB.
const env = fs.readFileSync(".env.local", "utf8");
const m = env.match(/NEON_DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
if (!m) {
  console.error("FAIL: migration — NEON_DATABASE_URL tidak ditemukan di .env.local");
  process.exit(1);
}
const client = new Client({ connectionString: m[1] });

async function main() {
  await client.connect();
  const problems = [];

  for (const t of ["classes", "tutors", "students", "announcements", "waiting_list", "trial_applications"]) {
    const r = await client.query(
      "SELECT count(*)::int AS n FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name='tenant_id' AND is_nullable='NO'",
      [t]
    );
    if (Number(r.rows[0].n) !== 1) problems.push(`${t}.tenant_id NOT NULL tidak ada`);
  }

  const adminCol = await client.query(
    "SELECT count(*)::int AS n FROM information_schema.columns WHERE table_schema='public' AND table_name='tenants' AND column_name='admin_user_id'"
  );
  if (Number(adminCol.rows[0].n) !== 1) problems.push("tenants.admin_user_id tidak ada");

  const leave = await client.query(
    "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public' AND table_name='tutor_leave_requests'"
  );
  if (Number(leave.rows[0].n) !== 1) problems.push("tabel tutor_leave_requests tidak ada");

  const unique = await client.query(
    "SELECT count(*)::int AS n FROM information_schema.table_constraints WHERE table_schema='public' AND table_name='paycore_events' AND constraint_type='UNIQUE' AND constraint_name LIKE '%paycore_order_id%'"
  );
  if (Number(unique.rows[0].n) !== 0) problems.push("paycore_events.paycore_order_id masih UNIQUE");

  const backfill = await client.query("SELECT count(*)::int AS n FROM classes WHERE tenant_id IS NULL");
  if (Number(backfill.rows[0].n) !== 0) problems.push("ada classes.tenant_id NULL");

  const owner = await client.query("SELECT count(*)::int AS n FROM tenants WHERE admin_user_id IS NOT NULL");
  if (Number(owner.rows[0].n) === 0) problems.push("tidak ada tenant dengan admin_user_id");

  await client.end();

  if (problems.length > 0) {
    console.error("FAIL: migration");
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log("OK: migration");
}

main().catch((e) => {
  console.error("FAIL: migration —", e.message);
  process.exit(1);
});
