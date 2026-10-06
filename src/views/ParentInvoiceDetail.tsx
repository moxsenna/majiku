"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Home,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  User,
  QrCode,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { downloadInvoicePDF } from "@/lib/invoiceExport";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { PaymentModal } from "@/components/payment/PaymentModal";
import {
  createInvoicePaymentOrder,
  type ParentInvoiceDetail as ParentInvoiceDetailType,
} from "@/server/actions/payments";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const statusConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  paid: { icon: CheckCircle2, label: "Lunas", color: "text-green-600", bg: "bg-green-50" },
  unpaid: { icon: Clock, label: "Belum Dibayar", color: "text-amber-600", bg: "bg-amber-50" },
  overdue: { icon: AlertCircle, label: "Jatuh Tempo", color: "text-red-600", bg: "bg-red-50" },
  partial: { icon: Clock, label: "Sebagian", color: "text-blue-600", bg: "bg-blue-50" },
};

interface Props {
  invoice: ParentInvoiceDetailType;
  paymentsEnabled: boolean;
}

export default function ParentInvoiceDetail({ invoice, paymentsEnabled }: Props) {
  const [isPaying, setIsPaying] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{
    open: boolean;
    checkoutUrl?: string | null;
    qrString?: string | null;
  } | null>(null);
  const config = statusConfig[invoice.status] || statusConfig.unpaid;
  const StatusIcon = config.icon;

  const schoolName = "MAJIKU Daycare & Preschool";
  const schoolAddress = "Jl. Pendidikan No. 123, Jakarta Selatan";
  const schoolPhone = "(021) 1234-5678";

  const periodLabel =
    invoice.billingPeriodStart && invoice.billingPeriodEnd
      ? `${format(new Date(invoice.billingPeriodStart), "d MMM yyyy", { locale: idLocale })} - ${format(new Date(invoice.billingPeriodEnd), "d MMM yyyy", { locale: idLocale })}`
      : "Periode SPP";

  const handleDownload = () => {
    const exportInvoice = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      parentName: invoice.parentName || "Orang Tua",
      studentName: invoice.studentName,
      className: invoice.className || "Kelas Siswa",
      period: periodLabel,
      items: [{ description: `SPP Bulanan - ${invoice.studentName}`, amount: invoice.amount }],
      subtotal: invoice.amount,
      discount: invoice.discount,
      total: invoice.total,
      amount: invoice.total,
      dueDate: invoice.dueDate
        ? format(new Date(invoice.dueDate), "d MMMM yyyy", { locale: idLocale })
        : "-",
      status: (invoice.status === "paid" ? "paid" : "unpaid") as "paid" | "unpaid" | "overdue",
      paidDate: invoice.paidAt
        ? format(new Date(invoice.paidAt), "d MMMM yyyy", { locale: idLocale })
        : undefined,
      schoolName,
      schoolAddress,
      schoolPhone,
    };
    downloadInvoicePDF(exportInvoice);
    toast.success("Invoice siap untuk diprint/download");
  };

  const handlePrint = () => {
    handleDownload();
  };

  const handlePayOnline = async () => {
    if (!paymentsEnabled) {
      toast.error("Pembayaran online belum aktif. Gunakan transfer bank manual.");
      return;
    }
    setIsPaying(true);
    try {
      const result = await createInvoicePaymentOrder(invoice.id);
      setPaymentModalData({
        open: true,
        checkoutUrl: result.checkoutUrl,
        qrString: result.qrString,
      });
    } catch (e: any) {
      toast.error(e.message || "Gagal menghubungkan ke payment gateway");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {paymentModalData && (
        <PaymentModal
          open={paymentModalData.open}
          onOpenChange={(open) =>
            setPaymentModalData((prev) => (prev ? { ...prev, open } : null))
          }
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          amount={invoice.total}
          checkoutUrl={paymentModalData.checkoutUrl}
          qrString={paymentModalData.qrString}
        />
      )}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border print:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link href="/parent/billing">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-lg">Detail Invoice</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" onClick={handleDownload} title="Download PDF">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={handlePrint} title="Print Invoice">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Invoice Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">{schoolName}</h2>
                <p className="text-xs text-primary-foreground/80">{schoolAddress}</p>
                <p className="text-xs text-primary-foreground/80">{schoolPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-primary-foreground/80">Nomor Invoice</p>
                <p className="font-bold text-base">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className={`p-3 ${config.bg} flex items-center justify-center gap-2 text-sm`}>
            <StatusIcon className={`w-4 h-4 ${config.color}`} />
            <span className={`font-medium ${config.color}`}>{config.label}</span>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Billing Info */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Kepada</p>
                <p className="font-semibold">{invoice.parentName || "Orang Tua Siswa"}</p>
                <p className="text-xs text-muted-foreground">Orang Tua dari {invoice.studentName}</p>
                {invoice.parentPhone && (
                  <p className="text-xs text-muted-foreground">{invoice.parentPhone}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Detail Siswa</p>
                <p><span className="text-muted-foreground">Siswa:</span> {invoice.studentName}</p>
                <p><span className="text-muted-foreground">Kelas:</span> {invoice.className || "-"}</p>
                <p><span className="text-muted-foreground">Periode:</span> {periodLabel}</p>
              </div>
            </div>

            <Separator />

            {/* Items Table */}
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs text-muted-foreground uppercase">Deskripsi</th>
                    <th className="text-right py-2 text-xs text-muted-foreground uppercase">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-3">SPP Bulanan ({invoice.studentName})</td>
                    <td className="py-3 text-right">{formatCurrency(invoice.amount)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-2 text-muted-foreground">Subtotal</td>
                    <td className="py-2 text-right">{formatCurrency(invoice.amount)}</td>
                  </tr>
                  {invoice.discount > 0 && (
                    <tr className="text-green-600">
                      <td className="py-2">Potongan / Diskon</td>
                      <td className="py-2 text-right">-{formatCurrency(invoice.discount)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-border font-bold">
                    <td className="py-3 text-base">Total Tagihan</td>
                    <td className="py-3 text-right text-lg text-primary">
                      {formatCurrency(invoice.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Due Date & Paid Date */}
            <div
              className={`p-4 rounded-xl ${
                invoice.status === "paid"
                  ? "bg-success/10 text-success"
                  : invoice.status === "overdue"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {invoice.status === "paid" ? "Tanggal Pembayaran" : "Jatuh Tempo"}
                </span>
                <span className="font-semibold">
                  {invoice.status === "paid"
                    ? invoice.paidAt
                      ? format(new Date(invoice.paidAt), "d MMMM yyyy, HH:mm", { locale: idLocale })
                      : "Lunas"
                    : invoice.dueDate
                    ? format(new Date(invoice.dueDate), "d MMMM yyyy", { locale: idLocale })
                    : "-"}
                </span>
              </div>
            </div>

            {/* Online Payment Attempts (if any) */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Riwayat Percobaan Pembayaran Online (PayCore)
                </p>
                <div className="space-y-1.5 text-xs">
                  {invoice.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-mono text-[11px] font-medium">{p.paycoreOrderId || "Menunggu Order"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {p.createdAt ? format(new Date(p.createdAt), "d MMM yyyy, HH:mm", { locale: idLocale }) : "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={p.paymentStatus === "paid" ? "success" : p.paymentStatus === "pending" ? "warning" : "destructive"}
                          className="text-[10px]"
                        >
                          {p.paymentStatus}
                        </Badge>
                        {p.paymentStatus === "pending" && p.checkoutUrl && (
                          <a href={p.checkoutUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                              Lanjut <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {invoice.status !== "paid" && (
              <div className="space-y-2 print:hidden pt-2">
                <Button
                  variant="hero"
                  className="w-full h-11"
                  size="lg"
                  disabled={isPaying || !paymentsEnabled}
                  onClick={handlePayOnline}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menghubungkan ke PayCore...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" /> Bayar Online Sekarang (QRIS / VA)
                    </>
                  )}
                </Button>
                {!paymentsEnabled && (
                  <p className="text-[11px] text-muted-foreground text-center">
                    * Pembayaran online sedang disiapkan (menunggu aktivasi gateway PayCore).
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Link href="/parent/payment" className="w-full">
                    <Button variant="outline" className="w-full text-xs">
                      Konfirmasi Transfer Manual
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-muted/30 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Terima kasih telah mempercayakan pendidikan putra/putri Anda kepada {schoolName}
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 print:hidden">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <Link href="/parent" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <Home className="h-5 w-5" />
            <span className="text-[11px]">Beranda</span>
          </Link>
          <Link href="/parent/catalog" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[11px]">Katalog</span>
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
