"use client";

import { ReactNode } from "react";
import { CircleUser, MessageCircle, Sun, UsersRound } from "lucide-react";
import { FloatingTabBar, TAB_BAR_SPACE, type TabItem } from "@/components/bunayo/Mobile";
import { cn } from "@/lib/utils";

/** Empat tab guru (kit.js): Hari Ini · Kelas · Pesan · Saya. Keluar ada di Saya (N30). */
const TUTOR_TABS: TabItem[] = [
  { href: "/tutor", label: "Hari Ini", icon: Sun, exact: true },
  { href: "/tutor/schedule", label: "Kelas", icon: UsersRound, match: ["/tutor/progress"] },
  { href: "/tutor/chat", label: "Pesan", icon: MessageCircle },
  { href: "/tutor/saya", label: "Saya", icon: CircleUser, match: ["/tutor/kpi", "/tutor/attendance", "/tutor/trials"] },
];

/** Shell portal guru: mobile-first (390), konten dibatasi 560 px di layar lebar, navigasi melayang 4 tab. */
export function TutorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-mobile min-h-screen bg-surface">
      <main className={cn("mx-auto min-w-0 max-w-[560px]", TAB_BAR_SPACE)}>{children}</main>
      <FloatingTabBar items={TUTOR_TABS} />
    </div>
  );
}
