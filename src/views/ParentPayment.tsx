"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Upload,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  Copy,
  Clock,
  AlertCircle,
  Home,
  ShoppingBag,
  MessageCircle,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const invoiceData = {
  id: "INV-2024-012",
  month: "Desember 2024",
  amount: 2500000,
  dueDate: "10 Desember 2024",
  items: [
    { name: "SPP Bulanan", amount: 2000000 },
    { name: "Makan Siang", amount: 300000 },
    { name: "Kegiatan Ekstrakurikuler", amount: 200000 },
  ],
};

const bankAccounts = [
  { bank: "BCA", name: "MAJIKU DAYCARE", number: "123-456-7890", logo: "🏦" },
  { bank: "Mandiri", name: "MAJIKU DAYCARE", number: "987-654-3210", logo: "🏛️" },
  { bank: "BNI", name: "MAJIKU DAYCARE", number: "555-888-9999", logo: "🏢" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ParentPayment() {
  const router = useRouter();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/-/g, ""));
    toast({
      title: "Disalin!",
      description: "Nomor rekening berhasil disalin",
    });
  };

  const handleSubmit = async () => {
    if (!paymentMethod) {
      toast({
        title: "Pilih Metode Pembayaran",
        description: "Silakan pilih metode pembayaran terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "transfer" && !selectedBank) {
      toast({
        title: "Pilih Bank",
        description: "Silakan pilih bank tujuan transfer",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    toast({
      title: "Pembayaran Berhasil Dikirim!",
      description: "Admin akan memverifikasi pembayaran Anda dalam 1x24 jam",
    });

    router.push("/parent/billing");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/parent/billing">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">Pembayaran</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        {/* Invoice Summary */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">{invoiceData.id}</p>
                <p className="font-bold text-lg">{invoiceData.month}</p>
              </div>
              <Badge variant="warning" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Belum Lunas
              </Badge>
            </div>
            
            <div className="space-y-2 mb-3">
              {invoiceData.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="font-semibold">Total Tagihan</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(invoiceData.amount)}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-warning">
              <AlertCircle className="h-4 w-4" />
              <span>Jatuh tempo: {invoiceData.dueDate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pilih Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => setPaymentMethod("transfer")}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                paymentMethod === "transfer"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Transfer Bank</p>
                <p className="text-xs text-muted-foreground">
                  BCA, Mandiri, BNI
                </p>
              </div>
              {paymentMethod === "transfer" && (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              )}
            </button>

            <button
              onClick={() => setPaymentMethod("ewallet")}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                paymentMethod === "ewallet"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">E-Wallet / QRIS</p>
                <p className="text-xs text-muted-foreground">
                  GoPay, OVO, DANA, ShopeePay
                </p>
              </div>
              {paymentMethod === "ewallet" && (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              )}
            </button>
          </CardContent>
        </Card>

        {/* Bank Selection (if transfer selected) */}
        {paymentMethod === "transfer" && (
          <Card className="animate-scale-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pilih Bank Tujuan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bankAccounts.map((bank) => (
                <button
                  key={bank.bank}
                  onClick={() => setSelectedBank(bank.bank)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedBank === bank.bank
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{bank.logo}</span>
                      <div className="text-left">
                        <p className="font-semibold">{bank.bank}</p>
                        <p className="text-xs text-muted-foreground">{bank.name}</p>
                      </div>
                    </div>
                    {selectedBank === bank.bank && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  {selectedBank === bank.bank && (
                    <div className="mt-3 p-3 bg-muted rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">No. Rekening</p>
                        <p className="font-mono font-bold text-lg">{bank.number}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(bank.number);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Salin
                      </Button>
                    </div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* QRIS (if ewallet selected) */}
        {paymentMethod === "ewallet" && (
          <Card className="animate-scale-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Scan QRIS</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center mb-4">
                <div className="text-center">
                  <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">QRIS Code</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan QR code di atas menggunakan aplikasi e-wallet favorit Anda
              </p>
            </CardContent>
          </Card>
        )}

        {/* Upload Bukti Transfer */}
        {paymentMethod && (
          <Card className="animate-scale-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upload Bukti Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium">{uploadedFile}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Klik untuk upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG atau PDF (max 5MB)
                    </p>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadedFile(file.name);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Tambahkan catatan jika diperlukan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        {paymentMethod && (
          <Button
            variant="hero"
            className="w-full h-12 text-base animate-slide-up"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Konfirmasi Pembayaran
              </>
            )}
          </Button>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <Link href="/parent" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <Home className="h-6 w-6" />
            <span className="text-xs">Beranda</span>
          </Link>
          <Link href="/parent/marketplace" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs">Marketplace</span>
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
