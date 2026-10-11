import type { Metadata } from "next";
import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://majiku.web.id";

export const metadata: Metadata = {
  title: "Marketplace Daycare, Preschool & Bimbel Terverifikasi — MAJIKU",
  description:
    "Temukan dan bandingkan daycare, preschool, dan bimbel terverifikasi di seluruh Indonesia. Terhubung langsung dengan pengelola dan dapatkan informasi program terbaik.",
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    title: "Marketplace Daycare, Preschool & Bimbel Terverifikasi — MAJIKU",
    description:
      "Temukan dan bandingkan daycare, preschool, dan bimbel terverifikasi di seluruh Indonesia. Terhubung langsung dengan pengelola dan dapatkan informasi program terbaik.",
    url: `${siteUrl}/marketplace`,
    type: "website",
    siteName: "MAJIKU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketplace Daycare, Preschool & Bimbel Terverifikasi — MAJIKU",
    description:
      "Temukan dan bandingkan daycare, preschool, dan bimbel terverifikasi di seluruh Indonesia. Terhubung langsung dengan pengelola dan dapatkan informasi program terbaik.",
  },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  return <MarketplaceContent searchParams={sp} />;
}
