import { Link } from "react-router-dom";
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

export default function ParentProfile() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link to="/parent">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-lg">Profil</h1>
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
                  <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200" />
                  <AvatarFallback>SP</AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="absolute -bottom-1 -right-1 rounded-full"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="mt-4 font-bold text-xl">Ibu Sari Putri</h2>
              <p className="text-sm text-muted-foreground">Orang Tua dari Aisyah Putri</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telepon</p>
                  <p className="font-medium text-sm">+62 812-3456-7890</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">sari.putri@email.com</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Child Info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Data Anak</h3>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <Avatar size="lg">
                <AvatarImage src="https://images.unsplash.com/photo-1595454223600-91d7bf17b165?w=100" />
                <AvatarFallback>AP</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">Aisyah Putri</p>
                <p className="text-sm text-muted-foreground">Kelas Bunga Matahari</p>
                <p className="text-xs text-muted-foreground">5 tahun • Bergabung Jan 2023</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {[
              { icon: Bell, label: "Notifikasi", desc: "Atur preferensi notifikasi" },
              { icon: Shield, label: "Keamanan", desc: "Password & keamanan akun" },
              { icon: HelpCircle, label: "Bantuan", desc: "FAQ & hubungi kami" },
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
        <Button variant="outline" className="w-full text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </Button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <Link to="/parent" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <Home className="h-6 w-6" />
            <span className="text-xs">Beranda</span>
          </Link>
          <Link to="/parent/catalog" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs">Katalog</span>
          </Link>
          <Link to="/parent/billing" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <CreditCard className="h-6 w-6" />
            <span className="text-xs">Tagihan</span>
          </Link>
          <Link to="/parent/chat" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
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
