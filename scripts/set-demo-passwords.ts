import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/db";
import { user, account, userRoles } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Setting passwords for demo users...");

  // Ambil hash password dari admin.test@gmail.com (Password123!)
  const [testUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, "admin.test@gmail.com"));

  if (!testUser) {
    throw new Error("User admin.test@gmail.com tidak ditemukan");
  }

  const [testAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, testUser.id));

  if (!testAccount || !testAccount.password) {
    throw new Error("Password hash tidak ditemukan");
  }

  const passwordHash = testAccount.password;
  console.log("Menggunakan hash Password123!");

  const demoUsers = [
    { email: "admin@majiku.test", role: "admin" },
    { email: "rina@majiku.test", role: "tutor" },
    { email: "parent@majiku.test", role: "parent" },
    { email: "demo@majiku.id", role: "admin" },
  ];

  for (const d of demoUsers) {
    const [u] = await db.select().from(user).where(eq(user.email, d.email));
    let userId = u?.id;

    if (!u) {
      userId = `usr_demo_${d.role}`;
      await db.insert(user).values({
        id: userId,
        name: d.role === "admin" ? "Admin Demo" : d.role === "tutor" ? "Bu Rina (Demo)" : "Orang Tua Demo",
        email: d.email,
        emailVerified: true,
      });
      console.log(`Created user ${d.email}`);
    }

    // Insert or update account
    const [existingAcc] = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId!));

    if (!existingAcc) {
      await db.insert(account).values({
        id: `acc_${userId!.slice(0, 8)}`,
        userId: userId!,
        accountId: userId!,
        providerId: "credential",
        password: passwordHash,
      });
      console.log(`Created account credential for ${d.email}`);
    } else {
      await db
        .update(account)
        .set({ password: passwordHash })
        .where(eq(account.id, existingAcc.id));
      console.log(`Updated account credential for ${d.email}`);
    }

    // Ensure user_roles
    const roleId = `ur_${userId!.slice(0, 8)}_${d.role}`;
    await db
      .insert(userRoles)
      .values({
        id: roleId,
        userId: userId!,
        role: d.role as any,
      })
      .onConflictDoNothing();
  }

  console.log("Semua akun demo sekarang memiliki password: Password123!");
}

main().catch(console.error);
