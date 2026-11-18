import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Angka ringkasan (kit .stats/.stat). Aturan: selalu dengan periode, selalu bisa diklik ke daftar sumbernya,
 * stabilo hanya pada satu angka per layar.
 */
export function StatRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap overflow-hidden rounded border border-border bg-card", className)}>{children}</div>
  );
}

export interface StatCardProps {
  /** Nama angka, mis. "Tiba" */
  label: string;
  /** Label periode wajib, mis. "hari ini", "Nov 2026", "semua periode" */
  periode: string;
  value: React.ReactNode;
  /** Keterangan kecil di samping angka, mis. "/38" atau "dari Rp 18,4 jt terbit" */
  suffix?: React.ReactNode;
  /** Tautan ke daftar sumber */
  href?: string;
  linkLabel?: string;
  onClick?: () => void;
  tone?: "default" | "red";
  /** Angka besar ber-font display */
  big?: boolean;
  /** Stabilo: hanya satu per layar */
  stabilo?: boolean;
  className?: string;
}

export function StatCard({ label, periode, value, suffix, href, linkLabel, onClick, tone, big, stabilo, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-[150px] flex-1 flex-col gap-[3px] border-b border-r border-border px-[18px] py-3.5 last:border-r-0",
        // ≤1000: 2×2 agar angka penuh tidak terpotong di kolom sempit (rail 834).
        "max-[1000px]:min-w-[46%]",
        "max-[560px]:min-w-[50%]",
        className,
      )}
    >
      <span className="text-xs text-muted-foreground">
        {label} · {periode}
      </span>
      <span
        className={cn(
          big ? "font-display text-[34px] font-extrabold tracking-tight" : "tabular text-2xl max-[560px]:text-xl",
          "leading-tight",
          tone === "red" && "text-destructive",
        )}
      >
        <span className={cn("whitespace-nowrap", stabilo && "hl")}>{value}</span>
        {suffix && <small className="text-[13px] text-muted-foreground">{suffix}</small>}
      </span>
      {linkLabel &&
        (href ? (
          <Link href={href} className="text-[13px] font-semibold text-primary hover:underline">
            {linkLabel}
          </Link>
        ) : onClick ? (
          <button type="button" onClick={onClick} className="self-start text-[13px] font-semibold text-primary hover:underline">
            {linkLabel}
          </button>
        ) : (
          <span className="text-[13px] text-muted-foreground">{linkLabel}</span>
        ))}
    </div>
  );
}

/** Skeleton baris angka. */
export function StatRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <StatRow>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex min-w-[150px] flex-1 flex-col gap-2 border-r border-border px-[18px] py-3.5 last:border-r-0">
          <span className="sk h-3 w-24" />
          <span className="sk h-6 w-16" />
          <span className="sk sk-light h-3 w-20" />
        </div>
      ))}
    </StatRow>
  );
}
