import type { Metadata } from "next";
import SaasLanding from "@/views/SaasLanding";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://majiku.web.id";

const title = "Bunayo — Manajemen Daycare, Preschool & Bimbel";
const description =
  "Satu sistem lembaga untuk kehadiran, kabar harian, foto kegiatan, chat orang tua, dan tagihan SPP. Coba 14 hari gratis, tanpa kartu kredit.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    type: "website",
    siteName: "Bunayo",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function Page() {
  return <SaasLanding />;
}
