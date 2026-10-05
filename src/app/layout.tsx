import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — Manajemen Daycare, Preschool & Bimbel`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { type: "website", locale: "id_ID", siteName: siteConfig.name, title: siteConfig.name, description: siteConfig.description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
