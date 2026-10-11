"use client";

import { useState } from "react";
import Link from "next/link";
import { tenants } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Building2, ExternalLink } from "lucide-react";

export interface TenantCardProps {
  tenant: typeof tenants.$inferSelect;
  enablePortalDialog?: boolean;
}

export function TenantCard({
  tenant,
  enablePortalDialog = false,
}: TenantCardProps) {
  const [open, setOpen] = useState(false);

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

  const targetHref = `/marketplace/${tenant.slug}`;

  const cardBody = (
    <Card className="flex h-full flex-col justify-between border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group-hover:border-primary/40 text-left">
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
  );

  if (enablePortalDialog) {
    return (
      <>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className="group block h-full cursor-pointer focus:outline-none"
        >
          {cardBody}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="capitalize text-xs">
                  {tenant.type}
                </Badge>
                {tenant.isVerified && (
                  <Badge variant="success" className="text-xs">
                    Terverifikasi ✓
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> {tenant.name}
              </DialogTitle>
              {tenant.tagline && (
                <DialogDescription className="text-xs text-muted-foreground">
                  {tenant.tagline}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-3 text-sm pt-2">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1.5">
                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{tenant.address ? `${tenant.address}, ${tenant.city}` : tenant.city}</span>
                </div>
                {tenant.whatsapp && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>WhatsApp: {tenant.whatsapp}</span>
                  </div>
                )}
              </div>

              {tenant.description && (
                <div>
                  <h4 className="font-medium text-xs text-muted-foreground mb-1">Tentang Cabang</h4>
                  <p className="text-xs leading-relaxed text-foreground">{tenant.description}</p>
                </div>
              )}

              <div className="p-3 border rounded-lg flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Biaya bulanan mulai</span>
                <span className="font-bold text-primary text-base">Rp {formattedPrice}</span>
              </div>

              <div className="space-y-2 pt-2">
                <Link href="/parent/registration" className="block w-full" onClick={() => setOpen(false)}>
                  <Button className="w-full">
                    Daftar Program / Trial
                  </Button>
                </Link>
                <div className="flex items-center justify-between pt-1">
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs">
                    Tutup
                  </Button>
                  <a
                    href={`/marketplace/${tenant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    Buka Halaman Publik <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Link href={targetHref} className="group block h-full">
      {cardBody}
    </Link>
  );
}
