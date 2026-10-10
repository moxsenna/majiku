"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { trialApplications, tutors, classes } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";

export interface SubmitTrialApplicationInput {
  programKey: string;
  childName: string;
  childNickname?: string;
  childBirthDate?: string;
  childGender?: string;
  allergies?: string;
  medicalNotes?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  requestedStartDate?: string;
  parentNotes?: string;
}

export interface ScheduleTrialInput {
  scheduledAt: string;
  tutorId: string;
  classId: string;
}

export type TrialApplicationRecord = typeof trialApplications.$inferSelect;

export interface TrialPipelineRow extends TrialApplicationRecord {
  className: string | null;
  tutorName: string | null;
}

export interface TrialQueueRow extends TrialApplicationRecord {
  className: string | null;
  tutorName: string | null;
}

export interface TrialApplicationRow extends TrialApplicationRecord {
  className: string | null;
  tutorName: string | null;
}

export interface SchedulingOptions {
  tutors: { id: string; name: string }[];
  classes: { id: string; name: string }[];
}

function hasRole(roles: AppRole[], role: AppRole): boolean {
  return roles.includes("admin") || roles.includes(role);
}

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

export async function submitTrialApplication(
  input: SubmitTrialApplicationInput
): Promise<{ id: string }> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login untuk mengajukan trial");
  }

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!hasRole(roles, "parent")) {
    throw new Error("Hanya parent atau admin yang dapat mengajukan trial");
  }

  if (!input.programKey?.trim()) {
    throw new Error("Program wajib dipilih");
  }
  if (!input.childName?.trim()) {
    throw new Error("Nama anak wajib diisi");
  }

  const parentName = input.parentName?.trim() || session.user.name || null;
  const parentEmail = input.parentEmail?.trim() || session.user.email || null;
  const parentPhone = input.parentPhone?.trim() || null;

  const result = await db
    .insert(trialApplications)
    .values({
      id: randomUUID(),
      parentUserId: session.user.id,
      programKey: input.programKey.trim(),
      childName: input.childName.trim(),
      childNickname: input.childNickname?.trim() || null,
      childBirthDate: input.childBirthDate?.trim() || null,
      childGender: input.childGender?.trim() || null,
      allergies: input.allergies?.trim() || null,
      medicalNotes: input.medicalNotes?.trim() || null,
      parentName,
      parentPhone,
      parentEmail,
      address: input.address?.trim() || null,
      emergencyContact: input.emergencyContact?.trim() || null,
      emergencyPhone: input.emergencyPhone?.trim() || null,
      requestedStartDate: input.requestedStartDate?.trim() || null,
      parentNotes: input.parentNotes?.trim() || null,
      status: "submitted",
    })
    .returning({ id: trialApplications.id });

  return { id: result[0].id };
}

export async function scheduleTrial(
  trialId: string,
  input: ScheduleTrialInput
): Promise<void> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login untuk menjadwalkan trial");
  }

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("admin") && !roles.includes("moderator")) {
    throw new Error("Hanya admin atau moderator yang dapat menjadwalkan trial");
  }

  if (!trialId) {
    throw new Error("ID pengajuan trial wajib diisi");
  }
  if (!input.scheduledAt || !input.tutorId || !input.classId) {
    throw new Error("Jadwal trial, tutor, dan kelas wajib dipilih");
  }

  const scheduledDate = new Date(input.scheduledAt);
  if (isNaN(scheduledDate.getTime())) {
    throw new Error("Format tanggal jadwal tidak valid");
  }

  const result = await db
    .update(trialApplications)
    .set({
      trialScheduledAt: scheduledDate,
      tutorId: input.tutorId,
      classId: input.classId,
      status: "scheduled",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(trialApplications.id, trialId),
        inArray(trialApplications.status, ["submitted", "scheduled"])
      )
    )
    .returning({ id: trialApplications.id });

  if (result.length === 0) {
    throw new Error("Pengajuan tidak ditemukan atau tidak dapat dijadwalkan");
  }
}

export async function markTrialAwaitingReview(trialId: string): Promise<void> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login untuk memperbarui status trial");
  }

  const tutorRows = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(eq(tutors.userId, session.user.id))
    .limit(1);

  const myTutor = tutorRows[0];
  if (!myTutor) {
    throw new Error("Hanya tutor yang ditugaskan");
  }

  const result = await db
    .update(trialApplications)
    .set({
      status: "awaiting_review",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(trialApplications.id, trialId),
        eq(trialApplications.tutorId, myTutor.id),
        eq(trialApplications.status, "scheduled")
      )
    )
    .returning({ id: trialApplications.id });

  if (result.length === 0) {
    throw new Error("Trial tidak ditemukan atau bukan milik Anda / status salah");
  }
}

