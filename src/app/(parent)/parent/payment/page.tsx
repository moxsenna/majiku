"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Check,
  Copy,
  CreditCard,
  FileText,
  Home,
  MessageCircle,
  ShoppingBag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function ManualPaymentContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoice");
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const bankAccounts = [
    { bank: "Bank BCA", number: "123-456-7890", name: "Pengelola Daycare" },
    { bank: "Bank Mandiri", number: "987-654-3210", name: "Pengelola Daycare" },
  ];

  const handleCopy = (text: string, bank: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bank);
    toast.success(`Nomor rekening ${bank} disalin`);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <Link href={invoiceId ? `/parent/invoice/${invoiceId}` : "/parent/billing"}>
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-base">Instruksi Pembayaran Manual</h1>
            <p className="text-[11px] text-muted-foreground">Transfer Bank & Konfirmasi</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {invoiceId && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Invoice ID: <span className="font-mono font-medium">{invoiceId}</span></span>
              </div>
              <Link href={`/parent/invoice/${invoiceId}`} className="text-primary font-semibold hover:underline">
                Rincian Tagihan
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Rekening Pembayaran Resmi
            </CardTitle>
            <CardDescription className="text-xs">
              Silakan transfer pembayaran sesuai nominal tagihan ke salah satu rekening berikut:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bankAccounts.map((acc) => (
              <div
                key={acc.bank}
                className="p-3 rounded-lg border border-border bg-muted/40 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-foreground">{acc.bank}</p>
                  <p className="font-mono text-sm font-bold text-primary">{acc.number}</p>
                  <p className="text-[11px] text-muted-foreground">a.n. {acc.name}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(acc.number.replace(/-/g, ""), acc.bank)}
                  className="h-8 gap-1 text-xs"
                >
                  {copiedBank === acc.bank ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Salin
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Langkah Pembayaran & Konfirmasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li>Lakukan transfer sesuai nominal tagihan yang tertera pada invoice.</li>
              <li>Simpan bukti transfer berupa tangkapan layar atau struk ATM.</li>
              <li>
                Kirimkan bukti transfer beserta nomor invoice kepada pihak administrasi melalui fitur Chat Tutor/Admin di portal ini atau kontak WhatsApp resmi pengelola.
              </li>
              <li>Admin daycare akan memverifikasi dan memperbarui status invoice menjadi lunas.</li>
            </ol>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {invoiceId && (
            <Link href={`/parent/invoice/${invoiceId}`} className="w-full block">
              <Button variant="default" className="w-full">
                Kembali ke Detail Invoice
              </Button>
            </Link>
          )}
          <Link href="/parent/billing" className="w-full block">
            <Button variant={invoiceId ? "outline" : "default"} className="w-full">
              Lihat Tagihan
            </Button>
          </Link>
          <Link href="/parent/chat" className="w-full block">
            <Button variant="ghost" className="w-full text-xs text-muted-foreground">
              Konfirmasi via Chat Tutor/Admin
            </Button>
          </Link>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <Link href="/parent" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <Home className="h-5 w-5" />
            <span className="text-[11px]">Beranda</span>
          </Link>
          <Link href="/parent/marketplace" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[11px]">Marketplace</span>
          </Link>
          <Link href="/parent/billing" className="flex flex-col items-center gap-1 p-2 text-primary">
            <CreditCard className="h-5 w-5" />
            <span className="text-[11px]">Tagihan</span>
          </Link>
          <Link href="/parent/chat" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[11px]">Chat</span>
          </Link>
          <Link href="/parent/profile" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <User className="h-5 w-5" />
            <span className="text-[11px]">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat instruksi pembayaran...</div>}>
      <ManualPaymentContent />
    </Suspense>
  );
}
