"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HeartHandshake, Mail, Lock, User, Phone, Baby, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { registerParentAction } from "@/server/actions/authRegistration";

interface ParentAuthProps {
  initialMode?: "login" | "register";
}

export default function ParentAuth({ initialMode = "login" }: ParentAuthProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    childName: "",
    childBirthDate: "",
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
      toast({ title: "Login Berhasil", description: "Selamat datang di Portal Orang Tua" });
      window.location.href = "/parent";
    } catch (err: any) {
      toast({ title: "Login Gagal", description: err?.message || "Terjadi kesalahan", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
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
      await registerParentAction({
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        childName: registerForm.childName,
        childBirthDate: registerForm.childBirthDate,
        password: registerForm.password,
      });

      // Auto login setelah registrasi
      await authClient.signIn.email({
        email: registerForm.email.trim().toLowerCase(),
        password: registerForm.password,
      });

      toast({ title: "Pendaftaran Berhasil! 🎉", description: "Akun orang tua Anda telah aktif." });
      window.location.href = "/parent";
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
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">MAJIKU Parent</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Portal Orang Tua & Wali Murid</p>
        </div>

        <Card className="shadow-xl border-border/60">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="pt-6 px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Masuk Ortu</TabsTrigger>
                <TabsTrigger value="register">Daftar Akun</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="pt-4">
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent-email">Email Orang Tua</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="parent-email"
                        type="email"
                        placeholder="ortu@email.com"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="parent-password">Password</Label>
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
                        id="parent-password"
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
                    {isLoading ? "Memproses..." : "Masuk ke Portal Orang Tua"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="parent-name">Nama Lengkap Orang Tua *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="parent-name"
                        placeholder="Nama Ayah / Bunda"
                        className="pl-10"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="child-name">Nama Anak (Opsional)</Label>
                      <div className="relative">
                        <Baby className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="child-name"
                          placeholder="Nama panggilan anak"
                          className="pl-10"
                          value={registerForm.childName}
                          onChange={(e) => setRegisterForm({ ...registerForm, childName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="parent-phone">No. WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="parent-phone"
                          placeholder="08xxxxxxxxxx"
                          className="pl-10"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="parent-reg-email">Email Login *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="parent-reg-email"
                        type="email"
                        placeholder="ortu@email.com"
                        className="pl-10"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="parent-reg-pwd">Password *</Label>
                      <Input
                        id="parent-reg-pwd"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 karakter"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="parent-reg-cpwd">Konfirmasi *</Label>
                      <Input
                        id="parent-reg-cpwd"
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
                      id="parent-terms"
                      checked={registerForm.agreeTerms}
                      onCheckedChange={(c) => setRegisterForm({ ...registerForm, agreeTerms: Boolean(c) })}
                    />
                    <label htmlFor="parent-terms" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                      Saya menyetujui Syarat & Ketentuan akun orang tua MAJIKU
                    </label>
                  </div>

                  <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={isLoading}>
                    {isLoading ? "Mendaftarkan..." : "Daftar Akun Orang Tua"}
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
              <DialogTitle>Bantuan Masuk Akun Orang Tua</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Panduan pemulihan akses akun orang tua / wali murid.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs text-muted-foreground leading-relaxed">
            <p>
              Jika Anda lupa password akun orang tua, Anda dapat meminta bantuan pihak administrasi Daycare tempat anak Anda terdaftar atau menghubungi tim support MAJIKU.
            </p>
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1.5 text-foreground font-medium">
              <p>Layanan Bantuan Pengguna:</p>
              <p className="text-muted-foreground font-normal">📧 Email: support@majiku.web.id</p>
              <p className="text-muted-foreground font-normal">💬 Hubungi Tata Usaha Daycare cabang anak Anda</p>
            </div>
            <p className="text-[11px] text-muted-foreground/80">
              Sertakan nama lengkap anak dan email terdaftar saat konfirmasi identitas.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsForgotOpen(false)} className="w-full sm:w-auto">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
