import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://majiku.web.id";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — MAJIKU",
  description:
    "Kebijakan privasi dan perlindungan data anak pada platform SaaS MAJIKU.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Kebijakan Privasi — MAJIKU",
    description:
      "Kebijakan privasi dan perlindungan data anak pada platform SaaS MAJIKU.",
    url: `${siteUrl}/privacy`,
    type: "website",
    siteName: "MAJIKU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kebijakan Privasi — MAJIKU",
    description:
      "Kebijakan privasi dan perlindungan data anak pada platform SaaS MAJIKU.",
  },
};

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold tracking-tight mb-2">Kebijakan Privasi</h1>
            <p className="text-sm text-muted-foreground">
              Terakhir diperbarui: 11 Oktober 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Komitmen Privasi Kami</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MAJIKU menghargai dan melindungi privasi seluruh pengguna platform kami, termasuk pengelola
              daycare, guru/tutor, orang tua/wali murid, dan data sensitif anak-anak yang dipercayakan kepada
              lembaga mitra. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Data yang Kami Kumpulkan</h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>Kami mengumpulkan jenis data berikut secara proporsional sesuai kebutuhan layanan:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Informasi Akun:</strong> Nama, alamat email, nomor telepon/WhatsApp, dan peran pengguna (admin, tutor, orang tua).</li>
                <li><strong>Profil Lembaga:</strong> Nama institusi, alamat, kota, program belajar, dan izin operasional.</li>
                <li><strong>Data Anak Didik:</strong> Nama anak, tanggal lahir, catatan kehadiran/absensi, riwayat makan, tidur, dan laporan kegiatan harian.</li>
                <li><strong>Dokumentasi Foto & Galeri:</strong> Foto aktivitas harian anak yang diunggah oleh guru untuk orang tua terkait via penyimpanan Cloudflare R2 terenkripsi.</li>
                <li><strong>Data Transaksi:</strong> Nomor pesanan, status pembayaran, dan riwayat tagihan SPP melalui gateway resmi PayCore (kami tidak menyimpan nomor kartu kredit atau PIN).</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Penggunaan Informasi</h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>Informasi yang dikumpulkan digunakan semata-mata untuk:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Menyediakan fitur operasional daycare (absensi QR, daily report, broadcast).</li>
                <li>Memfasilitasi komunikasi langsung antara orang tua dan pengasuh/guru anak.</li>
                <li>Menerbitkan tagihan SPP dan memverifikasi status pembayaran otomatis.</li>
                <li>Menjaga keamanan sistem, audit trail, dan mencegah penyalahgunaan akun.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Perlindungan Khusus Data Anak</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kami mematuhi standar perlindungan data anak yang ketat. Foto dan catatan harian anak bersifat privat
              dan hanya dapat diakses oleh orang tua kandung/wali resmi serta pengasuh di lembaga terkait.
              Data anak tidak pernah dijual, disewakan, atau dibagikan kepada pengiklan pihak ketiga mana pun.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Keamanan & Retensi Data</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seluruh komunikasi menggunakan enkripsi TLS/HTTPS modern. Data disimpan pada infrastruktur cloud
              terisolasi per tenant dengan pemantauan keamanan 24/7. Lembaga mitra dapat meminta penghapusan atau
              ekspor data saat masa berlangganan berakhir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Hubungi Kami</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin mengajukan permohonan terkait
              data pribadi Anda, hubungi Petugas Perlindungan Data kami melalui email:{" "}
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
