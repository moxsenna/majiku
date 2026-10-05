import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, MessageCircle, ArrowLeft } from "lucide-react";
import { getTenantBySlug } from "@/lib/tenants";
import { siteConfig } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgramList } from "@/components/marketplace/ProgramList";

interface TenantPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TenantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);

  if (!tenant) {
    return {
      title: "Tenant Tidak Ditemukan",
      description: "Tenant yang Anda cari tidak ditemukan di MAJIKU.",
    };
  }

  const rawDescription = tenant.tagline ?? tenant.description ?? "";
  const description =
    rawDescription.length > 155
      ? `${rawDescription.slice(0, 152)}...`
      : rawDescription;

  const url = `${siteConfig.url}/marketplace/${slug}`;

  return {
    title: `${tenant.name} — ${tenant.city}`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${tenant.name} — ${tenant.city}`,
      description,
      type: "website",
      url,
      images: tenant.photos && tenant.photos.length > 0 ? tenant.photos : undefined,
    },
  };
}

export default async function TenantDetailPage({ params }: TenantPageProps) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);

  if (!tenant) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tenant.name,
    description: tenant.description ?? tenant.tagline,
    address: {
      "@type": "PostalAddress",
      streetAddress: tenant.address,
      addressLocality: tenant.city,
      addressCountry: "ID",
    },
    url: `${siteConfig.url}/marketplace/${tenant.slug}`,
  };

  const numericPrice = Number(tenant.priceFrom);
  const formattedPrice = Number.isFinite(numericPrice)
    ? Intl.NumberFormat("id-ID").format(numericPrice)
    : tenant.priceFrom;

  const cleanWhatsapp = tenant.whatsapp
    ? tenant.whatsapp.replace(/[^0-9]/g, "")
    : null;
  const waUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
        `Halo ${tenant.name}, saya melihat profil Anda di MAJIKU dan tertarik untuk informasi lebih lanjut.`
      )}`
    : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {"\n"}

      {/* Breadcrumb sederhana */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/marketplace"
          className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Marketplace
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-xs">
          {tenant.name}
        </span>
      </nav>

      {/* Header & Main Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-medium capitalize text-xs">
            {tenant.type}
          </Badge>
          {tenant.isVerified && (
            <Badge variant="success" className="font-medium text-xs">
              Terverifikasi ✓
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {tenant.name}
        </h1>

        {tenant.tagline && (
          <p className="text-lg text-muted-foreground font-medium leading-snug">
            {tenant.tagline}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span>
              {tenant.address ? `${tenant.address}, ` : ""}
              {tenant.city}
            </span>
          </div>
          <div>•</div>
          <div>
            Mulai dari <strong className="text-foreground">Rp {formattedPrice}</strong>/bulan
          </div>
        </div>
      </div>

      {/* Hero photo if available */}
      {tenant.photos && tenant.photos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-muted aspect-video max-h-[380px] w-full">
          <img
            src={tenant.photos[0]}
            alt={tenant.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* CTA WhatsApp */}
      {waUrl && (
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Tertarik dengan {tenant.name}?</h3>
            <p className="text-sm text-muted-foreground">
              Konsultasikan jadwal visit, kuota, atau kurikulum langsung melalui WhatsApp.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold">
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Hubungi via WhatsApp
            </a>
          </Button>
        </div>
      )}

      {/* Section Deskripsi */}
      {tenant.description && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Tentang {tenant.name}
          </h2>
          <Card className="border-border/80 shadow-sm">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {tenant.description}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Program List */}
      <ProgramList tenant={tenant} />
    </main>
  );
}