export async function getTrialPipeline(): Promise<TrialPipelineRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("admin") && !roles.includes("moderator")) return [];

  const rows = await db
    .select({
      id: trialApplications.id,
      parentUserId: trialApplications.parentUserId,
      programKey: trialApplications.programKey,
      classId: trialApplications.classId,
      tutorId: trialApplications.tutorId,
      childName: trialApplications.childName,
      childNickname: trialApplications.childNickname,
      childBirthDate: trialApplications.childBirthDate,
      childGender: trialApplications.childGender,
      allergies: trialApplications.allergies,
      medicalNotes: trialApplications.medicalNotes,
      parentName: trialApplications.parentName,
      parentPhone: trialApplications.parentPhone,
      parentEmail: trialApplications.parentEmail,
      address: trialApplications.address,
      emergencyContact: trialApplications.emergencyContact,
      emergencyPhone: trialApplications.emergencyPhone,
      requestedStartDate: trialApplications.requestedStartDate,
      parentNotes: trialApplications.parentNotes,
      trialScheduledAt: trialApplications.trialScheduledAt,
      trialCompletedAt: trialApplications.trialCompletedAt,
      status: trialApplications.status,
      recommendation: trialApplications.recommendation,
      observationNotes: trialApplications.observationNotes,
      reviewedAt: trialApplications.reviewedAt,
      admittedAt: trialApplications.admittedAt,
      admittedStudentId: trialApplications.admittedStudentId,
      createdAt: trialApplications.createdAt,
      updatedAt: trialApplications.updatedAt,
      className: classes.name,
      tutorName: tutors.name,
    })
    .from(trialApplications)
    .leftJoin(classes, eq(trialApplications.classId, classes.id))
    .leftJoin(tutors, eq(trialApplications.tutorId, tutors.id))
    .orderBy(desc(trialApplications.createdAt));

  return rows;
}

export async function getMyTrialQueue(): Promise<TrialQueueRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const tutorRows = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(eq(tutors.userId, session.user.id))
    .limit(1);

  const myTutor = tutorRows[0];
  if (!myTutor) return [];

  const rows = await db
    .select({
      id: trialApplications.id,
      parentUserId: trialApplications.parentUserId,
      programKey: trialApplications.programKey,
      classId: trialApplications.classId,
      tutorId: trialApplications.tutorId,
      childName: trialApplications.childName,
      childNickname: trialApplications.childNickname,
      childBirthDate: trialApplications.childBirthDate,
      childGender: trialApplications.childGender,
      allergies: trialApplications.allergies,
      medicalNotes: trialApplications.medicalNotes,
      parentName: trialApplications.parentName,
      parentPhone: trialApplications.parentPhone,
      parentEmail: trialApplications.parentEmail,
      address: trialApplications.address,
      emergencyContact: trialApplications.emergencyContact,
      emergencyPhone: trialApplications.emergencyPhone,
      requestedStartDate: trialApplications.requestedStartDate,
      parentNotes: trialApplications.parentNotes,
      trialScheduledAt: trialApplications.trialScheduledAt,
      trialCompletedAt: trialApplications.trialCompletedAt,
      status: trialApplications.status,
      recommendation: trialApplications.recommendation,
      observationNotes: trialApplications.observationNotes,
      reviewedAt: trialApplications.reviewedAt,
      admittedAt: trialApplications.admittedAt,
      admittedStudentId: trialApplications.admittedStudentId,
      createdAt: trialApplications.createdAt,
      updatedAt: trialApplications.updatedAt,
      className: classes.name,
      tutorName: tutors.name,
    })
    .from(trialApplications)
    .leftJoin(classes, eq(trialApplications.classId, classes.id))
    .leftJoin(tutors, eq(trialApplications.tutorId, tutors.id))
    .where(
      and(
        eq(trialApplications.tutorId, myTutor.id),
        inArray(trialApplications.status, ["scheduled", "awaiting_review", "repeat_trial"])
      )
    )
    .orderBy(sql`${trialApplications.trialScheduledAt} ASC NULLS LAST`);

  return rows;
}

