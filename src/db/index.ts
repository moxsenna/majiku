import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

let _db: NeonHttpDatabase<Record<string, never>> | null = null;

function getDb(): NeonHttpDatabase<Record<string, never>> {
  if (!_db) {
    if (!process.env.NEON_DATABASE_URL) {
      config({ path: ".env.local" });
      config();
    }
    if (!process.env.NEON_DATABASE_URL) {
      throw new Error("NEON_DATABASE_URL tidak diset");
    }
    _db = drizzle(process.env.NEON_DATABASE_URL);
  }
  return _db;
}

export const db: NeonHttpDatabase<Record<string, never>> = new Proxy(
  {} as NeonHttpDatabase<Record<string, never>>,
  {
    get(_target, prop, receiver) {
      const target = getDb();
      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  }
);
