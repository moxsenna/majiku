"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CircleUser, House, MessageCircle, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingTabBar, TAB_BAR_SPACE, type TabItem } from "./Mobile";

/** Empat tab orang tua (kit.js): Beranda · Tagihan · Pesan · Profil. Jelajahi lembaga pindah ke Profil. */
const PARENT_TABS: TabItem[] = [
  { href: "/parent", label: "Beranda", icon: House, exact: true },
  { href: "/parent/billing", label: "Tagihan", icon: Receipt, match: ["/parent/invoice", "/parent/payment"] },
  { href: "/parent/chat", label: "Pesan", icon: MessageCircle },
  { href: "/parent/profile", label: "Profil", icon: CircleUser, match: ["/parent/marketplace", "/parent/catalog", "/parent/registration"] },
];

const STORAGE_KEY = "bunayo-anak-aktif";

interface ActiveKidContextValue {
  activeKidId: string | null;
  setActiveKidId: (id: string) => void;
}

const ActiveKidContext = createContext<ActiveKidContextValue>({ activeKidId: null, setActiveKidId: () => {} });

/** Anak yang sedang dipilih di pemilih anak; dibagi antar-tab dan diingat selama sesi peramban. */
export function useActiveKid() {
  return useContext(ActiveKidContext);
}

/** Shell portal orang tua: mobile-first (390), konten maks 560 px, navigasi melayang 4 tab. */
export function ParentShell({ children }: { children: React.ReactNode }) {
  const [activeKidId, setActive] = useState<string | null>(null);
  useEffect(() => {
    setActive(sessionStorage.getItem(STORAGE_KEY));
  }, []);
  const setActiveKidId = useCallback((id: string) => {
    setActive(id);
    sessionStorage.setItem(STORAGE_KEY, id);
  }, []);

  return (
    <ActiveKidContext.Provider value={{ activeKidId, setActiveKidId }}>
      <div className="app-mobile min-h-screen bg-surface print:bg-background">
        <div className={cn("mx-auto min-w-0 max-w-[560px] print:pb-0", TAB_BAR_SPACE)}>{children}</div>
        <FloatingTabBar items={PARENT_TABS} className="print:hidden" />
      </div>
    </ActiveKidContext.Provider>
  );
}
