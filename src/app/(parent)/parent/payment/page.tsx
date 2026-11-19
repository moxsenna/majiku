import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  FileText,
  Home,
  MessageCircle,
  ShoppingBag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyInvoiceById } from "@/server/actions/payments";
import { waLink } from "@/lib/keuangan";
import { formatRupiah } from "@/lib/format";
import { CopyRekeningButton } from "./CopyRekeningButton";

/**
 * Instruksi pembayaran manual — data NYATA dari invoice (bukan rekening karangan).
 * Konfirmasi bukti transfer mengalir lewat WhatsApp lembaga (pesan sudah terisi)
 * atau chat guru/admin; admin memverifikasi lalu menandai lunas dari portal admin.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>;
}) {
  const { invoice: invoiceId } = await searchParams;
  const invoice = invoiceId ? await getMyInvoiceById(invoiceId).catch(() => null) : null;

  const wa = waLink(invoice?.tenantWhatsapp ?? null);
  const pesanWa = invoice
    ? `Halo, saya ingin konfirmasi pembayaran tagihan ${invoice.invoiceNumber} sebesar ${formatRupiah(invoice.total)} untuk ${invoice.studentName}. Bukti transfer saya lampirkan di chat ini.`
    : "Halo, saya ingin konfirmasi pembayaran tagihan. Bukti transfer saya lampirkan di chat ini.";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <Link href={invoice ? `/parent/invoice/${invoice.id}` : "/parent/billing"}>
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
        {invoice ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>
                  <span className="font-mono font-medium">{invoice.invoiceNumber}</span> ·{" "}
                  {formatRupiah(invoice.total)} · {invoice.studentName}
                </span>
              </div>
              <Link href={`/parent/invoice/${invoice.id}`} className="text-primary font-semibold hover:underline">
                Rincian
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-3 text-xs text-muted-foreground">
              Buka halaman ini dari detail tagihan agar nominal & nomor invoice ikut tercantum.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Rekening {invoice?.tenantName ?? "Lembaga"}
            </CardTitle>
            <CardDescription className="text-xs">
              Transfer sesuai nominal tagihan ke rekening lembaga berikut:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoice?.bank?.bankAccountNumber ? (
              <div className="p-3 rounded-lg border border-border bg-muted/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">{invoice.bank.bankName || "Bank"}</p>
                  <p className="font-mono text-sm font-bold text-primary">{invoice.bank.bankAccountNumber}</p>
                  <p className="text-[11px] text-muted-foreground">
                    a.n. {invoice.bank.bankAccountHolder || invoice.tenantName || "Lembaga"}
                  </p>
                </div>
                <CopyRekeningButton number={invoice.bank.bankAccountNumber} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Rekening lembaga belum diatur. Hubungi admin lembaga untuk nomor rekening resmi —
                jangan transfer ke rekening mana pun sebelum dikonfirmasi admin.
              </p>
            )}
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
              <li>Kirim bukti transfer + nomor invoice via WhatsApp lembaga (tombol di bawah, pesan sudah terisi) atau chat guru/admin.</li>
              <li>Admin lembaga akan memverifikasi dan menandai tagihan lunas.</li>
            </ol>
          </CardContent>
        </Card>

        <div className="space-y-2 pt-2">
          {wa && (
            <a href={`${wa}?text=${encodeURIComponent(pesanWa)}`} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="hero" className="w-full">
                <MessageCircle className="h-5 w-5 mr-2" aria-hidden /> Konfirmasi via WhatsApp
              </Button>
            </a>
          )}
          {invoice && (
            <Link href={`/parent/invoice/${invoice.id}`} className="w-full block">
              <Button variant="outline" className="w-full">
                Kembali ke Detail Invoice
              </Button>
            </Link>
          )}
          <Link href="/parent/billing" className="w-full block">
            <Button variant={invoice ? "outline" : "default"} className="w-full">
              Lihat Tagihan
            </Button>
          </Link>
          <Link href="/parent/chat" className="w-full block">
            <Button variant="ghost" className="w-full text-xs text-muted-foreground">
              Konfirmasi via Chat Guru/Admin
            </Button>
          </Link>
        </div>
      </main>

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
