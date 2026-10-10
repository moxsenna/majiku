import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, Building2, Search, ArrowRight } from "lucide-react";
import { listActiveTenants } from "@/lib/tenants";
import { siteConfig } from "@/lib/site";
import { TenantCard } from "@/components/marketplace/TenantCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SiteTypePageProps {
  params: Promise<{ type: string }>;
}

type MappedType = "daycare" | "preschool" | "bimbel";

interface TypeConfig {
  mappedType: MappedType;
  title: string;
  metaTitle: string;
  metaDescription: string;
  badge: string;
  h1: string;
  intro: string;
}

const TYPE_CONFIGS: Record<string, TypeConfig> = {
  daycare: {
    mappedType: "daycare",
    title: "Daycare di Indonesia — Temukan TPA Terverifikasi",
    metaTitle: "Daycare di Indonesia — Temukan TPA Terverifikasi | MAJIKU",
    metaDescription:
      "Temukan TPA & daycare terverifikasi di Indonesia untuk perawatan, penitipan, dan tumbuh kembang anak terbaik dengan fasilitas lengkap dan pengasuh berpengalaman.",
    badge: "Daycare & TPA Terverifikasi",
    h1: "Temukan TPA & Daycare Terverifikasi di Indonesia",
    intro:
      "Temukan TPA & daycare terverifikasi di Indonesia dengan fasilitas lengkap, pengasuh profesional bersertifikasi, dan pengawasan terpercaya demi kenyamanan serta tumbuh kembang optimal si kecil.",
  },
  preschool: {
    mappedType: "preschool",
    title: "Preschool & TK — Temukan PAUD & TK Terverifikasi",
    metaTitle: "Preschool & TK — Temukan PAUD & TK Terverifikasi | MAJIKU",
    metaDescription:
      "Daftar preschool, PAUD, dan taman kanak-kanak terpercaya di Indonesia dengan kurikulum berkualitas dan lingkungan stimulasi usia dini.",
    badge: "Preschool & TK",
    h1: "Pilihan Preschool & TK / PAUD Terbaik",
    intro:
      "Temukan pilihan PAUD/TK dan preschool terbaik dengan metode pembelajaran interaktif, tenaga pendidik berkompeten, dan fasilitas belajar menyenangkan untuk fondasi masa depan buah hati Anda.",
  },
  tk: {
    mappedType: "preschool",
    title: "Preschool & TK — Temukan PAUD & TK Terverifikasi",
    metaTitle: "Preschool & TK — Temukan PAUD & TK Terverifikasi | MAJIKU",
    metaDescription:
      "Daftar preschool, PAUD, dan taman kanak-kanak terpercaya di Indonesia dengan kurikulum berkualitas dan lingkungan stimulasi usia dini.",
    badge: "TK & PAUD",
    h1: "Pilihan Taman Kanak-Kanak & PAUD Terbaik",
    intro:
      "Temukan pilihan PAUD/TK dan preschool terbaik dengan metode pembelajaran interaktif, tenaga pendidik berpengalaman, dan lingkungan belajar yang menyenangkan.",
  },
  bimbel: {
    mappedType: "bimbel",
    title: "Bimbel & Les Privat — Kursus & Bimbel Terbaik",
    metaTitle: "Bimbel & Les Privat — Kursus & Bimbel Terbaik | MAJIKU",
    metaDescription:
      "Cari bimbingan belajar, les privat, dan kursus terbaik di Indonesia untuk meningkatkan prestasi akademik dan kemampuan anak.",
    badge: "Bimbel & Les Privat",
    h1: "Bimbingan Belajar, Les Privat & Kursus Pilihan",
    intro:
      "Temukan bimbingan belajar, les privat, dan kursus terbaik untuk semua jenjang dengan tutor kompeten, materi terstruktur, dan bimbingan belajar intensif.",
  },
};

export async function generateMetadata({
  params,
}: SiteTypePageProps): Promise<Metadata> {
  const { type } = await params;
  const config = TYPE_CONFIGS[type];

  if (!config) {
    return {
      title: "Halaman Tidak Ditemukan",
      description: "Kategori yang Anda cari tidak ditemukan.",
    };
  }

  const canonicalUrl = `${siteConfig.url}/site/${type}`;

  return {
    title: {
      absolute: config.metaTitle,
    },
    description: config.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function SiteTypePage({ params }: SiteTypePageProps) {
  const { type } = await params;
  const config = TYPE_CONFIGS[type];

  if (!config) {
    notFound();
  }

  const tenantList = await listActiveTenants({ type: config.mappedType });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">MAJIKU</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/marketplace"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Semua Lembaga
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/admin/register">
              <Button size="sm" className="gradient-primary text-primary-foreground">
                Daftar Lembaga
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-foreground transition-colors">
            Direktori
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{config.badge}</span>
        </nav>

        {/* Hero / Intro SEO Block */}
        <div className="space-y-4 max-w-3xl">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            {config.badge}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {config.h1}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {config.intro}
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="text-muted-foreground self-center mr-1">Kategori lain:</span>
            {type !== "daycare" && (
              <Link
                href="/site/daycare"
                className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Daycare
              </Link>
            )}
            {type !== "preschool" && type !== "tk" && (
              <Link
                href="/site/preschool"
                className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Preschool &amp; TK
              </Link>
            )}
            {type !== "bimbel" && (
              <Link
                href="/site/bimbel"
                className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Bimbel &amp; Kursus
              </Link>
            )}
          </div>
        </div>

        {/* Directory Listing Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Daftar {config.badge} ({tenantList.length})
            </h2>
            <Link
              href={`/marketplace?type=${config.mappedType}`}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
              Filter lebih lanjut
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tenantList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenantList.map((tenant) => (
                <TenantCard key={tenant.id} tenant={tenant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl bg-card border border-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Belum Ada Lembaga Terdaftar
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Saat ini belum ada data terverifikasi untuk kategori ini di wilayah Anda. Anda dapat menjelajahi seluruh direktori kami.
              </p>
              <div className="pt-2">
                <Link href="/marketplace">
                  <Button variant="outline">Jelajahi Semua Lembaga di Marketplace</Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Bottom CTA Banner */}
        <section className="rounded-2xl gradient-primary text-primary-foreground p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold">
              Pemilik {config.badge}?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl text-sm">
              Daftarkan lembaga Anda di MAJIKU untuk meningkatkan visibilitas dan mengelola pendaftaran siswa baru secara otomatis.
            </p>
          </div>
          <Link href="/admin/register" className="shrink-0">
            <Button size="lg" variant="secondary" className="font-semibold">
              Daftarkan Sekarang
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">MAJIKU</span>
            <span>— Platform Manajemen Lembaga &amp; Direktori Anak</span>
          </div>
          <p>© {new Date().getFullYear()} MAJIKU. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
