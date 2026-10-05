"use server";

import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/server/auth";

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
  observationNotes: string,
  reviewerUserId?: string
) {
  let reviewer = reviewerUserId;
  if (!reviewer) {
    const session = await getSessionSafely();
    if (!session) {
      throw new Error("Unauthorized: Anda harus login untuk melakukan review trial");
    }
    reviewer = session.user.id;
  }

  await db.execute(
    sql`SELECT public.submit_trial_review(${trialId}, ${reviewer}, ${recommendation}::trial_recommendation, ${observationNotes})`
  );
}

export async function admitTrial(trialId: string, admittingUserId?: string) {
  let admitting = admittingUserId;
  if (!admitting) {
    const session = await getSessionSafely();
    if (!session) {
      throw new Error("Unauthorized: Anda harus login untuk menerima calon murid");
    }
    admitting = session.user.id;
  }

  await db.execute(
    sql`SELECT public.admit_trial_candidate(${trialId}, ${admitting})`
  );
}
