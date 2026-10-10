import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, ShoppingBag, Sparkles, ExternalLink, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CatalogItem {
  id: string;
  type: "internal" | "partner";
  category: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  discount?: string;
  accentColor: string;
  price?: string;
}

const catalogItems: CatalogItem[] = [
  {
    id: "1",
    type: "internal",
    category: "Promo",
    title: "Diskon Pendaftaran Semester Baru",
    subtitle: "Daftar semester baru sekarang dan dapatkan diskon spesial 20%! Kuota terbatas untuk pendaftaran bulan ini.",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400",
    ctaText: "Daftar Sekarang",
    ctaLink: "/parent/registration",
    badge: "Promo",
    discount: "20%",
    accentColor: "from-rose-500 to-orange-500",
  },
  {
    id: "2",
    type: "partner",
    category: "Buku",
    title: "Buku Edukasi Anak",
    subtitle: "Koleksi buku cerita dan aktivitas untuk si kecil. Gratis ongkir untuk semua pembelian!",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    ctaText: "Lihat Katalog",
    ctaLink: "#",
    badge: "Partner",
    accentColor: "from-blue-500 to-cyan-500",
    price: "Mulai Rp 45.000",
  },
  {
    id: "3",
    type: "partner",
    category: "Makanan",
    title: "Camilan Sehat Anak",
    subtitle: "Snack organik tanpa MSG & pengawet. Cocok untuk bekal sekolah si kecil!",
    image: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400",
    ctaText: "Pesan Sekarang",
    ctaLink: "#",
    badge: "Healthy",
    accentColor: "from-emerald-500 to-teal-500",
    price: "Mulai Rp 25.000",
  },
  {
    id: "4",
    type: "internal",
    category: "Event",
    title: "Family Day Event",
    subtitle: "Ikuti acara Family Day MAJIKU! Games seru, hadiah menarik, dan keseruan bersama keluarga.",
    image: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400",
    ctaText: "Daftar Event",
    ctaLink: "#",
    badge: "Event",
    accentColor: "from-violet-500 to-purple-500",
  },
  {
    id: "5",
    type: "partner",
    category: "Mainan",
    title: "Mainan Edukasi",
    subtitle: "Puzzle, building blocks, dan mainan edukatif lainnya untuk merangsang kreativitas anak.",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
    ctaText: "Lihat Produk",
    ctaLink: "#",
    badge: "Partner",
    accentColor: "from-amber-500 to-yellow-500",
    price: "Mulai Rp 75.000",
  },
  {
    id: "6",
    type: "partner",
    category: "Perlengkapan",
    title: "Perlengkapan Sekolah",
    subtitle: "Tas, tempat makan, botol minum, dan perlengkapan sekolah lucu untuk si kecil.",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400",
    ctaText: "Belanja",
    ctaLink: "#",
    badge: "Partner",
    accentColor: "from-pink-500 to-rose-500",
    price: "Mulai Rp 50.000",
  },
];

const categories = ["Semua", "Promo", "Buku", "Makanan", "Mainan", "Perlengkapan", "Event"];

export default function ParentCatalog() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items based on category and search
  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      const matchesCategory = activeCategory === "Semua" || item.category === activeCategory;
      const matchesSearch = 
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Get featured promo (first item with Promo category or first item)
  const featuredPromo = catalogItems.find((item) => item.category === "Promo") || catalogItems[0];
  
  // Items for grid (exclude featured if showing all or promo category)
  const gridItems = filteredItems.filter((item) => 
    activeCategory !== "Semua" && activeCategory !== "Promo" 
      ? true 
      : item.id !== featuredPromo.id
  );

  const handleItemClick = (item: CatalogItem) => {
    if (item.ctaLink === "#") {
      toast.info(`${item.title}`, {
        description: "Fitur ini akan segera tersedia. Hubungi admin untuk informasi lebih lanjut.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
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

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari produk atau promo..." 
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0 text-xs h-8"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* Featured Promo - show only when "Semua" or "Promo" */}
        {(activeCategory === "Semua" || activeCategory === "Promo") && !searchQuery && (
          <div className="mb-6">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Promo Unggulan
            </h2>
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="relative h-48">
                  <img
                    src={featuredPromo.image}
                    alt={featuredPromo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-85",
                    featuredPromo.accentColor
                  )} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-white/20 text-white backdrop-blur-sm">
                        {featuredPromo.badge}
                      </Badge>
                      {featuredPromo.discount && (
                        <Badge className="bg-white text-red-500 font-bold">
                          {featuredPromo.discount} OFF
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-white mb-1">{featuredPromo.title}</h3>
                    <p className="text-sm text-white/90 mb-4 line-clamp-2">{featuredPromo.subtitle}</p>
                    {featuredPromo.ctaLink === "#" ? (
                      <Button 
                        size="sm" 
                        className="bg-white text-foreground hover:bg-white/90"
                        onClick={() => handleItemClick(featuredPromo)}
                      >
                        {featuredPromo.ctaText}
                        <ExternalLink className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    ) : (
                      <Link href={featuredPromo.ctaLink}>
                        <Button size="sm" className="bg-white text-foreground hover:bg-white/90">
                          {featuredPromo.ctaText}
                          <ExternalLink className="w-3.5 h-3.5 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Catalog Grid */}
        <div>
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            {activeCategory === "Semua" ? "Semua Produk & Promo" : activeCategory}
            {searchQuery && (
              <span className="text-muted-foreground font-normal">
                ({filteredItems.length} hasil)
              </span>
            )}
          </h2>

          {gridItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => {
                  setActiveCategory("Semua");
                  setSearchQuery("");
                }}
              >
                Lihat semua produk
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {gridItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-0">
                    <div className="relative h-28">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-t opacity-75",
                        item.accentColor
                      )} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <Badge className="bg-white/20 text-white text-[10px] backdrop-blur-sm">
                          {item.badge}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-sm line-clamp-1 mb-1">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{item.subtitle}</p>
                      {item.price && (
                        <p className="text-xs font-semibold text-primary mb-2">{item.price}</p>
                      )}
                      {item.ctaLink === "#" ? (
                        <Button size="sm" variant="outline" className="w-full h-8 text-xs">
                          {item.ctaText}
                        </Button>
                      ) : (
                        <Link href={item.ctaLink} onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" className="w-full h-8 text-xs">
                            {item.ctaText}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
