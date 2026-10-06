"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Home,
  ShoppingBag,
  MessageCircle,
  User,
  Eye,
  Loader2,
  QrCode,
  FileText,
} from "lucide-react";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  createInvoicePaymentOrder,
  type ParentInvoiceSummary,
} from "@/server/actions/payments";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

interface ParentBillingProps {
  invoices: ParentInvoiceSummary[];
  paymentsEnabled: boolean;
}

export default function ParentBilling({
  invoices = [],
  paymentsEnabled = false,
}: ParentBillingProps) {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPayingId, setIsPayingId] = useState<string | null>(null);

  const activeInvoice = useMemo(() => {
    return invoices.find((inv) => inv.status === "unpaid" || inv.status === "overdue") || null;
  }, [invoices]);

  const mapToInvoiceData = (inv: ParentInvoiceSummary) => {
    const period =
      inv.billingPeriodStart && inv.billingPeriodEnd
        ? `${format(new Date(inv.billingPeriodStart), "d MMM yyyy", { locale: idLocale })} - ${format(new Date(inv.billingPeriodEnd), "d MMM yyyy", { locale: idLocale })}`
        : "Periode SPP";

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      parentName: "Orang Tua Siswa",
      studentName: inv.studentName,
      className: "Kelas Siswa",
      packageName: "SPP Bulanan",
      period,
      items: [
        { description: `SPP Bulanan - ${inv.studentName}`, amount: inv.amount },
        ...(inv.discount > 0 ? [{ description: "Potongan / Diskon", amount: -inv.discount }] : []),
      ],
      subtotal: inv.amount,
      discount: inv.discount,
      total: inv.total,
      amount: inv.total,
      dueDate: inv.dueDate
        ? format(new Date(inv.dueDate), "d MMMM yyyy", { locale: idLocale })
        : "-",
      status: (inv.status === "paid"
        ? "paid"
        : inv.status === "overdue"
        ? "overdue"
        : "unpaid") as "paid" | "unpaid" | "overdue",
      paidDate: inv.paidAt
        ? format(new Date(inv.paidAt), "d MMMM yyyy", { locale: idLocale })
        : undefined,
      schoolName: "MAJIKU Daycare & Preschool",
      schoolAddress: "Jl. Pendidikan No. 123, Jakarta",
      schoolPhone: "(021) 1234-5678",
    };
  };

  const handleViewInvoice = (inv: ParentInvoiceSummary) => {
    setSelectedInvoice(mapToInvoiceData(inv));
    setModalOpen(true);
  };

  const handlePayOnline = async (invoiceId: string) => {
    if (!paymentsEnabled) {
      toast({
        title: "Pembayaran Online Belum Aktif",
        description: "Silakan gunakan metode transfer manual sementara waktu.",
        variant: "destructive",
      });
      return;
    }

    setIsPayingId(invoiceId);
    try {
      const { checkoutUrl } = await createInvoicePaymentOrder(invoiceId);
      window.location.href = checkoutUrl;
    } catch (e: any) {
      toast({
        title: "Gagal Membuat Pembayaran",
        description: e.message || "Terjadi kesalahan saat menghubungi payment gateway",
        variant: "destructive",
      });
      setIsPayingId(null);
    }
  };

  return (
    <>
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="flex items-center gap-3 px-4 h-14">
            <Link href="/parent">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-lg">Tagihan & Pembayaran</h1>
          </div>
        </header>

        <main className="p-4 max-w-lg mx-auto space-y-4">
          {/* Current Bill */}
          {activeInvoice ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Tagihan Aktif</p>
                    <p className="text-sm font-semibold">{activeInvoice.studentName}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {formatCurrency(activeInvoice.total)}
                    </p>
                  </div>
                  <Badge variant={activeInvoice.status === "overdue" ? "destructive" : "warning"}>
                    {activeInvoice.status === "overdue" ? "Jatuh Tempo" : "Belum Bayar"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Jatuh tempo:{" "}
                    {activeInvoice.dueDate
                      ? format(new Date(activeInvoice.dueDate), "d MMMM yyyy", { locale: idLocale })
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="hero"
                    className="flex-1"
                    disabled={isPayingId === activeInvoice.id || !paymentsEnabled}
                    onClick={() => handlePayOnline(activeInvoice.id)}
                  >
                    {isPayingId === activeInvoice.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menghubungkan...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" /> Bayar Online (QRIS/VA)
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleViewInvoice(activeInvoice)}
                  >
                    Detail
                  </Button>
                </div>
                {!paymentsEnabled && (
                  <p className="text-[11px] text-muted-foreground mt-2 text-center">
                    * Pembayaran online sedang disiapkan. Gunakan transfer bank di bawah ini.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Tidak Ada Tagihan Aktif</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Semua kewajiban SPP anak Anda telah lunas. Terima kasih!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Daftar Tagihan</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {invoices.length} tagihan
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoices.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Belum ada data tagihan yang diterbitkan.
                </div>
              ) : (
                invoices.map((invoice, index) => {
                  const isPaid = invoice.status === "paid";
                  const isOverdue = invoice.status === "overdue";
                  return (
                    <div
                      key={invoice.id}
                      className={`flex items-center justify-between p-3.5 ${
                        index !== invoices.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isPaid ? (
                          <div className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          </div>
                        ) : isOverdue ? (
                          <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          </div>
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4 text-warning" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {invoice.studentName} ·{" "}
                            {isPaid
                              ? invoice.paidAt
                                ? `Lunas: ${format(new Date(invoice.paidAt), "d MMM yyyy", { locale: idLocale })}`
                                : "Lunas"
                              : invoice.dueDate
                              ? `Tempo: ${format(new Date(invoice.dueDate), "d MMM yyyy", { locale: idLocale })}`
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatCurrency(invoice.total)}</p>
                          <Badge
                            variant={isPaid ? "success" : isOverdue ? "destructive" : "warning"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {isPaid ? "Lunas" : isOverdue ? "Jatuh Tempo" : "Belum Bayar"}
                          </Badge>
                        </div>
                        {!isPaid && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={isPayingId === invoice.id || !paymentsEnabled}
                            onClick={() => handlePayOnline(invoice.id)}
                          >
                            Bayar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleViewInvoice(invoice)}
                          title="Lihat Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Metode Pembayaran Tersedia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-primary" /> Pembayaran Online (QRIS & Virtual Account)
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Didukung oleh PayCore & Duitku. Verifikasi instan otomatis tanpa perlu upload bukti transfer.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-secondary-foreground" /> Transfer Bank Manual
                </p>
                <p className="text-muted-foreground text-[11px]">
                  BCA: 123-456-7890 (a.n. MAJIKU) · Mandiri: 987-654-3210 (a.n. MAJIKU).
                </p>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
          <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
            <Link href="/parent" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
              <Home className="h-5 w-5" />
              <span className="text-[11px]">Beranda</span>
            </Link>
            <Link href="/parent/catalog" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-[11px]">Katalog</span>
            </Link>
            <button className="flex flex-col items-center gap-1 p-2 text-primary">
              <CreditCard className="h-5 w-5" />
              <span className="text-[11px]">Tagihan</span>
            </button>
            <Link href="/parent/chat" className="flex flex-col items-center gap-1 p-2 text-muted-foreground relative">
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
    </>
  );
}
