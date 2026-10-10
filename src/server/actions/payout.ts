"use server";

import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { tutors, tutorClassAssignments, tutorBonuses, classes } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";

export interface TutorItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  isActive: boolean | null;
  userId: string | null;
}

export interface TutorAssignmentItem {
  id: string;
  tutorId: string;
  classId: string;
  ratePerSession: number;
  isActive: boolean | null;
  tutor_id: string;
  class_id: string;
  rate_per_session: number;
  classes: {
    name: string;
    sessions_per_month: number;
  };
}

export interface TutorBonusItem {
  id: string;
  tutorId: string;
  amount: number;
  description: string | null;
  month: number;
  year: number;
  tutor_id: string;
}

export interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  pricePerMonth: string | null;
  sessionsPerMonth: number | null;
  schedule: string | null;
  location: string | null;
  isActive: boolean | null;
}

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

async function getCallerTutorId(userId: string, email?: string | null): Promise<string | null> {
  const row = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(
      and(
        email
          ? or(eq(tutors.userId, userId), eq(tutors.email, email))
          : eq(tutors.userId, userId),
        eq(tutors.isActive, true)
      )
    )
    .limit(1);
  return row[0]?.id ?? null;
}

export async function getTutors(): Promise<TutorItem[]> {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAdmin = roles.includes("admin") || roles.includes("moderator");
  const isTutor = roles.includes("tutor");

  if (!isAdmin && !isTutor) return [];

  const conditions = [eq(tutors.isActive, true)];
  if (!isAdmin && isTutor) {
    conditions.push(
      session.user.email
        ? or(eq(tutors.userId, session.user.id), eq(tutors.email, session.user.email))!
        : eq(tutors.userId, session.user.id)
    );
  }

  const rows = await db.select().from(tutors).where(and(...conditions));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    photoUrl: r.photoUrl,
    isActive: r.isActive,
    userId: r.userId,
  }));
}

export async function getTutorAssignments(): Promise<TutorAssignmentItem[]> {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAdmin = roles.includes("admin") || roles.includes("moderator");
  const isTutor = roles.includes("tutor");

  if (!isAdmin && !isTutor) return [];

  const conditions = [eq(tutorClassAssignments.isActive, true)];
  if (!isAdmin && isTutor) {
    const tutorId = await getCallerTutorId(session.user.id, session.user.email);
    if (!tutorId) return [];
    conditions.push(eq(tutorClassAssignments.tutorId, tutorId));
  }

  const rows = await db
    .select({
      id: tutorClassAssignments.id,
      tutorId: tutorClassAssignments.tutorId,
      classId: tutorClassAssignments.classId,
      ratePerSession: tutorClassAssignments.ratePerSession,
      isActive: tutorClassAssignments.isActive,
      className: classes.name,
      sessionsPerMonth: classes.sessionsPerMonth,
    })
    .from(tutorClassAssignments)
    .innerJoin(classes, eq(tutorClassAssignments.classId, classes.id))
    .where(and(...conditions));

  return rows.map((r) => {
    const rate = Number(r.ratePerSession ?? 0);
    return {
      id: r.id,
      tutorId: r.tutorId,
      classId: r.classId,
      ratePerSession: rate,
      isActive: r.isActive,
      tutor_id: r.tutorId,
      class_id: r.classId,
      rate_per_session: rate,
      classes: {
        name: r.className,
        sessions_per_month: r.sessionsPerMonth ?? 0,
      },
    };
  });
}

export async function getTutorBonuses(month?: number, year?: number): Promise<TutorBonusItem[]> {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAdmin = roles.includes("admin") || roles.includes("moderator");
  const isTutor = roles.includes("tutor");

  if (!isAdmin && !isTutor) return [];

  const now = new Date();
  const targetMonth = month ?? now.getMonth() + 1;
  const targetYear = year ?? now.getFullYear();

  const conditions = [
    eq(tutorBonuses.month, targetMonth),
    eq(tutorBonuses.year, targetYear),
  ];

  if (!isAdmin && isTutor) {
    const tutorId = await getCallerTutorId(session.user.id);
    if (!tutorId) return [];
    conditions.push(eq(tutorBonuses.tutorId, tutorId));
  }

  const rows = await db.select().from(tutorBonuses).where(and(...conditions));
  return rows.map((r) => {
    const amount = Number(r.amount ?? 0);
    return {
      id: r.id,
      tutorId: r.tutorId,
      amount,
      description: r.description,
      month: r.month,
      year: r.year,
      tutor_id: r.tutorId,
    };
  });
}

export async function getClasses(): Promise<ClassItem[]> {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAdmin = roles.includes("admin") || roles.includes("moderator");
  const isTutor = roles.includes("tutor");

  if (!isAdmin && !isTutor) return [];

  const rows = await db.select().from(classes).where(eq(classes.isActive, true));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    capacity: r.capacity,
    pricePerMonth: r.pricePerMonth,
    sessionsPerMonth: r.sessionsPerMonth,
    schedule: r.schedule,
    location: r.location,
    isActive: r.isActive,
  }));
}

export async function getTutorPayoutData(month?: number, year?: number) {
  const [tutorList, assignmentList, bonusList, classList] = await Promise.all([
    getTutors(),
    getTutorAssignments(),
    getTutorBonuses(month, year),
    getClasses(),
  ]);

  return {
    tutors: tutorList,
    assignments: assignmentList,
    bonuses: bonusList,
    classes: classList,
  };
}

export async function updateTutorRate(params: {
  assignmentId?: string;
  tutorId: string;
  classId: string;
  rate: number;
}) {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login untuk mengubah tarif tutor");
  }
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("admin") && !roles.includes("moderator")) {
    throw new Error("Hanya admin yang dapat mengubah tarif tutor");
  }

  if (params.assignmentId) {
    await db
      .update(tutorClassAssignments)
      .set({
        ratePerSession: String(params.rate),
        updatedAt: new Date(),
      })
      .where(eq(tutorClassAssignments.id, params.assignmentId));
  } else {
    await db.insert(tutorClassAssignments).values({
      id: "tca_" + randomUUID().replace(/-/g, "").slice(0, 12),
      tutorId: params.tutorId,
      classId: params.classId,
      ratePerSession: String(params.rate),
      isActive: true,
    });
  }
}

export async function addTutorBonus(params: {
  tutorId: string;
  amount: number;
  description: string;
  month?: number;
  year?: number;
}) {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login untuk menambahkan bonus tutor");
  }
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("admin") && !roles.includes("moderator")) {
    throw new Error("Hanya admin yang dapat menambahkan bonus tutor");
  }

  const now = new Date();
  const m = params.month ?? now.getMonth() + 1;
  const y = params.year ?? now.getFullYear();

  await db.insert(tutorBonuses).values({
    id: "tb_" + randomUUID().replace(/-/g, "").slice(0, 12),
    tutorId: params.tutorId,
    amount: String(params.amount),
    description: params.description,
    month: m,
    year: y,
  });
}
