import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  CreditCard, GraduationCap, BookOpen, LayoutDashboard, Bell, 
  Users, ClipboardCheck, MessageSquare, Calendar, Settings,
  Plus, ChevronRight, Wallet, FileText, UserCheck, Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { WaitingListManagement } from "./WaitingListManagement";

const demoUnpaidBilling = [
  { id: "1", parent: "Ibu Maya", child: "Citra", amount: 2800000, dueIn: 5 },
  { id: "2", parent: "Ibu Fitri", child: "Dimas", amount: 3500000, dueIn: -3 },
  { id: "3", parent: "Bapak Hendra", child: "Elsa", amount: 2500000, dueIn: 7 },
  { id: "4", parent: "Ibu Rina", child: "Farhan", amount: 3000000, dueIn: 2 },
];

const demoSalaries = [
  { id: "1", name: "Ibu Sarah", role: "Tutor TK A", salary: 4500000, status: "pending" },
  { id: "2", name: "Ibu Maya", role: "Tutor Playgroup", salary: 4200000, status: "pending" },
  { id: "3", name: "Bapak Dani", role: "Tutor TK B", salary: 4500000, status: "paid" },
  { id: "4", name: "Ibu Dina", role: "Tutor Toddler", salary: 4000000, status: "pending" },
];

const demoLessonPlans = [
  { id: "1", class: "TK A - Bunga Matahari", tutor: "Ibu Sarah", status: "pending" },
  { id: "2", class: "Playgroup - Pelangi", tutor: "Ibu Maya", status: "submitted" },
  { id: "3", class: "TK B - Bintang", tutor: "Bapak Dani", status: "pending" },
  { id: "4", class: "Toddler A", tutor: "Ibu Dina", status: "submitted" },
];

