import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/vendor", "/tutor", "/parent", "/students", "/attendance", "/billing", "/crm", "/messages", "/settings", "/gallery", "/schedule", "/classes", "/tutors", "/tutor-payout", "/birthdays", "/lesson-plans", "/daily-reports"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
