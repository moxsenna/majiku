"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  LifeBuoy,
  LogOut,
  Mail,
  ShieldCheck,
  Sprout,
  Store,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { inisial } from "@/lib/format";
import { isDemoEmail } from "@/lib/demo";
import { useAuth } from "@/hooks/useAuth";
import { KidAvatar, MobileGroupTitle, MobileSubHeader } from "@/components/bunayo";
import { getMyChildren } from "@/server/actions/parentChildren";

function MenuRow({
  href,
  icon: Icon,
  label,
  sub,
  className,
  iconBg,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  sub?: string;
  className?: string;
  iconBg?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex min-h-touch items-center gap-3 border-b border-border-subtle px-4 py-3 text-left last:border-b-0 hover:bg-muted", className)}
    >
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", iconBg ?? "bg-muted text-muted-foreground")}>
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <b className="block text-[15px] font-semibold">{label}</b>
        {sub && <small className="block truncate text-[13px] text-muted-foreground">{sub}</small>}
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}

export default function ParentProfile() {
  const { user, signOut } = useAuth();
  const { data: children = [] } = useQuery({ queryKey: ["my-children"], queryFn: getMyChildren });

  const nama = user?.name || "Orang Tua Siswa";
  const email = user?.email;

  return (
    <>
      <MobileSubHeader title="Profil" backHref="/parent" />

      <div className="flex flex-col gap-4 px-4 pb-4">
        <section className="rise field-ink flex items-center gap-4 rounded-[28px] bg-langit p-5">
          <KidAvatar
            name={nama}
            photoUrl={user?.image || (isDemoEmail(email) ? "/images/avatars/parent-anita.webp" : undefined)}
            size="xl"
            className="shrink-0 ring-4 ring-[hsl(0_0%_100%/.55)]"
          />
          <div className="min-w-0">
            <h1 className="truncate font-display text-[26px] font-bold leading-[1.1] tracking-[-0.025em]">{nama}</h1>
            <span className="field-sub flex items-center gap-1.5 text-sm" title={email}>
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{email || "—"}</span>
            </span>
          </div>
        </section>

        {children.length > 0 && (
          <section className="flex flex-col gap-2">
            <MobileGroupTitle>Anak saya</MobileGroupTitle>
            <ul className="overflow-hidden rounded-sheet bg-card">
              {children.map((c) => (
                <li key={c.id} className="flex min-h-16 items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0">
                  <KidAvatar id={c.id} name={c.nickname || c.name} photoUrl={c.avatar} size="md" tiba={c.attendanceToday} />
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-[15px] font-semibold">{c.nickname || c.name}</b>
                    <small className="block truncate text-[13px] text-muted-foreground">
                      {c.className} · {c.age} th
                    </small>
                  </span>
                  {c.attendanceToday && (
                    <small className="shrink-0 text-[13px] font-semibold text-daun-ink">Sudah tiba</small>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <MobileGroupTitle>Jelajahi</MobileGroupTitle>
          <ul className="overflow-hidden rounded-sheet bg-card">
            <MenuRow
              href="/parent/registration"
              icon={Sprout}
              iconBg="bg-daun-soft text-daun-ink"
              label="Daftar program / trial"
              sub="Kelas baru untuk anak atau adiknya"
            />
            <MenuRow
              href="/parent/marketplace"
              icon={Store}
              iconBg="bg-anggur-soft text-anggur-ink"
              label="Cari lembaga"
              sub="Daycare, preschool & bimbel terverifikasi"
            />
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <MobileGroupTitle>Bantuan & keamanan</MobileGroupTitle>
          <div className="rounded-sheet bg-card px-4 py-3.5">
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-langit-soft text-langit-ink">
                <LifeBuoy className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <p className="text-[13px] leading-relaxed text-foreground-2">
                Butuh bantuan? Hubungi lembaga Anda lewat menu <Link href="/parent/chat" className="font-semibold text-primary">Pesan</Link>.
              </p>
            </div>
            <div className="mt-3 flex gap-3 border-t border-border-subtle pt-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-daun-soft text-daun-ink">
                <ShieldCheck className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <p className="text-[13px] leading-relaxed text-foreground-2">
                Login Anda terlindungi kata sandi, dan sesi hanya berlaku di perangkat ini.
              </p>
            </div>
          </div>
          <p className="tabular px-1 text-[11px] text-muted-foreground">Bunayo Parent v1.0.0</p>
        </section>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            window.location.href = "/parent/login";
          }}
          className="press flex h-btn-lg items-center justify-center gap-2 rounded-sheet bg-card text-[15px] font-semibold text-destructive hover:bg-muted"
        >
          <LogOut className="h-5 w-5" aria-hidden /> Keluar
        </button>
      </div>
    </>
  );
}
