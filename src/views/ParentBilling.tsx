import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
  Home,
  ShoppingBag,
  MessageCircle,
  User,
  Eye,
} from "lucide-react";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";

const invoices = [
  {
    id: "1",
    month: "Desember 2024",
    amount: 2500000,
    dueDate: "10 Des 2024",
    status: "unpaid" as "paid" | "unpaid" | "overdue",
  },
  {
    id: "2",
    month: "November 2024",
    amount: 2500000,
    dueDate: "10 Nov 2024",
    status: "paid" as "paid" | "unpaid" | "overdue",
    paidDate: "8 Nov 2024",
  },
  {
    id: "3",
    month: "Oktober 2024",
    amount: 2500000,
    dueDate: "10 Okt 2024",
    status: "paid" as "paid" | "unpaid" | "overdue",
    paidDate: "5 Okt 2024",
  },
];

const invoiceDetail = {
  id: "1",
  invoiceNumber: "INV-2024-012",
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
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ParentBilling() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(invoiceDetail);

  const handleViewInvoice = () => {
    setModalOpen(true);
  };

  return (
    <>
      <InvoiceModal invoice={selectedInvoice} open={modalOpen} onOpenChange={setModalOpen} />
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="flex items-center gap-3 px-4 h-14">
            <Link to="/parent">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-lg">Tagihan & Pembayaran</h1>
          </div>
        </header>

        <main className="p-4 max-w-lg mx-auto space-y-4">
          {/* Current Bill */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tagihan Aktif</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(2500000)}</p>
                </div>
                <Badge variant="warning">Belum Dibayar</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>Jatuh tempo: 10 Desember 2024</span>
              </div>
              <Button variant="hero" className="w-full" onClick={handleViewInvoice}>
                Lihat Invoice
              </Button>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Riwayat Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoices.map((invoice, index) => (
                <div
                  key={invoice.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== invoices.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {invoice.status === "paid" ? (
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-warning" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{invoice.month}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.status === "paid"
                          ? `Dibayar: ${invoice.paidDate}`
                          : `Jatuh tempo: ${invoice.dueDate}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(invoice.amount)}</p>
                      <Badge variant={invoice.status === "paid" ? "success" : "warning"} className="text-xs">
                        {invoice.status === "paid" ? "Lunas" : "Belum Bayar"}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={handleViewInvoice}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Transfer Bank BCA", account: "123-456-7890" },
                { name: "Transfer Bank Mandiri", account: "987-654-3210" },
                { name: "QRIS / E-Wallet", account: "Scan QR di sekolah" },
              ].map((method, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium text-sm">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.account}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
          <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
            <Link to="/parent" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
              <Home className="h-6 w-6" />
              <span className="text-xs">Beranda</span>
            </Link>
            <Link to="/parent/catalog" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
              <ShoppingBag className="h-6 w-6" />
              <span className="text-xs">Katalog</span>
            </Link>
            <button className="flex flex-col items-center gap-1 p-2 text-primary">
              <CreditCard className="h-6 w-6" />
              <span className="text-xs">Tagihan</span>
            </button>
            <Link to="/parent/chat" className="flex flex-col items-center gap-1 p-2 text-muted-foreground relative">
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs">Chat</span>
            </Link>
            <Link to="/parent/profile" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
              <User className="h-6 w-6" />
              <span className="text-xs">Profil</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
