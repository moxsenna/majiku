"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  X,
  QrCode,
} from "lucide-react";
import { checkInvoiceStatus } from "@/server/actions/payments";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  checkoutUrl: string;
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
}: PaymentModalProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isLoadingIframe, setIsLoadingIframe] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [isCheckingManual, setIsCheckingManual] = useState(false);

  // Reset state when opening new modal
  useEffect(() => {
    if (open) {
      setIsLoadingIframe(true);
      setIsPaid(false);
    }
  }, [open, checkoutUrl]);

  // Polling status invoice setiap 4 detik saat modal terbuka dan belum lunas
  useEffect(() => {
    if (!open || isPaid || !invoiceId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await checkInvoiceStatus(invoiceId);
        if (isMounted && res.isPaid) {
          setIsPaid(true);
          startTransition(() => {
            router.refresh();
          });
        }
      } catch (err) {
        console.error("Gagal memeriksa status pembayaran:", err);
      }
    }, 4000);

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
        startTransition(() => {
          router.refresh();
        });
      }
    } finally {
      setIsCheckingManual(false);
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
      <DialogContent className="max-w-xl w-full h-[92vh] sm:h-[86vh] p-0 flex flex-col overflow-hidden rounded-2xl border-border bg-background shadow-2xl gap-0">
        {/* Top Header */}
        <DialogHeader className="p-3 sm:p-4 border-b border-border bg-card/60 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base font-bold truncate flex items-center gap-1.5">
                <span>Pembayaran SPP</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                  {invoiceNumber}
                </Badge>
              </DialogTitle>
              <p className="text-xs text-primary font-semibold">
                Total: {formatCurrency(amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {checkoutUrl && (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka di Tab Baru"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 relative bg-muted/10 overflow-hidden flex flex-col">
          {isPaid ? (
            /* Success State */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-background">
              <div className="h-20 w-20 rounded-full bg-success/10 text-success flex items-center justify-center animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">
                  Pembayaran Berhasil! 🎉
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Tagihan <strong>{invoiceNumber}</strong> telah berhasil dilunasi. Status
                  invoice telah diperbarui secara otomatis di sistem.
                </p>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground w-full max-w-xs space-y-1">
                <p className="flex justify-between">
                  <span>Nomor Invoice:</span>
                  <span className="font-mono font-medium text-foreground">{invoiceNumber}</span>
                </p>
                <p className="flex justify-between">
                  <span>Total Dibayar:</span>
                  <span className="font-semibold text-primary">{formatCurrency(amount)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Metode:</span>
                  <span className="text-foreground">Online (PayCore)</span>
                </p>
              </div>
              <Button onClick={handleClose} variant="hero" className="w-full max-w-xs">
                Kembali ke Tagihan
              </Button>
            </div>
          ) : (
            /* Iframe Checkout State */
            <>
              {isLoadingIframe && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-xs gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Menghubungkan ke Gateway Pembayaran...
                  </p>
                </div>
              )}
              {checkoutUrl ? (
                <iframe
                  src={checkoutUrl}
                  className="w-full flex-1 border-0 h-full"
                  title="Checkout Pembayaran"
                  allow="payment"
                  onLoad={() => setIsLoadingIframe(false)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-muted-foreground">
                  URL checkout pembayaran tidak ditemukan.
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Bar Footer */}
        {!isPaid && (
          <div className="p-2.5 px-4 bg-card border-t border-border flex items-center justify-between text-xs text-muted-foreground shrink-0 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate text-[11px]">
                Status otomatis mendeteksi lunas setelah Anda bayar.
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
