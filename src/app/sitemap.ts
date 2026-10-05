import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllTenantSlugs } from "@/lib/tenants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenantRows = await getAllTenantSlugs();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/marketplace",
    "/site/daycare",
    "/site/preschool",
    "/site/bimbel",
  ].map((p) => ({
    url: `${siteConfig.url}${p}`,
  }));
  const tenantRoutes: MetadataRoute.Sitemap = tenantRows.map((row) => ({
    url: `${siteConfig.url}/marketplace/${row.slug}`,
    lastModified: row.updatedAt ?? new Date(),
  }));
  return [...staticRoutes, ...tenantRoutes];
}
