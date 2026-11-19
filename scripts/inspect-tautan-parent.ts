// Inspeksi read-only: siswa/trial/waiting-list yang belum tertaut (parent_user_id NULL)
// tapi emailnya cocok dengan akun user eksisting.
// Jalankan: npx tsx scripts/inspect-tautan-parent.ts            (pakai .env.local = prod)
//           DOTENV=.env.test.local npx tsx scripts/inspect-tautan-parent.ts
import { config } from "dotenv";
config({ path: process.env.DOTENV || ".env.local" });

import { db } from "../src/db";
import { user, students, trialApplications, waitingList } from "../src/db/schema";
import { eq, isNull, sql, and, inArray } from "drizzle-orm";

async function main() {
  const users = await db.select({ id: user.id, email: user.email }).from(user);
  const emails = users.map((u) => u.email!.toLowerCase());
  console.log(`DB: total users=${users.length}`);

  const orphans = await db
    .select({
      id: students.id,
      name: students.name,
      tenantId: students.tenantId,
      parentEmail: students.parentEmail,
    })
    .from(students)
    .where(and(isNull(students.parentUserId), sql`lower(${students.parentEmail}) IN ${emails}`));

  console.log(`\nSTUDENTS tertaut-email (bisa di-backfill): ${orphans.length}`);
  for (const s of orphans) console.log(`- ${s.id} ${s.name} (tenant ${s.tenantId}) email=${s.parentEmail}`);

  const totalUnlinked = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(students)
    .where(isNull(students.parentUserId));
  console.log(`STUDENTS total tanpa parent_user_id: ${totalUnlinked[0]?.c}`);

  const trialOrphans = await db
    .select({
      id: trialApplications.id,
      childName: trialApplications.childName,
      status: trialApplications.status,
      parentEmail: trialApplications.parentEmail,
    })
    .from(trialApplications)
    .where(
      and(
        isNull(trialApplications.parentUserId),
        sql`lower(${trialApplications.parentEmail}) IN ${emails}`
      )
    );
  console.log(`\nTRIAL tertaut-email (bisa di-backfill): ${trialOrphans.length}`);
  for (const t of trialOrphans) console.log(`- ${t.id} ${t.childName} status=${t.status} email=${t.parentEmail}`);

  const wlOrphans = await db
    .select({ id: waitingList.id, studentName: waitingList.studentName, parentEmail: waitingList.parentEmail })
    .from(waitingList)
    .where(
      and(
        isNull(waitingList.parentUserId),
        sql`lower(${waitingList.parentEmail}) IN ${emails}`
      )
    );
  console.log(`\nWAITING-LIST tertaut-email: ${wlOrphans.length}`);
  for (const w of wlOrphans) console.log(`- ${w.id} ${w.studentName} email=${w.parentEmail}`);

  const linked = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(students)
    .where(sql`${students.parentUserId} IS NOT NULL`);
  console.log(`\nSTUDENTS sudah tertaut parent_user_id: ${linked[0]?.c}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
