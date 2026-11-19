"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  BookOpen,
  NotebookPen,
  ReceiptText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DemoAccessModal } from "@/components/demo/DemoAccessModal";
import { BunayoLogo, BunayoMark } from "@/components/bunayo/Logo";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptionPlans";

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

const rupiah = new Intl.NumberFormat("id-ID");

// Sehari di Bunayo: babak-babak hari yang sama, dilihat dari kelas dan dari rumah.
// Semua kemampuan di bawah nyata; klaim yang belum betul (mis. QR absensi) tidak disebut.
interface Beat {
  time: string;
  ink: string;
  soft: string;
  icon: LucideIcon;
  title: string;
  body: string;
  image?: string;
  imageAlt?: string;
  frame?: "phone" | "browser";
}

const beats: Beat[] = [
  {
    time: "07:15",
    ink: "text-langit-ink",
    soft: "bg-langit-soft",
    icon: Bell,
    title: "Tiba di kelas",
    body: "Guru menandai kehadiran dalam satu ketukan. Orang tua langsung menerima kabar bahwa anaknya sudah tiba, tanpa harus bertanya lewat grup chat.",
    image: "/previews/tutor-bunayo.webp",
    imageAlt: "Portal Guru Bunayo: kelas hari ini, kehadiran anak, dan tombol Absen anak",
    frame: "phone",
  },
  {
    time: "09:30",
    ink: "text-tomat-ink",
    soft: "bg-tomat-soft",
    icon: NotebookPen,
    title: "Kabar harian terkirim",
    body: "Makan, tidur, mood, dan foto kegiatan dicatat sekali untuk satu kelas. Orang tua membacanya langsung di portal Orang Tua, persis seperti tampilan di bagian atas halaman ini.",
  },
  {
    time: "13:45",
    ink: "text-anggur-ink",
    soft: "bg-anggur-soft",
    icon: CalendarDays,
    title: "Guru tetap fokus mengajar",
    body: "Jadwal, kelas, dan tugas hari ini ada di satu layar yang bisa dibuka dengan satu tangan di tengah kelas, jadi catatan selesai sebelum anak-anak bertanya lagi.",
  },
  {
    time: "15:30",
    ink: "text-daun-ink",
    soft: "bg-daun-soft",
    icon: ReceiptText,
    title: "Tagihan SPP terpantau",
    body: "Tagihan diterbitkan dari dashboard dan dibayar orang tua lewat QRIS atau Virtual Account via PayCore. Admin melihat siapa yang sudah lunas dan siapa yang terlambat dalam satu layar.",
    image: "/previews/admin-bunayo.webp",
    imageAlt: "Dashboard Admin Bunayo: kehadiran hari ini, penerimaan SPP, dan tagihan terlambat",
    frame: "browser",
  },
];

const steps = [
  {
    title: "Daftar lembaga",
    body: "Buat akun admin dan isi nama lembaga Anda. Masa trial 14 hari dimulai otomatis.",
  },
  {
    title: "Susun kelas & siswa",
    body: "Tambah kelas, siswa, dan jadwal sesuai operasional lembaga Anda.",
  },
  {
    title: "Undang guru & orang tua",
    body: "Guru dan orang tua masuk ke portal masing-masing dari HP mereka.",
  },
  {
    title: "Catat & tagih",
    body: "Kabar harian, foto kegiatan, dan tagihan SPP berjalan dalam satu sistem.",
  },
];

const plans = Object.values(SUBSCRIPTION_PLANS);

/* ------------------------------------------------------------------ */
/* Fragmen kecil                                                        */
/* ------------------------------------------------------------------ */

function PortalMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="press inline-flex h-btn items-center gap-1.5 rounded px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          Masuk Portal
          <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Pilih portal masuk
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/parent/login" className="flex cursor-pointer items-center gap-2.5 py-2">
            <HeartHandshake className="h-4 w-4 text-primary" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-foreground">Orang Tua Murid</p>
              <p className="text-[10px] text-muted-foreground">parent.majiku.web.id</p>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/tutor/login" className="flex cursor-pointer items-center gap-2.5 py-2">
            <BookOpen className="h-4 w-4 text-info" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-foreground">Guru & Pendidik</p>
              <p className="text-[10px] text-muted-foreground">tutor.majiku.web.id</p>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/login" className="flex cursor-pointer items-center gap-2.5 py-2">
            <GraduationCap className="h-4 w-4 text-foreground" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-foreground">Admin Lembaga</p>
              <p className="text-[10px] text-muted-foreground">admin.majiku.web.id</p>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** CTA utama: memulai trial — satu tombol biru per layar. */
