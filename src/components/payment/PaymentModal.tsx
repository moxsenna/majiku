"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Loader2,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { checkInvoiceStatus } from "@/server/actions/payments";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  checkoutUrl?: string | null;
  qrString?: string | null;
  expiresAt?: string | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function PaymentModal({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  amount,
  checkoutUrl,
  qrString,
  expiresAt,
}: PaymentModalProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isPaid, setIsPaid] = useState(false);
  const [isCheckingManual, setIsCheckingManual] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Reset state when opening modal
  useEffect(() => {
    if (open) {
      setIsPaid(false);
    }
  }, [open, qrString, invoiceId]);

  // Polling status invoice setiap 3.5 detik saat modal terbuka dan belum lunas
  useEffect(() => {
    if (!open || isPaid || !invoiceId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await checkInvoiceStatus(invoiceId);
        if (isMounted && res.isPaid) {
          setIsPaid(true);
          toast.success("Pembayaran terverifikasi! Tagihan lunas.");
          startTransition(() => {
            router.refresh();
          });
        }
      } catch (err) {
        console.error("Gagal memeriksa status pembayaran:", err);
      }
    }, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [open, isPaid, invoiceId, router]);

  const handleManualCheck = async () => {
    setIsCheckingManual(true);
    try {
      const res = await checkInvoiceStatus(invoiceId);
      if (res.isPaid) {
        setIsPaid(true);
        toast.success("Pembayaran terverifikasi! Tagihan lunas.");
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.info("Menunggu pembayaran masuk dari perbankan/e-wallet.");
      }
    } finally {
      setIsCheckingManual(false);
    }
  };

  const handleSaveQR = () => {
    try {
      setIsDownloading(true);
      const svg = document.getElementById("qris-code-svg");
      if (!svg) {
        toast.error("Kode QR belum siap");
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 20, 20);
        }
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QRIS-${invoiceNumber}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success("QRIS berhasil disimpan ke galeri");
        setIsDownloading(false);
      };
      img.onerror = () => {
        setIsDownloading(false);
        toast.error("Gagal membuat gambar QRIS");
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch {
      setIsDownloading(false);
      toast.error("Gagal mengunduh gambar QR");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (isPaid) {
      startTransition(() => {
        router.refresh();
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full p-0 flex flex-col overflow-hidden rounded-3xl border-border bg-background shadow-2xl gap-0 max-h-[94vh]">
        {/* Top Header */}
        <DialogHeader className="p-3.5 sm:p-4 border-b border-border bg-card/60 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base font-bold truncate flex items-center gap-1.5">
                <span>Bayar SPP</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                  {invoiceNumber}
                </Badge>
              </DialogTitle>
              <p className="text-xs text-primary font-semibold">
                Total: {formatCurrency(amount)}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center text-center">
          {isPaid ? (
            /* Success State */
            <div className="py-6 flex flex-col items-center justify-center space-y-4 animate-in zoom-in-90 duration-300">
              <div className="h-20 w-20 rounded-full bg-success/10 text-success flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">
                  Pembayaran Berhasil! 🎉
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Tagihan <strong>{invoiceNumber}</strong> telah lunas. Data otomatis terverifikasi di sistem MAJIKU.
                </p>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground w-full max-w-xs space-y-1">
                <p className="flex justify-between">
                  <span>Nomor Tagihan:</span>
                  <span className="font-mono font-medium text-foreground">{invoiceNumber}</span>
                </p>
                <p className="flex justify-between">
                  <span>Total Tagihan:</span>
                  <span className="font-semibold text-primary">{formatCurrency(amount)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Metode:</span>
                  <span className="text-foreground">QRIS Standar Nasional</span>
                </p>
              </div>

              <Button onClick={handleClose} variant="hero" className="w-full max-w-xs">
                Selesai
              </Button>
            </div>
          ) : qrString ? (
            /* Native Pure QRIS Card */
            <div className="w-full flex flex-col items-center space-y-4">
              {/* QRIS Card Frame */}
              <div className="w-full max-w-[310px] bg-white text-zinc-900 rounded-2xl p-4 shadow-md border border-zinc-200 flex flex-col items-center space-y-2.5">
                {/* QRIS Header */}
                <div className="w-full flex items-center justify-between border-b border-zinc-100 pb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-red-600 tracking-wider text-base font-sans">
                      QRIS
                    </span>
                    <span className="text-[9px] text-zinc-500 font-medium leading-tight">
                      Pembayaran Nasional
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[9px] py-0 px-1 border-zinc-300 text-zinc-600 bg-zinc-50 font-mono">
                    NMID
                  </Badge>
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-zinc-800 tracking-tight">
                    MAJIKU Daycare & Preschool
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Tagihan #{invoiceNumber}
                  </p>
                </div>

                {/* The Pure Crisp QR Barcode */}
                <div className="p-2 bg-white rounded-xl border-2 border-zinc-900 shadow-xs flex items-center justify-center">
                  <QRCodeSVG
                    id="qris-code-svg"
                    value={qrString}
                    size={220}
                    level="M"
                    includeMargin={false}
                  />
                </div>

                {/* Amount Display */}
                <div className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-1.5 px-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 text-[11px]">Total Bayar:</span>
                  <span className="font-extrabold text-red-600 text-sm">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons for QRIS */}
              <div className="w-full max-w-[310px] space-y-2">
                <Button
                  onClick={handleSaveQR}
                  variant="outline"
                  className="w-full text-xs h-9 border-border bg-card/50"
                  disabled={isDownloading}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  {isDownloading ? "Menyimpan..." : "Simpan Gambar QR ke Galeri"}
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                  <Smartphone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Scan pakai BCA, Mandiri, GoPay, OVO, ShopeePay, Dana, dll.</span>
                </div>
              </div>
            </div>
          ) : checkoutUrl ? (
            /* Fallback to Checkout Link if no QR string */
            <div className="py-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                Gunakan tautan pembayaran resmi berikut:
              </p>
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="hero" className="w-full">
                  Buka Halaman Pembayaran <ExternalLink className="h-4 w-4 ml-1.5" />
                </Button>
              </a>
            </div>
          ) : (
            <div className="py-8 text-xs text-muted-foreground">
              Gagal memuat barcode QRIS. Silakan coba kembali.
            </div>
          )}
        </div>

        {/* Bottom Bar Footer with Auto-Detection Indicator */}
        {!isPaid && (
          <div className="p-2.5 px-4 bg-card border-t border-border flex items-center justify-between text-xs text-muted-foreground shrink-0 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
              <span className="truncate text-[11px]">
                Mendeteksi pembayaran otomatis...
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground shrink-0"
              onClick={handleManualCheck}
              disabled={isCheckingManual}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isCheckingManual ? "animate-spin" : ""}`} />
              Cek Status
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
