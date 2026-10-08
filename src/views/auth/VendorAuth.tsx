"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";

export default function VendorAuth() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

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
      toast({ title: "Login Berhasil", description: "Selamat datang di Portal Super Admin" });
      window.location.href = "/vendor";
    } catch (err: any) {
      toast({ title: "Login Gagal", description: err?.message || "Terjadi kesalahan", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground shadow-lg">
              <Sparkles className="w-7 h-7" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">MAJIKU Platform</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">Portal Khusus Super Admin & Vendor SaaS</p>
        </div>

        <Card className="shadow-2xl border-slate-800 bg-slate-900 text-slate-100">
          <CardHeader className="pb-3 pt-6 px-6">
            <CardTitle className="text-lg text-white">Super Admin Access</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Akses terbatas hanya untuk tim operasional dan teknis MAJIKU SaaS.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-email" className="text-slate-300">Email Super Admin</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="vendor-email"
                    type="email"
                    placeholder="admin@majiku.web.id"
                    className="pl-10 bg-slate-950 border-slate-800 text-slate-100 focus:border-primary"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor-password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="vendor-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-slate-950 border-slate-800 text-slate-100 focus:border-primary"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk ke Platform Management"}
              </Button>
            </form>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Setiap aktivitas login dan operasional platform dicatat dalam audit security log sistem.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
