"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  Users,
  Bell,
  Shield,
  Palette,
  CreditCard,
  ChevronRight,
  Camera,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  getAdminDashboardOverview,
  getTenantProfile,
  updateTenantProfile,
} from "@/server/actions/adminDashboard";

interface SettingsSection {
  id: string;
  icon: typeof Building2;
  title: string;
  description: string;
  color: string;
  actionRoute?: string;
  toastNote?: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: "school",
    icon: Building2,
    title: "Profil Sekolah",
    description: "Nama, alamat, dan informasi dasar daycare",
    color: "bg-primary/10 text-primary",
    toastNote: "Perbarui informasi nama dan kontak sekolah pada form di sisi kiri.",
  },
  {
    id: "users",
    icon: Users,
    title: "Manajemen Pengguna & Guru",
    description: "Kelola akun guru, staf pendidik, dan hak akses",
    color: "bg-info/10 text-info",
    actionRoute: "/tutors",
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifikasi & Pengingat",
    description: "Atur saluran broadcast dan reminder tagihan SPP",
    color: "bg-highlight/10 text-highlight",
    toastNote: "Pengingat otomatis WhatsApp dan Broadcast terpusat telah aktif.",
  },
  {
    id: "security",
    icon: Shield,
    title: "Keamanan Akun",
    description: "Pengaturan kata sandi dan proteksi sesi",
    color: "bg-success/10 text-success",
    toastNote: "Sesi admin terlindungi dengan cookie HTTP-only dan rate limiter.",
  },
  {
    id: "appearance",
    icon: Palette,
    title: "Tampilan & Tema",
    description: "Kustomisasi warna antarmuka dan mode kontras",
    color: "bg-secondary text-secondary-foreground",
    toastNote: "Tema otomatis menyesuaikan preferensi sistem perangkat Anda.",
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Langganan & Billing SPP",
    description: "Kelola penerbitan invoice SPP dan metode pembayaran",
    color: "bg-warning/10 text-warning-foreground",
    actionRoute: "/billing",
  },
];

export default function Settings() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: overviewData } = useQuery({
    queryKey: ["admin-dashboard-overview"],
    queryFn: getAdminDashboardOverview,
  });

  const { data: tenantData } = useQuery({
    queryKey: ["tenant-profile"],
    queryFn: getTenantProfile,
  });

  const [daycareName, setDaycareName] = useState("MAJIKU Daycare");
  const [email, setEmail] = useState(user?.email || "admin@daycare.com");
  const [phone, setPhone] = useState("+62 812-3456-7890");
  const [address, setAddress] = useState("Jakarta Selatan");

  useEffect(() => {
    if (tenantData) {
      if (tenantData.name) setDaycareName(tenantData.name);
      if (tenantData.whatsapp) setPhone(tenantData.whatsapp);
      if (tenantData.address) setAddress(tenantData.address);
    }
  }, [tenantData]);

  const saveMutation = useMutation({
    mutationFn: (data: { name: string; phone?: string; address?: string }) =>
      updateTenantProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-profile"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-overview"] });
      toast({
        title: "Pengaturan Tersimpan ✓",
        description: `Profil ${daycareName} berhasil diperbarui di database.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Gagal Menyimpan",
        description: err?.message || "Terjadi kesalahan.",
        variant: "destructive",
      });
    },
  });

  const totalStudents = overviewData?.totalStudents ?? 0;
  const totalStaff = overviewData?.activeTutorsCount ?? 0;
  const activeClasses = overviewData?.activeClassesCount ?? 0;
  const totalCapacity = overviewData?.totalCapacity ?? 0;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      name: daycareName.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });
  };

  const handleSectionClick = (section: SettingsSection) => {
    if (section.actionRoute) {
      router.push(section.actionRoute);
    } else if (section.toastNote) {
      toast({
        title: section.title,
        description: section.toastNote,
      });
    }
  };

  const initials = (daycareName || "MD").slice(0, 2).toUpperCase();

  return (
    <DashboardLayout title="Pengaturan" subtitle="Kelola identitas lembaga dan preferensi operasional">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profil Lembaga</CardTitle>
            <CardDescription>Informasi yang ditampilkan ke wali murid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-md">
                  {initials}
                </div>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="absolute -bottom-2 -right-2 rounded-full shadow-sm"
                  onClick={() => toast({ title: "Ganti Logo", description: "Membuka media picker untuk logo sekolah..." })}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="mt-4 font-bold text-lg text-foreground text-center">{daycareName}</h3>
              <p className="text-sm text-muted-foreground">{address}</p>
              <Badge variant="success" className="mt-2">Lembaga Terverifikasi</Badge>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nama Lembaga / Daycare</label>
                <Input
                  value={daycareName}
                  onChange={(e) => setDaycareName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email Operasional</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nomor Telepon / WhatsApp</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Kota / Wilayah</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                {saveMutation.isPending ? "Menyimpan ke Database..." : "Simpan Perubahan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Settings List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Modul</CardTitle>
              <CardDescription>Pilih kategori untuk konfigurasi spesifik</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {settingsSections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section)}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${
                    index !== settingsSections.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl ${section.color} flex items-center justify-center`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{section.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Kapasitas & Kapabilitas Saat Ini</CardTitle>
              <CardDescription>Metrik operasional yang aktif di database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-xl font-bold text-foreground">{totalStudents}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Siswa Terdaftar</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-xl font-bold text-foreground">{totalStaff}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Tutor Aktif</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-xl font-bold text-foreground">{activeClasses}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Kelas Terbuka</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-xl font-bold text-foreground">{totalCapacity}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Total Kapasitas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members Quick Link */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Pengajar & Tim Pendidik</CardTitle>
                <CardDescription className="text-xs">Kelola tutor dan penugasan kelas</CardDescription>
              </div>
              <Button variant="soft" size="sm" onClick={() => router.push("/tutors")}>
                Kelola Tutor
              </Button>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-muted/20 border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-info/10 text-info flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{totalStaff} Guru Terdaftar</p>
                    <p className="text-xs text-muted-foreground">Atur tarif honor per sesi, kelas pengampu, dan izin</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/tutors")}>
                  Buka Modul
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
