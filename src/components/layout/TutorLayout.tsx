"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  ClipboardCheck,
  Upload,
  MessageCircle,
  Target,
  GraduationCap,
  BookOpen,
  Menu,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const tutorNavItems = [
  { icon: Home, label: "Dashboard", path: "/tutor" },
  { icon: ClipboardCheck, label: "Antrean Trial", path: "/tutor/trials" },
  { icon: ClipboardCheck, label: "Absensi Guru", path: "/tutor/attendance" },
  { icon: Upload, label: "Upload Progress", path: "/tutor/progress" },
  { icon: MessageCircle, label: "Chat Orang Tua", path: "/tutor/chat" },
  { icon: Target, label: "KPI & Kinerja", path: "/tutor/kpi" },
  { icon: BookOpen, label: "Panduan SOP", path: "/tutor/guides" },
];

function TutorSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/tutor/login";
  };

  const userInitials = (user?.name || user?.email || "TU")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Brand Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="h-10 w-10 rounded-xl bg-info/10 text-info flex items-center justify-center font-bold">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-foreground text-base tracking-tight">MAJIKU Tutor</h1>
          <p className="text-xs text-muted-foreground">Portal Pengajar</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {tutorNavItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-semibold bg-info/20 text-info">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.name || "Guru Pengajar"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.email || "tutor@daycare.com"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Keluar / Logout"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TutorLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-b border-border h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <TutorSidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Portal Tutor</span>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        <TutorSidebarContent />
      </aside>

      {/* Content Body */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
