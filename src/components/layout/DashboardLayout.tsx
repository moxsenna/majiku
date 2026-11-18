"use client";

import { ReactNode } from "react";
import { PageHeader } from "@/components/bunayo/PageHeader";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  /** Tidak dipakai lagi (bilah aksi cepat demo sudah dihapus); dipertahankan agar view lama tetap terkompilasi. */
  hideNavbarActions?: boolean;
}

/**
 * Pembungkus kompatibilitas untuk view admin yang belum di-redesign.
 * Shell (sidebar/rail/nav bawah) sekarang dipasang sekali di `src/app/(admin)/layout.tsx` (AdminShell);
 * komponen ini hanya menggambar kepala halaman + padding kit. Dihapus setelah semua layar Fase 3 selesai.
 */
export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <>
      {title && (
        <PageHeader title={title} description={subtitle} />
      )}
      <div className="px-8 pb-8 pt-6 max-[1000px]:px-6 max-[560px]:px-4 max-[560px]:pt-4">{children}</div>
    </>
  );
}
