import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  Search, MapPin, Star, Filter, Heart, MessageCircle,
  Phone, Clock, Users, ChevronLeft, X, Send, Image as ImageIcon,
  Navigation, DollarSign, Calendar, CheckCircle2, ArrowLeft,
  GraduationCap, Baby, Sparkles, Shield, Home, Compass, User,
  ChevronDown, SlidersHorizontal, Cake, Music, Palette, BookOpen,
  Target, RotateCcw
} from "lucide-react";

interface Daycare {
  id: string;
  name: string;
  slug: string;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  distance: number;
  address: string;
  priceRange: string;
  priceMin: number;
  priceMax: number;
  ageRange: string;
  ageMin: number;
  ageMax: number;
  programs: string[];
  facilities: string[];
  openHours: string;
  description: string;
  featured: boolean;
  verified: boolean;
  responseTime: string;
  category: string;
  languages: string[];
}

interface ChatMessage {
  id: string;
  sender: "user" | "daycare";
  message: string;
  time: string;
}

const categories = [
  { id: "daycare", label: "Daycare", icon: Baby },
  { id: "playgroup", label: "Playgroup", icon: Users },
  { id: "birthday", label: "Ulang Tahun", icon: Cake },
  { id: "music", label: "Musik", icon: Music },
  { id: "art", label: "Seni", icon: Palette },
  { id: "tutoring", label: "Bimbel", icon: BookOpen },
];

const daycares: Daycare[] = [
  {
    id: "1",
    name: "Bright Kids Daycare",
    slug: "bright-kids",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800",
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
      "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800",
    ],
    rating: 4.8,
    reviewCount: 128,
    distance: 0.8,
    address: "Jl. Sudirman No. 123, Jakarta Selatan",
    priceRange: "Rp 2.5jt - 4jt/bulan",
    priceMin: 2500000,
    priceMax: 4000000,
    ageRange: "1-6 tahun",
    ageMin: 1,
    ageMax: 6,
    programs: ["Montessori", "Full Day", "Half Day", "After School"],
    facilities: ["AC", "CCTV", "Playground", "Kolam Renang", "Kantin"],
    openHours: "07:00 - 18:00",
    description: "Bright Kids adalah daycare premium dengan kurikulum Montessori yang berfokus pada perkembangan holistik anak.",
    featured: true,
    verified: true,
    responseTime: "< 1 jam",
    category: "daycare",
    languages: ["Indonesia", "English"],
  },
  {
    id: "2",
    name: "Little Stars Academy",
    slug: "little-stars",
    image: "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800",
    images: [
      "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    ],
    rating: 4.6,
    reviewCount: 89,
    distance: 1.2,
    address: "Jl. Kemang Raya No. 45, Jakarta Selatan",
    priceRange: "Rp 1.8jt - 3jt/bulan",
    priceMin: 1800000,
    priceMax: 3000000,
    ageRange: "2-6 tahun",
    ageMin: 2,
    ageMax: 6,
    programs: ["Playgroup", "Full Day", "Half Day"],
    facilities: ["AC", "CCTV", "Playground", "Perpustakaan"],
    openHours: "07:30 - 17:00",
    description: "Little Stars Academy menyediakan lingkungan belajar yang menyenangkan dengan pendekatan bermain sambil belajar.",
    featured: false,
    verified: true,
    responseTime: "< 2 jam",
    category: "playgroup",
    languages: ["Indonesia"],
  },
  {
    id: "3",
    name: "Happy Garden Daycare",
    slug: "happy-garden",
    image: "https://images.unsplash.com/photo-1564429238535-45095e0c8f7a?w=800",
    images: [
      "https://images.unsplash.com/photo-1564429238535-45095e0c8f7a?w=800",
    ],
    rating: 4.9,
    reviewCount: 156,
    distance: 1.5,
    address: "Jl. Pondok Indah No. 78, Jakarta Selatan",
    priceRange: "Rp 3jt - 5jt/bulan",
    priceMin: 3000000,
    priceMax: 5000000,
    ageRange: "0-6 tahun",
    ageMin: 0,
    ageMax: 6,
    programs: ["Baby Care", "Toddler", "Montessori", "Full Day"],
    facilities: ["AC", "CCTV", "Playground", "Kolam Renang", "Gym", "Music Room"],
    openHours: "06:30 - 19:00",
    description: "Happy Garden adalah daycare premium dengan fasilitas terlengkap. Menerima bayi mulai 3 bulan.",
    featured: true,
    verified: true,
    responseTime: "< 30 menit",
    category: "daycare",
    languages: ["Indonesia", "English", "Mandarin"],
  },
  {
    id: "4",
    name: "Ceria Kids Center",
    slug: "ceria-kids",
    image: "https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=800",
    images: [
      "https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=800",
    ],
    rating: 4.4,
    reviewCount: 67,
    distance: 2.1,
    address: "Jl. Fatmawati No. 32, Jakarta Selatan",
    priceRange: "Rp 1.5jt - 2.5jt/bulan",
    priceMin: 1500000,
    priceMax: 2500000,
    ageRange: "2-6 tahun",
    ageMin: 2,
    ageMax: 6,
    programs: ["Playgroup", "Half Day", "Full Day"],
    facilities: ["AC", "CCTV", "Playground"],
    openHours: "07:00 - 17:00",
    description: "Ceria Kids Center menyediakan daycare dengan harga terjangkau namun tetap berkualitas.",
    featured: false,
    verified: false,
    responseTime: "< 3 jam",
    category: "daycare",
    languages: ["Indonesia"],
  },
  {
    id: "5",
    name: "Rainbow Learning Center",
    slug: "rainbow-learning",
    image: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800",
    images: [
      "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800",
    ],
    rating: 4.7,
    reviewCount: 112,
    distance: 0.5,
    address: "Jl. Tendean No. 56, Jakarta Selatan",
    priceRange: "Rp 2jt - 3.5jt/bulan",
    priceMin: 2000000,
    priceMax: 3500000,
    ageRange: "1-6 tahun",
    ageMin: 1,
    ageMax: 6,
    programs: ["Toddler", "Playgroup", "Montessori", "Full Day"],
    facilities: ["AC", "CCTV", "Playground", "Art Room", "Music Room"],
    openHours: "07:00 - 18:00",
    description: "Rainbow Learning Center fokus pada pengembangan kreativitas dan bakat anak melalui berbagai kegiatan seni.",
    featured: true,
    verified: true,
    responseTime: "< 1 jam",
    category: "art",
    languages: ["Indonesia", "English"],
  },
];

