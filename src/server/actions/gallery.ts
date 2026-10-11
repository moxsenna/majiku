"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { desc, eq, asc, and, or, inArray } from "drizzle-orm";
import { db } from "@/db";
import { galleryPhotos, students, classes, user, tutors } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";
import { requireTenantContext } from "@/server/authz";
import { deletePhoto } from "@/server/r2";

export interface GalleryPhotoRow {
  id: string;
  studentId: string | null;
  studentName: string | null;
  classId: string | null;
  className: string | null;
  photoKey: string;
  caption: string | null;
  uploadedByUserId: string | null;
  uploaderName: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UploadGalleryPhotosInput {
  photoKeys: string[];
  studentIds?: string[];
  classId?: string | null;
  caption?: string | null;
}

export interface GalleryOptionItem {
  id: string;
  name: string;
}

const GALLERY_KEY_REGEX = /^gallery\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/;

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

async function getTenantIdForGallery(): Promise<{ tenantId: string; userId: string }> {
  const session = await getSessionSafely();
  if (!session) throw new Error("Unauthorized: Anda harus login");
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (roles.includes("admin") || roles.includes("moderator")) {
    const ctx = await requireTenantContext();
    return { tenantId: ctx.tenantId, userId: ctx.session.user.id };
  }
  if (roles.includes("tutor")) {
    const [tutor] = await db
      .select({ tenantId: tutors.tenantId })
      .from(tutors)
      .where(
        and(
          session.user.email
            ? or(eq(tutors.userId, session.user.id), eq(tutors.email, session.user.email))
            : eq(tutors.userId, session.user.id),
          eq(tutors.isActive, true)
        )
      )
      .limit(1);
    if (tutor) return { tenantId: tutor.tenantId, userId: session.user.id };
  }
  throw new Error("Unauthorized: Akses galeri ditolak");
}

export async function listGalleryPhotos(): Promise<GalleryPhotoRow[]> {
  let authContext: { tenantId: string; userId: string };
  try {
    authContext = await getTenantIdForGallery();
  } catch {
    return [];
  }

  const rows = await db
    .select({
      id: galleryPhotos.id,
      studentId: galleryPhotos.studentId,
      studentName: students.name,
      classId: galleryPhotos.classId,
      className: classes.name,
      photoKey: galleryPhotos.photoKey,
      caption: galleryPhotos.caption,
      uploadedByUserId: galleryPhotos.uploadedByUserId,
      uploaderName: user.name,
      createdAt: galleryPhotos.createdAt,
      updatedAt: galleryPhotos.updatedAt,
    })
    .from(galleryPhotos)
    .leftJoin(students, eq(galleryPhotos.studentId, students.id))
    .leftJoin(classes, eq(galleryPhotos.classId, classes.id))
    .leftJoin(user, eq(galleryPhotos.uploadedByUserId, user.id))
    .where(
      or(
        eq(students.tenantId, authContext.tenantId),
        eq(classes.tenantId, authContext.tenantId)
      )
    )
    .orderBy(desc(galleryPhotos.createdAt));

  return rows;
}

export async function uploadGalleryPhotos(
  input: UploadGalleryPhotosInput
): Promise<{ created: number }> {
  const { tenantId, userId } = await getTenantIdForGallery();

  const { photoKeys } = input;
  if (!Array.isArray(photoKeys) || photoKeys.length === 0) {
    throw new Error("Minimal 1 foto harus diunggah");
  }
  if (photoKeys.length > 6) {
    throw new Error("Maksimal 6 foto sekaligus");
  }

  for (const key of photoKeys) {
    if (!GALLERY_KEY_REGEX.test(key)) {
      throw new Error(`Format key foto tidak valid: ${key}`);
    }
  }

  let classId: string | null = null;
  if (input.classId?.trim()) {
    const [targetClass] = await db
      .select({ id: classes.id })
      .from(classes)
      .where(and(eq(classes.id, input.classId.trim()), eq(classes.tenantId, tenantId)))
      .limit(1);
    if (!targetClass) {
      throw new Error("Kelas tidak ditemukan");
    }
    classId = targetClass.id;
  }

  const rawStudentIds = (input.studentIds || []).filter(Boolean);
  let validStudentIds: string[] = [];
  if (rawStudentIds.length > 0) {
    const targetStudents = await db
      .select({ id: students.id })
      .from(students)
      .where(and(inArray(students.id, rawStudentIds), eq(students.tenantId, tenantId)));
    validStudentIds = targetStudents.map((s) => s.id);
  }

  const caption = input.caption?.trim() || null;
  let createdCount = 0;

  for (const key of photoKeys) {
    if (validStudentIds.length > 0) {
      for (const sId of validStudentIds) {
        await db.insert(galleryPhotos).values({
          id: randomUUID(),
          studentId: sId,
          classId,
          photoKey: key,
          caption,
          uploadedByUserId: userId,
        });
        createdCount++;
      }
    } else {
      await db.insert(galleryPhotos).values({
        id: randomUUID(),
        studentId: null,
        classId,
        photoKey: key,
        caption,
        uploadedByUserId: userId,
      });
      createdCount++;
    }
  }

  return { created: createdCount };
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  const ctx = await requireTenantContext();

  const [photo] = await db
    .select({
      id: galleryPhotos.id,
      photoKey: galleryPhotos.photoKey,
    })
    .from(galleryPhotos)
    .leftJoin(students, eq(galleryPhotos.studentId, students.id))
    .leftJoin(classes, eq(galleryPhotos.classId, classes.id))
    .where(
      and(
        eq(galleryPhotos.id, id),
        or(
          eq(students.tenantId, ctx.tenantId),
          eq(classes.tenantId, ctx.tenantId)
        )
      )
    )
    .limit(1);

  if (!photo) {
    throw new Error("Foto galeri tidak ditemukan");
  }

  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));

  // Hanya hapus dari R2 jika tidak ada baris lain yang masih menggunakan photoKey ini
  const [stillUsed] = await db
    .select({ id: galleryPhotos.id })
    .from(galleryPhotos)
    .where(eq(galleryPhotos.photoKey, photo.photoKey))
    .limit(1);

  if (!stillUsed) {
    // Best-effort hapus dari R2
    await deletePhoto(photo.photoKey);
  }
}

export async function listGalleryOptions(): Promise<{
  students: GalleryOptionItem[];
  classes: GalleryOptionItem[];
}> {
  let authContext: { tenantId: string; userId: string };
  try {
    authContext = await getTenantIdForGallery();
  } catch {
    return { students: [], classes: [] };
  }

  const [studentList, classList] = await Promise.all([
    db
      .select({ id: students.id, name: students.name })
      .from(students)
      .where(and(eq(students.tenantId, authContext.tenantId), eq(students.isActive, true)))
      .orderBy(asc(students.name)),
    db
      .select({ id: classes.id, name: classes.name })
      .from(classes)
      .where(and(eq(classes.tenantId, authContext.tenantId), eq(classes.isActive, true)))
      .orderBy(asc(classes.name)),
  ]);

  return {
    students: studentList,
    classes: classList,
  };
}
