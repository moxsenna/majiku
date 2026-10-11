import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { db } from "@/db";
import { tenants, tutors, userRoles, type TenantRow } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { isDemoEmail } from "@/lib/demo";
import type { AppRole } from "@/server/actions/roles";

export type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

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
 * Akun demo (@majiku.test / demo@majiku.id / demo+) -> tenant operasional pertama
 * (data mock disajikan di lapisan view, sama seperti perilaku existing).
 * Superadmin murni (tanpa kepemilikan tenant) ditolak di sini — gunakan portal vendor.
 */
export async function requireTenantContext(): Promise<TenantContext> {
  const session = await requireRoles("admin");
  const email = session.user.email;

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
 * admin lembaga -> tenants.admin_user_id; tutor -> tutors.tenant_id via user.
 * Dipakai action tutor (absensi, izin/cuti) yang bukan konteks admin.
 */
export async function resolveTenantIdForUser(userId: string): Promise<string | null> {
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
