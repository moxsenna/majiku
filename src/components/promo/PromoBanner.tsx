import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ShoppingBag, Sparkles, Percent, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromoItem {
  id: string;
  type: "internal" | "partner";
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  discount?: string;
  accentColor: string;
}

const promoItems: PromoItem[] = [
  {
    id: "1",
    type: "internal",
    title: "Diskon Pendaftaran",
    subtitle: "Daftar semester 2 & hemat 20%",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400",
    ctaText: "Daftar",
    ctaLink: "/parent/registration",
    badge: "Promo",
    discount: "20%",
    accentColor: "from-rose-500 to-orange-500",
  },
  {
    id: "2",
    type: "partner",
    title: "Buku Edukasi",
    subtitle: "Gratis ongkir semua buku!",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    ctaText: "Lihat",
    ctaLink: "/parent/catalog",
    badge: "Partner",
    accentColor: "from-blue-500 to-cyan-500",
  },
  {
    id: "3",
    type: "partner",
    title: "Snack Sehat",
    subtitle: "Camilan organik untuk bekal",
    image: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400",
    ctaText: "Pesan",
    ctaLink: "/parent/catalog",
    badge: "Healthy",
    accentColor: "from-emerald-500 to-teal-500",
  },
  {
    id: "4",
    type: "internal",
    title: "Family Day",
    subtitle: "Event seru bersama keluarga",
    image: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400",
    ctaText: "Daftar",
    ctaLink: "/parent/catalog",
    badge: "Event",
    accentColor: "from-violet-500 to-purple-500",
  },
];

interface PromoBannerProps {
  variant?: "slider" | "carousel" | "single";
}

export function PromoBanner({ variant = "slider" }: PromoBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll for carousel
  useEffect(() => {
    if (variant === "carousel") {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % promoItems.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [variant]);

  // Slider variant - horizontal scroll
  if (variant === "slider") {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Promo & Penawaran
          </h3>
          <Link href="/parent/catalog">
            <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2">
              Lihat Semua
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Horizontal Scroll */}
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {promoItems.map((promo) => (
            <Link 
              key={promo.id} 
              href={promo.ctaLink}
              className="snap-start flex-shrink-0 w-[280px] first:ml-0"
            >
              <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] h-full">
                <CardContent className="p-0">
                  <div className="relative h-32">
                    {/* Background Image */}
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-85",
                      promo.accentColor
                    )} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      {/* Top - Badges */}
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white/90 text-foreground text-[10px] font-semibold h-5 px-2 shadow-sm">
                          {promo.type === "partner" ? (
                            <ShoppingBag className="w-3 h-3 mr-1" />
                          ) : (
                            <Sparkles className="w-3 h-3 mr-1" />
                          )}
                          {promo.badge}
                        </Badge>
                        {promo.discount && (
                          <Badge className="bg-red-500 text-white text-[10px] font-bold h-5 px-2">
                            <Percent className="w-3 h-3 mr-1" />
                            {promo.discount}
                          </Badge>
                        )}
                      </div>

                      {/* Bottom - Title & CTA */}
                      <div>
                        <h4 className="font-bold text-white text-base leading-tight mb-0.5">
                          {promo.title}
                        </h4>
                        <p className="text-white/90 text-xs mb-2 line-clamp-1">
                          {promo.subtitle}
                        </p>
                        <Button 
                          size="sm" 
                          className="h-7 px-3 text-xs bg-white text-foreground hover:bg-white/90 shadow-md"
                        >
                          {promo.ctaText}
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Scroll Indicator Dots */}
        <div className="flex justify-center gap-1.5">
          {promoItems.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === 0 ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // Carousel variant - auto-rotating
  if (variant === "carousel") {
    const currentPromo = promoItems[currentIndex];
    
    return (
      <div className="space-y-3">
        <Link href="/parent/catalog">
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-40">
                <img
                  src={currentPromo.image}
                  alt={currentPromo.title}
                  className="w-full h-full object-cover transition-opacity"
                />
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r opacity-85",
                  currentPromo.accentColor
                )} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/90 text-foreground text-xs font-semibold">
                      {currentPromo.badge}
                    </Badge>
                    {currentPromo.discount && (
                      <Badge className="bg-red-500 text-white text-xs font-bold">
                        {currentPromo.discount} OFF
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-white mb-1">{currentPromo.title}</h3>
                    <p className="text-sm text-white/90 mb-3">{currentPromo.subtitle}</p>
                    <Button size="sm" className="bg-white text-foreground hover:bg-white/90">
                      {currentPromo.ctaText}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Dots */}
        <div className="flex justify-center gap-1.5">
          {promoItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-2 rounded-full transition-all",
                idx === currentIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // Single variant - compact
  const firstPromo = promoItems[0];
  return (
    <Link href="/parent/catalog">
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all group">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-3">
            <div className={cn("w-1.5 h-14 rounded-full bg-gradient-to-b", firstPromo.accentColor)} />
            <img
              src={firstPromo.image}
              alt={firstPromo.title}
              className="w-12 h-12 rounded-xl object-cover shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  <Sparkles className="w-3 h-3 mr-0.5" />
                  {firstPromo.badge}
                </Badge>
                {firstPromo.discount && (
                  <Badge className="bg-red-500 text-[10px] h-5 px-1.5">
                    {firstPromo.discount}
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold text-sm">{firstPromo.title}</h4>
              <p className="text-[11px] text-muted-foreground truncate">{firstPromo.subtitle}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
