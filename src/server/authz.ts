import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { db } from "@/db";
import { tenants, tutors, user, userRoles, attendance, type TenantRow } from "@/db/schema";
import { asc, eq, and } from "drizzle-orm";
import { isDemoEmail, DEMO_TENANT_ID } from "@/lib/demo";
import { todayInWib } from "@/lib/datetime";
import type { AppRole } from "@/server/actions/roles";

export type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

/**
 * Custom error thrown when a mutation is attempted in demo mode.
 */
export class DemoMutationError extends Error {
  isDemoLock = true;
  constructor(
    message = "Mode Demo: Fitur penambahan atau perubahan data dinonaktifkan untuk menjaga integritas simulasi."
  ) {
    super(message);
    this.name = "DemoMutationError";
  }
}

/**
 * Guard sentral untuk mengunci seluruh operasi mutasi (tulis/edit/hapus)
 * saat request berasal dari akun demo atau menarget tenant demo (tnt_demo).
 */
export function assertDemoMutationLock(
  session?: AuthSession | null,
  targetTenantId?: string | null
): void {
  const email = session?.user?.email;
  const isDemo = isDemoEmail(email) || targetTenantId === DEMO_TENANT_ID;
  if (isDemo) {
    throw new DemoMutationError();
  }
}

/**
 * Proyeksi kalender dinamis: memastikan tenant demo selalu memiliki data absensi hari ini (todayInWib).
 */
export async function ensureDemoAttendanceToday(): Promise<void> {
  try {
    const today = todayInWib();
    const [existing] = await db
      .select({ id: attendance.id })
      .from(attendance)
      .where(and(eq(attendance.studentId, "stu_demo_aisyah"), eq(attendance.date, today)))
      .limit(1);

    if (!existing) {
      await db
        .insert(attendance)
        .values([
          {
            id: `att_aisyah_${today}`,
            studentId: "stu_demo_aisyah",
            classId: "cls_bunga_matahari",
            date: today,
            status: "present",
            checkInTime: "07:45:00",
            checkOutTime: "12:00:00",
            checkedInBy: "Bu Rina Wijaya",
          },
          {
            id: `att_raka_${today}`,
            studentId: "stu_demo_raka",
            classId: "cls_bunga_matahari",
            date: today,
            status: "present",
            checkInTime: "08:00:00",
            checkOutTime: "12:00:00",
            checkedInBy: "Bu Rina Wijaya",
          },
          {
            id: `att_keisha_${today}`,
            studentId: "stu_demo_keisha",
            classId: "cls_bunga_matahari",
            date: today,
            status: "permit",
            permitType: "sick",
            permitReason: "Demam ringan dan istirahat di rumah",
            checkedInBy: "Bu Rina Wijaya",
          },
          {
            id: `att_arjuna_${today}`,
            studentId: "stu_demo_arjuna",
            classId: "cls_bunga_matahari",
            date: today,
            status: "permit",
            permitType: "family",
            permitReason: "Acara keluarga ke luar kota",
            checkedInBy: "Bu Rina Wijaya",
          },
        ])
        .onConflictDoNothing();
    }
  } catch {
    // Non-blocking fail-safe
  }
}

/**
 * Otorisasi terpusat untuk server action.
 * Setiap action yang membaca/menulis data lembaga WAJIB memakai helper ini
 * agar terisolasi per tenant (lihat docs/launch-audit-2026-10-11.md blok A & B).
 */

export async function getSessionOrNull(): Promise<AuthSession | null> {
  return auth.api.getSession({ headers: await headers() }).catch(() => null);
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getSessionOrNull();
  if (!session) throw new Error("Unauthorized: sesi tidak ditemukan");
  return session;
}

export async function getMyRoles(userId: string): Promise<AppRole[]> {
  const rows = await db.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.userId, userId));
  return rows.map((r) => r.role);
}

export async function requireRoles(...allowed: AppRole[]): Promise<AuthSession> {
  const session = await requireSession();
  const roles = await getMyRoles(session.user.id);
  if (!roles.some((r) => allowed.includes(r))) {
    throw new Error(`Forbidden: aksi ini hanya untuk role ${allowed.join("/")}`);
  }
  return session;
}

export interface TenantContext {
  session: AuthSession;
  tenantId: string;
  tenant: TenantRow;
  isDemo: boolean;
}

/**
 * Admin lembaga -> tenant miliknya (tenants.admin_user_id).
 * Akun demo -> terhubung langsung ke tnt_demo (Bunayo Daycare Demo).
 * Superadmin murni (tanpa kepemilikan tenant) ditolak di sini — gunakan portal vendor.
 */
export async function requireTenantContext(): Promise<TenantContext> {
  const session = await requireRoles("admin");
  const email = session.user.email;

  if (isDemoEmail(email)) {
    ensureDemoAttendanceToday().catch(() => {});
    const [demoTenant] = await db.select().from(tenants).where(eq(tenants.id, DEMO_TENANT_ID)).limit(1);
    if (demoTenant) return { session, tenantId: demoTenant.id, tenant: demoTenant, isDemo: true };
  }

  const [owned] = await db.select().from(tenants).where(eq(tenants.adminUserId, session.user.id)).limit(1);
  if (owned) return { session, tenantId: owned.id, tenant: owned, isDemo: isDemoEmail(email) };

  if (isDemoEmail(email)) {
    const [first] = await db.select().from(tenants).orderBy(asc(tenants.createdAt)).limit(1);
    if (first) return { session, tenantId: first.id, tenant: first, isDemo: true };
  }

  throw new Error("Forbidden: akun admin tidak terhubung ke lembaga mana pun");
}

/** Parent -> sesi dengan role parent (data anak di-scope per parentUserId oleh pemanggil). */
export async function requireParentContext(): Promise<AuthSession> {
  return requireRoles("parent");
}

/** Tutor -> sesi dengan role tutor. */
export async function requireTutorContext(): Promise<AuthSession> {
  return requireRoles("tutor", "admin");
}

/** Superadmin platform (portal vendor). */
export async function requireSuperadmin(): Promise<AuthSession> {
  return requireRoles("superadmin");
}

/**
 * Resolve tenantId untuk user apa pun tanpa melempar error:
 * Akun demo -> DEMO_TENANT_ID (tnt_demo)
 * admin lembaga -> tenants.admin_user_id; tutor -> tutors.tenant_id via user.
 * Dipakai action tutor (absensi, izin/cuti) yang bukan konteks admin.
 */
export async function resolveTenantIdForUser(userId: string): Promise<string | null> {
  const [userRow] = await db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1);
  if (userRow?.email && isDemoEmail(userRow.email)) {
    ensureDemoAttendanceToday().catch(() => {});
    return DEMO_TENANT_ID;
  }

  const [owned] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.adminUserId, userId))
    .limit(1);
  if (owned) return owned.id;

  const [tutorRow] = await db
    .select({ tenantId: tutors.tenantId })
    .from(tutors)
    .where(eq(tutors.userId, userId))
    .limit(1);
  return tutorRow?.tenantId ?? null;
}
