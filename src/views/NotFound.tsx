"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.warn("404 Halaman Tidak Ditemukan:", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6 text-center">
      <div className="w-full max-w-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="text-4xl font-extrabold tracking-tight text-primary">404</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau tautan yang Anda masukkan salah.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <Link href="/">
            <Button className="w-full sm:w-auto gap-2">
              <Home className="w-4 h-4" />
              Ke Halaman Utama
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
