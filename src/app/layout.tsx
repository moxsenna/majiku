import { ReticleDev } from './reticle-dev';
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { fontVariables } from "./fonts";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: { default: `${siteConfig.name} — Manajemen Daycare, Preschool & Bimbel`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: siteConfig.logo, width: 1307, height: 441, alt: siteConfig.name }],
  },
  appleWebApp: { title: siteConfig.name, capable: true, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#2046C4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={fontVariables} suppressHydrationWarning>
      <body suppressHydrationWarning>{process.env.NODE_ENV === 'development' ? <ReticleDev /> : null}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
