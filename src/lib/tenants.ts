import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";

export interface TenantFilters {
  type?: "daycare" | "preschool" | "bimbel";
  city?: string;
  q?: string;
}

export async function listActiveTenants(filters: TenantFilters = {}) {
  const conds: SQL[] = [eq(tenants.isActive, true)];
  if (filters.type) conds.push(eq(tenants.type, filters.type));
  if (filters.city) conds.push(ilike(tenants.city, filters.city));
  if (filters.q)
    conds.push(
      or(ilike(tenants.name, `%${filters.q}%`), ilike(tenants.description, `%${filters.q}%`))!
    );
  return db.select().from(tenants).where(and(...conds)).orderBy(desc(tenants.isVerified), tenants.name);
}

export async function getTenantBySlug(slug: string) {
  const rows = await db.select().from(tenants).where(and(eq(tenants.slug, slug), eq(tenants.isActive, true))).limit(1);
  return rows[0] ?? null;
}

export async function getAllTenantSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: tenants.slug }).from(tenants).where(eq(tenants.isActive, true));
  return rows.map((r) => r.slug);
}

export async function getFeaturedTenants(limit = 6) {
  return db.select().from(tenants).where(eq(tenants.isActive, true)).orderBy(desc(tenants.isVerified), tenants.name).limit(limit);
}