function TrialButton({ size = "lg" }: { size?: "md" | "lg" }) {
  return (
    <Link href="/admin/register">
      <Button
        size={size === "lg" ? "lg" : "default"}
        className={`press gap-2 rounded bg-primary text-primary-foreground hover:bg-primary-hover ${size === "lg" ? "h-btn-lg px-6 text-base" : ""}`}
      >
        Coba 14 hari gratis
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Button>
    </Link>
  );
}

/** Bingkai HP (tinta) — tangkapan layar portal ortu asli. */
function PhoneFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto w-[250px] sm:w-[280px] ${className ?? ""}`}>
      <div className="rounded-[2.5rem] bg-foreground p-2 shadow-float">
        <div className="overflow-hidden rounded-[2rem] bg-card">
          <div className="mx-16 h-5 rounded-b-lg bg-foreground" />
          {children}
        </div>
      </div>
    </div>
  );
}

/** Bingkai jendela browser netral — tangkapan layar portal desktop asli. */
function BrowserFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded border border-border bg-card shadow-soft">
      <div className="flex items-center gap-1.5 border-b border-border-subtle bg-muted px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-3 truncate text-[11px] text-muted-foreground">Dashboard Admin · data demo</span>
      </div>
      <img src={src} alt={alt} loading="lazy" className="h-auto w-full" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Landing                                                              */
/* ------------------------------------------------------------------ */

export default function SaasLanding() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigasi */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Bunayo — beranda" className="press">
            <BunayoLogo height={30} priority />
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            <a href="#hari" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Sehari di Bunayo
            </a>
            <a href="#cara-kerja" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Cara kerja
            </a>
            <a href="#harga" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Harga
            </a>
          </div>
          <div className="flex items-center gap-2">
            <PortalMenu />
            <TrialButton size="md" />
          </div>
        </div>
      </nav>

      {/* Hero: penawaran + bukti pertama */}
      <section className="px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:pb-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="rise">
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[56px]">
              Guru catat sekali.
              <br />
              Orang tua langsung tahu.
            </h1>
            <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-foreground-2">
              Bunayo menyatukan kehadiran, kabar harian, foto, chat, dan tagihan SPP untuk daycare,
              preschool, dan bimbel — satu sistem lembaga yang menghubungkan kelas dan rumah.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <TrialButton />
              <Button
                variant="outline"
                size="lg"
                className="press h-btn-lg gap-2 rounded border-[1.5px] border-foreground px-6 text-base"
                onClick={() => setDemoModalOpen(true)}
              >
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                Lihat demo interaktif
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Gratis 14 hari · tanpa kartu kredit · tanpa komitmen
            </p>
          </div>

          {/* Bukti pertama: portal ortu asli dengan kabar tiba */}
          <div className="rise rise-2 relative">
            <PhoneFrame>
              <img
                src="/previews/parent-bunayo.webp"
                alt="Portal Orang Tua Bunayo — kabar harian anak dengan data demo"
                className="h-auto w-full"
              />
            </PhoneFrame>
            <div className="press absolute -left-2 top-8 flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-soft sm:-left-6">
              <span className="tiba-dot grid h-9 w-9 place-items-center rounded-full bg-daun-soft">
                <span className="h-2.5 w-2.5 rounded-full bg-success-ring" />
              </span>
              <div>
                <p className="text-sm font-semibold">Sudah tiba</p>
                <p className="tabular text-xs text-muted-foreground">07:15 · Portal Orang Tua</p>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Tampilan portal Orang Tua · data demo
            </p>
          </div>
        </div>
      </section>

      {/* Sehari di Bunayo: hari yang sama, dari kelas dan dari rumah */}
      <section id="hari" className="border-y border-border bg-kanvas px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Sehari di Bunayo
            </h2>
            <p className="mt-4 text-lg text-foreground-2">
              Hari yang sama, dilihat dari kelas dan dari rumah. Inilah hari lembaga Anda yang
              berjalan di atas satu sistem.
            </p>
          </div>

          <ol className="relative mt-12 flex flex-col">
            {/* rail jam: garis halus tunggal di kolom kiri */}
            <span aria-hidden className="absolute bottom-3 left-[19px] top-3 w-px bg-border" />
            {beats.map((beat) => (
              <li key={beat.time} className="relative grid gap-x-8 pb-14 pl-14 last:pb-0 lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-x-14">
                <span className={`absolute left-0 top-0 grid h-10 w-10 place-items-center rounded ${beat.soft} ring-4 ring-kanvas`}>
                  <beat.icon className={`h-5 w-5 ${beat.ink}`} aria-hidden />
                </span>
                <div>
                  <p className="tabular font-mono text-sm font-medium text-muted-foreground">{beat.time}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold tracking-tight">{beat.title}</h3>
                  <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-foreground-2">{beat.body}</p>
                </div>
                {beat.image && (
                  <div className="mt-6 lg:mt-0">
                    {beat.frame === "phone" ? (
                      <PhoneFrame>
                        <img src={beat.image} alt={beat.imageAlt ?? beat.title} loading="lazy" className="h-auto w-full" />
                      </PhoneFrame>
                    ) : (
                      <BrowserFrame src={beat.image} alt={beat.imageAlt ?? beat.title} />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-10 text-center text-xs text-muted-foreground">
            Seluruh tangkapan layar diambil dari aplikasi Bunayo dengan data demo.
          </p>
        </div>
      </section>

      {/* Cara kerja: empat langkah nyata */}
      <section id="cara-kerja" className="px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Mulai dalam empat langkah
            </h2>
            <p className="mt-4 text-lg text-foreground-2">
              Tidak perlu tim IT. Lembaga berjalan normal di hari yang sama Anda mendaftar.
            </p>
          </div>
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded border border-border bg-card p-5">
                <span className="tabular font-mono text-sm text-muted-foreground">
                  Langkah {i + 1}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground-2">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex justify-center">
            <TrialButton />
          </div>
        </div>
      </section>

      {/* Harga: dari sumber kebenaran billing, trial 14 hari di depan */}
      <section id="harga" className="border-y border-border bg-kanvas px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Satu harga per lembaga
            </h2>
            <p className="mt-4 text-lg text-foreground-2">
              Pilih paket setelah melihat semuanya sendiri — semua paket dimulai dengan trial 14 hari.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded bg-card p-6 ${
                  plan.popular ? "border-[1.5px] border-foreground" : "border border-border"
                }`}
              >
                {plan.badge && (
                  <span
                    className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-semibold ${
                      plan.popular ? "bg-highlight text-highlight-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-5">
                  <span className="tabular font-display text-4xl font-extrabold tracking-tight">
                    Rp {rupiah.format(plan.priceMonthly)}
                  </span>
                  <span className="text-sm text-muted-foreground"> /bulan</span>
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground-2">
                      <span className={`mt-[7px] h-[7px] w-[7px] shrink-0 rounded-full ${plan.popular ? "bg-foreground" : "bg-border"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <Link href="/admin/register" className="block">
                    <Button
                      className={`press h-btn w-full rounded text-base ${
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                          : "border-[1.5px] border-foreground bg-card text-foreground hover:bg-muted"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Mulai trial 14 hari
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </Link>
                  <p className="mt-2.5 text-center text-xs text-muted-foreground">
                    Detail paket di{" "}
                    <Link href={`/checkout?plan=${plan.id}`} className="underline underline-offset-2 hover:text-foreground">
                      halaman pendaftaran langganan
                    </Link>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
            Trial 14 hari tanpa kartu kredit. Setelah trial, pembayaran berjalan lewat PayCore
            (QRIS / Virtual Account) dan bisa dihentikan kapan saja.
          </p>
        </div>
      </section>

      {/* CTA akhir: kartu krayon matahari */}
      <section className="px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="field-ink rounded-sheet bg-matahari p-8 text-center sm:p-12">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Mulai hari pertama lembaga Anda
            </h2>
            <p className="field-sub mx-auto mt-4 max-w-[52ch] text-base">
              Coba 14 hari gratis — lihat sendiri bagaimana kelas dan rumah terhubung dalam satu
              hari yang sama.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/admin/register">
                <Button size="lg" className="press h-btn-lg rounded-full bg-[hsl(249_26%_14%)] px-7 text-base text-[hsl(40_100%_98%)] hover:bg-[hsl(249_26%_20%)]">
                  Coba 14 hari gratis
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="press inline-flex h-btn-lg items-center gap-2 rounded-full border-[1.5px] border-foreground bg-white/60 px-6 text-base font-medium"
              >
                <Sparkles className="h-5 w-5" aria-hidden />
                Lihat demo dulu
              </button>
            </div>
            <p className="field-sub mt-5 text-sm">Tanpa kartu kredit · aktif seketika</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <BunayoMark height={28} />
            <span className="text-sm text-muted-foreground">Sistem manajemen lembaga pendidikan</span>
          </div>
          <nav aria-label="Tautan footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/marketplace" className="hover:text-foreground">
              Marketplace Lembaga
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Syarat & Ketentuan
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Kebijakan Privasi
            </Link>
            <a href="mailto:support@majiku.web.id" className="hover:text-foreground">
              Kontak
            </a>
          </nav>
          <p className="tabular text-sm text-muted-foreground">© 2026 Bunayo</p>
        </div>
      </footer>

      <DemoAccessModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
    </div>
  );
}
