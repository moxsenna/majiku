import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";

type SearchParams = Promise<{ type?: string; city?: string; q?: string }>;

export default async function ParentMarketplacePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  return <MarketplaceContent searchParams={sp} />;
}
