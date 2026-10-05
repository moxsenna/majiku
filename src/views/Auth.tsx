"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Sparkles, ArrowLeft, Eye, EyeOff, Mail, Lock, Building2, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { getRoleHome } from "@/lib/roleRedirect";

export default function Auth() {
  const { mode } = useParams<{ mode: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(mode === "register" ? "register" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in (to the dashboard matching the user's role)
  useEffect(() => {
    authClient.getSession().then(async (res) => {
      if (res?.data?.session) {
        const home = await getRoleHome(res.data.user.id);
        window.location.href = home;
      }
    });
  }, []);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    institutionName: "",
    institutionType: "",
    name: "",
    email: "",
    phone: "",
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
    const { data, error } = await authClient.signIn.email({
      email: loginForm.email,
      password: loginForm.password,
    });
    if (error) {
      setIsLoading(false);
      toast({ title: "Login Gagal", description: error.message || "Email atau password salah", variant: "destructive" });
    } else {
      const home = await getRoleHome(data?.user?.id);
      setIsLoading(false);
      toast({ title: "Login Berhasil!", description: "Selamat datang kembali di MAJIKU" });
      window.location.href = home;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.institutionName || !registerForm.email || !registerForm.password) {
      toast({ title: "Error", description: "Mohon lengkapi semua field yang wajib diisi", variant: "destructive" });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({ title: "Error", description: "Password dan konfirmasi password tidak sama", variant: "destructive" });
      return;
    }
    if (!registerForm.agreeTerms) {
      toast({ title: "Error", description: "Anda harus menyetujui syarat dan ketentuan", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await authClient.signUp.email({
      email: registerForm.email,
      password: registerForm.password,
      name: registerForm.name || registerForm.email,
    });
    setIsLoading(false);
    if (error) {
      toast({ title: "Pendaftaran Gagal", description: error.message || "Pendaftaran gagal", variant: "destructive" });
    } else {
      toast({ title: "Pendaftaran Berhasil!", description: "Silakan masuk dengan akun baru Anda." });
      setActiveTab("login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <div className="p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-2xl">MAJIKU</span>
            </Link>
          </div>

          <Card className="shadow-xl border-border/50">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="pb-4 pt-6 px-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Masuk</TabsTrigger>
                  <TabsTrigger value="register">Daftar</TabsTrigger>
                </TabsList>
              </div>

              <CardContent>
                <TabsContent value="login" className="mt-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="login-email" type="email" placeholder="nama@lembaga.com" className="pl-10"
                          value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10"
                          value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={isLoading}>
                      {isLoading ? "Memproses..." : "Masuk"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-0">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="institution-name">Nama Lembaga *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="institution-name" placeholder="TK Ceria Mandiri" className="pl-10"
                          value={registerForm.institutionName} onChange={(e) => setRegisterForm({ ...registerForm, institutionName: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution-type">Jenis Lembaga *</Label>
                      <Select value={registerForm.institutionType} onValueChange={(value) => setRegisterForm({ ...registerForm, institutionType: value })}>
                        <SelectTrigger><SelectValue placeholder="Pilih jenis lembaga" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daycare">Daycare / Penitipan Anak</SelectItem>
                          <SelectItem value="tk">TK / PAUD</SelectItem>
                          <SelectItem value="bimbel">Bimbingan Belajar</SelectItem>
                          <SelectItem value="kursus">Kursus / Les Privat</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Anda *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="name" placeholder="Nama lengkap" className="pl-10"
                            value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">No. HP</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="phone" placeholder="08xxxxxxxxxx" className="pl-10"
                            value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="register-email" type="email" placeholder="nama@lembaga.com" className="pl-10"
                          value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password *</Label>
                        <Input id="register-password" type={showPassword ? "text" : "password"} placeholder="Min 8 karakter"
                          value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Konfirmasi *</Label>
                        <Input id="confirm-password" type={showPassword ? "text" : "password"} placeholder="Ulangi password"
                          value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} />
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" checked={registerForm.agreeTerms}
                        onCheckedChange={(checked) => setRegisterForm({ ...registerForm, agreeTerms: checked as boolean })} />
                      <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                        Saya menyetujui <span className="text-primary underline cursor-pointer">Syarat & Ketentuan</span> dan{" "}
                        <span className="text-primary underline cursor-pointer">Kebijakan Privasi</span>
                      </label>
                    </div>

                    <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={isLoading}>
                      {isLoading ? "Memproses..." : "Daftar Sekarang"}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
