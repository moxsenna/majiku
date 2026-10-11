"use server";

import { db } from "@/db";
import { tenants } from "@/db/schema";
import { requireSuperadmin } from "@/server/authz";
import { eq, desc } from "drizzle-orm";

export interface VendorTenantRow {
  id: string;
  slug: string;
  name: string;
  type: "daycare" | "preschool" | "bimbel";
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date | null;
}

export async function setTenantActive(tenantId: string, isActive: boolean) {
  await requireSuperadmin();
  const [updated] = await db
    .update(tenants)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId))
    .returning({ id: tenants.id, isActive: tenants.isActive });

  if (!updated) {
    throw new Error(`Tenant dengan ID ${tenantId} tidak ditemukan`);
  }

  return { success: true, tenantId: updated.id, isActive: Boolean(updated.isActive) };
}

export async function toggleTenantVerified(tenantId: string, isVerified: boolean) {
  await requireSuperadmin();
  const [updated] = await db
    .update(tenants)
    .set({
      isVerified,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId))
    .returning({ id: tenants.id, isVerified: tenants.isVerified });

  if (!updated) {
    throw new Error(`Tenant dengan ID ${tenantId} tidak ditemukan`);
  }

  return { success: true, tenantId: updated.id, isVerified: Boolean(updated.isVerified) };
}

export async function listVendorTenants(): Promise<VendorTenantRow[]> {
  await requireSuperadmin();
  const rows = await db
    .select({
      id: tenants.id,
      slug: tenants.slug,
      name: tenants.name,
      type: tenants.type,
      isActive: tenants.isActive,
      isVerified: tenants.isVerified,
      createdAt: tenants.createdAt,
    })
    .from(tenants)
    .orderBy(desc(tenants.createdAt));

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    type: r.type,
    isActive: Boolean(r.isActive),
    isVerified: Boolean(r.isVerified),
    createdAt: r.createdAt,
  }));
}
