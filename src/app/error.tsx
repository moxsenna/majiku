"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Terjadi kesalahan sistem (500):", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="w-full max-w-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Terjadi Kesalahan Sistem
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sistem kami sedang mengalami kendala sementara saat memproses permintaan Anda. Silakan coba muat ulang halaman.
          </p>
        </div>

        {error.digest && (
          <p className="text-[11px] font-mono text-muted-foreground/60 bg-muted/40 py-1 px-2 rounded-md inline-block">
            Kode Error: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={() => reset()} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
