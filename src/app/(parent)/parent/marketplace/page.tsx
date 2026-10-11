import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ParentMarketplacePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  return (
    <MarketplaceContent
      searchParams={sp}
      action="/parent/marketplace"
      portalNav={true}
    />
  );
}
