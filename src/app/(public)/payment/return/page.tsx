import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ArrowRight, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Status Pembayaran | MAJIKU",
  robots: { index: false, follow: false },
};

export default function PaymentReturnPage() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-border shadow-sm">
        <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-8 w-8 text-primary animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-foreground">
              Pembayaran Sedang Diverifikasi
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Terima kasih! Pembayaran Anda melalui gateway PayCore sedang dalam proses
              pencocokan otomatis.
            </p>
          </div>

          <div className="p-3.5 bg-muted/50 rounded-xl text-left text-xs space-y-1.5 border border-border/60">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Verifikasi Otomatis</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-normal">
              Status tagihan SPP Anda akan berubah menjadi <strong>Lunas</strong> dalam 1–3 menit
              setelah sistem perbankan / e-wallet menyelesaikan transaksi. Anda tidak perlu
              mengunggah bukti transfer.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link href="/parent/billing" className="w-full">
              <Button variant="hero" className="w-full">
                Lihat Tagihan Saya <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/parent" className="w-full">
              <Button variant="ghost" className="w-full text-xs">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