const quickMenuItems = [
  { icon: Users, label: "Siswa", href: "/students", color: "bg-primary/10 text-primary" },
  { icon: Clock, label: "Waiting List", isWaitingList: true, color: "bg-warning/10 text-warning" },
  { icon: GraduationCap, label: "Tutor", href: "/tutors", color: "bg-info/10 text-info" },
  { icon: ClipboardCheck, label: "Kehadiran", href: "/attendance", color: "bg-success/10 text-success" },
  { icon: CreditCard, label: "Billing", href: "/billing", color: "bg-orange-500/10 text-orange-500" },
  { icon: MessageSquare, label: "Pesan", href: "/messages", color: "bg-purple-500/10 text-purple-500" },
  { icon: Calendar, label: "Jadwal", href: "/schedule", color: "bg-pink-500/10 text-pink-500" },
  { icon: FileText, label: "Laporan", href: "/daily-reports", color: "bg-cyan-500/10 text-cyan-500" },
  { icon: Settings, label: "Pengaturan", href: "/settings", color: "bg-muted text-muted-foreground" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function AdminBottomNav() {
  const location = useLocation();
  const { toast } = useToast();
  const [billingOpen, setBillingOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [waitingListOpen, setWaitingListOpen] = useState(false);

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: CreditCard,
      label: "Tagihan",
      badge: 3,
      onClick: () => setBillingOpen(true),
    },
    {
      icon: GraduationCap,
      label: "Gaji",
      badge: 2,
      onClick: () => setSalaryOpen(true),
    },
    {
      icon: BookOpen,
      label: "Lesson",
      badge: 2,
      onClick: () => setLessonOpen(true),
    },
    {
      icon: Plus,
      label: "Menu",
      isMenu: true,
      onClick: () => setMenuOpen(true),
    },
  ];

  const handleSendReminder = (parent: string) => {
    toast({
      title: "Pengingat Terkirim",
      description: `Notifikasi tagihan dikirim ke ${parent}`,
    });
  };

  const handlePaySalary = (name: string) => {
    toast({
      title: "Gaji Diproses",
      description: `Pembayaran gaji ${name} sedang diproses`,
    });
  };

  return (
    <>
      {/* Bottom Navigation - Only visible on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border lg:hidden">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isActive = item.href && location.pathname === item.href;
            const Icon = item.icon;
            
            if (item.href) {
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex flex-col items-center justify-center flex-1 py-2 relative transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-2 h-4 min-w-4 px-1 bg-destructive rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full" />
                  )}
                </Link>
              );
            }

            if (item.isMenu) {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center flex-1 py-2 relative text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="h-10 w-10 -mt-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] mt-1 font-medium text-primary">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center flex-1 py-2 relative text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 h-4 min-w-4 px-1 bg-destructive rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick Menu Sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl p-0">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="text-left">Menu Cepat</SheetTitle>
            <SheetDescription className="text-left">
              Akses cepat ke semua fitur
            </SheetDescription>
          </SheetHeader>
          
          <div className="p-4 pt-2">
            <div className="grid grid-cols-4 gap-3">
              {quickMenuItems.map((item) => {
                if (item.isWaitingList) {
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        setMenuOpen(false);
                        setWaitingListOpen(true);
                      }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center relative`}>
                        <item.icon className="h-6 w-6" />
                        <span className="absolute -top-1 -right-1 h-5 min-w-5 bg-destructive rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                          4
                        </span>
                      </div>
                      <span className="text-xs font-medium text-center">{item.label}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    to={item.href!}
                    onClick={() => setMenuOpen(false)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-medium text-center">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <p className="text-xs font-semibold text-muted-foreground mb-3">AKSI CEPAT</p>
              <Button variant="outline" className="w-full justify-between" onClick={() => {
                setMenuOpen(false);
                setBillingOpen(true);
              }}>
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-warning" />
                  Tagihan Jatuh Tempo
                </span>
                <Badge variant="destructive">3</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => {
                setMenuOpen(false);
                setSalaryOpen(true);
              }}>
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-info" />
                  Gaji Tutor
                </span>
                <Badge variant="secondary">2 pending</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => {
                setMenuOpen(false);
                setLessonOpen(true);
              }}>
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Lesson Plan
                </span>
                <Badge variant="secondary">2 belum</Badge>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Billing Sheet - Full Screen on Mobile */}
      <Sheet open={billingOpen} onOpenChange={setBillingOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
          <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-left">Tagihan Akan Jatuh Tempo</SheetTitle>
                  <SheetDescription className="text-left">
                    {demoUnpaidBilling.length} tagihan perlu difollow up
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(90vh-80px)]">
            <div className="p-4 space-y-3">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className="bg-destructive/5 border-destructive/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-xl font-bold text-destructive">
                      {formatCurrency(demoUnpaidBilling.filter(b => b.dueIn < 0).reduce((a, b) => a + b.amount, 0))}
                    </p>
                    <p className="text-xs text-muted-foreground">Terlambat</p>
                  </CardContent>
                </Card>
                <Card className="bg-warning/5 border-warning/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-xl font-bold text-warning">
                      {formatCurrency(demoUnpaidBilling.filter(b => b.dueIn >= 0).reduce((a, b) => a + b.amount, 0))}
                    </p>
                    <p className="text-xs text-muted-foreground">Akan Jatuh Tempo</p>
                  </CardContent>
                </Card>
              </div>

              <Button className="w-full gap-2 mb-4" onClick={() => {
                toast({ title: "Pengingat Massal", description: "Notifikasi dikirim ke semua orang tua" });
              }}>
                <Bell className="h-4 w-4" />
                Kirim Pengingat ke Semua
              </Button>

              {demoUnpaidBilling.map((item) => (
                <Card key={item.id} className={item.dueIn < 0 ? "border-destructive/50 bg-destructive/5" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-sm font-medium">{item.parent.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{item.parent}</p>
                          <p className="text-sm text-muted-foreground">{item.child}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(item.amount)}</p>
                        <Badge 
                          variant={item.dueIn < 0 ? "destructive" : "outline"} 
                          className="mt-1"
                        >
                          {item.dueIn < 0 ? `Telat ${Math.abs(item.dueIn)} hari` : `${item.dueIn} hari lagi`}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => handleSendReminder(item.parent)}
                    >
                      <Bell className="h-4 w-4" />
                      Kirim Pengingat
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Salary Sheet - Full Screen on Mobile */}
      <Sheet open={salaryOpen} onOpenChange={setSalaryOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
          <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-left">Gaji Tutor Bulan Ini</SheetTitle>
                  <SheetDescription className="text-left">
                    {demoSalaries.filter(s => s.status === "pending").length} gaji menunggu pembayaran
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(90vh-80px)]">
            <div className="p-4 space-y-3">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className="bg-warning/5 border-warning/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-xl font-bold text-warning">
                      {formatCurrency(demoSalaries.filter(s => s.status === "pending").reduce((a, b) => a + b.salary, 0))}
                    </p>
                    <p className="text-xs text-muted-foreground">Belum Dibayar</p>
                  </CardContent>
                </Card>
                <Card className="bg-success/5 border-success/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-xl font-bold text-success">
                      {formatCurrency(demoSalaries.filter(s => s.status === "paid").reduce((a, b) => a + b.salary, 0))}
                    </p>
                    <p className="text-xs text-muted-foreground">Sudah Dibayar</p>
                  </CardContent>
                </Card>
              </div>

              {demoSalaries.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-sm font-medium">{item.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(item.salary)}</p>
                        <Badge variant={item.status === "paid" ? "default" : "secondary"} className="mt-1">
                          {item.status === "paid" ? "Lunas" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                    {item.status === "pending" && (
                      <Button 
                        className="w-full"
                        onClick={() => handlePaySalary(item.name)}
                      >
                        Proses Pembayaran
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Lesson Plan Sheet - Full Screen on Mobile */}
      <Sheet open={lessonOpen} onOpenChange={setLessonOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
          <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-left">Lesson Plan Hari Ini</SheetTitle>
                  <SheetDescription className="text-left">
                    Status lesson plan dari setiap kelas
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(90vh-80px)]">
            <div className="p-4 space-y-3">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className="bg-success/5 border-success/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-success">
                      {demoLessonPlans.filter(l => l.status === "submitted").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Sudah Submit</p>
                  </CardContent>
                </Card>
                <Card className="bg-warning/5 border-warning/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-warning">
                      {demoLessonPlans.filter(l => l.status === "pending").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Belum Submit</p>
                  </CardContent>
                </Card>
              </div>

              {demoLessonPlans.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{item.class}</p>
                        <p className="text-sm text-muted-foreground">Tutor: {item.tutor}</p>
                      </div>
                      <Badge variant={item.status === "submitted" ? "default" : "secondary"}>
                        {item.status === "submitted" ? "Sudah Submit" : "Belum Submit"}
                      </Badge>
                    </div>
                    {item.status === "pending" && (
                      <Button variant="outline" className="w-full gap-2">
                        <Bell className="h-4 w-4" />
                        Ingatkan Tutor
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Waiting List Management */}
      <WaitingListManagement 
        isOpen={waitingListOpen} 
        onClose={() => setWaitingListOpen(false)} 
      />
    </>
  );
}