export default function DaycareMarketplace() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDaycare, setSelectedDaycare] = useState<Daycare | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDaycare, setChatDaycare] = useState<Daycare | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "daycare", message: "Halo! Ada yang bisa kami bantu?", time: "10:00" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Filter states
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState([10]);
  const [priceRange, setPriceRange] = useState([0, 6000000]);
  const [ageRange, setAgeRange] = useState([0, 12]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  
  // Registration form states
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    parentName: "",
    childName: "",
    childAge: "",
    phone: "",
    email: "",
    program: "",
    startDate: "",
    notes: "",
  });

  // Filter sections open state
  const [openSections, setOpenSections] = useState<string[]>(["sort"]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const resetFilters = () => {
    setSortBy("relevance");
    setSelectedCategory(null);
    setMaxDistance([10]);
    setPriceRange([0, 6000000]);
    setAgeRange([0, 12]);
    setSelectedLanguages([]);
    setMinRating(0);
  };

  const filteredDaycares = daycares
    .filter((d) => {
      const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDistance = d.distance <= maxDistance[0];
      const matchPrice = d.priceMin >= priceRange[0] && d.priceMax <= priceRange[1];
      const matchCategory = !selectedCategory || d.category === selectedCategory;
      const matchAge = d.ageMin <= ageRange[1] && d.ageMax >= ageRange[0];
      const matchLanguage = selectedLanguages.length === 0 || 
        selectedLanguages.some(lang => d.languages.includes(lang));
      const matchRating = d.rating >= minRating;
      return matchSearch && matchDistance && matchPrice && matchCategory && matchAge && matchLanguage && matchRating;
    })
    .sort((a, b) => {
      if (sortBy === "distance") return a.distance - b.distance;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_low") return a.priceMin - b.priceMin;
      if (sortBy === "price_high") return b.priceMin - a.priceMin;
      return 0;
    });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
    toast({
      title: favorites.includes(id) ? "Dihapus dari favorit" : "Ditambahkan ke favorit",
    });
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const openChat = (daycare: Daycare) => {
    setChatDaycare(daycare);
    setChatOpen(true);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", message: newMessage, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setNewMessage("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "daycare", message: "Terima kasih sudah menghubungi kami! Tim kami akan segera membalas pesan Anda.", time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) },
      ]);
    }, 1000);
  };

  const handleRegistration = (daycare: Daycare) => {
    setSelectedDaycare(daycare);
    setRegistrationOpen(true);
  };

  const submitRegistration = () => {
    if (!registrationForm.parentName || !registrationForm.childName || !registrationForm.phone) {
      toast({
        title: "Form belum lengkap",
        description: "Mohon isi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Pendaftaran berhasil dikirim!",
      description: `Tim ${selectedDaycare?.name} akan menghubungi Anda dalam 1x24 jam.`,
    });
    setRegistrationOpen(false);
    setRegistrationForm({
      parentName: "",
      childName: "",
      childAge: "",
      phone: "",
      email: "",
      program: "",
      startDate: "",
      notes: "",
    });
  };

  const activeFiltersCount = [
    selectedCategory,
    maxDistance[0] < 10,
    priceRange[0] > 0 || priceRange[1] < 6000000,
    ageRange[0] > 0 || ageRange[1] < 12,
    selectedLanguages.length > 0,
    minRating > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-primary mb-3">Beranda</h1>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari Aktivitas"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 bg-background"
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 p-3 border rounded-lg bg-background mb-3">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate">122 Jalan Pondok Jati Raya-Bintaro...</span>
          </div>

          {/* Category Icons */}
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`flex flex-col items-center gap-1 flex-shrink-0 ${
                  selectedCategory === cat.id ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                  selectedCategory === cat.id 
                    ? "border-primary bg-primary/10" 
                    : "border-muted bg-muted/50"
                }`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-center w-16 truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-6">
        {/* Penawaran Section */}
        {filteredDaycares.some((d) => d.featured) && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">Penawaran untuk Anda</h2>
              <Button variant="link" className="text-primary p-0 h-auto">
                Lihat semua
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {filteredDaycares
                .filter((d) => d.featured)
                .map((daycare) => (
                  <Card
                    key={daycare.id}
                    className="flex-shrink-0 w-[260px] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedDaycare(daycare)}
                  >
                    <div className="relative">
                      <img
                        src={daycare.image}
                        alt={daycare.name}
                        className="w-full h-32 object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(daycare.id);
                        }}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.includes(daycare.id)
                              ? "fill-red-500 text-red-500"
                              : ""
                          }`}
                        />
                        <span className="text-[10px] ml-1">{favorites.includes(daycare.id) ? 1 : 0}</span>
                      </Button>
                      <Badge className="absolute top-2 left-2 bg-pink-500 text-white gap-1">
                        <Sparkles className="w-3 h-3" />
                        -10%
                      </Badge>
                      <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {daycare.priceRange.split(" - ")[0]}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs text-primary font-medium truncate">{daycare.name}</p>
                      <h3 className="font-semibold text-sm truncate mb-1">{daycare.programs[0]}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {daycare.address.split(",")[0]} ({daycare.distance}km)
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium">{daycare.rating}</span>
                          <span className="text-xs text-muted-foreground">({daycare.reviewCount})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                        <Baby className="w-3 h-3" />
                        <span className="text-xs">{daycare.ageRange}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Terdekat Section */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Terdekat</h2>
            <Button variant="link" className="text-primary p-0 h-auto">
              Lihat semua
            </Button>
          </div>
          <div className="space-y-3">
            {filteredDaycares.slice(0, 5).map((daycare) => (
              <Card
                key={daycare.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedDaycare(daycare)}
              >
                <div className="relative">
                  <img
                    src={daycare.image}
                    alt={daycare.name}
                    className="w-full h-40 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(daycare.id);
                    }}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(daycare.id)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                    <span className="text-[10px] ml-1">{favorites.includes(daycare.id) ? 1 : 0}</span>
                  </Button>
                  <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {daycare.priceRange.split(" - ")[0]}
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-primary font-medium">{daycare.name}</p>
                      <h3 className="font-semibold text-sm truncate">{daycare.programs[0]}</h3>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-sm">{daycare.rating}</span>
                      <span className="text-xs text-muted-foreground">({daycare.reviewCount})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {daycare.address.split(",")[0]} ({daycare.distance}km)
                    </p>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Baby className="w-3 h-3" />
                      <span className="text-xs">{daycare.ageRange}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <button className="flex flex-col items-center gap-1 p-2 text-primary">
            <Home className="h-6 w-6" />
            <span className="text-xs">Beranda</span>
          </button>
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground relative">
                <Compass className="h-6 w-6" />
                <span className="text-xs">Mengeksplorasi</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
              <SheetHeader className="flex-row items-center justify-between py-2 border-b">
                <Button variant="ghost" size="icon" onClick={() => setFilterOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
                <SheetTitle>Sortir & Filter</SheetTitle>
                <Button variant="link" className="text-primary p-0" onClick={resetFilters}>
                  Atur Ulang
                </Button>
              </SheetHeader>
              <div className="flex h-[calc(100%-120px)]">
                {/* Left sidebar - Filter categories */}
                <div className="w-1/3 border-r overflow-y-auto">
                  <button
                    className={`w-full text-left p-3 border-l-4 ${openSections.includes("sort") ? "border-primary bg-primary/5" : "border-transparent"}`}
                    onClick={() => toggleSection("sort")}
                  >
                    <p className="font-medium text-sm">Urutkan</p>
                    <p className="text-xs text-primary">
                      {sortBy === "relevance" ? "Relevansi" : 
                       sortBy === "distance" ? "Terdekat" :
                       sortBy === "rating" ? "Rating" :
                       sortBy === "price_low" ? "Harga ↑" : "Harga ↓"}
                    </p>
                  </button>
                  <button
                    className={`w-full text-left p-3 border-l-4 ${openSections.includes("category") ? "border-primary bg-primary/5" : "border-transparent"}`}
                    onClick={() => toggleSection("category")}
                  >
                    <p className="font-medium text-sm">Kategori</p>
                    <p className="text-xs text-primary">{selectedCategory || "Semua"}</p>
                  </button>
                  <button
                    className={`w-full text-left p-3 border-l-4 ${openSections.includes("distance") ? "border-primary bg-primary/5" : "border-transparent"}`}
                    onClick={() => toggleSection("distance")}
                  >
                    <p className="font-medium text-sm">Jarak (Terdekat)</p>
                    <p className="text-xs text-primary">{maxDistance[0] < 10 ? `Maks ${maxDistance[0]} km` : "Semua"}</p>
                  </button>
                  <button
                    className={`w-full text-left p-3 border-l-4 ${openSections.includes("age") ? "border-primary bg-primary/5" : "border-transparent"}`}
                    onClick={() => toggleSection("age")}
                  >
                    <p className="font-medium text-sm">Rentang Usia</p>
                    <p className="text-xs text-primary">{ageRange[0]}-{ageRange[1]} tahun</p>
                  </button>
                  <button
                    className={`w-full text-left p-3 border-l-4 ${openSections.includes("price") ? "border-primary bg-primary/5" : "border-transparent"}`}
                    onClick={() => toggleSection("price")}
                  >
                    <p className="font-medium text-sm">Kisaran Harga</p>
                    <p className="text-xs text-primary">
                      {priceRange[0] > 0 || priceRange[1] < 6000000 
                        ? `${(priceRange[0]/1000000).toFixed(1)}-${(priceRange[1]/1000000).toFixed(1)} jt`
                        : "Semua"}
                    </p>
                  </button>
                  <button
                    className={`w-full text-left p-3 border-l-4 ${openSections.includes("language") ? "border-primary bg-primary/5" : "border-transparent"}`}
                    onClick={() => toggleSection("language")}
                  >
                    <p className="font-medium text-sm">Bahasa</p>
                    <p className="text-xs text-primary">{selectedLanguages.length > 0 ? selectedLanguages.join(", ") : "Semua"}</p>
                  </button>
                  <button
                    className={`w-full text-left p-3 border-l-4 ${openSections.includes("rating") ? "border-primary bg-primary/5" : "border-transparent"}`}
                    onClick={() => toggleSection("rating")}
                  >
                    <p className="font-medium text-sm">Peringkat</p>
                    <p className="text-xs text-primary">{minRating > 0 ? `Min ${minRating}★` : "Semua"}</p>
                  </button>
                </div>

                {/* Right content - Filter options */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {openSections.includes("sort") && (
                    <div className="space-y-3">
                      <p className="font-medium text-muted-foreground mb-2">Urutkan</p>
                      <RadioGroup value={sortBy} onValueChange={setSortBy}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="relevance" id="relevance" />
                          <Label htmlFor="relevance">Relevansi</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="distance" id="distance" />
                          <Label htmlFor="distance">Jarak (Terdekat)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rating" id="rating" />
                          <Label htmlFor="rating">Rating Ulasan (Tinggi ke Rendah)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="price_low" id="price_low" />
                          <Label htmlFor="price_low">Harga (Rendah ke Tinggi)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="price_high" id="price_high" />
                          <Label htmlFor="price_high">Harga (Tinggi ke Rendah)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {openSections.includes("category") && (
                    <div className="space-y-3">
                      <p className="font-medium text-muted-foreground mb-2">Kategori</p>
                      <div className="space-y-2">
                        {categories.map((cat) => (
                          <div key={cat.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={cat.id} 
                              checked={selectedCategory === cat.id}
                              onCheckedChange={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                            />
                            <Label htmlFor={cat.id}>{cat.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {openSections.includes("distance") && (
                    <div className="space-y-3">
                      <p className="font-medium text-muted-foreground mb-2">Jarak Maksimum: {maxDistance[0]} km</p>
                      <Slider
                        value={maxDistance}
                        onValueChange={setMaxDistance}
                        max={10}
                        min={1}
                        step={0.5}
                      />
                    </div>
                  )}

                  {openSections.includes("age") && (
                    <div className="space-y-3">
                      <p className="font-medium text-muted-foreground mb-2">Rentang Usia: {ageRange[0]} - {ageRange[1]} tahun</p>
                      <Slider
                        value={ageRange}
                        onValueChange={setAgeRange}
                        max={12}
                        min={0}
                        step={1}
                      />
                    </div>
                  )}

                  {openSections.includes("price") && (
                    <div className="space-y-3">
                      <p className="font-medium text-muted-foreground mb-2">
                        Harga: Rp {(priceRange[0] / 1000000).toFixed(1)}jt - Rp {(priceRange[1] / 1000000).toFixed(1)}jt
                      </p>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={6000000}
                        min={0}
                        step={500000}
                      />
                    </div>
                  )}

                  {openSections.includes("language") && (
                    <div className="space-y-3">
                      <p className="font-medium text-muted-foreground mb-2">Bahasa</p>
                      <div className="space-y-2">
                        {["Indonesia", "English", "Mandarin"].map((lang) => (
                          <div key={lang} className="flex items-center space-x-2">
                            <Checkbox 
                              id={lang} 
                              checked={selectedLanguages.includes(lang)}
                              onCheckedChange={() => toggleLanguage(lang)}
                            />
                            <Label htmlFor={lang}>{lang}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {openSections.includes("rating") && (
                    <div className="space-y-3">
                      <p className="font-medium text-muted-foreground mb-2">Peringkat Minimum</p>
                      <RadioGroup value={minRating.toString()} onValueChange={(v) => setMinRating(parseFloat(v))}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0" id="r0" />
                          <Label htmlFor="r0">Semua</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4" id="r4" />
                          <Label htmlFor="r4">4+ ⭐</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4.5" id="r45" />
                          <Label htmlFor="r45">4.5+ ⭐</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              </div>

              {/* Apply button */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
                <Button className="w-full" size="lg" onClick={() => setFilterOpen(false)}>
                  Menunjukkan {filteredDaycares.length} Hasil
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/parent" className="flex flex-col items-center gap-1 p-2">
            <div className="w-12 h-12 -mt-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Baby className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xs text-primary font-medium">Anak Saya</span>
          </Link>
          <Link to="/parent/chat" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs">Pesan</span>
          </Link>
          <Link to="/parent/profile" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <User className="h-6 w-6" />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </nav>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDaycare && !registrationOpen} onOpenChange={() => setSelectedDaycare(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0">
          {selectedDaycare && (
            <>
              <div className="relative">
                <img
                  src={selectedDaycare.image}
                  alt={selectedDaycare.name}
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
                  onClick={() => setSelectedDaycare(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                  onClick={() => toggleFavorite(selectedDaycare.id)}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favorites.includes(selectedDaycare.id)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                </Button>
                {selectedDaycare.verified && (
                  <Badge className="absolute bottom-2 left-2 bg-primary text-primary-foreground gap-1">
                    <Shield className="w-3 h-3" />
                    Terverifikasi
                  </Badge>
                )}
              </div>

              <ScrollArea className="max-h-[calc(90vh-200px)]">
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <h2 className="text-xl font-bold">{selectedDaycare.name}</h2>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{selectedDaycare.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({selectedDaycare.reviewCount})
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {selectedDaycare.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Harga</p>
                      <p className="font-semibold text-sm">{selectedDaycare.priceRange}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Usia</p>
                      <p className="font-semibold text-sm">{selectedDaycare.ageRange}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Jam Operasi</p>
                      <p className="font-semibold text-sm">{selectedDaycare.openHours}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Response Time</p>
                      <p className="font-semibold text-sm">{selectedDaycare.responseTime}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Deskripsi</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedDaycare.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Program</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDaycare.programs.map((program, idx) => (
                        <Badge key={idx} variant="secondary">
                          {program}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Fasilitas</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDaycare.facilities.map((facility, idx) => (
                        <Badge key={idx} variant="outline">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Bahasa</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDaycare.languages.map((lang, idx) => (
                        <Badge key={idx} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    setSelectedDaycare(null);
                    openChat(selectedDaycare);
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => handleRegistration(selectedDaycare)}
                >
                  <Calendar className="w-4 h-4" />
                  Daftar Sekarang
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Registration Dialog - Full Screen */}
      <Dialog open={registrationOpen} onOpenChange={setRegistrationOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-lg h-[90vh] max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-4 border-b shrink-0">
            <DialogTitle>Formulir Pendaftaran</DialogTitle>
          </DialogHeader>
          {selectedDaycare && (
            <ScrollArea className="flex-1">
              <div className="p-4 pb-8 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <img 
                    src={selectedDaycare.image} 
                    alt={selectedDaycare.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold">{selectedDaycare.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedDaycare.address.split(",")[0]}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="parentName">Nama Orang Tua *</Label>
                    <Input
                      id="parentName"
                      placeholder="Masukkan nama lengkap"
                      value={registrationForm.parentName}
                      onChange={(e) => setRegistrationForm({...registrationForm, parentName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="childName">Nama Anak *</Label>
                    <Input
                      id="childName"
                      placeholder="Masukkan nama anak"
                      value={registrationForm.childName}
                      onChange={(e) => setRegistrationForm({...registrationForm, childName: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="childAge">Usia Anak</Label>
                      <Select 
                        value={registrationForm.childAge}
                        onValueChange={(v) => setRegistrationForm({...registrationForm, childAge: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih usia" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(7)].map((_, i) => (
                            <SelectItem key={i} value={i.toString()}>{i} tahun</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gender">Jenis Kelamin</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Laki-laki</SelectItem>
                          <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">No. WhatsApp *</Label>
                    <div className="flex gap-2">
                      <Select defaultValue="+62">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+62">+62</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        placeholder="8123456789"
                        value={registrationForm.phone}
                        onChange={(e) => setRegistrationForm({...registrationForm, phone: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={registrationForm.email}
                      onChange={(e) => setRegistrationForm({...registrationForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="program">Pilih Program</Label>
                    <Select 
                      value={registrationForm.program}
                      onValueChange={(v) => setRegistrationForm({...registrationForm, program: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih program" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDaycare.programs.map((program) => (
                          <SelectItem key={program} value={program}>{program}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Rencana Mulai</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={registrationForm.startDate}
                      onChange={(e) => setRegistrationForm({...registrationForm, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="allergy">Alergi (jika ada)</Label>
                    <Input
                      id="allergy"
                      placeholder="Contoh: Kacang, susu, udang"
                    />
                  </div>
                  <div>
                    <Label htmlFor="healthNotes">Catatan Kesehatan</Label>
                    <Textarea
                      id="healthNotes"
                      placeholder="Informasi kesehatan penting yang perlu diketahui..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Catatan Tambahan</Label>
                    <Textarea
                      id="notes"
                      placeholder="Informasi tambahan tentang anak Anda..."
                      value={registrationForm.notes}
                      onChange={(e) => setRegistrationForm({...registrationForm, notes: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <div className="p-4 border-t shrink-0 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setRegistrationOpen(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <Button className="flex-1" onClick={submitRegistration}>
              Lanjut
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-md max-h-[90vh] p-0 gap-0 flex flex-col">
          {chatDaycare && (
            <>
              <DialogHeader className="p-4 border-b flex-row items-center gap-3">
                <Avatar>
                  <AvatarImage src={chatDaycare.image} />
                  <AvatarFallback>{chatDaycare.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <DialogTitle className="text-base">{chatDaycare.name}</DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Biasanya membalas {chatDaycare.responseTime}
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <Phone className="w-4 h-4" />
                </Button>
              </DialogHeader>

              <ScrollArea className="flex-1 p-4 min-h-[300px]">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Ketik pesan..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
