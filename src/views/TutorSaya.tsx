"use client";

import Link from "next/link";
import { ChevronRight, ClipboardCheck, ClipboardList, LogOut, Target, type LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIstilah } from "@/hooks/useIstilah";
import { KidAvatar, MobileCard, MobileGroupTitle, MobileHeader, ThemeToggle } from "@/components/bunayo";

function MenuRow({ href, icon: Icon, label, sub }: { href: string; icon: LucideIcon; label: string; sub?: string }) {
  return (
    <Link href={href} className="flex min-h-touch items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0 hover:bg-muted">
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1">
        <b className="block text-[15px] font-semibold">{label}</b>
        {sub && <small className="block text-[13px] text-muted-foreground">{sub}</small>}
      </span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden />
    </Link>
  );
}

/**
 * G10 Saya (kerangka Fase 2): pintu ke absensi diri, kinerja, antrean trial, tema, dan Keluar (N30).
 * Isi lengkap layar G10 dikerjakan di Fase 4.
 */
export default function TutorSaya() {
  const { user, signOut } = useAuth();
  const istilah = useIstilah();
  const name = user?.name || user?.email || "";

  return (
    <div className="flex flex-col gap-3 pb-4">
      <MobileHeader title="Saya" />
      <div className="flex flex-col gap-3 px-4">
        <MobileCard className="flex-row items-center gap-3">
          {name ? <KidAvatar name={name} size="lg" krayon="anggur" /> : <span className="sk sk-circle h-12 w-12" />}
          <span className="min-w-0">
            <b className="block truncate font-display text-lg font-bold">{name || "…"}</b>
            <small className="block truncate text-[13px] text-muted-foreground">{istilah.guru}{user?.email ? ` · ${user.email}` : ""}</small>
          </span>
        </MobileCard>

        <MobileGroupTitle>Kerja</MobileGroupTitle>
        <MobileCard flat>
          <MenuRow href="/tutor/attendance" icon={ClipboardCheck} label="Absen saya" sub="Masuk, pulang, dan izin" />
          <MenuRow href="/tutor/kpi" icon={Target} label="Kinerja" sub="Kehadiran dan laporan bulan ini" />
          <MenuRow href="/tutor/trials" icon={ClipboardList} label="Observasi trial" sub="Anak trial yang perlu dinilai" />
        </MobileCard>

        <MobileGroupTitle>Tampilan</MobileGroupTitle>
        <MobileCard>
          <ThemeToggle />
        </MobileCard>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            window.location.href = "/tutor/login";
          }}
          className="mt-2 flex h-btn-lg items-center justify-center gap-2 rounded-sheet bg-card text-[15px] font-semibold text-destructive hover:bg-muted"
        >
          <LogOut className="h-5 w-5" aria-hidden />
          Keluar
        </button>
      </div>
    </div>
  );
}
