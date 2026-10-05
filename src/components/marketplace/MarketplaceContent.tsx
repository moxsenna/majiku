import { listActiveTenants, type TenantFilters } from "@/lib/tenants";
import { TenantCard } from "@/components/marketplace/TenantCard";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";

export interface MarketplaceContentProps {
  searchParams?: {
    type?: string | string[];
    city?: string | string[];
    q?: string | string[];
    [key: string]: string | string[] | undefined;
  };
  action?: string;
}

const cleanString = (val?: string | string[]) =>
  typeof val === "string" ? val.trim() || undefined : undefined;

export async function MarketplaceContent({
  searchParams,
  action = "/marketplace",
}: MarketplaceContentProps) {
  const sp = searchParams ?? {};
  const city = cleanString(sp.city);
  const q = cleanString(sp.q);
  const type =
    typeof sp.type === "string" &&
    (sp.type === "daycare" || sp.type === "preschool" || sp.type === "bimbel")
      ? sp.type
      : undefined;

  const filters: TenantFilters = {
    type,
    city,
    q,
  };

  const tenantList = await listActiveTenants(filters);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Marketplace Daycare &amp; Bimbel</h1>
      <p className="mt-2 text-muted-foreground">
        {tenantList.length} pusat pembelajaran ditemukan
      </p>
      <MarketplaceFilters current={{ type, city, q }} action={action} />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tenantList.map((t) => (
          <TenantCard key={t.id} tenant={t} />
        ))}
      </div>
      {tenantList.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">
          Tidak ada hasil. Coba ubah filter.
        </p>
      )}
    </main>
  );
}
