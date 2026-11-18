import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Langkah (kit .steps): aktif = Tinta, selesai = centang hijau lembut. */
export function Stepper({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  return (
    <ol className={cn("flex items-center", className)} aria-label="Langkah">
      {steps.map((label, i) => {
        const done = i < current;
        const on = i === current;
        return (
          <li key={label} className={cn("flex items-center", i < steps.length - 1 && "flex-1")} aria-current={on ? "step" : undefined}>
            <span
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap text-sm font-semibold",
                done || on ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "tabular grid h-[30px] w-[30px] place-items-center rounded-full border-[1.5px] text-[13px]",
                  on && "border-foreground bg-foreground text-background",
                  done && "border-daun-soft bg-daun-soft text-success",
                  !on && !done && "border-input bg-card",
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn(!on && "max-[560px]:hidden")}>{label}</span>
            </span>
            {i < steps.length - 1 && <span aria-hidden className="mx-3 h-[1.5px] min-w-6 flex-1 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

/** Bilah kuota/kapasitas (kit .prog). */
export function ProgressBar({
  value,
  max,
  tone = "ink",
  className,
  label,
}: {
  value: number;
  max: number;
  tone?: "ink" | "daun" | "red" | "matahari";
  className?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const bar = { ink: "bg-foreground", daun: "bg-daun", red: "bg-destructive", matahari: "bg-matahari" }[tone];
  return (
    <span
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn("block h-2 flex-1 overflow-hidden rounded-full bg-muted", className)}
    >
      <i className={cn("block h-full rounded-full", bar)} style={{ width: `${pct}%` }} />
    </span>
  );
}
