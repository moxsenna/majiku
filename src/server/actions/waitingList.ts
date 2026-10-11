"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { and, asc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { waitingList, classes, students, studentEnrollments } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";
import { requireTenantContext } from "@/server/authz";

export interface WaitingListRow {
  id: string;
  studentName: string;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  parentUserId: string | null;
  classId: string | null;
  status: string;
  priority: number;
  notes: string | null;
  className: string | null;
  classCapacity: number | null;
  // Aliases for legacy UI
  student_name: string;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  class_id: string | null;
  classes: {
    name: string;
    capacity: number | null;
  } | null;
}

export type WaitingListStatusType = "waiting" | "notified" | "confirmed" | "expired" | "cancelled";

export interface CreateWaitingListInput {
  studentName: string;
  parentName?: string | null;
  parentPhone?: string | null;
  parentEmail?: string | null;
  parentUserId?: string | null;
  classId?: string | null;
  priority?: number;
  notes?: string | null;
}

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

export async function getWaitingList(): Promise<WaitingListRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAdmin = roles.includes("admin") || roles.includes("moderator");
  const isParent = roles.includes("parent");

  if (!isAdmin && !isParent) return [];

  const conditions = [];
  if (isAdmin) {
    try {
      const { tenantId } = await requireTenantContext();
      conditions.push(eq(waitingList.tenantId, tenantId));
    } catch {
      return [];
    }
  } else if (isParent) {
    conditions.push(
      session.user.email
        ? or(
            eq(waitingList.parentUserId, session.user.id),
            eq(waitingList.parentEmail, session.user.email)
          )!
        : eq(waitingList.parentUserId, session.user.id)
    );
  }

  const query = db
    .select({
      id: waitingList.id,
      studentName: waitingList.studentName,
      parentName: waitingList.parentName,
      parentPhone: waitingList.parentPhone,
      parentEmail: waitingList.parentEmail,
      parentUserId: waitingList.parentUserId,
      classId: waitingList.classId,
      status: waitingList.status,
      priority: waitingList.priority,
      notes: waitingList.notes,
      className: classes.name,
      classCapacity: classes.capacity,
    })
    .from(waitingList)
    .leftJoin(classes, eq(waitingList.classId, classes.id))
    .orderBy(asc(waitingList.priority));

  const rows = conditions.length > 0 ? await query.where(and(...conditions)) : await query;

  return rows.map((r) => ({
    id: r.id,
    studentName: r.studentName,
    parentName: r.parentName,
    parentPhone: r.parentPhone,
    parentEmail: r.parentEmail,
    parentUserId: r.parentUserId,
    classId: r.classId,
    status: r.status,
    priority: r.priority ?? 0,
    notes: r.notes,
    className: r.className,
    classCapacity: r.classCapacity,
    student_name: r.studentName,
    parent_name: r.parentName,
    parent_phone: r.parentPhone,
    parent_email: r.parentEmail,
    class_id: r.classId,
    classes: r.className
      ? {
          name: r.className,
          capacity: r.classCapacity,
        }
      : null,
  }));
}

export async function createWaitingListEntry(input: CreateWaitingListInput): Promise<{ id: string }> {
  const { tenantId } = await requireTenantContext();

  const studentName = input.studentName?.trim();
  if (!studentName) {
    throw new Error("Nama calon siswa wajib diisi");
  }

  let targetClassId: string | null = null;
  if (input.classId?.trim() && input.classId !== "none") {
    const [cls] = await db
      .select({ id: classes.id })
      .from(classes)
      .where(and(eq(classes.id, input.classId.trim()), eq(classes.tenantId, tenantId)))
      .limit(1);
    if (!cls) {
      throw new Error("Kelas tidak ditemukan atau bukan milik lembaga Anda");
    }
    targetClassId = cls.id;
  }

  const id = randomUUID();
  await db.insert(waitingList).values({
    id,
    tenantId,
    studentName,
    parentName: input.parentName?.trim() || null,
    parentPhone: input.parentPhone?.trim() || null,
    parentEmail: input.parentEmail?.trim() || null,
    parentUserId: input.parentUserId?.trim() || null,
    classId: targetClassId,
    priority: input.priority ?? 0,
    notes: input.notes?.trim() || null,
    status: "waiting",
  });

  return { id };
}

export async function updateWaitingListStatus(
  id: string,
  status: WaitingListStatusType
): Promise<{ ok: boolean }> {
  const { tenantId } = await requireTenantContext();

  const allowedStatuses: WaitingListStatusType[] = ["waiting", "notified", "confirmed", "expired", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    throw new Error("Status waiting list tidak valid");
  }

  const now = new Date();
  const updateValues: Record<string, unknown> = {
    status,
    updatedAt: now,
  };

  if (status === "notified") {
    updateValues.notifiedAt = now;
  } else if (status === "confirmed") {
    updateValues.confirmedAt = now;
  }

  const updated = await db
    .update(waitingList)
    .set(updateValues)
    .where(and(eq(waitingList.id, id), eq(waitingList.tenantId, tenantId)))
    .returning({ id: waitingList.id });

  if (updated.length === 0) {
    throw new Error("Entri waiting list tidak ditemukan");
  }

  return { ok: true };
}

export async function promoteWaitingListToStudent(
  waitingListId: string
): Promise<{ studentId: string }> {
  const { tenantId } = await requireTenantContext();

  const [entry] = await db
    .select()
    .from(waitingList)
    .where(and(eq(waitingList.id, waitingListId), eq(waitingList.tenantId, tenantId)))
    .limit(1);

  if (!entry) {
    throw new Error("Entri waiting list tidak ditemukan");
  }

  const studentId = randomUUID();
  const today = new Date().toISOString().slice(0, 10);

  await db.insert(students).values({
    id: studentId,
    tenantId,
    name: entry.studentName,
    parentName: entry.parentName,
    parentPhone: entry.parentPhone,
    parentEmail: entry.parentEmail,
    parentUserId: entry.parentUserId,
    registrationDate: today,
    isActive: true,
  });

  if (entry.classId) {
    const [cls] = await db
      .select({ id: classes.id, sessionsPerMonth: classes.sessionsPerMonth })
      .from(classes)
      .where(and(eq(classes.id, entry.classId), eq(classes.tenantId, tenantId)))
      .limit(1);

    if (cls) {
      await db.insert(studentEnrollments).values({
        id: randomUUID(),
        studentId,
        classId: cls.id,
        sessionsQuota: cls.sessionsPerMonth ?? 20,
        sessionsUsed: 0,
        freePermitsAllowed: 2,
        freePermitsUsed: 0,
        enrollmentDate: today,
        billingDay: 1,
        isActive: true,
      });
    }
  }

  await db
    .update(waitingList)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(waitingList.id, waitingListId));

  return { studentId };
}
