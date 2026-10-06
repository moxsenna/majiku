import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { userRoles } from "@/db/schema";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Setiap akun baru otomatis mendapat role "parent" (default pendaftar
          // publik). Role lain (tutor/admin) diberikan admin secara manual.
          try {
            await db
              .insert(userRoles)
              .values({ id: crypto.randomUUID(), userId: user.id, role: "parent" })
              .onConflictDoNothing();
          } catch (err) {
            console.error("Gagal memberi role default ke user baru:", err);
          }
        },
      },
    },
  },
});
