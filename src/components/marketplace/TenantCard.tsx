import Link from "next/link";
import { tenants } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export interface TenantCardProps {
  tenant: typeof tenants.$inferSelect;
}

export function TenantCard({ tenant }: TenantCardProps) {
  const summary =
    tenant.tagline ||
    (tenant.description
      ? tenant.description.length > 120
        ? `${tenant.description.slice(0, 117)}...`
        : tenant.description
      : "");

  const numericPrice = Number(tenant.priceFrom);
  const formattedPrice = Number.isFinite(numericPrice)
    ? Intl.NumberFormat("id-ID").format(numericPrice)
    : tenant.priceFrom;

  return (
    <Link href={`/marketplace/${tenant.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col justify-between border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group-hover:border-primary/40">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-medium capitalize">
              {tenant.type}
            </Badge>
            {tenant.isVerified && (
              <Badge variant="success" className="font-medium">
                Terverifikasi ✓
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
            {tenant.name}
          </CardTitle>
          {summary && (
            <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
              {summary}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{tenant.city}</span>
          </div>
          <div className="border-t pt-3 text-sm">
            <span className="text-xs text-muted-foreground">Mulai dari </span>
            <span className="font-semibold text-foreground">
              Rp {formattedPrice}
            </span>
            <span className="text-xs text-muted-foreground">/bulan</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
