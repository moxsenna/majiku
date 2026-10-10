import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating tutor_attendance table if not exists...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "public"."tutor_attendance" (
      "id" text PRIMARY KEY NOT NULL,
      "tutor_id" text REFERENCES "public"."tutors"("id") ON DELETE CASCADE,
      "user_id" text REFERENCES "public"."user"("id") ON DELETE SET NULL,
      "date" date NOT NULL,
      "check_in_time" text,
      "check_out_time" text,
      "status" text DEFAULT 'hadir' NOT NULL,
      "method" text DEFAULT 'manual',
      "notes" text,
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now()
    );
  `);
  console.log("Table tutor_attendance is ready!");
}

main().catch(console.error);
