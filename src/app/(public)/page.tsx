import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import SaasLanding from "@/views/SaasLanding";
import { getFeaturedTenants } from "@/lib/tenants";
import { TenantCard } from "@/components/marketplace/TenantCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://majiku.web.id";

export const metadata: Metadata = {
  title: "MAJIKU — Solusi Manajemen Daycare, Preschool, Bimbel & Marketplace Lembaga",
  description:
    "Platform all-in-one manajemen daycare, PAUD, preschool, dan bimbingan belajar. Dilengkapi direktori dan marketplace lembaga terverifikasi di seluruh Indonesia.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MAJIKU — Solusi Manajemen Daycare, Preschool, Bimbel & Marketplace Lembaga",
    description:
      "Platform all-in-one manajemen daycare, PAUD, preschool, dan bimbingan belajar. Dilengkapi direktori dan marketplace lembaga terverifikasi di seluruh Indonesia.",
    url: siteUrl,
    type: "website",
    siteName: "MAJIKU",
  },
  twitter: {
    card: "summary_large_image",
    title: "MAJIKU — Solusi Manajemen Daycare, Preschool, Bimbel & Marketplace Lembaga",
    description:
      "Platform all-in-one manajemen daycare, PAUD, preschool, dan bimbingan belajar. Dilengkapi direktori dan marketplace lembaga terverifikasi di seluruh Indonesia.",
  },
};

export default async function Page() {
  const featuredTenants = await getFeaturedTenants(6);

  const featuredSection = (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Lembaga Pilihan
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Daycare & Bimbel Pilihan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Temukan rekomendasi daycare, preschool, dan bimbingan belajar terbaik dan terverifikasi untuk buah hati Anda.
          </p>
        </div>

        {featuredTenants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTenants.map((tenant) => (
              <div key={tenant.id}>
                {"\n"}
                <TenantCard tenant={tenant} />
                {"\n"}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-card border border-border">
            <p className="text-muted-foreground mb-4">
              Belum ada lembaga pilihan yang ditampilkan.
            </p>
            <Link href="/marketplace">
              <Button variant="outline">Jelajahi Direktori Marketplace</Button>
            </Link>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/marketplace">
            <Button variant="outline" size="lg" className="gap-2">
              Jelajahi Semua Lembaga
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );

  return (
    <SaasLanding
      featuredTenants={featuredTenants}
      featuredSection={featuredSection}
    />
  );
}
