"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  Users,
  Calendar,
  ClipboardCheck,
  MessageSquare,
  Image,
  CreditCard,
  Settings,
  GraduationCap,
  Cake,
  Menu,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  className?: string;
}

const adminMenuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Siswa", path: "/students" },
  { icon: Users, label: "CRM & Pipeline", path: "/crm" },
  { icon: GraduationCap, label: "Kelola Kelas", path: "/classes" },
  { icon: Users, label: "Kelola Tutor", path: "/tutors" },
  { icon: ClipboardCheck, label: "Kehadiran", path: "/attendance" },
  { icon: Calendar, label: "Laporan Harian", path: "/daily-reports" },
  { icon: Calendar, label: "Lesson Plans", path: "/lesson-plans" },
  { icon: Image, label: "Galeri Foto", path: "/gallery" },
  { icon: MessageSquare, label: "Komunikasi", path: "/messages" },
  { icon: CreditCard, label: "Billing SPP", path: "/billing" },
  { icon: CreditCard, label: "Gaji Tutor", path: "/tutor-payout" },
  { icon: Calendar, label: "Jadwal Kelas", path: "/schedule" },
  { icon: Cake, label: "Ulang Tahun", path: "/birthdays" },
];

const bottomItems = [
  { icon: Settings, label: "Pengaturan", path: "/settings" },
];

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/admin/login";
  };

  const userInitials = (user?.name || user?.email || "AD")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground text-lg">MAJIKU</h1>
              <p className="text-xs text-sidebar-foreground/60">
                Admin Daycare
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center mx-auto">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-xs",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive && "text-sidebar-primary-foreground"
                )}
              />
              {!collapsed && (
                <span>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span>{item.label}</span>
              )}
            </Link>
          );
        })}

        {/* User Profile & Logout */}
        <div
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-lg bg-sidebar-accent mt-2",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">
                {user?.name || "Admin Daycare"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">
                {user?.email || "admin@majiku.id"}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
              title="Keluar / Logout"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="fixed top-3 left-3 z-50 lg:hidden bg-background/80 backdrop-blur-sm shadow-md"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 gradient-sidebar border-sidebar-border">
          <div className="h-full flex flex-col">
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen gradient-sidebar border-r border-sidebar-border flex-col transition-all duration-300 hidden lg:flex",
          collapsed ? "w-20" : "w-64",
          className
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>
    </>
  );
}
