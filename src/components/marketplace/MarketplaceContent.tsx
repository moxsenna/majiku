import Link from "next/link";
import {
  ArrowLeft,
  Home,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  portalNav?: boolean;
}

const cleanString = (val?: string | string[]) =>
  typeof val === "string" ? val.trim() || undefined : undefined;

export async function MarketplaceContent({
  searchParams,
  action = "/marketplace",
  portalNav = false,
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
    <div className={portalNav ? "min-h-screen bg-background pb-8" : ""}>
      {portalNav && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center gap-3 px-4 h-14 max-w-6xl mx-auto">
            <Link href="/parent/profile" aria-label="Kembali ke Profil">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h2 className="font-bold text-base">Jelajahi lembaga</h2>
              <p className="text-[11px] text-muted-foreground">Temukan cabang dan program terdekat</p>
            </div>
          </div>
        </header>
      )}

      <main className={`mx-auto max-w-6xl px-4 ${portalNav ? "py-6" : "py-10"}`}>
        <h1 className="text-3xl font-bold tracking-tight">Marketplace Daycare &amp; Bimbel</h1>
        <p className="mt-2 text-muted-foreground">
          {tenantList.length} pusat pembelajaran ditemukan
        </p>
        <MarketplaceFilters current={{ type, city, q }} action={action} />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tenantList.map((t) => (
            <TenantCard
              key={t.id}
              tenant={t}
              enablePortalDialog={portalNav}
            />
          ))}
        </div>
        {tenantList.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">
            Tidak ada hasil. Coba ubah filter.
          </p>
        )}
      </main>

    </div>
  );
}
