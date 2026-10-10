"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  CreditCard, GraduationCap, BookOpen, LayoutDashboard, 
  Users, ClipboardCheck, MessageSquare, Calendar, Settings,
  Plus, Clock, FileText, Wallet
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { WaitingListManagement } from "./WaitingListManagement";

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

export function AdminBottomNav() {
  const pathname = usePathname();
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
      href: "/billing",
    },
    {
      icon: GraduationCap,
      label: "Gaji",
      href: "/tutor-payout",
    },
    {
      icon: BookOpen,
      label: "Lesson",
      href: "/lesson-plans",
    },
    {
      icon: Plus,
      label: "Menu",
      isMenu: true,
      onClick: () => setMenuOpen(true),
    },
  ];

  return (
    <>
      {/* Bottom Navigation - Only visible on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border lg:hidden">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isActive = item.href && pathname === item.href;
            const Icon = item.icon;
            
            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 py-2 relative transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full" />
                  )}
                </Link>
              );
            }

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
          })}
        </div>
      </nav>

      {/* Quick Menu Sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl p-0">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="text-left">Menu Navigasi Cepat</SheetTitle>
            <SheetDescription className="text-left">
              Akses cepat ke seluruh modul operasional daycare
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
                      <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-medium text-center">{item.label}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href={item.href!}
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
          </div>
        </SheetContent>
      </Sheet>

      {/* Waiting List Dialog */}
      <WaitingListManagement
        isOpen={waitingListOpen}
        onClose={() => setWaitingListOpen(false)}
      />
    </>
  );
}
