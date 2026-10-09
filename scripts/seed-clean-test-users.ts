import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { user, userRoles } from "../src/db/schema";
import { auth } from "../src/server/auth";

interface TestAccount {
  name: string;
  email: string;
  password: string;
  role: "admin" | "tutor" | "parent" | "superadmin";
}

const testAccounts: TestAccount[] = [
  {
    name: "Admin Test Bersih",
    email: "admin.test@gmail.com",
    password: "Password123!",
    role: "admin",
  },
  {
    name: "Tutor Test Bersih",
    email: "tutor.test@gmail.com",
    password: "Password123!",
    role: "tutor",
  },
  {
    name: "Parent Test Bersih",
    email: "parent.test@gmail.com",
    password: "Password123!",
    role: "parent",
  },
];

async function main() {
  console.log("=== SEED AKUN TEST BERSIH NON-DEMO ===");

  for (const acc of testAccounts) {
    try {
      // 1. Coba daftar via BetterAuth API
      const result = await auth.api.signUpEmail({
        body: {
          name: acc.name,
          email: acc.email,
          password: acc.password,
        },
      }).catch((err) => {
        // Akun mungkin sudah terdaftar
        return null;
      });

      // 2. Ambil user record
      const [userRecord] = await db
        .select()
        .from(user)
        .where(eq(user.email, acc.email));

      if (userRecord) {
        // 3. Assign role
        const roleId = `ur_${userRecord.id.slice(0, 8)}_${acc.role}`;
        await db
          .insert(userRoles)
          .values({
            id: roleId,
            userId: userRecord.id,
            role: acc.role,
          })
          .onConflictDoNothing();

        console.log(`✓ Akun siap: ${acc.email} | Role: ${acc.role} | ID: ${userRecord.id}`);
      } else {
        console.error(`✗ Gagal mendaftarkan user ${acc.email}`);
      }
    } catch (e: any) {
      console.error(`Error akun ${acc.email}:`, e.message);
    }
  }

  console.log("\nSelesai! Akun test dapat digunakan untuk login di masing-masing portal:");
  console.log("- Admin Portal  : admin.test@gmail.com / Password123!");
  console.log("- Tutor Portal  : tutor.test@gmail.com / Password123!");
  console.log("- Parent Portal : parent.test@gmail.com / Password123!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
