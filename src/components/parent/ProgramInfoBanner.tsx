import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  Clock, 
  Users, 
  Calendar,
  Sparkles,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";

// Banner data
const bannerItems = [
  {
    id: "1",
    type: "program",
    title: "Pendaftaran Semester Baru",
    subtitle: "Batch Januari 2025 dibuka!",
    badge: "Baru",
    badgeColor: "bg-primary text-primary-foreground",
    bgColor: "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent",
    icon: Sparkles,
    link: "/parent/registration",
    cta: "Daftar Sekarang"
  },
  {
    id: "2",
    type: "promo",
    title: "Diskon 20% Early Bird",
    subtitle: "Untuk pendaftaran sebelum 15 Jan",
    badge: "Promo",
    badgeColor: "bg-highlight text-highlight-foreground",
    bgColor: "bg-gradient-to-br from-highlight/20 via-highlight/10 to-transparent",
    icon: Star,
    link: "/parent/registration",
    cta: "Lihat Promo"
  },
  {
    id: "3",
    type: "event",
    title: "Open House",
    subtitle: "Sabtu, 11 Januari 2025 - 09:00",
    badge: "Event",
    badgeColor: "bg-info text-info-foreground",
    bgColor: "bg-gradient-to-br from-info/20 via-info/10 to-transparent",
    icon: Calendar,
    link: "/parent/marketplace",
    cta: "Daftar Hadir"
  },
];

// Testimonials
const testimonials = [
  {
    id: "1",
    name: "Ibu Anita",
    child: "Raka, Playgroup",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    text: "Anak saya sangat senang belajar di sini. Guru-gurunya sabar dan penuh perhatian.",
    rating: 5,
  },
  {
    id: "2",
    name: "Bapak Doni",
    child: "Keisha, TK A",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    text: "Perkembangan anak sangat pesat. Sekarang sudah bisa baca dan tulis!",
    rating: 5,
  },
  {
    id: "3",
    name: "Ibu Rina",
    child: "Arjun, Toddler",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    text: "Fasilitas lengkap dan bersih. Sangat recommended untuk daycare.",
    rating: 5,
  },
];

// Class activities
const classActivities = [
  {
    id: "1",
    title: "Playgroup Asyik",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400",
    description: "Belajar sambil bermain bersama teman",
    participants: 18,
  },
  {
    id: "2",
    title: "Seni & Kreasi",
    image: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400",
    description: "Mengembangkan kreativitas anak",
    participants: 15,
  },
  {
    id: "3",
    title: "English Fun",
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400",
    description: "Belajar bahasa Inggris dengan menyenangkan",
    participants: 20,
  },
];

export function ProgramInfoBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerItems.length);
    }, 5000);

    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      clearInterval(bannerTimer);
      clearInterval(testimonialTimer);
    };
  }, []);

  const banner = bannerItems[currentBanner];
  const testimonial = testimonials[currentTestimonial];

  return (
    <div className="space-y-4">
      {/* Main Info Banner */}
      <Card className={`overflow-hidden border-0 ${banner.bgColor}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Badge className={`${banner.badgeColor} mb-2`}>
                {banner.badge}
              </Badge>
              <h3 className="font-bold text-lg text-foreground">{banner.title}</h3>
              <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
              <Link to={banner.link}>
                <Button size="sm" className="mt-3 gap-1">
                  {banner.cta}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-background/50 flex items-center justify-center">
              <banner.icon className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {bannerItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBanner(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentBanner ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Activities Carousel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">Kegiatan Kelas Lain</h3>
          <Link to="/parent/marketplace" className="text-sm text-primary font-medium">
            Lihat Semua
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {classActivities.map((activity) => (
            <Card key={activity.id} className="flex-shrink-0 w-40 overflow-hidden">
              <div className="relative">
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-24 object-cover"
                />
                <Badge className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {activity.participants}
                </Badge>
              </div>
              <CardContent className="p-2">
                <p className="font-semibold text-sm truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
