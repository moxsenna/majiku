"use server";

import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

export async function submitTrialReview(
  trialId: string,
  recommendation: "suitable" | "repeat_trial" | "not_suitable",
  observationNotes: string
) {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login untuk melakukan review trial");
  }

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("tutor") && !roles.includes("admin") && !roles.includes("moderator")) {
    throw new Error("Hanya tutor atau admin yang dapat melakukan review trial");
  }

  await db.execute(
    sql`SELECT public.submit_trial_review(${trialId}, ${session.user.id}, ${recommendation}::trial_recommendation, ${observationNotes})`
  );
}

export async function admitTrial(trialId: string) {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login untuk menerima calon murid");
  }

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("admin") && !roles.includes("moderator")) {
    throw new Error("Hanya admin yang dapat menerima calon murid");
  }

  await db.execute(
    sql`SELECT public.admit_trial_candidate(${trialId}, ${session.user.id})`
  );
}
