"use client";

import { ReactNode, createContext, useContext, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminNavbarActions } from "@/components/dashboard/AdminNavbarActions";
import { NotificationsDropdown } from "@/components/dashboard/NotificationsDropdown";

interface HeaderInfo {
  title?: string;
  subtitle?: string;
  hideNavbarActions?: boolean;
}

interface DashboardContextValue {
  isRoot: boolean;
  setHeader: (info: HeaderInfo) => void;
}

const DashboardLayoutContext = createContext<DashboardContextValue | null>(null);

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideNavbarActions?: boolean;
}

function ChildDashboardLayout({
  children,
  title,
  subtitle,
  hideNavbarActions,
  setHeader,
}: DashboardLayoutProps & { setHeader: (info: HeaderInfo) => void }) {
  useEffect(() => {
    setHeader({ title, subtitle, hideNavbarActions });
  }, [title, subtitle, hideNavbarActions, setHeader]);

  return <>{children}</>;
}

function RootDashboardLayout({
  children,
  initialTitle,
  initialSubtitle,
  initialHideActions,
}: {
  children: ReactNode;
  initialTitle?: string;
  initialSubtitle?: string;
  initialHideActions?: boolean;
}) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo>({
    title: initialTitle,
    subtitle: initialSubtitle,
    hideNavbarActions: initialHideActions,
  });

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const q = searchVal.trim();
      if (q) {
        router.push(`/students?q=${encodeURIComponent(q)}`);
      }
    }
  };

  const displayTitle = headerInfo.title ?? initialTitle;
  const displaySubtitle = headerInfo.subtitle ?? initialSubtitle;
  const displayHideActions = headerInfo.hideNavbarActions ?? initialHideActions;

  return (
    <DashboardLayoutContext.Provider value={{ isRoot: true, setHeader: setHeaderInfo }}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        
        {/* Main content */}
        <div className="lg:pl-64 transition-all duration-300">
          {/* Top header */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="flex items-center justify-between px-4 lg:px-6 h-14 lg:h-16">
              <div className="flex items-center gap-4 flex-1 ml-12 lg:ml-0">
                {displayTitle && (
                  <div>
                    <h1 className="text-base lg:text-xl font-bold text-foreground">{displayTitle}</h1>
                    {displaySubtitle && (
                      <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">{displaySubtitle}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari siswa, staf... (Enter)"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-48 lg:w-64 pl-9"
                    variant="filled"
                  />
                </div>

                {/* Notifications */}
                <NotificationsDropdown />
              </div>
            </div>
            
            {/* Quick Actions Bar - Only visible on desktop */}
            {!displayHideActions && (
              <div className="hidden lg:block px-4 lg:px-6 pb-3 border-t border-border/50 pt-2">
                <AdminNavbarActions />
              </div>
            )}
          </header>

          {/* Page content */}
          <main className="p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
        </div>
      </div>
    </DashboardLayoutContext.Provider>
  );
}

export function DashboardLayout({ children, title, subtitle, hideNavbarActions }: DashboardLayoutProps) {
  const parentContext = useContext(DashboardLayoutContext);

  if (parentContext) {
    return (
      <ChildDashboardLayout
        title={title}
        subtitle={subtitle}
        hideNavbarActions={hideNavbarActions}
        setHeader={parentContext.setHeader}
      >
        {children}
      </ChildDashboardLayout>
    );
  }

  return (
    <RootDashboardLayout
      initialTitle={title}
      initialSubtitle={subtitle}
      initialHideActions={hideNavbarActions}
    >
      {children}
    </RootDashboardLayout>
  );
}
