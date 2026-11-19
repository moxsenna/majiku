"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { KidAvatar } from "./KidAvatar";

/* ---------------- Navigasi bawah melayang (guru & orang tua) ---------------- */

export interface TabItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Titik Tomat = ada yang belum dibaca */
  dot?: boolean;
  /** Path lain yang juga mengaktifkan tab ini */
  match?: string[];
  exact?: boolean;
}

function isActive(pathname: string, t: TabItem) {
  const paths = [t.href, ...(t.match ?? [])];
  return paths.some((p) => (t.exact ? pathname === p : pathname === p || pathname.startsWith(`${p}/`)));
}

/**
 * Kit .fnav: 68 px, empat tab berikon 24 px & berlabel, aktif = pil Tinta. Target sentuh ≥ 80×56.
 */
export function FloatingTabBar({ items, className }: { items: TabItem[]; className?: string }) {
  const pathname = usePathname() ?? "";
  return (
    <nav
      aria-label="Navigasi utama"
      className={cn(
        "fixed inset-x-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-40 mx-auto grid h-[68px] max-w-[440px] rounded-full bg-card/90 p-1.5 shadow-float ring-1 ring-border/60 backdrop-blur-xl backdrop-saturate-150",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((t) => {
        const on = isActive(pathname, t);
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "relative flex min-h-14 flex-col items-center justify-center gap-[3px] rounded-sheet text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft",
              on ? "bg-nav-active text-nav-active-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-6 w-6" aria-hidden />
            {t.label}
            {t.dot && <span aria-label="belum dibaca" className="absolute right-6 top-1.5 h-2 w-2 rounded-full bg-tomat" />}
          </Link>
        );
      })}
    </nav>
  );
}

/** Ruang di bawah konten agar tidak tertutup navigasi melayang. */
export const TAB_BAR_SPACE = "pb-[110px]";

/* ---------------- Header mobile ---------------- */

/** Kit .mh (diperkecil untuk HP): judul Bricolage 26 + subjudul, opsional aksi kanan (tombol bulat 48). */
export function MobileHeader({
  title,
  sub,
  eyebrow,
  right,
  className,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  eyebrow?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-center justify-between gap-2.5 px-4 pb-3 pt-1.5", className)}>
      <div className="min-w-0">
        {eyebrow && <span className="block text-[15px] font-medium text-muted-foreground">{eyebrow}</span>}
        <h1 className="font-display text-[26px] font-bold leading-[1.1] tracking-[-0.025em]">{title}</h1>
        {sub && <span className="block text-[15px] font-medium text-muted-foreground">{sub}</span>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}

/** Header sub-halaman: tombol kembali 44 + judul 22. */
export function MobileSubHeader({
  title,
  eyebrow,
  backHref,
  onBack,
  right,
}: {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const back = (
    <span className="grid h-touch w-touch shrink-0 place-items-center rounded-full bg-card shadow-soft">
      <ChevronLeft className="h-5 w-5" aria-hidden />
    </span>
  );
  return (
    <header className="flex items-center gap-2.5 px-4 pb-3 pt-1.5">
      {backHref ? (
        <Link href={backHref} aria-label="Kembali">
          {back}
        </Link>
      ) : (
        <button type="button" onClick={onBack} aria-label="Kembali">
          {back}
        </button>
      )}
      <div className="min-w-0 flex-1">
        {eyebrow && <span className="tabular block text-[13px] text-muted-foreground">{eyebrow}</span>}
        <span className="block truncate font-display text-[22px] font-bold tracking-tight">{title}</span>
      </div>
      {right}
    </header>
  );
}

/** Tombol bulat putih 48 (kit .cb-w), mis. notifikasi; titik Tomat bila ada yang baru. */
export function RoundIconButton({
  icon: Icon,
  label,
  dot,
  href,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  dot?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <Icon className="h-5 w-5" aria-hidden />
      {dot && <span className="absolute right-3 top-[11px] h-[9px] w-[9px] rounded-full border-2 border-card bg-tomat" />}
    </>
  );
  const cls = "relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-card shadow-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft";
  return href ? (
    <Link href={href} aria-label={label} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {inner}
    </button>
  );
}

/* ---------------- Pemilih anak (orang tua) ---------------- */

export interface KidOption {
  id: string;
  name: string;
  photoUrl?: string | null;
}

/**
 * Pemilih anak = deretan avatar (kit .kidsw). Anak aktif membuka label nama; anak lain cukup wajahnya.
 * 1 anak: pemilih disembunyikan (judul jadi "Kabar Kayla"). 4+ anak: sisanya masuk "+N".
 */
export function KidSwitcher({
  kids,
  activeId,
  onChange,
  max = 3,
  className,
}: {
  kids: KidOption[];
  activeId: string | null;
  onChange: (id: string) => void;
  max?: number;
  className?: string;
}) {
  if (kids.length <= 1) return null;
  const activeIdx = Math.max(0, kids.findIndex((k) => k.id === activeId));
  // Anak aktif selalu terlihat walau di luar `max`.
  const visible = kids.slice(0, max);
  if (activeIdx >= max) visible[max - 1] = kids[activeIdx];
  const hidden = kids.filter((k) => !visible.includes(k));
  return (
    <div role="tablist" aria-label="Pilih anak" className={cn("flex items-center gap-1.5 rounded-full bg-card p-1 shadow-soft", className)}>
      {visible.map((k) => {
        const on = k.id === (activeId ?? kids[0].id);
        const panggilan = k.name.trim().split(/\s+/)[0];
        return (
          <button
            key={k.id}
            type="button"
            role="tab"
            aria-selected={on}
            aria-label={k.name}
            onClick={() => onChange(k.id)}
            className={cn(
              "flex h-10 min-w-10 items-center gap-2 rounded-full font-display text-base font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft",
              on ? "bg-muted pr-3 text-foreground" : "text-muted-foreground",
            )}
          >
            <KidAvatar id={k.id} name={k.name} photoUrl={k.photoUrl} size="md" />
            {on && <span>{panggilan}</span>}
          </button>
        );
      })}
      {hidden.length > 0 && (
        <button
          type="button"
          onClick={() => onChange(hidden[0].id)}
          aria-label={`${hidden.length} anak lainnya`}
          className="grid h-10 w-10 place-items-center rounded-full bg-muted text-sm font-semibold"
        >
          +{hidden.length}
        </button>
      )}
    </div>
  );
}

/* ---------------- Kartu & grup daftar mobile ---------------- */

/** Kartu mobile (kit .mc): putih, radius sheet. */
export function MobileCard({ children, flat, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { flat?: boolean }) {
  return (
    <div className={cn("flex flex-col rounded-sheet bg-card", flat ? "overflow-hidden" : "gap-2.5 p-4", className)} {...props}>
      {children}
    </div>
  );
}

/** Judul grup daftar gaya iOS (kit .mgrp-t). */
export function MobileGroupTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="px-1 pt-2 font-sans text-[13px] font-semibold uppercase tracking-[0.02em] text-muted-foreground">{children}</h2>;
}
