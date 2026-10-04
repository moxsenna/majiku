import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL_DIRECT || process.env.NEON_DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/majiku",
  },
});
