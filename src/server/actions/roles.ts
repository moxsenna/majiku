"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userRoles } from "@/db/schema";
import { auth } from "@/server/auth";

export type AppRole = "admin" | "moderator" | "user" | "parent" | "tutor";

export async function getMyRoles(): Promise<AppRole[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];
  const rows = await db.select().from(userRoles).where(eq(userRoles.userId, session.user.id));
  return rows.map((r) => r.role);
}
