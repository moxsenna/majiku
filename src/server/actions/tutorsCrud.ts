"use server";

import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { tutors, tutorClassAssignments, classes, user } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";

export type TutorRecord = typeof tutors.$inferSelect;

export interface TutorAssignmentDetail {
  assignmentId: string;
  classId: string;
  className: string | null;
  ratePerSession: string | null;
}

export interface TutorWithAssignments {
  tutor: TutorRecord;
  assignments: TutorAssignmentDetail[];
}

export interface CreateTutorInput {
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface UpdateTutorInput {
  name?: string;
  email?: string | null;
  phone?: string | null;
}

export async function listTutorsWithAssignments(): Promise<TutorWithAssignments[]> {
  const ctx = await requireTenantContext();

  const rows = await db
    .select({
      tutor: tutors,
      assignmentId: tutorClassAssignments.id,
      classId: tutorClassAssignments.classId,
      className: classes.name,
      ratePerSession: tutorClassAssignments.ratePerSession,
    })
    .from(tutors)
    .leftJoin(tutorClassAssignments, eq(tutors.id, tutorClassAssignments.tutorId))
    .leftJoin(classes, eq(tutorClassAssignments.classId, classes.id))
    .where(eq(tutors.tenantId, ctx.tenantId))
    .orderBy(desc(tutors.createdAt), asc(tutors.name));

  const map = new Map<string, TutorWithAssignments>();
  for (const row of rows) {
    let entry = map.get(row.tutor.id);
    if (!entry) {
      entry = { tutor: row.tutor, assignments: [] };
      map.set(row.tutor.id, entry);
    }
    if (row.assignmentId && row.classId) {
      entry.assignments.push({
        assignmentId: row.assignmentId,
        classId: row.classId,
        className: row.className,
        ratePerSession: row.ratePerSession,
      });
    }
  }

  return Array.from(map.values());
}

export async function createTutor(input: CreateTutorInput): Promise<{ id: string }> {
  const ctx = await requireTenantContext();

  if (!input.name || !input.name.trim()) {
    throw new Error("Nama tutor wajib diisi");
  }

  const id = randomUUID();
  const email = input.email?.trim().toLowerCase() || null;

  // Auto-link jika email cocok dengan akun user terdaftar
  let userId: string | null = null;
  if (email) {
    const matched = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    if (matched.length > 0) {
      userId = matched[0].id;
    }
  }

  await db.insert(tutors).values({
    id,
    tenantId: ctx.tenantId,
    name: input.name.trim(),
    email,
    phone: input.phone?.trim() || null,
    userId,
    isActive: true,
  });

  return { id };
}

export async function updateTutor(
  id: string,
  partial: UpdateTutorInput
): Promise<void> {
  const ctx = await requireTenantContext();

  if (!id) {
    throw new Error("ID tutor wajib diisi");
  }

  if (partial.name !== undefined && !partial.name.trim()) {
    throw new Error("Nama tutor tidak boleh kosong");
  }

  const updateValues: Partial<typeof tutors.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (partial.name !== undefined) updateValues.name = partial.name.trim();
  if (partial.email !== undefined) {
    const trimmedEmail = typeof partial.email === "string" ? partial.email.trim().toLowerCase() || null : partial.email;
    updateValues.email = trimmedEmail;
    if (trimmedEmail) {
      const matched = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, trimmedEmail))
        .limit(1);
      if (matched.length > 0) {
        updateValues.userId = matched[0].id;
      }
    }
  }
  if (partial.phone !== undefined) {
    updateValues.phone =
      typeof partial.phone === "string" ? partial.phone.trim() || null : partial.phone;
  }

  const result = await db
    .update(tutors)
    .set(updateValues)
    .where(and(eq(tutors.id, id), eq(tutors.tenantId, ctx.tenantId)))
    .returning({ id: tutors.id });

  if (result.length === 0) {
    throw new Error("Tutor tidak ditemukan");
  }
}

export async function toggleTutorActive(id: string, isActive: boolean): Promise<void> {
  const ctx = await requireTenantContext();

  if (!id) {
    throw new Error("ID tutor wajib diisi");
  }

  const result = await db
    .update(tutors)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(and(eq(tutors.id, id), eq(tutors.tenantId, ctx.tenantId)))
    .returning({ id: tutors.id });

  if (result.length === 0) {
    throw new Error("Tutor tidak ditemukan");
  }
}

