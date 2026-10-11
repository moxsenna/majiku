"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BookOpen, Mail, Lock, Eye, EyeOff, Info, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { getMyRoles, type AppRole } from "@/server/actions/roles";

export default function TutorAuth() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast({ title: "Error", description: "Mohon isi email dan password pengajar", variant: "destructive" });
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

      // Verifikasi peran pengajar
      const roles: AppRole[] = await getMyRoles().catch(() => []);
      if (!roles.includes("tutor") && !roles.includes("admin")) {
        toast({
          title: "Akses Ditolak",
          description: "Akun ini bukan akun pengajar",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Hormati parameter ?next= untuk rute internal /tutor/*
      let targetUrl = "/tutor";
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const nextParam = searchParams.get("next");
        if (nextParam && nextParam.startsWith("/tutor") && !nextParam.startsWith("//")) {
          targetUrl = nextParam;
        }
      }

      toast({ title: "Login Berhasil", description: "Selamat datang di Portal Pengajar / Tutor" });
      window.location.href = targetUrl;
    } catch (err: any) {
      toast({ title: "Login Gagal", description: err?.message || "Terjadi kesalahan", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center shadow-sm">
              <BookOpen className="w-7 h-7" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">MAJIKU Tutor</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Portal Khusus Guru & Pendidik</p>
        </div>

        <Card className="shadow-xl border-border/60">
          <CardHeader className="pb-3 pt-6 px-6">
            <CardTitle className="text-lg">Masuk Pengajar</CardTitle>
            <CardDescription className="text-xs">
              Gunakan email yang telah didaftarkan oleh lembaga Daycare Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tutor-email">Email Terdaftar</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="tutor-email"
                    type="email"
                    placeholder="nama.guru@daycare.com"
                    className="pl-10"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tutor-password">Password</Label>
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
                    id="tutor-password"
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
                {isLoading ? "Memproses..." : "Masuk ke Dashboard Tutor"}
              </Button>
            </form>

            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex items-start gap-2.5 text-xs text-muted-foreground">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Akun pengajar tidak dapat didaftarkan secara mandiri. Silakan hubungi pengelola lembaga Daycare Anda untuk mendapatkan akses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <DialogTitle>Bantuan Masuk Pengajar</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Panduan pemulihan akses akun guru & pendidik MAJIKU.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs text-muted-foreground leading-relaxed">
            <p>
              Akun dan kata sandi pengajar dikelola secara terpusat oleh administrator lembaga Daycare tempat Anda bertugas.
            </p>
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1.5 text-foreground font-medium">
              <p>Cara Memperbarui Sandi:</p>
              <p className="text-muted-foreground font-normal">1. Hubungi Admin / Kepala Sekolah Daycare Anda.</p>
              <p className="text-muted-foreground font-normal">2. Admin dapat mengatur ulang tautan akun Anda di menu Kelola Tutor.</p>
              <p className="text-muted-foreground font-normal">📧 Bantuan Teknis: support@majiku.web.id</p>
            </div>
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
