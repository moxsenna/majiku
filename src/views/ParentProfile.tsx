"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit2,
  Home,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  User,
  Phone,
  Mail,
  GraduationCap,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getMyChildren, type ParentChildData } from "@/server/actions/parentChildren";

export default function ParentProfile() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const { data: children = [] } = useQuery({
    queryKey: ["my-children"],
    queryFn: getMyChildren,
  });

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/parent/login";
  };

  const displayName = user?.name || "Orang Tua Siswa";
  const displayEmail = user?.email || "ortu@email.com";
  const userInitials = (user?.name || user?.email || "OT")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link href="/parent">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-lg">Profil Orang Tua</h1>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => toast({ title: "Pengaturan Akun", description: "Preferensi akun orang tua tersimpan." })}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar size="2xl">
                  <AvatarFallback className="text-xl font-bold bg-primary/20 text-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="mt-4 font-bold text-xl">{displayName}</h2>
              <p className="text-sm text-muted-foreground">Akun Orang Tua Terdaftar</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{displayEmail}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Child Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Informasi Anak</h3>
              <Link href="/parent/registration">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                  <Plus className="h-3.5 w-3.5" />
                  Daftar Anak
                </Button>
              </Link>
            </div>
            {children.length === 0 ? (
              <div className="p-4 rounded-lg bg-muted/20 text-center">
                <p className="text-xs text-muted-foreground">Belum ada anak yang terhubung ke akun Anda.</p>
                <Link href="/parent/registration" className="mt-2 inline-block">
                  <Button size="sm" variant="outline" className="text-xs mt-1">Daftar Trial Sekarang</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {children.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {c.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.className} • {c.age} tahun</p>
                    </div>
                    {c.attendanceToday && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                        Hadir Hari Ini
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {[
              { icon: Bell, label: "Notifikasi", desc: "Atur preferensi notifikasi", action: "Preferensi notifikasi diperbarui." },
              { icon: Shield, label: "Keamanan Akun", desc: "Password & perlindungan data", action: "Data keamanan akun dalam status terlindungi." },
              { icon: HelpCircle, label: "Bantuan & Kontak Daycare", desc: "Hubungi admin sekolah", action: "Menghubungi customer support daycare via WhatsApp..." },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => toast({ title: item.label, description: item.action })}
                className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                  index !== 2 ? "border-b border-border" : ""
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Keluar dari Akun
        </Button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <Link href="/parent" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <Home className="h-6 w-6" />
            <span className="text-xs">Beranda</span>
          </Link>
          <Link href="/parent/marketplace" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs">Marketplace</span>
          </Link>
          <Link href="/parent/billing" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <CreditCard className="h-6 w-6" />
            <span className="text-xs">Tagihan</span>
          </Link>
          <Link href="/parent/chat" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs">Chat</span>
          </Link>
          <button className="flex flex-col items-center gap-1 p-2 text-primary">
            <User className="h-6 w-6" />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
