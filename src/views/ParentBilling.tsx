"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  BadgeCheck,
  ChevronRight,
  CircleAlert,
  Clock3,
  Loader2,
  QrCode,
  ReceiptText,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { MobileGroupTitle, MobileSubHeader } from "@/components/bunayo";
import { createInvoicePaymentOrder, type ParentInvoiceSummary } from "@/server/actions/payments";

function judulPeriode(inv: ParentInvoiceSummary): string {
  if (inv.billingPeriodStart) {
    const d = new Date(inv.billingPeriodStart);
    if (!isNaN(d.getTime())) return `SPP ${format(d, "MMMM yyyy", { locale: idLocale })}`;
  }
  const m = inv.invoiceNumber?.match(/INV-(\d{4})(\d{2})-/);
  if (m) return `SPP ${format(new Date(Number(m[1]), Number(m[2]) - 1, 1), "MMMM yyyy", { locale: idLocale })}`;
  return "Tagihan SPP";
}

const STATUS: Record<"paid" | "unpaid" | "overdue", { label: string; icon: LucideIcon; cls: string }> = {
  paid: { label: "Lunas", icon: BadgeCheck, cls: "text-daun-ink" },
  unpaid: { label: "Belum bayar", icon: Clock3, cls: "text-matahari-ink" },
  overdue: { label: "Jatuh tempo", icon: CircleAlert, cls: "text-destructive" },
};

interface ParentBillingProps {
  invoices: ParentInvoiceSummary[];
  paymentsEnabled: boolean;
}

