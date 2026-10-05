import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { db } from "../src/db";
import { trialApplications } from "../src/db/schema";

async function main() {
  console.log("Seeding demo trial applications...");

  const now = new Date();
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  await db
    .insert(trialApplications)
    .values([
      {
        id: "trialsub1",
        parentUserId: "usr_parent",
        childName: "Budi Santoso Jr",
        programKey: "toddler",
        parentName: "Budi Santoso",
        parentPhone: "081200000001",
        status: "submitted",
      },
      {
        id: "trialsch1",
        childName: "Siti Aminah Jr",
        programKey: "daycare",
        tutorId: "tut_1",
        classId: "cls_1",
        trialScheduledAt: threeDaysLater,
        parentName: "Siti Aminah Sr",
        parentPhone: "081200000002",
        status: "scheduled",
      },
      {
        id: "trialrec1",
        childName: "Raka Pratama Jr",
        programKey: "toddler",
        tutorId: "tut_1",
        classId: "cls_1",
        recommendation: "suitable",
        reviewedAt: now,
        trialCompletedAt: now,
        observationNotes: "Anak adaptif dan nyaman",
        parentName: "Raka Pratama Sr",
        parentPhone: "081200000003",
        status: "recommended",
      },
    ])
    .onConflictDoNothing();

  console.log("Seeding complete. Checking counts per status...");

  const counts = await db
    .select({
      status: trialApplications.status,
      count: sql<number>`count(*)::int`,
    })
    .from(trialApplications)
    .groupBy(trialApplications.status);

  console.table(counts);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed demo trial failed:", err);
  process.exit(1);
});
