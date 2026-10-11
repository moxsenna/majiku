import { headers } from "next/headers";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/server/auth";
import { getMyRoles } from "@/server/authz";
import { db } from "@/db";
import {
  dailyReports,
  galleryPhotos,
  students,
  tutors,
  tutorClassAssignments,
  tenants,
  classes,
} from "@/db/schema";
import { getPhoto } from "@/server/r2";

/**
 * Sajikan foto privat (laporan harian & galeri) dengan OTORISASI, bukan sekadar sesi:
 * - superadmin platform: boleh semua
 * - admin lembaga: foto milik lembaganya
 * - tutor: foto anak di kelas yang diampunya
 * - orang tua: foto anaknya sendiri
 * Key tanpa metadata di DB ditolak (prinsip default-deny).
 */
export async function GET(
  _req: Request,
  props: { params: Promise<{ key: string[] }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: keySegments } = await props.params;
  if (!keySegments || keySegments.length === 0) {
    return new Response("Not Found", { status: 404 });
  }
  const key = keySegments.join("/");

  // Pola key dibatasi: reports/<uuid>.<ext> atau gallery/<uuid>.<ext> (anti path traversal)
  if (!/^(reports|gallery)\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/.test(key)) {
    return new Response("Not Found", { status: 404 });
  }

  const roles = await getMyRoles(session.user.id);
  if (!roles.includes("superadmin")) {
    // Cari konteks kepemilikan key dari metadata DB
    const [galleryRow] = await db
      .select({ studentId: galleryPhotos.studentId, classId: galleryPhotos.classId })
      .from(galleryPhotos)
      .where(eq(galleryPhotos.photoKey, key))
      .limit(1);

    let studentId = galleryRow?.studentId ?? null;
    let classId = galleryRow?.classId ?? null;

    if (!studentId) {
      const [reportRow] = await db
        .select({ studentId: dailyReports.studentId, classId: dailyReports.classId })
        .from(dailyReports)
        .where(sql`${dailyReports.photos} @> ${JSON.stringify([key])}::jsonb`)
        .limit(1);
      studentId = reportRow?.studentId ?? null;
      classId = reportRow?.classId ?? null;
    }

    if (!studentId) {
      // Key tidak dirujuk metadata mana pun — default deny
      return new Response("Not Found", { status: 404 });
    }

    let allowed = false;

    // 1. Admin lembaga pemilik (via kelas foto, atau via tenant siswa)
    const [adminOfTenant] = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(
        and(
          eq(tenants.adminUserId, session.user.id),
          sql`EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = ${studentId}
              AND (
                s.tenant_id = ${tenants.id}
                OR EXISTS (
                  SELECT 1 FROM classes c
                  WHERE c.id = ${classId} AND c.tenant_id = ${tenants.id}
                )
              )
          )`
        )
      )
      .limit(1);
    if (adminOfTenant) allowed = true;

    // 2. Orang tua dari anak tersebut
    if (!allowed) {
      const [parentRow] = await db
        .select({ id: students.id })
        .from(students)
        .where(
          and(
            eq(students.id, studentId),
            sql`(${students.parentUserId} = ${session.user.id} OR ${students.parentEmail} = ${session.user.email})`
          )
        )
        .limit(1);
      if (parentRow) allowed = true;
    }

    // 3. Tutor yang mengampu kelas anak tersebut
    if (!allowed && classId) {
      const [tutorRow] = await db
        .select({ id: tutors.id })
        .from(tutors)
        .innerJoin(
          tutorClassAssignments,
          and(
            eq(tutorClassAssignments.tutorId, tutors.id),
            eq(tutorClassAssignments.classId, classId)
          )
        )
        .where(eq(tutors.userId, session.user.id))
        .limit(1);
      if (tutorRow) allowed = true;
    }

    if (!allowed) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const obj = await getPhoto(key);

  if (!obj || !obj.body) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
