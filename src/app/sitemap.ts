import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllTenantSlugs } from "@/lib/tenants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllTenantSlugs();
  const staticRoutes = ["", "/marketplace", "/auth/login", "/auth/register"].map((p) => ({
    url: `${siteConfig.url}${p}`,
    lastModified: new Date(),
  }));
  const tenantRoutes = slugs.map((slug) => ({
    url: `${siteConfig.url}/marketplace/${slug}`,
    lastModified: new Date(),
  }));
  return [...staticRoutes, ...tenantRoutes];
}
