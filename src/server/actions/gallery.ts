"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { desc, eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { galleryPhotos, students, classes, user } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";
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

export async function listGalleryPhotos(): Promise<GalleryPhotoRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const allowed = roles.includes("admin") || roles.includes("moderator") || roles.includes("tutor");
  if (!allowed) return [];

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
    .orderBy(desc(galleryPhotos.createdAt));

  return rows;
}

export async function uploadGalleryPhotos(
  input: UploadGalleryPhotosInput
): Promise<{ created: number }> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login");
  }

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const allowed = roles.includes("admin") || roles.includes("moderator") || roles.includes("tutor");
  if (!allowed) {
    throw new Error("Unauthorized: Hanya admin, moderator, atau tutor yang dapat mengunggah foto galeri");
  }

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

  const classId = input.classId?.trim() || null;
  const caption = input.caption?.trim() || null;
  const validStudentIds = (input.studentIds || []).filter(Boolean);

  let createdCount = 0;

  await db.transaction(async (tx) => {
    for (const key of photoKeys) {
      if (validStudentIds.length > 0) {
        for (const sId of validStudentIds) {
          await tx.insert(galleryPhotos).values({
            id: randomUUID(),
            studentId: sId,
            classId,
            photoKey: key,
            caption,
            uploadedByUserId: session.user.id,
          });
          createdCount++;
        }
      } else {
        await tx.insert(galleryPhotos).values({
          id: randomUUID(),
          studentId: null,
          classId,
          photoKey: key,
          caption,
          uploadedByUserId: session.user.id,
        });
        createdCount++;
      }
    }
  });

  return { created: createdCount };
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login");
  }

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const allowed = roles.includes("admin") || roles.includes("moderator");
  if (!allowed) {
    throw new Error("Hanya admin atau moderator yang dapat menghapus foto galeri");
  }

  const [photo] = await db
    .select({
      id: galleryPhotos.id,
      photoKey: galleryPhotos.photoKey,
    })
    .from(galleryPhotos)
    .where(eq(galleryPhotos.id, id))
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
  const session = await getSessionSafely();
  if (!session) {
    return { students: [], classes: [] };
  }

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const allowed = roles.includes("admin") || roles.includes("moderator") || roles.includes("tutor");
  if (!allowed) {
    return { students: [], classes: [] };
  }

  const [studentList, classList] = await Promise.all([
    db
      .select({ id: students.id, name: students.name })
      .from(students)
      .where(eq(students.isActive, true))
      .orderBy(asc(students.name)),
    db
      .select({ id: classes.id, name: classes.name })
      .from(classes)
      .where(eq(classes.isActive, true))
      .orderBy(asc(classes.name)),
  ]);

  return {
    students: studentList,
    classes: classList,
  };
}
