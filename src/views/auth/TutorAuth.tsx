"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, Eye, EyeOff, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";

export default function TutorAuth() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      toast({ title: "Login Berhasil", description: "Selamat datang di Portal Pengajar / Tutor" });
      window.location.href = "/tutor";
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
                <Label htmlFor="tutor-password">Password</Label>
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
    </div>
  );
}