export async function getMyTrialApplications(): Promise<TrialApplicationRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const rows = await db
    .select({
      id: trialApplications.id,
      parentUserId: trialApplications.parentUserId,
      programKey: trialApplications.programKey,
      classId: trialApplications.classId,
      tutorId: trialApplications.tutorId,
      childName: trialApplications.childName,
      childNickname: trialApplications.childNickname,
      childBirthDate: trialApplications.childBirthDate,
      childGender: trialApplications.childGender,
      allergies: trialApplications.allergies,
      medicalNotes: trialApplications.medicalNotes,
      parentName: trialApplications.parentName,
      parentPhone: trialApplications.parentPhone,
      parentEmail: trialApplications.parentEmail,
      address: trialApplications.address,
      emergencyContact: trialApplications.emergencyContact,
      emergencyPhone: trialApplications.emergencyPhone,
      requestedStartDate: trialApplications.requestedStartDate,
      parentNotes: trialApplications.parentNotes,
      trialScheduledAt: trialApplications.trialScheduledAt,
      trialCompletedAt: trialApplications.trialCompletedAt,
      status: trialApplications.status,
      recommendation: trialApplications.recommendation,
      observationNotes: trialApplications.observationNotes,
      reviewedAt: trialApplications.reviewedAt,
      admittedAt: trialApplications.admittedAt,
      admittedStudentId: trialApplications.admittedStudentId,
      createdAt: trialApplications.createdAt,
      updatedAt: trialApplications.updatedAt,
      className: classes.name,
      tutorName: tutors.name,
    })
    .from(trialApplications)
    .leftJoin(classes, eq(trialApplications.classId, classes.id))
    .leftJoin(tutors, eq(trialApplications.tutorId, tutors.id))
    .where(
      session.user.email
        ? or(
            eq(trialApplications.parentUserId, session.user.id),
            eq(trialApplications.parentEmail, session.user.email)
          )
        : eq(trialApplications.parentUserId, session.user.id)
    )
    .orderBy(desc(trialApplications.createdAt));

  return rows;
}

export async function getSchedulingOptions(): Promise<SchedulingOptions> {
  const session = await getSessionSafely();
  if (!session) return { tutors: [], classes: [] };

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("admin") && !roles.includes("moderator")) {
    return { tutors: [], classes: [] };
  }

  const [activeTutors, activeClasses] = await Promise.all([
    db
      .select({ id: tutors.id, name: tutors.name })
      .from(tutors)
      .where(eq(tutors.isActive, true))
      .orderBy(asc(tutors.name)),
    db
      .select({ id: classes.id, name: classes.name })
      .from(classes)
      .where(eq(classes.isActive, true))
      .orderBy(asc(classes.name)),
  ]);

  return {
    tutors: activeTutors,
    classes: activeClasses,
  };
}

export interface RegistrationProgramItem {
  id: string;
  name: string;
  age: string;
  price: number;
  schedule: string;
  features: string[];
  quota: number;
  enrolled: number;
  status: "open" | "full" | "closed";
}

export async function getAvailablePrograms(): Promise<RegistrationProgramItem[]> {
  const dbClasses = await db
    .select({
      id: classes.id,
      name: classes.name,
      description: classes.description,
      capacity: classes.capacity,
      pricePerMonth: classes.pricePerMonth,
      schedule: classes.schedule,
    })
    .from(classes)
    .where(eq(classes.isActive, true))
    .orderBy(asc(classes.name));

  if (dbClasses.length === 0) {
    return [
      {
        id: "toddler",
        name: "Program Toddler",
        age: "1.5 - 3 tahun",
        price: 2000000,
        schedule: "Senin - Jumat, 08:00 - 12:00",
        features: ["Stimulasi motorik", "Musik & gerak", "Bermain sensori"],
        quota: 20,
        enrolled: 0,
        status: "open",
      },
      {
        id: "playgroup",
        name: "Playgroup",
        age: "3 - 4 tahun",
        price: 2500000,
        schedule: "Senin - Jumat, 08:00 - 13:00",
        features: ["Belajar huruf & angka", "Kegiatan seni", "Bermain kreatif"],
        quota: 25,
        enrolled: 0,
        status: "open",
      },
      {
        id: "kindergarten",
        name: "TK A & B",
        age: "4 - 6 tahun",
        price: 3000000,
        schedule: "Senin - Jumat, 07:30 - 14:00",
        features: ["Persiapan SD", "Bahasa Inggris", "Ekstrakurikuler"],
        quota: 30,
        enrolled: 0,
        status: "open",
      },
    ];
  }

  return dbClasses.map((c) => ({
    id: c.id,
    name: c.name,
    age: c.description || "2 - 6 tahun",
    price: Number(c.pricePerMonth) || 2000000,
    schedule: c.schedule || "Senin - Jumat, 08:00 - 12:00",
    features: ["Aktivitas belajar terstruktur", "Laporan harian perkembangan", "Dokumentasi foto kegiatan"],
    quota: c.capacity || 20,
    enrolled: 0,
    status: "open",
  }));
}
