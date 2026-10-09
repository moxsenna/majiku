import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/db";
import { user, account } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const users = await db.select().from(user);
  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    const acc = await db.select().from(account).where(eq(account.userId, u.id));
    console.log(`- ${u.email}: hasAccount=${acc.length > 0}`);
  }
}

main().catch(console.error);
