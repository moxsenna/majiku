import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { user, userRoles } from "../src/db/schema";
import type { AppRole } from "../src/server/actions/roles";

async function assign(email: string, role: AppRole) {
  const users = await db.select().from(user).where(eq(user.email, email));
  if (users.length === 0) {
    console.error(`User not found: ${email}`);
    return;
  }
  const targetUser = users[0];
  await db
    .insert(userRoles)
    .values({
      id: `ur_${targetUser.id.slice(0, 8)}_${role}`,
      userId: targetUser.id,
      role: role,
    })
    .onConflictDoNothing();
  console.log(`Assigned role '${role}' to ${email} (${targetUser.id})`);
}

async function main() {
  await assign("test_worker@majiku.test", "admin");
  await assign("test_tutor@majiku.test", "tutor");
  await assign("test_parent@majiku.test", "parent");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
