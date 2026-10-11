import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { db } from "../src/db";
import { sql } from "drizzle-orm";

/**
 * Migrasi multi-tenant:
 *  - tenants.admin_user_id (pemilik lembaga)
 *  - tenant_id NOT NULL + FK pada classes, tutors, students, announcements, waiting_list, trial_applications
 *  - tabel tutor_leave_requests
 *  - drop UNIQUE paycore_events.paycore_order_id (satu order boleh punya banyak event)
 * Backfill: semua baris existing -> tenant operasional pertama (majiku-kids),
 * admin_user_id tnt_1 -> akun admin real pertama (moxsenna@gmail.com) bila belum ada.
 * Idempoten: aman dijalankan berulang.
 */

const TENANT_TABLES = ["classes", "tutors", "students", "announcements", "waiting_list", "trial_applications"];

async function columnExists(table: string, column: string): Promise<boolean> {
  const res = await db.execute(sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${column}
  `);
  return res.rows.length > 0;
}

async function constraintExists(table: string, constraint: string): Promise<boolean> {
  const res = await db.execute(sql`
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = ${table} AND constraint_name = ${constraint}
  `);
  return res.rows.length > 0;
}

async function main() {
  console.log("=== Migrasi multi-tenant dimulai ===");

  // 0. Tentukan tenant operasional pertama (fallback tnt_1)
  const firstTenant = await db.execute(sql`SELECT id FROM tenants ORDER BY created_at ASC NULLS LAST, id ASC LIMIT 1`);
  const defaultTenantId = (firstTenant.rows[0] as { id: string } | undefined)?.id ?? "tnt_1";
  console.log(`Tenant operasional utama: ${defaultTenantId}`);

  // 1. tenants.admin_user_id
  if (!(await columnExists("tenants", "admin_user_id"))) {
    await db.execute(sql`ALTER TABLE tenants ADD COLUMN admin_user_id text REFERENCES "user"("id") ON DELETE SET NULL`);
    console.log("tenants.admin_user_id ditambahkan");
  }
  const owner = await db.execute(sql`SELECT id FROM "user" WHERE email = 'moxsenna@gmail.com' LIMIT 1`);
  const ownerId = (owner.rows[0] as { id: string } | undefined)?.id;
  if (ownerId) {
    await db.execute(sql`
      UPDATE tenants SET admin_user_id = ${ownerId}
      WHERE id = ${defaultTenantId} AND admin_user_id IS NULL
    `);
    console.log(`admin_user_id ${defaultTenantId} -> akun pemilik (moxsenna@gmail.com)`);
  } else {
    console.log("Peringatan: akun pemilik moxsenna@gmail.com tidak ditemukan, admin_user_id dibiarkan NULL");
  }

  // 2. tenant_id pada tabel root
  for (const t of TENANT_TABLES) {
    if (!(await columnExists(t, "tenant_id"))) {
      await db.execute(sql.raw(`ALTER TABLE ${t} ADD COLUMN tenant_id text`));
    }
    await db.execute(sql.raw(`UPDATE ${t} SET tenant_id = '${defaultTenantId}' WHERE tenant_id IS NULL`));
    await db.execute(sql.raw(`ALTER TABLE ${t} ALTER COLUMN tenant_id SET NOT NULL`));
    if (!(await constraintExists(t, `${t}_tenant_id_tenants_id_fk`))) {
      await db.execute(sql.raw(`ALTER TABLE ${t} ADD CONSTRAINT ${t}_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE`));
    }
    await db.execute(sql.raw(`CREATE INDEX IF NOT EXISTS ${t}_tenant_id_idx ON ${t} (tenant_id)`));
    console.log(`${t}.tenant_id siap (backfill -> ${defaultTenantId})`);
  }

  // 3. Tabel tutor_leave_requests
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "public"."tutor_leave_requests" (
      "id" text PRIMARY KEY NOT NULL,
      "tenant_id" text NOT NULL REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
      "tutor_id" text REFERENCES "public"."tutors"("id") ON DELETE CASCADE,
      "user_id" text REFERENCES "public"."user"("id") ON DELETE SET NULL,
      "leave_type" text NOT NULL,
      "start_date" date NOT NULL,
      "end_date" date NOT NULL,
      "reason" text,
      "replacement_tutor_id" text REFERENCES "public"."tutors"("id") ON DELETE SET NULL,
      "status" text DEFAULT 'pending' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now()
    )
  `);
  console.log("tutor_leave_requests siap");

  // 4. Drop UNIQUE paycore_events.paycore_order_id
  for (const cname of ["paycore_events_paycore_order_id_unique", "paycore_events_paycore_order_id_key"]) {
    if (await constraintExists("paycore_events", cname)) {
      await db.execute(sql.raw(`ALTER TABLE paycore_events DROP CONSTRAINT ${cname}`));
      console.log(`UNIQUE ${cname} di-drop`);
    }
  }

  console.log("=== Migrasi multi-tenant selesai ===");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("MIGRASI GAGAL:", e.message);
    process.exit(1);
  });