export interface LinkableUser {
  id: string;
  name: string;
  email: string;
  linkedTutorName: string | null;
}

export async function listLinkableUsers(): Promise<LinkableUser[]> {
  const ctx = await requireTenantContext();

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      linkedTutorName: tutors.name,
    })
    .from(user)
    .leftJoin(
      tutors,
      and(eq(tutors.userId, user.id), eq(tutors.tenantId, ctx.tenantId))
    )
    .orderBy(asc(user.name));

  return rows;
}

export async function linkTutorUser(tutorId: string, userId: string): Promise<void> {
  const ctx = await requireTenantContext();

  if (!tutorId) {
    throw new Error("ID tutor wajib diisi");
  }
  if (!userId) {
    throw new Error("ID akun wajib diisi");
  }

  const [targetTutor] = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(and(eq(tutors.id, tutorId), eq(tutors.tenantId, ctx.tenantId)))
    .limit(1);

  if (!targetTutor) {
    throw new Error("Tutor tidak ditemukan");
  }

  const [targetUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!targetUser) {
    throw new Error("Akun tidak ditemukan");
  }

  const [alreadyLinked] = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(
      and(
        eq(tutors.userId, userId),
        eq(tutors.tenantId, ctx.tenantId),
        ne(tutors.id, tutorId)
      )
    )
    .limit(1);

  if (alreadyLinked) {
    throw new Error("Akun sudah tertaut ke tutor lain");
  }

  const result = await db
    .update(tutors)
    .set({
      userId,
      updatedAt: new Date(),
    })
    .where(and(eq(tutors.id, tutorId), eq(tutors.tenantId, ctx.tenantId)))
    .returning({ id: tutors.id });

  if (result.length === 0) {
    throw new Error("Tutor tidak ditemukan");
  }
}

export async function unlinkTutorUser(tutorId: string): Promise<void> {
  const ctx = await requireTenantContext();

  if (!tutorId) {
    throw new Error("ID tutor wajib diisi");
  }

  const result = await db
    .update(tutors)
    .set({
      userId: null,
      updatedAt: new Date(),
    })
    .where(and(eq(tutors.id, tutorId), eq(tutors.tenantId, ctx.tenantId)))
    .returning({ id: tutors.id });

  if (result.length === 0) {
    throw new Error("Tutor tidak ditemukan");
  }
}

export async function assignTutorClass(
  tutorId: string,
  classId: string,
  ratePerSession: number = 50000
): Promise<void> {
  const ctx = await requireTenantContext();
  if (!tutorId || !classId) throw new Error("ID tutor dan kelas wajib diisi");

  const [tutor] = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(and(eq(tutors.id, tutorId), eq(tutors.tenantId, ctx.tenantId)))
    .limit(1);
  if (!tutor) throw new Error("Tutor tidak ditemukan");

  const [cls] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(and(eq(classes.id, classId), eq(classes.tenantId, ctx.tenantId)))
    .limit(1);
  if (!cls) throw new Error("Kelas tidak ditemukan");

  await db.insert(tutorClassAssignments).values({
    id: randomUUID(),
    tutorId,
    classId,
    ratePerSession: String(ratePerSession),
    isActive: true,
  }).onConflictDoNothing();
}

export async function removeTutorClassAssignment(assignmentId: string): Promise<void> {
  const ctx = await requireTenantContext();
  if (!assignmentId) throw new Error("ID penugasan wajib diisi");

  const scopedAssignments = db
    .select({ id: tutorClassAssignments.id })
    .from(tutorClassAssignments)
    .innerJoin(tutors, eq(tutors.id, tutorClassAssignments.tutorId))
    .where(and(eq(tutorClassAssignments.id, assignmentId), eq(tutors.tenantId, ctx.tenantId)));

  const result = await db
    .delete(tutorClassAssignments)
    .where(inArray(tutorClassAssignments.id, scopedAssignments))
    .returning({ id: tutorClassAssignments.id });

  if (result.length === 0) {
    throw new Error("Penugasan tidak ditemukan");
  }
}