export default function ParentBilling({ invoices = [], paymentsEnabled = false }: ParentBillingProps) {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPayingId, setIsPayingId] = useState<string | null>(null);
  const [filterAnak, setFilterAnak] = useState<string>("all");
  const [paymentModalData, setPaymentModalData] = useState<{
    open: boolean;
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    checkoutUrl?: string | null;
    qrString?: string | null;
  } | null>(null);

  const anakNames = useMemo(
    () => Array.from(new Set(invoices.map((i) => i.studentName).filter(Boolean))),
    [invoices],
  );
  const invoicesTampil = useMemo(
    () => (filterAnak === "all" ? invoices : invoices.filter((i) => i.studentName === filterAnak)),
    [invoices, filterAnak],
  );
  const aktif = invoicesTampil.find((i) => i.status === "unpaid" || i.status === "overdue") ?? null;

  const mapToInvoiceData = (inv: ParentInvoiceSummary) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    parentName: "Orang Tua Siswa",
    studentName: inv.studentName,
    className: "",
    packageName: "SPP Bulanan",
    period:
      inv.billingPeriodStart && inv.billingPeriodEnd
        ? `${format(new Date(inv.billingPeriodStart), "d MMM yyyy", { locale: idLocale })} – ${format(new Date(inv.billingPeriodEnd), "d MMM yyyy", { locale: idLocale })}`
        : "Periode SPP",
    items: [
      { description: `SPP Bulanan – ${inv.studentName}`, amount: inv.amount },
      ...(inv.discount > 0 ? [{ description: "Potongan", amount: -inv.discount }] : []),
    ],
    subtotal: inv.amount,
    discount: inv.discount,
    total: inv.total,
    amount: inv.total,
    dueDate: inv.dueDate ? format(new Date(inv.dueDate), "d MMMM yyyy", { locale: idLocale }) : "-",
    status: (inv.status === "paid" ? "paid" : inv.status === "overdue" ? "overdue" : "unpaid") as
      | "paid"
      | "unpaid"
      | "overdue",
    paidDate: inv.paidAt ? format(new Date(inv.paidAt), "d MMMM yyyy", { locale: idLocale }) : undefined,
    // Nama/alamat lembaga belum ada di ringkasan tagihan; jangan isi alamat & telepon karangan.
    schoolName: "Bunayo",
  });

  const bayarOnline = async (invoiceId: string, inv?: ParentInvoiceSummary) => {
    if (!paymentsEnabled) {
      toast({ title: "Pembayaran online belum aktif", description: "Minta admin lembaga mengaktifkan PayCore.", variant: "destructive" });
      return;
    }
    const target = inv ?? invoices.find((i) => i.id === invoiceId);
    setIsPayingId(invoiceId);
    try {
      const result = await createInvoicePaymentOrder(invoiceId);
      setPaymentModalData({
        open: true,
        invoiceId,
        invoiceNumber: target?.invoiceNumber || "INV",
        amount: target?.total || 0,
        checkoutUrl: result.checkoutUrl,
        qrString: result.qrString,
      });
    } catch (e: any) {
      const isDemo = e.message?.includes("Demo");
      toast({
        title: isDemo ? "Mode simulasi demo" : "Gagal membuat pembayaran",
        description: e.message || "Terjadi kesalahan saat menghubungi payment gateway.",
        variant: isDemo ? "default" : "destructive",
      });
    } finally {
      setIsPayingId(null);
    }
  };

  return (
    <>
      {paymentModalData && (
        <PaymentModal
          open={paymentModalData.open}
          onOpenChange={(open) => setPaymentModalData((prev) => (prev ? { ...prev, open } : null))}
          invoiceId={paymentModalData.invoiceId}
          invoiceNumber={paymentModalData.invoiceNumber}
          amount={paymentModalData.amount}
          checkoutUrl={paymentModalData.checkoutUrl}
          qrString={paymentModalData.qrString}
        />
      )}
      {selectedInvoice && (
        <InvoiceModal invoice={selectedInvoice} open={modalOpen} onOpenChange={setModalOpen} />
      )}

      <MobileSubHeader title="Tagihan" backHref="/parent" />

      <div className="flex flex-col gap-4 px-4 pb-4">
        {aktif ? (
          <section className="rise field-ink relative flex flex-col gap-1 overflow-hidden rounded-[28px] bg-langit p-5">
            <span className="field-sub text-sm font-semibold">
              {aktif.studentName} · {judulPeriode(aktif)}
            </span>
            <p className="tabular font-display text-[36px] font-extrabold leading-none tracking-[-0.02em]">
              {formatRupiah(aktif.total)}
            </p>
            <span className="field-sub flex items-center gap-1.5 text-sm">
              <Clock3 className="h-4 w-4" aria-hidden /> Jatuh tempo {formatTanggal(aktif.dueDate, { tanpaTahun: new Date(aktif.dueDate ?? Date.now()).getFullYear() === new Date().getFullYear() })}
            </span>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <button
                type="button"
                disabled={isPayingId === aktif.id || !paymentsEnabled}
                onClick={() => bayarOnline(aktif.id)}
                className="press grid h-btn-lg place-items-center rounded-full bg-[hsl(249_26%_14%)] text-base font-semibold text-[hsl(40_60%_96%)] disabled:opacity-60"
              >
                {isPayingId === aktif.id ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Menghubungkan…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <QrCode className="h-5 w-5" aria-hidden /> Bayar online (QRIS/VA)
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedInvoice(mapToInvoiceData(aktif));
                  setModalOpen(true);
                }}
                className="press grid h-btn place-items-center rounded-full bg-[hsl(0_0%_100%/.6)] text-[15px] font-semibold"
              >
                Lihat rincian
              </button>
            </div>
            {!paymentsEnabled && (
              <p className="field-sub mt-1 text-[13px]">
                Pembayaran online sedang disiapkan lembaga. Nomor rekening resmi akan diberikan lembaga lewat Pesan.
              </p>
            )}
          </section>
        ) : (
          <section className="rise flex items-center gap-3 rounded-sheet bg-card p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-daun-soft text-daun-ink">
              <BadgeCheck className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-[15px] font-semibold">Semua tagihan lunas</p>
              <p className="text-sm text-foreground-2">Tidak ada kewajiban SPP yang menunggu. Terima kasih!</p>
            </div>
          </section>
        )}

        {anakNames.length > 1 && (
          <div role="tablist" aria-label="Filter anak" className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            {["all", ...anakNames].map((n) => {
              const on = filterAnak === n;
              return (
                <button
                  key={n}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setFilterAnak(n)}
                  className={cn(
                    "h-8 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                    on ? "bg-nav-active text-nav-active-foreground" : "bg-card text-muted-foreground",
                  )}
                >
                  {n === "all" ? "Semua" : n.split(" ")[0]}
                </button>
              );
            })}
          </div>
        )}

        <section className="flex flex-col gap-2" aria-labelledby="riwayat-judul">
          <MobileGroupTitle>
            <span id="riwayat-judul">Semua tagihan</span>
          </MobileGroupTitle>
          {invoicesTampil.length === 0 ? (
            <p className="rounded-sheet bg-card p-5 text-sm text-foreground-2">Belum ada tagihan yang diterbitkan lembaga.</p>
          ) : (
            <ul className="overflow-hidden rounded-sheet bg-card">
              {invoicesTampil.map((inv) => {
                const st = STATUS[(inv.status === "paid" ? "paid" : inv.status === "overdue" ? "overdue" : "unpaid")];
                const Icon = st.icon;
                const bisaBayar = inv.status !== "paid" && paymentsEnabled;
                return (
                  <li key={inv.id} className="border-b border-border-subtle last:border-b-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInvoice(mapToInvoiceData(inv));
                        setModalOpen(true);
                      }}
                      className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted"
                    >
                      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted", st.cls)}>
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <b className="block truncate text-[15px] font-semibold">{judulPeriode(inv)}</b>
                          <b className="tabular shrink-0 text-[15px]">{formatRupiah(inv.total)}</b>
                        </span>
                        <span className="flex items-center justify-between gap-2">
                          <span className="tabular block truncate text-[13px] text-muted-foreground">
                            {inv.studentName.split(" ")[0]} ·{" "}
                            {inv.status === "paid"
                              ? inv.paidAt
                                ? `Lunas ${format(new Date(inv.paidAt), "d MMM yyyy", { locale: idLocale })}`
                                : "Lunas"
                              : `Tempo ${inv.dueDate ? format(new Date(inv.dueDate), new Date(inv.dueDate).getFullYear() === new Date().getFullYear() ? "d MMM" : "d MMM yy", { locale: idLocale }) : "-"}`}
                          </span>
                          <small className={cn("shrink-0 text-[13px] font-semibold", st.cls)}>{st.label}</small>
                        </span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="flex items-start gap-3 rounded-sheet bg-muted p-4">
          <ReceiptText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Pembayaran online memakai QRIS & Virtual Account (PayCore/Duitku) dan terverifikasi otomatis. Untuk transfer manual, minta
            nomor rekening resmi lembaga melalui menu Pesan.
          </p>
        </section>
      </div>
    </>
  );
}
