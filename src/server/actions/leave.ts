"use server";

import { db } from "@/db";
import { tutorLeaveRequests, tutors } from "@/db/schema";
import { requireTutorContext, requireTenantContext } from "@/server/authz";
import { eq, and, or, desc } from "drizzle-orm";
import { isValidDateString } from "@/lib/datetime";

export interface SubmitLeaveRequestInput {
  leaveType: "sick" | "personal" | "annual" | "emergency" | string;
  startDate: string;
  endDate: string;
  reason?: string;
  replacementTutorId?: string | null;
}

export type TutorLeaveRequestItem = typeof tutorLeaveRequests.$inferSelect;

export async function submitLeaveRequest(input: SubmitLeaveRequestInput) {
  const session = await requireTutorContext();

  const leaveType = (input.leaveType ?? "").trim();
  if (!leaveType) {
    throw new Error("Jenis cuti wajib dipilih");
  }

  if (!isValidDateString(input.startDate) || !isValidDateString(input.endDate)) {
    throw new Error("Format tanggal tidak valid (YYYY-MM-DD)");
  }

  if (input.startDate > input.endDate) {
    throw new Error("Tanggal mulai tidak boleh lebih besar dari tanggal selesai");
  }

  // Cari data tutor berdasarkan userId sesi
  const [tutor] = await db
    .select({
      id: tutors.id,
      tenantId: tutors.tenantId,
      name: tutors.name,
    })
    .from(tutors)
    .where(eq(tutors.userId, session.user.id))
    .limit(1);

  let tenantId = tutor?.tenantId;
  if (!tenantId) {
    try {
      const tenantCtx = await requireTenantContext();
      tenantId = tenantCtx.tenantId;
    } catch {
      // bukan admin ber-tenant
    }
  }

  if (!tenantId) {
    throw new Error("Tutor tidak terhubung ke lembaga/tenant mana pun");
  }

  // Validasi replacementTutorId jika diisi: harus valid ID tutor di tenant yang sama
  let validReplacementTutorId: string | null = null;
  if (input.replacementTutorId && input.replacementTutorId !== "admin") {
    const [sub] = await db
      .select({ id: tutors.id })
      .from(tutors)
      .where(and(eq(tutors.id, input.replacementTutorId), eq(tutors.tenantId, tenantId)))
      .limit(1);
    if (sub) {
      validReplacementTutorId = sub.id;
    }
  }

  const id = `tlr_${crypto.randomUUID()}`;
  await db.insert(tutorLeaveRequests).values({
    id,
    tenantId,
    tutorId: tutor?.id ?? null,
    userId: session.user.id,
    leaveType,
    startDate: input.startDate,
    endDate: input.endDate,
    reason: input.reason?.trim() || null,
    replacementTutorId: validReplacementTutorId,
    status: "pending",
  });

  return { success: true, id };
}

export async function getMyLeaveRequests(): Promise<TutorLeaveRequestItem[]> {
  const session = await requireTutorContext();

  const [tutor] = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(eq(tutors.userId, session.user.id))
    .limit(1);

  const rows = await db
    .select()
    .from(tutorLeaveRequests)
    .where(
      tutor
        ? or(
            eq(tutorLeaveRequests.userId, session.user.id),
            eq(tutorLeaveRequests.tutorId, tutor.id)
          )
        : eq(tutorLeaveRequests.userId, session.user.id)
    )
    .orderBy(desc(tutorLeaveRequests.createdAt));

  return rows;
}

export async function getAvailableReplacementTutors() {
  const session = await requireTutorContext();

  const [tutor] = await db
    .select({ id: tutors.id, tenantId: tutors.tenantId })
    .from(tutors)
    .where(eq(tutors.userId, session.user.id))
    .limit(1);

  let tenantId = tutor?.tenantId;
  if (!tenantId) {
    try {
      const tenantCtx = await requireTenantContext();
      tenantId = tenantCtx.tenantId;
    } catch {
      // ignore
    }
  }

  if (!tenantId) return [];

  const list = await db
    .select({
      id: tutors.id,
      name: tutors.name,
    })
    .from(tutors)
    .where(and(eq(tutors.tenantId, tenantId), eq(tutors.isActive, true)));

  return list.filter((t) => !tutor || t.id !== tutor.id);
}
