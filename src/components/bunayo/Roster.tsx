import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatJam } from "@/lib/format";
import { KidAvatar } from "./KidAvatar";
import type { Krayon } from "@/lib/krayon";

export type RosterState = "tiba" | "belum" | "izin" | "sakit" | "alpa" | "terlambat";

const RING: Record<RosterState, string> = {
  tiba: "shadow-[0_0_0_4px_hsl(var(--surface)),0_0_0_8px_hsl(var(--success-ring))]",
  terlambat: "shadow-[0_0_0_4px_hsl(var(--surface)),0_0_0_8px_hsl(var(--matahari))]",
  izin: "shadow-[0_0_0_4px_hsl(var(--surface)),0_0_0_8px_hsl(var(--langit))]",
  sakit: "shadow-[0_0_0_4px_hsl(var(--surface)),0_0_0_8px_hsl(var(--langit))]",
  alpa: "shadow-[0_0_0_4px_hsl(var(--surface)),0_0_0_8px_hsl(var(--destructive))]",
  belum: "outline-[3px] outline-dashed outline-input outline-offset-4",
};

const LABEL: Record<RosterState, { text: string; cls: string }> = {
  tiba: { text: "", cls: "text-success" },
  terlambat: { text: "Terlambat Datang", cls: "text-warning" },
  izin: { text: "Izin", cls: "text-langit-ink" },
  sakit: { text: "Sakit", cls: "text-langit-ink" },
  alpa: { text: "Alpa", cls: "text-destructive" },
  belum: { text: "Belum tiba", cls: "text-muted-foreground" },
};

/**
 * Wajah anak di absen kelas (GV2): 96 px dengan cincin status — hijau tiba, putus-putus belum, Langit izin.
 * Segitiga merah = ada alergi. Ketuk untuk menandai; `onLongPress` untuk profil singkat.
 */
export function RosterFace({
  id,
  name,
  photoUrl,
  krayon,
  state,
  jamTiba,
  alergi,
  onClick,
  disabled,
}: {
  id?: string;
  name: string;
  photoUrl?: string | null;
  krayon?: Krayon;
  state: RosterState;
  jamTiba?: string | Date | null;
  alergi?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const label = LABEL[state];
  const panggilan = name.trim().split(/\s+/)[0];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex min-h-touch flex-col items-center gap-1.5 rounded-sheet p-2 text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft disabled:cursor-default",
        state === "belum" && "opacity-55",
      )}
      aria-label={`${name}: ${state === "tiba" ? "sudah tiba" : label.text}${alergi ? ", ada alergi" : ""}`}
    >
      <span className="relative">
        <KidAvatar id={id} name={name} photoUrl={photoUrl} krayon={krayon} size="2xl" className={RING[state]} />
        {alergi && <TriangleAlert aria-hidden className="absolute -right-0.5 -top-0.5 h-6 w-6 fill-card text-destructive" />}
      </span>
      <b className="text-base">{panggilan}</b>
      <span className={cn("text-[13px] font-semibold", label.cls, state === "tiba" && "tabular")}>
        {state === "tiba" ? (jamTiba ? formatJam(jamTiba) : "Tiba") : label.text}
      </span>
    </button>
  );
}

/** Baris daftar anak (guru): avatar + nama + umur/alergi + status. */
export function KidRow({
  avatar,
  name,
  sub,
  status,
  onClick,
}: {
  avatar: React.ReactNode;
  name: string;
  sub?: React.ReactNode;
  status?: React.ReactNode;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 border-b border-border-subtle px-4 py-3 text-left last:border-b-0"
    >
      {avatar}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold">{name}</span>
        {sub && <span className="block text-[13px] text-muted-foreground">{sub}</span>}
      </span>
      {status}
    </Comp>
  );
}
