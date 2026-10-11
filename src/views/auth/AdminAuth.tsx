"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { GraduationCap, Mail, Lock, Building2, User, Phone, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { registerDaycareAdminAction } from "@/server/actions/authRegistration";

interface AdminAuthProps {
  initialMode?: "login" | "register";
}

export default function AdminAuth({ initialMode = "login" }: AdminAuthProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    institutionName: "",
    institutionType: "daycare",
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast({ title: "Error", description: "Mohon isi email dan password", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      });
      if (error) {
        toast({ title: "Login Gagal", description: error.message || "Email atau password salah", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      toast({ title: "Login Berhasil", description: "Selamat datang di Portal Admin Daycare" });
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast({ title: "Login Gagal", description: err?.message || "Terjadi kesalahan", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.institutionName || !registerForm.email || !registerForm.password || !registerForm.name) {
      toast({ title: "Error", description: "Mohon lengkapi seluruh field wajib", variant: "destructive" });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({ title: "Error", description: "Konfirmasi password tidak cocok", variant: "destructive" });
      return;
    }
    if (!registerForm.agreeTerms) {
      toast({ title: "Error", description: "Anda harus menyetujui Syarat & Ketentuan", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await registerDaycareAdminAction({
        institutionName: registerForm.institutionName,
        institutionType: registerForm.institutionType,
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        city: registerForm.city || undefined,
        password: registerForm.password,
      });

      // Auto login setelah registrasi berhasil
      await authClient.signIn.email({
        email: registerForm.email.trim().toLowerCase(),
        password: registerForm.password,
      });

      toast({ title: "Pendaftaran Lembaga Berhasil! 🎉", description: "Akun daycare Anda telah aktif." });
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast({ title: "Pendaftaran Gagal", description: err?.message || "Terjadi kesalahan", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="font-bold text-2xl tracking-tight">MAJIKU</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Portal Admin Lembaga & Daycare</p>
        </div>

        <Card className="shadow-xl border-border/60">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="pt-6 px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Masuk Admin</TabsTrigger>
                <TabsTrigger value="register">Daftar Lembaga</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="pt-4">
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email Admin</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@daycare.com"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setIsForgotOpen(true)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Lupa password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={isLoading}>
                    {isLoading ? "Memproses..." : "Masuk ke Dashboard Daycare"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="inst-name">Nama Lembaga / Daycare *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="inst-name"
                        placeholder="Daycare Ceria Bunda"
                        className="pl-10"
                        value={registerForm.institutionName}
                        onChange={(e) => setRegisterForm({ ...registerForm, institutionName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inst-type">Jenis Layanan</Label>
                    <Select
                      value={registerForm.institutionType}
                      onValueChange={(val) => setRegisterForm({ ...registerForm, institutionType: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daycare">Daycare / Penitipan Anak</SelectItem>
                        <SelectItem value="tk">TK / PAUD / Kelompok Bermain</SelectItem>
                        <SelectItem value="bimbel">Bimbingan Belajar / Les</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inst-city">Kota Lembaga</Label>
                    <Input
                      id="inst-city"
                      placeholder="Contoh: Tangerang Selatan"
                      value={registerForm.city}
                      onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="admin-name">Nama Anda *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="admin-name"
                          placeholder="Nama pengelola"
                          className="pl-10"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="admin-phone">No. WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="admin-phone"
                          placeholder="08xxxxxxxxxx"
                          className="pl-10"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-reg-email">Email Login *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="admin-reg-email"
                        type="email"
                        placeholder="admin@daycare.com"
                        className="pl-10"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="admin-reg-pwd">Password *</Label>
                      <Input
                        id="admin-reg-pwd"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 karakter"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="admin-reg-cpwd">Konfirmasi *</Label>
                      <Input
                        id="admin-reg-cpwd"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ulangi"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-1">
                    <Checkbox
                      id="admin-terms"
                      checked={registerForm.agreeTerms}
                      onCheckedChange={(c) => setRegisterForm({ ...registerForm, agreeTerms: Boolean(c) })}
                    />
                    <label htmlFor="admin-terms" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                      Saya menyetujui Syarat & Ketentuan pengelolaan platform MAJIKU
                    </label>
                  </div>

                  <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={isLoading}>
                    {isLoading ? "Mendaftarkan..." : "Daftar Lembaga Baru"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <DialogTitle>Bantuan Masuk & Reset Password</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Panduan pemulihan akses akun pengelola Daycare MAJIKU.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs text-muted-foreground leading-relaxed">
            <p>
              Untuk menjaga integritas dan keamanan data murid serta keuangan lembaga Anda, reset password akun admin daycare dilakukan melalui verifikasi pengelola.
            </p>
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1.5 text-foreground font-medium">
              <p>Tim Bantuan Teknis MAJIKU:</p>
              <p className="text-muted-foreground font-normal">📧 Email: support@majiku.web.id</p>
              <p className="text-muted-foreground font-normal">💬 WhatsApp: +62 812-3456-7890 (Hari Kerja 08:00 - 17:00 WIB)</p>
            </div>
            <p className="text-[11px] text-muted-foreground/80">
              Sertakan nama lembaga terdaftar dan alamat email saat mengajukan permintaan pemulihan sandi.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsForgotOpen(false)} className="w-full sm:w-auto">
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
