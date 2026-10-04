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
  Globe,
  CreditCard,
  Mail,
  ChevronRight,
  Camera,
} from "lucide-react";

const settingsSections = [
  {
    id: "school",
    icon: Building2,
    title: "Profil Sekolah",
    description: "Nama, alamat, dan informasi dasar daycare",
    color: "bg-primary/10 text-primary",
  },
  {
    id: "users",
    icon: Users,
    title: "Manajemen Pengguna",
    description: "Kelola admin, staf, dan hak akses",
    color: "bg-info/10 text-info",
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifikasi",
    description: "Atur pengaturan notifikasi dan reminder",
    color: "bg-highlight/10 text-highlight",
  },
  {
    id: "security",
    icon: Shield,
    title: "Keamanan",
    description: "Password, 2FA, dan pengaturan keamanan",
    color: "bg-success/10 text-success",
  },
  {
    id: "appearance",
    icon: Palette,
    title: "Tampilan",
    description: "Tema, warna, dan kustomisasi tampilan",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Langganan & Billing",
    description: "Kelola paket langganan dan pembayaran",
    color: "bg-warning/10 text-warning-foreground",
  },
];

export default function Settings() {
  return (
    <DashboardLayout title="Pengaturan" subtitle="Kelola pengaturan aplikasi dan preferensi">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profil Daycare</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  LS
                </div>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="absolute -bottom-2 -right-2 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="mt-4 font-bold text-lg text-foreground">MAJIKU Daycare</h3>
              <p className="text-sm text-muted-foreground">Jakarta Selatan</p>
              <Badge variant="success" className="mt-2">Pro Plan</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Nama Daycare</label>
                <Input defaultValue="MAJIKU Daycare" className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email</label>
                <Input defaultValue="admin@majiku.id" className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Telepon</label>
                <Input defaultValue="+62 21-1234-5678" className="mt-1" />
              </div>
              <Button variant="hero" className="w-full">
                Simpan Perubahan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Umum</CardTitle>
              <CardDescription>Kelola pengaturan aplikasi Anda</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {settingsSections.map((section, index) => (
                <button
                  key={section.id}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${
                    index !== settingsSections.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl ${section.color} flex items-center justify-center`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{section.title}</p>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Akun</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">156</p>
                  <p className="text-xs text-muted-foreground">Total Siswa</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground">Total Staf</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">6</p>
                  <p className="text-xs text-muted-foreground">Kelas Aktif</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">180</p>
                  <p className="text-xs text-muted-foreground">Kapasitas Max</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tim Staf</CardTitle>
                <CardDescription>Kelola akses pengguna</CardDescription>
              </div>
              <Button variant="soft" size="sm">
                Tambah Staf
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Admin User", role: "Super Admin", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
                  { name: "Ibu Sarah", role: "Guru Kelas", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
                  { name: "Pak Ahmad", role: "Guru Kelas", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
                ].map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
