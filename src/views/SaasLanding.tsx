import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  GraduationCap, 
  Users, 
  BarChart3, 
  MessageSquare, 
  CreditCard, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  BookOpen,
  Star,
  ChevronRight,
  Smartphone,
  Monitor,
  Bell,
  ClipboardCheck,
  Calendar,
  Image,
  Play
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Manajemen Siswa",
    description: "Kelola data siswa, orang tua, dan kelas dengan mudah dalam satu dashboard."
  },
  {
    icon: BarChart3,
    title: "Laporan & Analytics",
    description: "Pantau perkembangan siswa dan performa lembaga dengan laporan real-time."
  },
  {
    icon: MessageSquare,
    title: "Komunikasi Orang Tua",
    description: "Kirim update harian, foto kegiatan, dan chat langsung dengan orang tua."
  },
  {
    icon: CreditCard,
    title: "Billing Otomatis",
    description: "Invoice otomatis, reminder pembayaran, dan laporan keuangan lengkap."
  },
  {
    icon: GraduationCap,
    title: "Manajemen Tutor",
    description: "Kelola jadwal, KPI, dan payroll tutor dengan sistem yang terintegrasi."
  },
  {
    icon: Shield,
    title: "Keamanan Data",
    description: "Data terenkripsi dan aman dengan backup otomatis setiap hari."
  }
];

const pricingPlans = [
  {
    name: "Basic",
    price: "299K",
    period: "/bulan",
    description: "Untuk lembaga kecil yang baru mulai",
    features: [
      "Hingga 50 siswa",
      "2 kelas aktif",
      "Laporan dasar",
      "Chat dengan orang tua",
      "Support via email"
    ],
    popular: false,
    cta: "Mulai Gratis"
  },
  {
    name: "Pro",
    price: "599K",
    period: "/bulan",
    description: "Untuk lembaga yang sedang berkembang",
    features: [
      "Hingga 200 siswa",
      "10 kelas aktif",
      "Analytics lengkap",
      "Billing otomatis",
      "Manajemen tutor",
      "Priority support"
    ],
    popular: true,
    cta: "Coba 14 Hari Gratis"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Untuk jaringan lembaga & franchise",
    features: [
      "Unlimited siswa",
      "Multi-cabang",
      "White-label branding",
      "API access",
      "Dedicated support",
      "Custom integrations"
    ],
    popular: false,
    cta: "Hubungi Sales"
  }
];

const testimonials = [
  {
    name: "Ibu Ratna Sari",
    role: "Pemilik TK Ceria Mandiri",
    avatar: "RS",
    content: "MAJIKU membantu kami mengelola 150+ siswa dengan lebih efisien. Orang tua sangat senang dengan update harian!",
    rating: 5
  },
  {
    name: "Pak Hendra",
    role: "Direktur Bimbel Prestasi",
    avatar: "PH",
    content: "Fitur billing otomatis menghemat waktu admin kami hingga 80%. Sangat recommended!",
    rating: 5
  },
  {
    name: "Ibu Dewi Kusuma",
    role: "Kepala Sekolah PAUD Ananda",
    avatar: "DK",
    content: "Dashboard yang intuitif dan laporan yang lengkap. Tim support juga sangat responsif.",
    rating: 5
  }
];

