import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://majiku.web.id";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan Layanan — MAJIKU",
  description:
    "Ketentuan penggunaan platform SaaS MAJIKU untuk manajemen daycare, PAUD, preschool, dan bimbingan belajar.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Syarat dan Ketentuan Layanan — MAJIKU",
    description:
      "Ketentuan penggunaan platform SaaS MAJIKU untuk manajemen daycare, PAUD, preschool, dan bimbingan belajar.",
    url: `${siteUrl}/terms`,
    type: "website",
    siteName: "MAJIKU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syarat dan Ketentuan Layanan — MAJIKU",
    description:
      "Ketentuan penggunaan platform SaaS MAJIKU untuk manajemen daycare, PAUD, preschool, dan bimbingan belajar.",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">MAJIKU</span>
          </Link>
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
            <Link href="/">
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Syarat & Ketentuan Layanan</h1>
            <p className="text-sm text-muted-foreground">
              Terakhir diperbarui: 11 Oktober 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Pendahuluan & Penerimaan Layanan</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Selamat datang di MAJIKU. Dokumen ini mengatur penggunaan platform SaaS manajemen daycare,
              preschool, PAUD, dan bimbingan belajar yang dioperasikan oleh MAJIKU (&ldquo;Kami&rdquo;).
              Dengan mendaftar, mengakses, atau menggunakan layanan Kami, Anda menyatakan telah membaca,
              memahami, dan menyetujui seluruh ketentuan ini.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Akun & Keamanan Akses</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pengguna bertanggung jawab penuh atas kerahasiaan kredensial akun mereka (email dan kata sandi).
              Pengelola lembaga mitra berkewajiban memastikan bahwa hanya staf dan tenaga pengajar berwenang
              yang diberikan akses ke modul administrasi dan data anak didik.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Paket Berlangganan & Pembayaran</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Layanan MAJIKU disediakan berdasarkan paket langganan (Basic, Pro, Enterprise) dengan siklus
              penagihan bulanan atau tahunan. Pembayaran diproses secara aman melalui gerbang pembayaran resmi
              PayCore (QRIS dan Virtual Account). Lembaga diaktifkan secara otomatis setelah pembayaran lunas
              dikonfirmasi oleh sistem.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Data Anak & Kerahasiaan Informasi</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Data absensi, laporan kegiatan harian, catatan perkembangan, dan dokumentasi foto anak adalah
              milik sah lembaga dan wali murid terkait. MAJIKU mengenkripsi transmisi data dan menerapkan
              kebijakan isolasi multi-tenant yang ketat untuk mencegah akses tanpa hak antar-lembaga.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Pembatasan Tanggung Jawab</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MAJIKU berkomitmen menjaga ketersediaan layanan dengan standar keandalan tinggi. Namun, Kami
              tidak bertanggung jawab atas kerugian tidak langsung atau gangguan operasional yang timbul akibat
              kesalahan konfigurasi pengguna, gangguan koneksi internet pihak ketiga, atau kondisi force majeure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Kontak & Dukungan</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Apabila Anda memiliki pertanyaan, kendala teknis, atau klarifikasi terkait syarat dan ketentuan ini,
              silakan hubungi tim dukungan Kami melalui email:{" "}
              <a href="mailto:support@majiku.web.id" className="text-primary underline">
                support@majiku.web.id
              </a>.
            </p>
          </section>
        </article>
      </main>

      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © 2026 MAJIKU. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
