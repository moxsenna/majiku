import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Kepala halaman admin (kit .ph): eyebrow mono, judul Bricolage 40/34/28, aksi di kanan.
 * Di ≤ 560 px hanya aksi utama (biru) yang tampil — beri `className="max-[560px]:hidden"` pada aksi lain.
 */
export function PageHeader({
  title,
  eyebrow,
  crumbs,
  actions,
  className,
}: {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  crumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-6 px-8 pt-8 max-[1000px]:px-6 max-[1000px]:pt-6 max-[560px]:gap-3 max-[560px]:px-4 max-[560px]:pt-2",
        className,
      )}
    >
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Lokasi" className="mb-1.5 flex items-center gap-1 text-[13px] text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-foreground hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <span className="tabular mb-1.5 block text-[13px] text-muted-foreground">{eyebrow}</span>}
        <h1 className="font-display text-[40px] font-bold leading-[1.02] tracking-tight max-[1000px]:text-[34px] max-[560px]:text-[28px]">
          {title}
        </h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Badan halaman admin (kit .pb). */
export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-5 px-8 pb-8 pt-6 max-[1000px]:px-6 max-[1000px]:pb-7 max-[1000px]:pt-5 max-[560px]:gap-4 max-[560px]:px-4 max-[560px]:pb-6 max-[560px]:pt-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
