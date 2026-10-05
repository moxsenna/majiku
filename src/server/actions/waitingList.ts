"use server";

import { headers } from "next/headers";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { waitingList, classes } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";

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
  const roles: AppRole[] = session ? await getMyRoles().catch(() => []) : [];
  const isParentOnly = session && roles.includes("parent") && !roles.includes("admin") && !roles.includes("moderator");

  const conditions = [];
  if (isParentOnly && session) {
    conditions.push(eq(waitingList.parentUserId, session.user.id));
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
