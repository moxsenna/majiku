import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAJIKU — Manajemen Daycare, Preschool & Bimbel",
  description: "Platform manajemen daycare, preschool, dan bimbel multi-tenant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
