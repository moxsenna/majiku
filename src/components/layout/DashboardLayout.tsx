import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminNavbarActions } from "@/components/dashboard/AdminNavbarActions";
import { NotificationsDropdown } from "@/components/dashboard/NotificationsDropdown";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideNavbarActions?: boolean;
}

export function DashboardLayout({ children, title, subtitle, hideNavbarActions }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main content */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-6 h-14 lg:h-16">
            <div className="flex items-center gap-4 flex-1 ml-12 lg:ml-0">
              {title && (
                <div>
                  <h1 className="text-base lg:text-xl font-bold text-foreground">{title}</h1>
                  {subtitle && (
                    <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari siswa, staf..."
                  className="w-48 lg:w-64 pl-9"
                  variant="filled"
                />
              </div>

              {/* Notifications */}
              <NotificationsDropdown />
            </div>
          </div>
          
          {/* Quick Actions Bar - Only visible on desktop */}
          {!hideNavbarActions && (
            <div className="hidden lg:block px-4 lg:px-6 pb-3 border-t border-border/50 pt-2">
              <AdminNavbarActions />
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>
    </div>
  );
}
