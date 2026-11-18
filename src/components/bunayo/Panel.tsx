import { cn } from "@/lib/utils";

/** Panel bergaris Tinta (kit .pn): kartu di halaman memakai garis, bukan bayangan. */
export function Panel({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("min-w-0 rounded border border-border bg-card", className)} {...props}>
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  meta,
  action,
  className,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-baseline justify-between gap-3 border-b border-foreground px-[18px] py-3.5", className)}>
      <h3 className="font-display text-[19px] font-bold tracking-tight">{title}</h3>
      <div className="flex items-baseline gap-3">
        {meta !== undefined && <span className="text-[13px] text-muted-foreground">{meta}</span>}
        {action}
      </div>
    </header>
  );
}

export function PanelBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-[18px] py-4", className)}>{children}</div>;
}

/** Baris daftar dalam panel (kit .li), tinggi minimum 52. */
export function PanelRow({
  children,
  className,
  stacked,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { stacked?: boolean }) {
  return (
    <div
      className={cn(
        "flex min-h-[52px] gap-3 border-b border-border-subtle px-[18px] py-3 last:border-b-0 max-[560px]:flex-wrap",
        stacked ? "flex-col items-stretch gap-2.5" : "items-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Judul & keterangan baris (kit .li .t / .s). */
export function RowText({ title, sub, className }: { title: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return (
    <span className={cn("min-w-0 flex-1", className)}>
      <span className="block truncate text-[15px] font-semibold">{title}</span>
      {sub && <span className="block text-[13px] text-muted-foreground">{sub}</span>}
    </span>
  );
}

/** Skeleton baris panel. */
export function PanelRowsSkeleton({ rows = 3, avatar }: { rows?: number; avatar?: boolean }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <PanelRow key={i}>
          {avatar && <span className="sk sk-circle h-10 w-10 shrink-0" />}
          <span className="flex flex-1 flex-col gap-2">
            <span className="sk h-3.5 w-2/5" />
            <span className="sk sk-light h-3 w-3/5" />
          </span>
        </PanelRow>
      ))}
    </>
  );
}
