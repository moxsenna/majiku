import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function ensureSchemaOk(): Promise<{ tables: string[] }> {
  const res = await db.execute<{ tablename: string }>(
    sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  return { tables: res.rows.map((r) => r.tablename) };
}
