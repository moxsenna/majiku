"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  ArrowRight,
  Instagram,
  Facebook,
  MessageCircle,
  GraduationCap,
  Baby,
  Heart,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Play,
  Quote,
  Send,
  Menu,
  AlertCircle,
  FileText,
  Sparkles,
  Shield,
  Zap,
  Target,
  Camera,
  Check,
  BookMarked,
  Music,
  Palette,
  Globe,
  Brain,
  Dumbbell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

// Demo vendor data
const vendorData = {
  bimbel: {
    name: "Bimbel Ganesha Prestasi",
    tagline: "Raih Prestasi Gemilang Bersama Kami",
    type: "Bimbel",
    description: "Lembaga bimbingan belajar terpercaya dengan metode pembelajaran inovatif dan pengajar berpengalaman untuk membantu siswa meraih prestasi akademik terbaik.",
    heroImage: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200",
    stats: {
      students: "2,500+",
      teachers: "85",
      years: "15",
      graduates: "10,000+"
    },
    gallery: [
      { src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600", caption: "Ruang Kelas Nyaman" },
      { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600", caption: "Pembelajaran Interaktif" },
      { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600", caption: "Try Out Rutin" },
      { src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600", caption: "Wisuda Alumni" },
      { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600", caption: "Konsultasi Belajar" },
      { src: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600", caption: "Belajar Kelompok" },
    ],
    curriculum: [
      { title: "Kurikulum Nasional", desc: "Sesuai standar Kemendikbud terbaru", icon: BookOpen },
      { title: "Materi Olimpiade", desc: "Persiapan OSN tingkat nasional", icon: Award },
      { title: "UTBK & SNBT", desc: "Latihan soal dan strategi lolos PTN", icon: Target },
      { title: "English Program", desc: "Kelas bahasa Inggris intensif", icon: Globe },
    ],
    accreditations: [
      "Terakreditasi Kemendikbud RI",
      "Mitra Resmi Kurikulum Merdeka",
      "Sertifikasi ISO 9001:2015",
      "Member HIPKI (Himpunan Penyelenggara Kursus Indonesia)"
    ],
    programs: [
      { name: "SD Kelas 1-6", description: "Pemantapan dasar matematika, bahasa, dan IPA", price: "Rp 450.000/bulan", icon: BookOpen },
      { name: "SMP Kelas 7-9", description: "Persiapan UN dan masuk SMA favorit", price: "Rp 550.000/bulan", icon: GraduationCap },
      { name: "SMA Kelas 10-12", description: "Persiapan UTBK dan PTN", price: "Rp 750.000/bulan", icon: Award },
      { name: "Kelas Olimpiade", description: "Persiapan OSN tingkat nasional", price: "Rp 1.200.000/bulan", icon: Star },
    ],
    features: [
      { title: "Pengajar Profesional", desc: "Lulusan PTN ternama", icon: GraduationCap },
      { title: "Kelas Kecil", desc: "Maksimal 10 siswa per kelas", icon: Users },
      { title: "Try Out Rutin", desc: "Evaluasi bulanan", icon: Target },
      { title: "Kurikulum Terbaru", desc: "Selalu update", icon: BookOpen },
      { title: "Laporan Mingguan", desc: "Pantau perkembangan anak", icon: FileText },
      { title: "Konsultasi Gratis", desc: "Dengan guru ahli", icon: MessageCircle },
    ],
    testimonials: [
      { name: "Budi Santoso", role: "Orang tua siswa", text: "Anak saya berhasil masuk SMA favorit berkat bimbingan intensif dari Ganesha Prestasi.", rating: 5 },
      { name: "Siti Aminah", role: "Alumni 2023", text: "Metode belajarnya sangat efektif. Saya berhasil lolos UTBK dan diterima di UI!", rating: 5 },
      { name: "Ahmad Fauzi", role: "Orang tua siswa", text: "Guru-gurunya sabar dan profesional. Recommended banget!", rating: 5 },
    ],
    products: [
      { name: "Paket Buku Latihan SD", price: "Rp 150.000", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300" },
      { name: "Paket Buku Latihan SMP", price: "Rp 200.000", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300" },
      { name: "Video Pembelajaran Online", price: "Rp 350.000/tahun", image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=300" },
    ],
    contact: {
      phone: "021-12345678",
      whatsapp: "08123456789",
      email: "info@ganeshaprestasi.com",
      address: "Jl. Pendidikan No. 123, Jakarta Selatan",
      hours: "Senin - Sabtu, 08:00 - 20:00"
    },
    socials: {
      instagram: "@ganeshaprestasi",
      facebook: "Ganesha Prestasi Official"
    }
  },
  daycare: {
    name: "Daycare Sunshine Kids",
    tagline: "Tempat Tumbuh Kembang Anak yang Penuh Kasih",
    type: "Daycare",
    description: "Daycare profesional dengan lingkungan yang aman, nyaman, dan stimulatif untuk mendukung tumbuh kembang optimal si kecil.",
    heroImage: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1200",
    stats: {
      students: "120",
      teachers: "25",
      years: "8",
      graduates: "500+"
    },
    gallery: [
      { src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600", caption: "Bermain Bersama" },
      { src: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=600", caption: "Aktivitas Seni" },
      { src: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600", caption: "Ruang Tidur Nyaman" },
      { src: "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=600", caption: "Bermain Outdoor" },
      { src: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=600", caption: "Makan Bersama" },
      { src: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600", caption: "Kegiatan Musik" },
    ],
    curriculum: [
      { title: "Stimulasi Motorik", desc: "Latihan motorik halus & kasar", icon: Dumbbell },
      { title: "Seni & Kreativitas", desc: "Menggambar, mewarnai, crafts", icon: Palette },
      { title: "Musik & Gerak", desc: "Bernyanyi dan menari bersama", icon: Music },
      { title: "Pengembangan Bahasa", desc: "Storytelling & vocabulary", icon: BookMarked },
      { title: "Kognitif Dasar", desc: "Angka, warna, bentuk", icon: Brain },
      { title: "Social Skills", desc: "Bermain & berbagi bersama", icon: Heart },
    ],
    accreditations: [
      "Izin Resmi Dinas Pendidikan",
      "Standar Kesehatan Kemenkes",
      "Sertifikasi Keamanan CCTV 24 Jam",
      "Staff Bersertifikat PAUD Nasional"
    ],
    programs: [
      { name: "Baby Care (0-1 tahun)", description: "Perawatan bayi dengan stimulasi motorik", price: "Rp 2.500.000/bulan", icon: Baby },
      { name: "Toddler (1-2 tahun)", description: "Eksplorasi dan pengembangan bahasa", price: "Rp 2.200.000/bulan", icon: Heart },
      { name: "Playgroup (2-4 tahun)", description: "Persiapan sosial dan akademik dasar", price: "Rp 1.800.000/bulan", icon: Users },
      { name: "Afterschool Care", description: "Penitipan sepulang sekolah", price: "Rp 1.500.000/bulan", icon: Clock },
    ],
    features: [
      { title: "Pengasuh Bersertifikat", desc: "Terlatih dan berpengalaman", icon: Award },
      { title: "CCTV 24 Jam", desc: "Pantau dari mana saja", icon: Shield },
      { title: "Menu Bergizi", desc: "Makanan sehat seimbang", icon: Heart },
      { title: "Ruangan Steril", desc: "Ber-AC dan bersih", icon: Sparkles },
      { title: "Laporan Harian", desc: "Via aplikasi real-time", icon: FileText },
      { title: "Konsultasi Psikolog", desc: "Gratis untuk orang tua", icon: MessageCircle },
    ],
    testimonials: [
      { name: "Maya Dewi", role: "Orang tua", text: "Anak saya betah banget di Sunshine Kids. Pengasuhnya sangat sabar dan penuh kasih.", rating: 5 },
      { name: "Rini Susanti", role: "Orang tua", text: "CCTV yang bisa dipantau dari HP bikin saya tenang kerja. Recommended!", rating: 5 },
      { name: "Andi Pratama", role: "Orang tua", text: "Fasilitas lengkap dan bersih. Anak saya jadi lebih mandiri sejak di sini.", rating: 5 },
    ],
    products: [
      { name: "Seragam Sunshine Kids", price: "Rp 250.000/set", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300" },
      { name: "Tas & Perlengkapan", price: "Rp 150.000", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300" },
      { name: "Paket Foto Tahunan", price: "Rp 350.000", image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=300" },
    ],
    contact: {
      phone: "021-87654321",
      whatsapp: "08198765432",
      email: "hello@sunshinekids.id",
      address: "Jl. Bunga Mawar No. 45, BSD City, Tangerang",
      hours: "Senin - Jumat, 07:00 - 18:00"
    },
    socials: {
      instagram: "@sunshinekids.id",
      facebook: "Sunshine Kids Daycare"
    }
  }
};

export default function VendorSite() {
  const { type = "bimbel" } = useParams<{ type: string }>();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    message: "",
    childName: "",
    childAge: "",
    hasSpecialNeeds: false,
    specialNeeds: ""
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  const vendor = vendorData[type as keyof typeof vendorData] || vendorData.bimbel;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Pesan Terkirim!",
      description: "Tim kami akan segera menghubungi Anda.",
    });
    setFormData({ name: "", phone: "", message: "", childName: "", childAge: "", hasSpecialNeeds: false, specialNeeds: "" });
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${vendor.contact.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const nextGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev + 1) % vendor.gallery.length);
  };

  const prevGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev - 1 + vendor.gallery.length) % vendor.gallery.length);
  };

  const navLinks = [
    { href: "#programs", label: "Program" },
    { href: "#gallery", label: "Galeri" },
    { href: "#curriculum", label: "Kurikulum" },
    { href: "#features", label: "Keunggulan" },
    { href: "#testimonials", label: "Testimoni" },
    { href: "#contact", label: "Kontak" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                {vendor.type === "Daycare" ? (
                  <Baby className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                ) : (
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                )}
              </div>
              <div className="hidden xs:block">
                <span className="font-bold text-sm sm:text-base lg:text-lg line-clamp-1">{vendor.name}</span>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{vendor.type} Terpercaya</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.href} 
                  href={link.href} 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                onClick={handleWhatsApp} 
                className="gradient-primary shadow-lg hover:shadow-xl transition-all hover:scale-105 h-8 sm:h-9 md:h-10 px-3 sm:px-4 text-xs sm:text-sm"
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Hubungi</span>
                <span className="sm:hidden">Chat</span>
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="xl:hidden">
                  <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 sm:h-10 sm:w-10">
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 sm:p-6 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center">
                          {vendor.type === "Daycare" ? (
                            <Baby className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          ) : (
                            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm sm:text-base">{vendor.name}</p>
                          <p className="text-xs text-muted-foreground">{vendor.type}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                      <div className="space-y-1">
                        {navLinks.map((link) => (
                          <a 
                            key={link.href} 
                            href={link.href} 
                            className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <ChevronRight className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm sm:text-base">{link.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 border-t border-border">
                      <Button onClick={handleWhatsApp} className="w-full gradient-primary h-11 sm:h-12">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Hubungi via WhatsApp
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="relative min-h-[100svh] flex items-center pt-14 sm:pt-16 md:pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={vendor.heroImage} 
            alt={vendor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/70" />
          <div className="absolute top-1/4 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        </div>
        
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-primary">{vendor.type} Terpercaya Sejak {vendor.stats.years} Tahun</span>
              </div>
              
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gradient">{vendor.tagline.split(' ').slice(0, 2).join(' ')}</span>
                <br />
                <span className="text-foreground">{vendor.tagline.split(' ').slice(2).join(' ')}</span>
              </h1>
              
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                {vendor.description}
              </p>
              
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={handleWhatsApp} 
                  className="gradient-primary shadow-lg hover:shadow-xl transition-all hover:scale-105 h-11 sm:h-12 md:h-14 px-6 sm:px-8 text-sm sm:text-base md:text-lg"
                >
                  Daftar Sekarang
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-11 sm:h-12 md:h-14 px-6 sm:px-8 text-sm sm:text-base md:text-lg border-2 hover:bg-muted"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Lihat Video
                </Button>
              </div>

              {/* Trust Badges - Mobile */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-2">
                {vendor.accreditations.slice(0, 2).map((acc, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-muted/50 rounded-full text-[10px] sm:text-xs">
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-muted-foreground line-clamp-1">{acc}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              {[
                { value: vendor.stats.students, label: "Siswa Aktif", icon: Users },
                { value: vendor.stats.teachers, label: "Pengajar", icon: GraduationCap },
                { value: vendor.stats.years, label: "Tahun", icon: Calendar },
                { value: vendor.stats.graduates, label: "Alumni", icon: Award },
              ].map((stat, i) => (
                <Card 
                  key={i} 
                  className="group bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll indicator - Hidden on very small screens */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 animate-bounce hidden sm:flex">
          <span className="text-[10px] sm:text-xs text-muted-foreground">Scroll untuk lihat lebih</span>
          <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5 sm:p-2">
            <div className="w-1 h-2 sm:w-1.5 sm:h-3 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </section>

      {/* Trust & Accreditation Banner */}
      <section className="py-6 sm:py-8 md:py-10 bg-muted/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-xs sm:text-sm font-medium">Legalitas Terjamin</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border" />
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-6">
              {vendor.accreditations.map((acc, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs md:text-sm text-foreground">{acc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section - Mobile Optimized */}
      <section id="gallery" className="py-12 sm:py-16 md:py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="gradient-primary text-white border-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm mb-3 sm:mb-4">
              <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Galeri Kegiatan
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Lihat <span className="text-gradient">Aktivitas Kami</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Dokumentasi kegiatan belajar dan bermain bersama siswa kami
            </p>
          </div>
          
          {/* Mobile Carousel */}
          <div className="relative mb-6 sm:mb-8">
            <div className="overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl">
              <div className="relative aspect-[4/3] sm:aspect-video">
                <img 
                  src={vendor.gallery[currentGalleryIndex].src} 
                  alt={vendor.gallery[currentGalleryIndex].caption}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                  <p className="text-white font-semibold text-sm sm:text-lg md:text-xl">{vendor.gallery[currentGalleryIndex].caption}</p>
                  <p className="text-white/70 text-xs sm:text-sm">{currentGalleryIndex + 1} / {vendor.gallery.length}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button 
              onClick={prevGalleryImage}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-foreground" />
            </button>
            <button 
              onClick={nextGalleryImage}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-foreground" />
            </button>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {vendor.gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentGalleryIndex(i)}
                className={`relative aspect-square rounded-lg sm:rounded-xl overflow-hidden transition-all ${
                  currentGalleryIndex === i 
                    ? 'ring-2 sm:ring-3 ring-primary shadow-lg scale-105' 
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={img.src} 
                  alt={img.caption}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section - Mobile Optimized */}
      <section id="curriculum" className="py-12 sm:py-16 md:py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="gradient-primary text-white border-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm mb-3 sm:mb-4">
              <BookMarked className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Kurikulum Kami
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Kurikulum <span className="text-gradient">Berkualitas</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Dirancang oleh ahli pendidikan untuk perkembangan optimal anak Anda
            </p>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {vendor.curriculum.map((item, i) => (
              <Card 
                key={i} 
                className="group relative overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 gradient-primary opacity-5 blur-2xl group-hover:opacity-10 transition-opacity" />
                <CardContent className="p-4 sm:p-5 md:p-6 flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base md:text-lg text-foreground mb-1">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section - Mobile Optimized */}
      <section id="programs" className="py-12 sm:py-16 md:py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="gradient-primary text-white border-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm mb-3 sm:mb-4">
              Program Unggulan
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Pilih Program <span className="text-gradient">Terbaik</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Berbagai program yang dirancang khusus untuk memenuhi kebutuhan belajar setiap anak
            </p>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {vendor.programs.map((program, i) => (
              <Card 
                key={i} 
                className="group relative overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 gradient-primary opacity-5 blur-2xl group-hover:opacity-10 transition-opacity" />
                <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <program.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg md:text-xl">{program.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{program.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Mulai dari</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{program.price}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 group-hover:gradient-primary group-hover:text-white transition-all"
                    >
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Optimized */}
      <section id="features" className="py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Badge className="gradient-primary text-white border-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm mb-3 sm:mb-4">
                Mengapa Memilih Kami?
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Keunggulan <span className="text-gradient">Kami</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 md:mb-10">
                Kami berkomitmen memberikan layanan terbaik dengan standar kualitas tinggi untuk setiap anak didik kami.
              </p>
              
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                {vendor.features.map((feature, i) => (
                  <div 
                    key={i} 
                    className="group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-xs sm:text-sm md:text-base mb-0.5">{feature.title}</h4>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 gradient-primary rounded-2xl sm:rounded-3xl rotate-3 opacity-20 blur-xl" />
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={vendor.type === "Daycare" 
                    ? "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600"
                    : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600"
                  }
                  alt="Features"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card/90 backdrop-blur-sm border border-border/50">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm md:text-base">Terbukti Berkualitas</p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{vendor.stats.graduates} alumni sukses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Mobile Optimized */}
      <section id="testimonials" className="py-12 sm:py-16 md:py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="gradient-primary text-white border-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm mb-3 sm:mb-4">
              Testimoni
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Apa Kata <span className="text-gradient">Mereka?</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Dengarkan pengalaman dari orang tua dan alumni kami
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {vendor.testimonials.map((testimonial, i) => (
              <Card 
                key={i} 
                className="group relative overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-full h-1 gradient-primary" />
                <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6">
                  <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-primary/20 mb-3 sm:mb-4" />
                  <p className="text-foreground mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm md:text-base">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-primary/20">
                      <AvatarFallback className="gradient-primary text-white font-semibold text-xs sm:text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground text-xs sm:text-sm md:text-base">{testimonial.name}</p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 mt-3 sm:mt-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section - Mobile Optimized */}
      <section id="products" className="py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="gradient-primary text-white border-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm mb-3 sm:mb-4">
              Produk & Merchandise
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Produk <span className="text-gradient">Pendukung</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Lengkapi kebutuhan belajar dengan produk berkualitas dari kami
            </p>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {vendor.products.map((product, i) => (
              <Card key={i} className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{product.price}</p>
                    <Button size="sm" className="gradient-primary hover:opacity-90 text-xs sm:text-sm h-8 sm:h-9">
                      Beli
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Mobile Optimized */}
      <section id="contact" className="py-12 sm:py-16 md:py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            <div>
              <Badge className="gradient-primary text-white border-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm mb-3 sm:mb-4">
                Hubungi Kami
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Ada <span className="text-gradient">Pertanyaan?</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 md:mb-10">
                Tim kami siap membantu Anda. Hubungi kami atau isi form untuk informasi lebih lanjut.
              </p>
              
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {[
                  { icon: Phone, label: "Telepon", value: vendor.contact.phone },
                  { icon: MessageCircle, label: "WhatsApp", value: vendor.contact.whatsapp },
                  { icon: Mail, label: "Email", value: vendor.contact.email },
                  { icon: MapPin, label: "Alamat", value: vendor.contact.address },
                  { icon: Clock, label: "Jam Operasional", value: vendor.contact.hours },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-xs sm:text-sm md:text-base truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Social Media */}
              <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                <a href="#" className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </a>
              </div>
            </div>
            
            {/* Contact Form */}
            <Card className="border-border/50 shadow-2xl">
              <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">Form Pendaftaran</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Isi form di bawah dan kami akan segera menghubungi Anda</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="name" className="text-xs sm:text-sm">Nama Orang Tua *</Label>
                      <Input 
                        id="name"
                        placeholder="Nama lengkap"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="phone" className="text-xs sm:text-sm">No. WhatsApp *</Label>
                      <Input 
                        id="phone"
                        placeholder="08xxxxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                        className="h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Child Information for Daycare */}
                  {vendor.type === "Daycare" && (
                    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <Label className="font-semibold text-xs sm:text-sm">Informasi Anak</Label>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="child-name" className="text-xs sm:text-sm">Nama Anak</Label>
                          <Input
                            id="child-name"
                            placeholder="Nama anak"
                            value={formData.childName}
                            onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                            className="h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl text-sm"
                          />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="child-age" className="text-xs sm:text-sm">Usia Anak</Label>
                          <Select
                            value={formData.childAge}
                            onValueChange={(value) => setFormData({ ...formData, childAge: value })}
                          >
                            <SelectTrigger className="h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl text-sm">
                              <SelectValue placeholder="Pilih usia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-1">0-1 tahun</SelectItem>
                              <SelectItem value="1-2">1-2 tahun</SelectItem>
                              <SelectItem value="2-3">2-3 tahun</SelectItem>
                              <SelectItem value="3-4">3-4 tahun</SelectItem>
                              <SelectItem value="4-5">4-5 tahun</SelectItem>
                              <SelectItem value="5-6">5-6 tahun</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <Checkbox
                          id="has-special-needs"
                          checked={formData.hasSpecialNeeds}
                          onCheckedChange={(checked) => setFormData({ ...formData, hasSpecialNeeds: checked as boolean })}
                        />
                        <label htmlFor="has-special-needs" className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight cursor-pointer">
                          Anak memiliki kebutuhan khusus / catatan penting
                        </label>
                      </div>

                      {formData.hasSpecialNeeds && (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                            <Label htmlFor="special-needs" className="text-xs sm:text-sm">Catatan Khusus</Label>
                          </div>
                          <Textarea
                            id="special-needs"
                            placeholder="Contoh: Speech Delay, ASD, ADHD, alergi makanan, dll."
                            value={formData.specialNeeds}
                            onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                            rows={3}
                            className="rounded-lg sm:rounded-xl text-xs sm:text-sm"
                          />
                          <div className="flex items-start gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400">
                              Informasi ini akan dijaga kerahasiaannya dan membantu kami memberikan penanganan yang tepat.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="message" className="text-xs sm:text-sm">Pesan / Pertanyaan</Label>
                    <Textarea 
                      id="message"
                      placeholder="Tulis pesan atau pertanyaan Anda..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={3}
                      className="rounded-lg sm:rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 sm:h-12 md:h-14 gradient-primary text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl transition-all">
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Kirim Pendaftaran
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white/5 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 border border-white/20 mb-4 sm:mb-6">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            <span className="text-xs sm:text-sm font-medium text-white">Promo Spesial Bulan Ini</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Siap Bergabung Bersama Kami?
          </h2>
          <p className="text-white/80 mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Daftarkan anak Anda sekarang dan dapatkan potongan khusus untuk pendaftaran bulan ini!
          </p>
          <div className="flex flex-col xs:flex-row justify-center gap-3 sm:gap-4">
            <Button 
              size="lg" 
              onClick={handleWhatsApp} 
              className="bg-white text-primary hover:bg-white/90 h-11 sm:h-12 md:h-14 px-6 sm:px-8 text-sm sm:text-base md:text-lg shadow-xl"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Chat WhatsApp
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 h-11 sm:h-12 md:h-14 px-6 sm:px-8 text-sm sm:text-base md:text-lg"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Telepon
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="py-8 sm:py-10 md:py-12 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center">
                {vendor.type === "Daycare" ? (
                  <Baby className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </div>
              <div>
                <span className="font-bold text-sm sm:text-base md:text-lg block">{vendor.name}</span>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{vendor.tagline}</p>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground text-center md:text-right">
              © 2024 {vendor.name}. Powered by <Link href="/saas" className="text-primary font-semibold hover:underline">MAJIKU</Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button - Mobile Optimized */}
      <button 
        onClick={handleWhatsApp}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-green-500 text-white shadow-2xl hover:bg-green-600 hover:scale-110 transition-all flex items-center justify-center z-50 group"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 text-white text-[10px] sm:text-xs flex items-center justify-center animate-pulse">1</span>
      </button>
    </div>
  );
}
