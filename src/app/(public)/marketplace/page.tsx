import type { Metadata } from "next";
import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";

export const metadata: Metadata = {
  title: "Marketplace Daycare, Preschool & Bimbel Terverifikasi",
  description: "Temukan dan bandingkan daycare, preschool, dan bimbel terverifikasi di seluruh Indonesia.",
  alternates: {
    canonical: "/marketplace",
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
