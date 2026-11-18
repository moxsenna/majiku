import { cn } from "@/lib/utils";
import { KELAS_KRAYON, krayonDari, type Krayon } from "@/lib/krayon";

/** Chip kelas (kit .ck): warna krayon kelas, dipakai juga di garis kalender & avatar kelas. */
export function ClassChip({
  name,
  id,
  krayon,
  className,
}: {
  name: string;
  /** ID kelas → krayon tetap. Abaikan bila `krayon` diisi. */
  id?: string | null;
  krayon?: Krayon;
  className?: string;
}) {
  const k = KELAS_KRAYON[krayon ?? krayonDari(id ?? name)];
  return (
    <span className={cn("inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[13px] font-semibold", k.soft, k.ink, className)}>
      <span aria-hidden className={cn("h-[7px] w-[7px] rounded-full", k.bg)} />
      {name}
    </span>
  );
}

/** Chip filter (kit .fc): aktif = Tinta. */
export function FilterChip({
  active,
  count,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; count?: number | string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-chip items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft",
        "relative before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']",
        active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground-2 hover:border-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && <span className={cn("tabular font-normal", active ? "opacity-75" : "text-muted-foreground")}>{count}</span>}
    </button>
  );
}
