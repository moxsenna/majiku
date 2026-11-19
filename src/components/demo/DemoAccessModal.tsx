"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  HeartHandshake,
  GraduationCap,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import { getSubdomainForRole } from "@/lib/roleRedirect";

interface DemoAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole?: "admin" | "parent" | "tutor" | "vendor";
}

interface DemoRoleOption {
  id: "admin" | "parent" | "tutor" | "vendor";
  title: string;
  roleBadge: string;
  badgeVariant: "default" | "secondary" | "outline" | "success" | "warning";
  email: string;
  description: string;
  highlights: string[];
  icon: any;
  color: string;
}

const demoOptions: DemoRoleOption[] = [
  {
    id: "admin",
    title: "Admin Daycare",
    roleBadge: "Role: Admin",
    badgeVariant: "default",
    email: "admin@bunayo.test",
    description: "Kelola operasional Bunayo Daycare: Kelas Bunga Matahari, absensi terpadu, billing & SPP Aisyah Putri, dan pengumuman.",
    highlights: ["Kelas Bunga Matahari", "Billing SPP Sinkron", "Monitoring Absensi"],
    icon: Building2,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "parent",
    title: "Orang Tua Siswa",
    roleBadge: "Role: Parent",
    badgeVariant: "success",
    email: "parent@bunayo.test",
    description: "Aplikasi mobile orang tua: pantau anak Aisyah Putri, feed laporan harian, galeri foto, & status SPP lunas.",
    highlights: ["Profil Anak (Aisyah)", "Laporan Aktivitas Harian", "Status SPP Lunas"],
    icon: HeartHandshake,
    color: "bg-success/10 text-success border-success/20",
  },
  {
    id: "tutor",
    title: "Guru / Tutor",
    roleBadge: "Role: Tutor",
    badgeVariant: "warning",
    email: "tutor@bunayo.test",
    description: "Portal pendidik: jadwal Kelas Bunga Matahari, absensi siswa, laporan harian Aisyah Putri, dan chat dengan bunda.",
    highlights: ["Kelas Bunga Matahari", "Absensi Siswa Hari Ini", "Laporan Perkembangan"],
    icon: GraduationCap,
    color: "bg-warning/10 text-warning-foreground border-warning/20",
  },
];

export function DemoAccessModal({
  open,
  onOpenChange,
}: DemoAccessModalProps) {
  const { toast } = useToast();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleLoginDemo = async (opt: DemoRoleOption) => {
    setLoadingRole(opt.id);
    try {
      // Login langsung via BetterAuth client
      await authClient.signIn.email({
        email: opt.email,
        password: "Password123!",
      });

      toast({
        title: `Masuk sebagai ${opt.title} ✓`,
        description: "Membuka portal dengan dataset demo interaktif...",
      });

      // Pindah ke subdomain peran (cookie sesi lintas-subdomain di produksi);
      // URL relatif membuat demo dari subdomain salah mendarat di portal lain.
      window.location.href = getSubdomainForRole(opt.id, window.location.host);
    } catch (err: any) {
      toast({
        title: "Gagal Masuk Demo",
        description: err?.message || "Terjadi kesalahan koneksi",
        variant: "destructive",
      });
      setLoadingRole(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Jelajahi Demo Interaktif Bunayo
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-0.5">
                Pilih peran untuk langsung merasakan pengalaman aplikasi dengan data simulasi lengkap tanpa perlu registrasi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-3">
          {demoOptions.map((opt) => {
            const Icon = opt.icon;
            const isLoading = loadingRole === opt.id;

            return (
              <div
                key={opt.id}
                className={`p-4 rounded-xl border ${opt.color} bg-background/50 hover:bg-background transition-all flex flex-col justify-between shadow-xs`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant={opt.badgeVariant} className="text-[10px] px-2 py-0.5">
                      {opt.roleBadge}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-sm text-foreground mb-1">{opt.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {opt.description}
                  </p>

                  <div className="space-y-1 mb-4">
                    {opt.highlights.map((h, i) => (
                      <div key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="default"
                  className="w-full text-xs gap-1.5"
                  disabled={loadingRole !== null}
                  onClick={() => handleLoginDemo(opt)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Masuk...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk Demo</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Kredensial Manual: password semua akun demo adalah <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">Password123!</code></span>
          <span className="text-[11px]">Mode Simulasi</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
