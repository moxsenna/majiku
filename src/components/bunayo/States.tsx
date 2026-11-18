import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { KELAS_KRAYON, type Krayon } from "@/lib/krayon";

/**
 * Kosong (kit .empty): judul + langkah berikutnya + satu aksi. Harus mengajarkan apa yang dilakukan selanjutnya.
 */
export function EmptyState({
  title,
  description,
  action,
  dots = ["tomat", "matahari", "daun"],
  compact,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  dots?: Krayon[];
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2.5 rounded border border-border bg-card",
        compact ? "p-5" : "p-8",
        className,
      )}
    >
      <span aria-hidden className="flex gap-1">
        {dots.map((d) => (
          <i key={d} className={cn("block h-3.5 w-3.5 rounded-full", KELAS_KRAYON[d].bg)} />
        ))}
      </span>
      <h4 className={cn("font-display font-bold tracking-tight", compact ? "text-xl" : "text-2xl")}>{title}</h4>
      {description && <p className="max-w-[560px] text-[15px] leading-relaxed text-foreground-2">{description}</p>}
      {action && <div className="mt-1 flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

/**
 * Galat per section (kit .errb). Data lama tetap tampil redup di bawahnya (bungkus dengan <Stale>).
 */
export function ErrorBanner({
  title,
  description,
  onRetry,
  retryLabel = "Coba lagi",
  className,
}: {
  title: string;
  description?: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center justify-between gap-4 rounded border-[1.5px] border-destructive bg-card px-4 py-3.5 max-[560px]:flex-col max-[560px]:items-stretch",
        className,
      )}
    >
      <div className="min-w-0">
        <b className="block text-destructive">{title}</b>
        {description && <span className="text-sm text-foreground-2">{description}</span>}
      </div>
      {onRetry && (
        <Button variant="sec" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/** Data lama saat galat: tetap terlihat, redup, tidak bisa diklik. */
export function Stale({ stale, children }: { stale?: boolean; children: React.ReactNode }) {
  return <div className={cn(stale && "stale")} aria-busy={stale || undefined}>{children}</div>;
}

/** Info lembut (kit .info-b). */
export function InfoBox({ icon, children, className }: { icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2.5 rounded bg-muted px-3.5 py-3 text-sm", className)}>
      {icon}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * Pembungkus 4 state untuk satu section: memuat → skeleton, galat tanpa data → banner,
 * galat dengan data lama → banner + data redup, kosong → EmptyState, isi → children.
 */
export function SectionState<T>({
  query,
  isEmpty,
  skeleton,
  empty,
  errorTitle,
  children,
}: {
  query: { data: T | undefined; isLoading: boolean; isError: boolean; refetch: () => unknown; dataUpdatedAt?: number };
  isEmpty?: (data: T) => boolean;
  skeleton: React.ReactNode;
  empty?: React.ReactNode;
  errorTitle: string;
  children: (data: T) => React.ReactNode;
}) {
  const { data, isLoading, isError, refetch } = query;
  if (isLoading && data === undefined) return <>{skeleton}</>;
  if (isError && data === undefined) {
    return <ErrorBanner title={errorTitle} description="Tidak ada yang terkirim atau berubah." onRetry={() => refetch()} />;
  }
  if (data === undefined) return <>{skeleton}</>;
  if (!isError && isEmpty?.(data) && empty) return <>{empty}</>;
  return (
    <div className="flex flex-col gap-3">
      {isError && (
        <ErrorBanner
          title={errorTitle}
          description="Yang tampil di bawah adalah data terakhir yang berhasil dimuat."
          onRetry={() => refetch()}
        />
      )}
      <Stale stale={isError}>{children(data)}</Stale>
    </div>
  );
}
