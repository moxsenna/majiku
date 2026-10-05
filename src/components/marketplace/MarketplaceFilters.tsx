import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface MarketplaceFiltersProps {
  current?: {
    type?: string;
    city?: string;
    q?: string;
  };
  action?: string;
}

export function MarketplaceFilters({
  current,
  action = "/marketplace",
}: MarketplaceFiltersProps) {
  const hasActiveFilters = Boolean(current?.type || current?.city || current?.q);

  return (
    <form
      action={action}
      method="get"
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          name="q"
          defaultValue={current?.q ?? ""}
          placeholder="Cari nama..."
          className="pl-9"
        />
      </div>
      <div className="w-full sm:w-48">
        <Input
          type="text"
          name="city"
          defaultValue={current?.city ?? ""}
          placeholder="Kota"
        />
      </div>
      <div className="w-full sm:w-44">
        <select
          name="type"
          defaultValue={current?.type ?? ""}
          aria-label="Filter berdasarkan tipe"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Semua</option>
          <option value="daycare">Daycare</option>
          <option value="preschool">Preschool</option>
          <option value="bimbel">Bimbel</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit">Filter</Button>
        {hasActiveFilters && (
          <a
            href={action}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Reset
          </a>
        )}
      </div>
    </form>
  );
}
