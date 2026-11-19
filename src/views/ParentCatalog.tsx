import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Gift, ShoppingBag, Sparkles } from "lucide-react";

/**
 * Promo & Katalog — versi jujur.
 * Belum ada model data promo/partner; halaman mock dengan link mati dihapus.
 * Konten nyata yang tersedia: marketplace lembaga & pendaftaran program.
 */
export default function ParentCatalog() {
  return (
    <div className="min-h-screen bg-background pb-6">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Link href="/parent">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Promo & Katalog
            </h1>
            <p className="text-xs text-muted-foreground">Belanja kebutuhan si kecil</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <h2 className="font-bold text-foreground">Belum ada promo yang tayang</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Katalog promo lembaga dan produk partner belum tersedia.
            Sementara itu, jelajahi lembaga & program yang ada di marketplace.
          </p>
          <Button asChild>
            <Link href="/parent/marketplace">
              <ShoppingBag className="w-4 h-4 mr-2" aria-hidden />
              Buka Marketplace
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
