"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BunayoLogo, BunayoMark } from "./Logo";
import { KidAvatar } from "./KidAvatar";
import { ThemeToggle } from "./ThemeToggle";

/* ------------------------------------------------------------------ */
/* Model navigasi                                                       */
/* ------------------------------------------------------------------ */

export interface NavSub {
  label: string;
  href: string;
  /** Path tambahan yang mengaktifkan sub ini */
  match?: string[];
  exact?: boolean;
}

export interface NavItem {
  key: string;
  label: string;
  /** Label pendek untuk rail tablet */
  short?: string;
  href: string;
  icon?: LucideIcon;
  /** Angka hanya untuk hal yang perlu tindakan (kit .n.u) */
  badge?: number;
  /** Item anak yang tampil menjorok tanpa ikon (mis. Pendaftaran & Trial) */
  indent?: boolean;
  sub?: NavSub[];
  /** Path yang mengaktifkan item ini (selain href & sub) */
  match?: string[];
}

export type NavEntry = NavItem | { group: string };

export interface AdminShellProps {
  nav: NavEntry[];
  /** Pengaturan di kaki sidebar */
  settings: NavItem;
  /** Lima tab navigasi bawah (≤ 560 px); tab ke-5 "Lainnya" membuka menu lengkap */
  mobileTabs: { key: string; label: string; icon: LucideIcon; href?: string; dot?: boolean }[];
  org: { name: string; sub?: string | null } | null;
  user: { name: string; role: string; image?: string | null } | null;
  onSignOut: () => void;
  /** Lonceng notifikasi (topbar mobile). Kosongkan bila belum ada sumber notifikasi nyata. */
  notifSlot?: React.ReactNode;
  /** Aksi cari global: Enter → hasil */
  onSearch?: (q: string) => void;
  children: React.ReactNode;
}

function matches(pathname: string, href: string, extra: string[] = [], exact = false) {
  return [href, ...extra].some((p) => (exact ? pathname === p : pathname === p || pathname.startsWith(`${p}/`)));
}

