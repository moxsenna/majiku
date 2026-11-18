"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPSI = [
  { v: "light", label: "Terang", icon: Sun },
  { v: "dark", label: "Gelap", icon: Moon },
  { v: "system", label: "Ikuti perangkat", icon: Monitor },
] as const;

/** Pemilih tema: Terang (tampilan desain) · Gelap · Ikuti perangkat. Segmen gaya kit .seg-m. */
export function ThemeToggle({ className, compact }: { className?: string; compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? theme ?? "light" : "light";
  return (
    <div role="radiogroup" aria-label="Tema tampilan" className={cn("flex rounded-full bg-muted p-1", className)}>
      {OPSI.map(({ v, label, icon: Icon }) => {
        const on = current === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={label}
            title={label}
            onClick={() => setTheme(v)}
            className={cn(
              "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft",
              on ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {!compact && <span>{v === "system" ? "Otomatis" : label}</span>}
          </button>
        );
      })}
    </div>
  );
}