export default function SaasLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">MAJIKU</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Harga</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimoni</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="gradient-primary text-primary-foreground">
                  Daftar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1" />
              Platform #1 untuk Daycare & Bimbel
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Kelola Lembaga Pendidikan Anda dengan{" "}
              <span className="text-gradient">Lebih Mudah</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              MAJIKU adalah platform all-in-one untuk daycare, TK, PAUD, dan lembaga bimbingan belajar. 
              Dari manajemen siswa hingga billing, semua dalam satu tempat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="gradient-primary text-primary-foreground text-lg px-8 h-14">
                  Mulai Gratis 14 Hari
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/vendor">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  Lihat Demo
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Tidak perlu kartu kredit • Setup dalam 5 menit
            </p>
          </div>

          {/* Hero Image/Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { value: "500+", label: "Lembaga Aktif" },
              { value: "25K+", label: "Siswa Terkelola" },
              { value: "98%", label: "Kepuasan User" },
              { value: "24/7", label: "Support" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-card border border-border">
                <p className="text-3xl sm:text-4xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Screenshots Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Play className="w-3 h-3 mr-1" />
              Lihat Demo
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tampilan Aplikasi yang <span className="text-gradient">Mudah Digunakan</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Interface yang intuitif untuk admin, tutor, dan orang tua. Lihat bagaimana MAJIKU mempermudah operasional lembaga Anda.
            </p>
          </div>

          {/* Dashboard Demo */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <Badge className="mb-4 bg-primary/10 text-primary">Dashboard Admin</Badge>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Kelola Semuanya dalam Satu Dashboard
              </h3>
              <p className="text-muted-foreground mb-6">
                Lihat ringkasan lengkap lembaga Anda: kehadiran siswa, tagihan, jadwal, dan notifikasi dalam satu tampilan.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  { icon: ClipboardCheck, text: "Monitoring kehadiran real-time" },
                  { icon: CreditCard, text: "Status billing dan pembayaran" },
                  { icon: Users, text: "Data siswa dan kelas" },
                  { icon: BarChart3, text: "Analytics dan laporan" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/vendor">
                <Button className="gap-2">
                  Lihat Demo Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 gradient-primary opacity-10 blur-3xl rounded-full"></div>
              <Card className="relative overflow-hidden shadow-2xl border-2">
                <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-muted rounded px-3 py-0.5 text-xs text-muted-foreground">
                      majiku.app/dashboard
                    </div>
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
                  alt="Dashboard Preview"
                  className="w-full h-auto"
                />
                {/* Overlay Cards */}
                <div className="absolute top-1/4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border animate-float">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                      <ClipboardCheck className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Kehadiran Hari Ini</p>
                      <p className="text-sm font-bold text-success">156/160 siswa</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-1/4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border animate-float" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-highlight/20 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-highlight" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Pendapatan Bulan Ini</p>
                      <p className="text-sm font-bold text-highlight">Rp 245 juta</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Parent Portal Demo */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative">
              <div className="absolute inset-0 bg-success/10 blur-3xl rounded-full"></div>
              <div className="relative flex justify-center">
                {/* Mobile Phone Frame */}
                <div className="relative w-64 sm:w-72">
                  <div className="bg-foreground rounded-[3rem] p-2 shadow-2xl">
                    <div className="bg-background rounded-[2.5rem] overflow-hidden">
                      {/* Phone Notch */}
                      <div className="bg-foreground h-6 rounded-b-2xl mx-16"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80"
                        alt="Parent App Preview"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  {/* Floating notification */}
                  <div className="absolute -right-8 top-1/3 bg-background rounded-xl p-3 shadow-lg border animate-float">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs font-semibold">Aisyah sudah tiba!</p>
                        <p className="text-[10px] text-muted-foreground">08:15</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Badge className="mb-4 bg-success/10 text-success">Portal Orang Tua</Badge>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Orang Tua Selalu Terhubung
              </h3>
              <p className="text-muted-foreground mb-6">
                Aplikasi mobile untuk orang tua dengan update real-time tentang aktivitas anak, foto kegiatan, dan komunikasi langsung dengan guru.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  { icon: Bell, text: "Notifikasi check-in & check-out" },
                  { icon: Image, text: "Foto & video kegiatan harian" },
                  { icon: MessageSquare, text: "Chat langsung dengan guru" },
                  { icon: CreditCard, text: "Lihat dan bayar tagihan" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/parent">
                <Button variant="outline" className="gap-2">
                  <Smartphone className="h-4 w-4" />
                  Lihat Portal Orang Tua
                </Button>
              </Link>
            </div>
          </div>

          {/* Tutor App Demo */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Badge className="mb-4 bg-info/10 text-info">Aplikasi Tutor</Badge>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Tutor Lebih Produktif
              </h3>
              <p className="text-muted-foreground mb-6">
                Dashboard khusus untuk tutor dengan jadwal mengajar, KPI tracking, dan tools untuk membuat laporan harian dengan mudah.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  { icon: Calendar, text: "Jadwal mengajar otomatis" },
                  { icon: ClipboardCheck, text: "Absensi siswa per kelas" },
                  { icon: BarChart3, text: "KPI dan progress tracking" },
                  { icon: CreditCard, text: "Lihat gaji dan slip" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-info" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/tutor">
                <Button variant="outline" className="gap-2">
                  <Monitor className="h-4 w-4" />
                  Lihat Dashboard Tutor
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-info/10 blur-3xl rounded-full"></div>
              <Card className="relative overflow-hidden shadow-2xl border-2">
                <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-muted rounded px-3 py-0.5 text-xs text-muted-foreground">
                      majiku.app/tutor
                    </div>
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&q=80"
                  alt="Tutor Dashboard Preview"
                  className="w-full h-auto"
                />
                {/* Overlay Cards */}
                <div className="absolute top-1/4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border animate-float">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-info/20 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-info" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Jadwal Hari Ini</p>
                      <p className="text-sm font-bold text-info">4 Kelas</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cocok Untuk Berbagai Lembaga</h2>
            <p className="text-muted-foreground">Satu platform untuk semua kebutuhan pendidikan anak</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-highlight/20 flex items-center justify-center mb-4">
                  <Building2 className="w-7 h-7 text-highlight-foreground" />
                </div>
                <CardTitle className="text-xl">Daycare & TK/PAUD</CardTitle>
                <CardDescription>
                  Kelola kehadiran, laporan harian, foto kegiatan, dan komunikasi dengan orang tua.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Absensi QR Code", "Daily Report dengan foto", "Notifikasi real-time", "Portal khusus orang tua"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-info/20 flex items-center justify-center mb-4">
                  <BookOpen className="w-7 h-7 text-info" />
                </div>
                <CardTitle className="text-xl">Bimbingan Belajar</CardTitle>
                <CardDescription>
                  Kelola jadwal, progress belajar, dan payroll tutor dengan sistem terintegrasi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Manajemen kelas & jadwal", "Tracking progress siswa", "KPI & payroll tutor", "Billing per sesi/paket"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Fitur Lengkap</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Semua yang Anda Butuhkan dalam Satu Platform
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Fitur komprehensif untuk mengelola lembaga pendidikan Anda dengan lebih efisien
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Harga Transparan</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pilih Paket Sesuai Kebutuhan Anda
            </h2>
            <p className="text-muted-foreground">
              Mulai gratis, upgrade kapan saja
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <Card 
                key={i} 
                className={`relative ${plan.popular ? 'border-primary border-2 shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground">
                    Paling Populer
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Rp {plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register">
                    <Button 
                      className={`w-full ${plan.popular ? 'gradient-primary text-primary-foreground' : ''}`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Testimoni</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Dipercaya oleh Ratusan Lembaga
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="bg-card">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array(testimonial.rating).fill(0).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-highlight text-highlight" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="gradient-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Siap Mengelola Lembaga Anda dengan Lebih Baik?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Bergabung dengan 500+ lembaga pendidikan yang sudah menggunakan MAJIKU. 
                Gratis 14 hari, tanpa kartu kredit.
              </p>
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 h-14">
                  Mulai Sekarang
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">MAJIKU</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-foreground">Kebijakan Privasi</a>
              <a href="#" className="hover:text-foreground">Kontak</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MAJIKU. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}