function isItemActive(pathname: string, item: NavItem) {
  return (
    matches(pathname, item.href, item.match) ||
    (item.sub ?? []).some((s) => matches(pathname, s.href, s.match, s.exact))
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar (1440: 232 px · 834: rail 76 px)                             */
/* ------------------------------------------------------------------ */

function SidebarNav({
  nav,
  pathname,
  rail,
  onNavigate,
}: {
  nav: NavEntry[];
  pathname: string;
  rail?: boolean;
  onNavigate?: () => void;
}) {
  const renderItem = (item: NavItem) => {
    const on = isItemActive(pathname, item);
    const Icon = item.icon;
    const urgent = (item.badge ?? 0) > 0;
    if (rail && item.indent) return null;
    return (
      <div key={item.key}>
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={on ? "page" : undefined}
          className={cn(
            "relative flex items-center rounded text-sidebar-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft",
            rail
              ? "mx-auto h-[54px] w-[60px] flex-col justify-center gap-[3px] text-center text-[10px] leading-tight"
              : "h-9 gap-2.5 whitespace-nowrap px-2 text-sm",
            !rail && item.indent && "h-8 pl-9 text-[13px]",
            on && "bg-muted font-semibold text-foreground",
            on && (rail ? "before:-left-2" : "before:-left-3.5"),
            on && "before:absolute before:bottom-1.5 before:top-1.5 before:w-[3px] before:rounded-r-xs before:bg-foreground before:content-['']",
          )}
        >
          {Icon && <Icon className={cn("h-[18px] w-[18px] shrink-0", on ? "text-foreground" : "text-muted-foreground")} aria-hidden />}
          <span className={cn(rail && "max-w-[58px] truncate")}>{rail ? item.short ?? item.label : item.label}</span>
          {!rail && item.badge !== undefined && item.badge > 0 && (
            <span className={cn("tabular ml-auto text-xs", urgent ? "text-destructive" : "text-muted-foreground")}>{item.badge}</span>
          )}
          {rail && urgent && <span aria-label={`${item.badge} perlu tindakan`} className="absolute right-3.5 top-2 h-[7px] w-[7px] rounded-full bg-destructive" />}
        </Link>
        {!rail && on && item.sub && (
          <div className="flex flex-col gap-px">
            {item.sub.map((s) => {
              const subOn = matches(pathname, s.href, s.match, s.exact);
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={onNavigate}
                  aria-current={subOn ? "page" : undefined}
                  className={cn(
                    "relative flex h-8 items-center whitespace-nowrap rounded pl-9 pr-2 text-[13px] hover:bg-muted",
                    subOn ? "bg-muted font-semibold text-foreground before:absolute before:-left-3.5 before:bottom-1.5 before:top-1.5 before:w-[3px] before:rounded-r-xs before:bg-foreground before:content-['']" : "text-sidebar-foreground",
                  )}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav aria-label="Menu admin" className={cn("flex flex-col gap-px", rail && "items-stretch")}>
      {nav.map((e, i) =>
        "group" in e ? (
          rail ? null : (
            <div key={`g-${i}`} className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {e.group}
            </div>
          )
        ) : (
          renderItem(e)
        ),
      )}
    </nav>
  );
}

function SidebarSearch({ onSearch }: { onSearch?: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <label className="flex h-9 items-center gap-2 overflow-hidden rounded border border-border px-2.5 text-[13px] text-muted-foreground focus-within:border-primary">
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q.trim()) onSearch?.(q.trim());
        }}
        placeholder="Cari siswa (Enter)"
        aria-label="Cari siswa"
        className="h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

function OrgBox({ org }: { org: AdminShellProps["org"] }) {
  if (!org) return <span className="sk h-[50px] w-full rounded" />;
  const isDemo = org.name.toLowerCase().includes("demo");
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 rounded border border-border px-2.5 py-2">
        <KidAvatar name={org.name} size="xs" />
        <span className="min-w-0 flex-1">
          <b className="block truncate text-sm text-foreground">{org.name}</b>
          {org.sub && <small className="block truncate text-xs text-muted-foreground">{org.sub}</small>}
        </span>
      </div>
      {isDemo && (
        <div className="flex items-center justify-between rounded bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          <span className="flex items-center gap-1.5">
            <span>👁️</span>
            <span>Mode Demo Aktif</span>
          </span>
          <span className="text-[10px] opacity-75">Simulasi</span>
        </div>
      )}
    </div>
  );
}

function SidebarFoot({
  settings,
  pathname,
  user,
  onSignOut,
  rail,
  onNavigate,
}: {
  settings: NavItem;
  pathname: string;
  user: AdminShellProps["user"];
  onSignOut: () => void;
  rail?: boolean;
  onNavigate?: () => void;
}) {
  const on = isItemActive(pathname, settings);
  const Icon = settings.icon;
  return (
    <div className={cn("mt-auto flex flex-col gap-0.5 border-t border-border pt-3", rail && "items-center")}>
      <Link
        href={settings.href}
        onClick={onNavigate}
        aria-current={on ? "page" : undefined}
        className={cn(
          "relative flex items-center rounded text-sidebar-foreground hover:bg-muted",
          rail ? "h-[54px] w-[60px] flex-col justify-center gap-[3px] text-[10px]" : "h-9 gap-2.5 px-2 text-sm",
          on && "bg-muted font-semibold text-foreground",
        )}
      >
        {Icon && <Icon className={cn("h-[18px] w-[18px]", on ? "text-foreground" : "text-muted-foreground")} aria-hidden />}
        <span>{rail ? settings.short ?? settings.label : settings.label}</span>
      </Link>
      {!rail && on && settings.sub && (
        <div className="flex flex-col gap-px">
          {settings.sub.map((s) => {
            const subOn = matches(pathname, s.href, s.match, s.exact);
            return (
              <Link
                key={s.href}
                href={s.href}
                onClick={onNavigate}
                className={cn("flex h-8 items-center rounded pl-9 text-[13px] hover:bg-muted", subOn ? "bg-muted font-semibold text-foreground" : "text-sidebar-foreground")}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      )}
      {!rail && <ThemeToggle compact className="my-1.5" />}
      <div className={cn("flex items-center gap-2.5 p-2", rail && "justify-center")}>
        {user ? <KidAvatar name={user.name} photoUrl={user.image} size="sm" krayon="anggur" /> : <span className="sk sk-circle h-[34px] w-[34px]" />}
        {!rail && (
          <div className="min-w-0 flex-1">
            <b className="block truncate text-sm">{user?.name ?? "…"}</b>
            <small className="text-xs text-muted-foreground">
              {user?.role ?? ""}
              {user && " · "}
              <button type="button" onClick={onSignOut} className="font-semibold text-primary hover:underline">
                Keluar
              </button>
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                                */
/* ------------------------------------------------------------------ */

/**
 * Shell admin Bunayo (desktop-first):
 * ≥ 1001 px sidebar putih 232 px (tiga grup, sub-menu hanya untuk menu aktif) ·
 * 561–1000 px rail ikon 76 px (titik merah menggantikan angka) ·
 * ≤ 560 px topbar (logo, lembaga, cari, notifikasi) + navigasi bawah 5.
 */
export function AdminShell({ nav, settings, mobileTabs, org, user, onSignOut, notifSlot, onSearch, children }: AdminShellProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const search = onSearch ?? ((q: string) => router.push(`/students?q=${encodeURIComponent(q)}`));

  const allItems = nav.filter((e): e is NavItem => !("group" in e));
  const tabActive = (key: string) => {
    const item = allItems.find((i) => i.key === key);
    return item ? isItemActive(pathname, item) : false;
  };
  const mainTabKeys = mobileTabs.filter((t) => t.href).map((t) => t.key);
  const lainnyaOn = !mainTabKeys.some(tabActive);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar flex-col gap-[18px] overflow-y-auto border-r border-sidebar-border bg-sidebar px-3.5 py-5 text-sidebar-foreground min-[1001px]:flex">
        <Link href="/dashboard" className="px-1.5" aria-label="Hari Ini">
          <BunayoLogo height={30} priority />
        </Link>
        <OrgBox org={org} />
        <SidebarSearch onSearch={search} />
        <SidebarNav nav={nav} pathname={pathname} />
        <SidebarFoot settings={settings} pathname={pathname} user={user} onSignOut={onSignOut} />
      </aside>

      {/* Rail tablet */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-rail flex-col items-center gap-2.5 overflow-y-auto border-r border-sidebar-border bg-sidebar px-2 py-4 min-[561px]:max-[1000px]:flex">
        <Link href="/dashboard" aria-label="Hari Ini" className="mb-1">
          <BunayoMark height={40} />
        </Link>
        <SidebarNav nav={nav} pathname={pathname} rail />
        <SidebarFoot settings={settings} pathname={pathname} user={user} onSignOut={onSignOut} rail />
      </aside>

      {/* Topbar mobile */}
      <header className="sticky top-0 z-30 hidden items-center gap-2 bg-background px-4 pb-1.5 pt-3.5 max-[560px]:flex">
        <BunayoMark height={36} />
        {org && (
          <span className="flex h-10 min-w-0 items-center gap-2 rounded-full border border-border bg-card px-2.5 text-sm font-semibold">
            <KidAvatar name={org.name} size="xs" />
            <span className="truncate">{org.name}</span>
          </span>
        )}
        <span className="flex-1" />
        <Link href="/students" aria-label="Cari siswa" className="grid h-touch w-touch place-items-center rounded-full border border-border bg-card">
          <Search className="h-[18px] w-[18px]" aria-hidden />
        </Link>
        {notifSlot}
      </header>

      <main className="min-w-0 pb-24 min-[561px]:pb-0 min-[561px]:max-[1000px]:pl-[76px] min-[1001px]:pl-[232px]">{children}</main>

      {/* Navigasi bawah mobile: 5 tab */}
      <nav
        aria-label="Navigasi admin"
        className="fixed inset-x-0 bottom-0 z-30 hidden grid-cols-5 border-t border-border bg-card px-1 pb-[max(18px,env(safe-area-inset-bottom))] pt-1.5 max-[560px]:grid"
      >
        {mobileTabs.map((t) => {
          const on = t.href ? tabActive(t.key) : lainnyaOn;
          const Icon = t.icon;
          const cls = cn(
            "relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded text-[11px] font-semibold",
            on ? "text-foreground" : "text-muted-foreground",
          );
          const icon = (
            <span className={cn("grid place-items-center", on && "h-7 w-11 rounded-full bg-nav-active text-nav-active-foreground")}>
              <Icon className="h-5 w-5" aria-hidden />
            </span>
          );
          return t.href ? (
            <Link key={t.key} href={t.href} aria-current={on ? "page" : undefined} className={cls}>
              {icon}
              {t.label}
              {t.dot && <span className="absolute right-[calc(50%-16px)] top-1 h-2 w-2 rounded-full bg-destructive" />}
            </Link>
          ) : (
            <button key={t.key} type="button" onClick={() => setMoreOpen(true)} className={cls} aria-haspopup="dialog">
              {icon}
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Menu "Lainnya" (lembar bawah) */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <span aria-hidden className="mx-auto block h-[5px] w-10 rounded-full bg-border" />
          <SheetTitle>Menu</SheetTitle>
          <div className="flex flex-col gap-3">
            <OrgBox org={org} />
            <SidebarNav nav={nav} pathname={pathname} onNavigate={() => setMoreOpen(false)} />
            <SidebarFoot settings={settings} pathname={pathname} user={user} onSignOut={onSignOut} onNavigate={() => setMoreOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
