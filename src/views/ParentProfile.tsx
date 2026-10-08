"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ParentProfile() {
  const { user, signOut } = useAuth();

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
          <Button variant="ghost" size="icon-sm">
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
            <h3 className="font-semibold mb-3">Informasi Anak</h3>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary/10 text-primary">AN</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">Siswa Terdaftar</p>
                <p className="text-xs text-muted-foreground">Pantau laporan harian dan tagihan SPP di portal ini</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {[
              { icon: Bell, label: "Notifikasi", desc: "Atur preferensi notifikasi" },
              { icon: Shield, label: "Keamanan Akun", desc: "Password & perlindungan data" },
              { icon: HelpCircle, label: "Bantuan & Kontak Daycare", desc: "Hubungi admin sekolah" },
            ].map((item, index) => (
              <button
                key={index}
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
          <Link href="/parent/catalog" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs">Katalog</span>
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
