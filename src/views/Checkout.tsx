"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Building2,
  CreditCard,
  Lock,
  QrCode,
  Loader2,
  ArrowRight,
  User,
  Mail,
  Phone,
  Calendar,
  Layers,
  Zap,
} from "lucide-react";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan,
} from "@/lib/subscriptionPlans";
import {
  createSubscriptionCheckoutOrder,
} from "@/server/actions/checkout";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CheckoutView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const planParam = (searchParams.get("plan")?.toLowerCase() || "pro") as "basic" | "pro" | "enterprise";
  const [selectedPlanId, setSelectedPlanId] = useState<"basic" | "pro" | "enterprise">(
    SUBSCRIPTION_PLANS[planParam] ? planParam : "pro"
  );
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const [form, setForm] = useState({
    institutionName: "",
    institutionType: "daycare" as "daycare" | "preschool" | "bimbel",
    adminName: "",
    email: "",
    phone: "",
    password: "",
  });

  const selectedPlan: SubscriptionPlan =
    SUBSCRIPTION_PLANS[selectedPlanId] || SUBSCRIPTION_PLANS.pro;

  const priceAmount =
    billingCycle === "yearly" ? selectedPlan.priceYearly : selectedPlan.priceMonthly;

  const handlePlanSelect = (id: "basic" | "pro" | "enterprise") => {
    setSelectedPlanId(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.institutionName.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama lembaga daycare/bimbel wajib diisi",
        variant: "destructive",
      });
      return;
    }
    if (!form.adminName.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama penanggung jawab wajib diisi",
        variant: "destructive",
      });
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      toast({
        title: "Validasi Gagal",
        description: "Alamat email tidak valid",
        variant: "destructive",
      });
      return;
    }
    if (!form.phone.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nomor WhatsApp aktif wajib diisi",
        variant: "destructive",
      });
      return;
    }
    if (!form.password || form.password.length < 8) {
      toast({
        title: "Validasi Gagal",
        description: "Password minimal 8 karakter untuk keamanan akun admin Anda",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await createSubscriptionCheckoutOrder({
          planId: selectedPlanId,
          billingCycle,
          institutionName: form.institutionName.trim(),
          institutionType: form.institutionType,
          adminName: form.adminName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        });

        if (result.checkoutUrl) {
          toast({
            title: "Menghubungkan ke PayCore...",
            description: "Anda akan dialihkan ke halaman pembayaran resmi.",
          });
          // Redirect langsung ke halaman checkout gateway PayCore
          window.location.href = result.checkoutUrl;
          return;
        }

        // Mode pembayaran / fallback
        toast({
          title: "Pendaftaran Berhasil Disiapkan ✓",
          description: `Order ${result.externalOrderId} berhasil dibuat. Silakan login ke portal admin.`,
        });
        router.push("/admin/login");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses order.";
        toast({
          title: "Gagal Memproses Checkout",
          description: msg,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background py-1.5 px-3 rounded-full border border-border shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enkripsi 256-Bit SSL • Pembayaran Aman PayCore</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Checkout Berlangganan
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Langkah Terakhir Mengaktifkan <span className="text-primary">MAJIKU</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            Lengkapi data lembaga Anda untuk mengaktifkan portal admin, portal guru, dan portal orang tua secara otomatis.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Pendaftaran & Payment Method */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Pilihan Paket */}
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      1. Pilih Paket Layanan
                    </CardTitle>
                    {/* Toggle Cycle */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-3 py-1 rounded-md transition-all ${
                          billingCycle === "monthly"
                            ? "bg-background text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Bulanan
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("yearly")}
                        className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                          billingCycle === "yearly"
                            ? "bg-background text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>Tahunan</span>
                        <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 py-0 px-1">
                          Hemat 20%
                        </Badge>
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(SUBSCRIPTION_PLANS) as Array<"basic" | "pro" | "enterprise">).map(
                      (key) => {
                        const p = SUBSCRIPTION_PLANS[key];
                        const isSelected = selectedPlanId === key;
                        const price = billingCycle === "yearly" ? p.priceYearly : p.priceMonthly;
                        return (
                          <div
                            key={key}
                            onClick={() => handlePlanSelect(key)}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-xs"
                                : "border-border hover:border-border/80 bg-background"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm text-foreground">{p.name}</span>
                              {p.popular && (
                                <Badge className="text-[9px] px-1 py-0 bg-primary text-primary-foreground">
                                  Populer
                                </Badge>
                              )}
                            </div>
                            <p className="text-base font-extrabold text-foreground mt-1">
                              {formatCurrency(price)}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {billingCycle === "yearly" ? "per tahun" : "per bulan"}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Data Lembaga & Akun Admin */}
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    2. Data Lembaga & Admin Pengelola
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Kredensial ini akan menjadi login utama Anda di portal admin.majiku.web.id
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="institutionName" className="text-xs">
                        Nama Daycare / Bimbel <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="institutionName"
                          placeholder="Contoh: Daycare Bintang Kecil"
                          className="pl-9"
                          value={form.institutionName}
                          onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="institutionType" className="text-xs">
                        Jenis Lembaga
                      </Label>
                      <select
                        id="institutionType"
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                        value={form.institutionType}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            institutionType: e.target.value as "daycare" | "preschool" | "bimbel",
                          })
                        }
                      >
                        <option value="daycare">Daycare (Penitipan Anak)</option>
                        <option value="preschool">TK / PAUD / Preschool</option>
                        <option value="bimbel">Bimbingan Belajar / Kursus</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="adminName" className="text-xs">
                        Nama Pemilik / Admin <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="adminName"
                          placeholder="Contoh: Ibu Ratna Sari"
                          className="pl-9"
                          value={form.adminName}
                          onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs">
                        No. WhatsApp / HP <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Contoh: 08123456789"
                          className="pl-9"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">
                        Email Login Admin <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@daycare.com"
                          className="pl-9"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs">
                        Buat Password Akun <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Minimal 8 karakter"
                          className="pl-9"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Pilihan Gateway PayCore */}
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    3. Metode Pembayaran Resmi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">
                          PayCore Payment Gateway (Instan & Otomatis)
                        </span>
                        <Badge className="bg-emerald-600 text-white text-[10px]">
                          Terverifikasi Otomatis
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Mendukung pembayaran instan melalui <strong>QRIS</strong> (GoPay, OVO, Dana, ShopeePay, BCA Mobile) dan <strong>Virtual Account Bank</strong> (BCA, Mandiri, BRI, BNI, Permata). Akun langsung aktif seketika setelah pembayaran berhasil.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Order Summary & Action */}
            <div className="lg:col-span-5 space-y-6 sticky top-8">
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4 border-b border-border">
                  <CardTitle className="text-base">Ringkasan Berlangganan</CardTitle>
                  <CardDescription className="text-xs">
                    Rincian investasi untuk operasional lembaga Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground text-sm">{selectedPlan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Siklus: {billingCycle === "yearly" ? "1 Tahun (Tahunan)" : "1 Bulan (Bulanan)"}
                      </p>
                    </div>
                    <p className="font-bold text-foreground text-sm">
                      {formatCurrency(priceAmount)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCurrency(priceAmount)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Biaya Setup & Onboarding</span>
                      <span className="text-emerald-600 font-semibold">GRATIS</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>PPN (Sudah Termasuk)</span>
                      <span>Rp 0</span>
                    </div>
                    <div className="pt-3 border-t border-border flex justify-between items-center text-sm">
                      <span className="font-bold text-foreground">Total Pembayaran</span>
                      <span className="font-extrabold text-xl text-primary">
                        {formatCurrency(priceAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Benefit highlights */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      Fitur Termasuk di {selectedPlan.name}:
                    </p>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {selectedPlan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full text-base h-13 shadow-md gap-2"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Menghubungkan ke PayCore...</span>
                        </>
                      ) : (
                        <>
                          <span>Bayar Sekarang dengan PayCore</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                    <p className="text-[11px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" />
                      Garansi uang kembali 14 hari tanpa syarat.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
