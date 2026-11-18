import { cn } from "@/lib/utils";
import type { StatusInfo, VarianStatus } from "@/lib/status";

const VARIAN: Record<VarianStatus, { text: string; dot: string }> = {
  ok: { text: "text-success", dot: "bg-daun" },
  wait: { text: "text-warning", dot: "bg-matahari" },
  info: { text: "text-info", dot: "bg-langit" },
  ang: { text: "text-anggur-ink", dot: "bg-anggur" },
  off: { text: "text-muted-foreground", dot: "h-1.5 w-1.5 border-[1.5px] border-muted-foreground bg-transparent" },
  alert: { text: "text-destructive", dot: "" },
};

/**
 * Status = titik + teks (kit .st). Varian "alert" = pil merah muda, hanya untuk yang perlu tindakan sekarang.
 * Pakai `info` dari @/lib/status (statusTagihan, statusKehadiran, …) atau `varian` + children.
 */
export function StatusDot({
  info,
  varian,
  children,
  size = "md",
  className,
}: {
  info?: StatusInfo;
  varian?: VarianStatus;
  children?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  const v = info?.varian ?? varian ?? "off";
  const label = children ?? info?.label;
  const s = VARIAN[v];
  if (v === "alert") {
    return (
      <span
        className={cn(
          "inline-flex items-center whitespace-nowrap rounded-full bg-destructive-soft px-2.5 py-0.5 font-semibold text-destructive",
          size === "sm" ? "text-[13px]" : "text-sm",
          className,
        )}
      >
        {label}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap font-semibold", s.text, size === "sm" ? "text-[13px]" : "text-sm", className)}>
      <span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", s.dot)} />
      {label}
    </span>
  );
}
