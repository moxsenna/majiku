"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Download, Printer, CheckCircle2, Clock, AlertCircle,
  Home, ShoppingBag, CreditCard, MessageCircle, User
} from "lucide-react";
import { downloadInvoicePDF } from "@/lib/invoiceExport";
import { toast } from "sonner";
// Sample invoice data - in real app this would come from database
const invoiceData = {
  id: "1",
  invoiceNumber: "INV-2024-001",
  parentName: "Bpk. Ahmad Wijaya",
  studentName: "Arjuna Wijaya",
  className: "Kelas Bunga Matahari",
  packageName: "Paket Reguler",
  period: "Desember 2024",
  items: [
    { description: "SPP Bulanan", amount: 2000000 },
    { description: "Biaya Kegiatan", amount: 300000 },
    { description: "Biaya Makan", amount: 200000 },
  ],
  subtotal: 2500000,
  discount: 0,
  total: 2500000,
  dueDate: "10 Desember 2024",
  status: "unpaid" as "paid" | "unpaid" | "overdue",
  schoolName: "MAJIKU Daycare & Preschool",
  schoolAddress: "Jl. Pendidikan No. 123, Jakarta Selatan",
  schoolPhone: "(021) 1234-5678",
  bankAccounts: [
    { bank: "BCA", number: "123-456-7890", name: "PT MAJIKU Indonesia" },
    { bank: "Mandiri", number: "987-654-3210", name: "PT MAJIKU Indonesia" },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const statusConfig = {
  paid: { icon: CheckCircle2, label: "Lunas", color: "text-green-600", bg: "bg-green-50" },
  unpaid: { icon: Clock, label: "Belum Dibayar", color: "text-amber-600", bg: "bg-amber-50" },
  overdue: { icon: AlertCircle, label: "Jatuh Tempo", color: "text-red-600", bg: "bg-red-50" },
};

export default function ParentInvoiceDetail() {
  const { id } = useParams();
  const invoice = invoiceData; // In real app, fetch by id
  const config = statusConfig[invoice.status];
  const StatusIcon = config.icon;

  const handleDownload = () => {
    const exportInvoice = {
      ...invoice,
      amount: invoice.total,
    };
    downloadInvoicePDF(exportInvoice);
    toast.success("Invoice siap untuk diprint/download");
  };

  const handlePrint = () => {
    handleDownload();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
            <Button variant="outline" size="icon-sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* Invoice Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{invoice.schoolName}</h2>
                <p className="text-sm text-primary-foreground/80">{invoice.schoolAddress}</p>
                <p className="text-sm text-primary-foreground/80">{invoice.schoolPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-foreground/80">Invoice</p>
                <p className="font-bold text-lg">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className={`p-3 ${config.bg} flex items-center justify-center gap-2`}>
            <StatusIcon className={`w-5 h-5 ${config.color}`} />
            <span className={`font-medium ${config.color}`}>{config.label}</span>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Billing Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Kepada</p>
                <p className="font-semibold">{invoice.parentName}</p>
                <p className="text-sm text-muted-foreground">Orang Tua dari {invoice.studentName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Detail</p>
                <p className="text-sm"><span className="text-muted-foreground">Siswa:</span> {invoice.studentName}</p>
                <p className="text-sm"><span className="text-muted-foreground">Kelas:</span> {invoice.className}</p>
                <p className="text-sm"><span className="text-muted-foreground">Periode:</span> {invoice.period}</p>
              </div>
            </div>

            <Separator />

            {/* Items Table */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs text-muted-foreground uppercase">Deskripsi</th>
                    <th className="text-right py-2 text-xs text-muted-foreground uppercase">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-2 text-muted-foreground">Subtotal</td>
                    <td className="py-2 text-right">{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                  {invoice.discount > 0 && (
                    <tr className="text-green-600">
                      <td className="py-2">Diskon</td>
                      <td className="py-2 text-right">-{formatCurrency(invoice.discount)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-border">
                    <td className="py-3 font-bold text-lg">Total</td>
                    <td className="py-3 text-right font-bold text-lg text-primary">
                      {formatCurrency(invoice.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Due Date */}
            <div className={`p-4 rounded-xl ${invoice.status === "overdue" ? "bg-destructive/10" : "bg-muted/50"}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Jatuh Tempo</span>
                <span className={`font-semibold ${invoice.status === "overdue" ? "text-destructive" : ""}`}>
                  {invoice.dueDate}
                </span>
              </div>
            </div>

            {/* Bank Accounts */}
            {invoice.status !== "paid" && (
              <div className="space-y-3">
                <p className="font-medium text-sm">Metode Pembayaran</p>
                {invoice.bankAccounts.map((account, index) => (
                  <div key={index} className="p-3 rounded-xl bg-muted/50 border border-border">
                    <p className="font-medium text-sm">{account.bank}</p>
                    <p className="text-lg font-mono tracking-wider">{account.number}</p>
                    <p className="text-xs text-muted-foreground">a.n. {account.name}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action Button */}
            {invoice.status !== "paid" && (
              <Link href="/parent/payment" className="block print:hidden">
                <Button variant="hero" className="w-full" size="lg">
                  Bayar Sekarang
                </Button>
              </Link>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-muted/30 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Terima kasih telah mempercayakan pendidikan putra/putri Anda kepada {invoice.schoolName}
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 print:hidden">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <Link href="/parent" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <Home className="h-6 w-6" />
            <span className="text-xs">Beranda</span>
          </Link>
          <Link href="/parent/catalog" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs">Katalog</span>
          </Link>
          <Link href="/parent/billing" className="flex flex-col items-center gap-1 p-2 text-primary">
            <CreditCard className="h-6 w-6" />
            <span className="text-xs">Tagihan</span>
          </Link>
          <Link href="/parent/chat" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs">Chat</span>
          </Link>
          <Link href="/parent/profile" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <User className="h-6 w-6" />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
