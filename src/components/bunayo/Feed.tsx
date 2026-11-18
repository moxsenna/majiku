import { Camera, Moon, Pill, Puzzle, Sparkles, Toilet, Utensils, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatJam } from "@/lib/format";
import { KELAS_KRAYON, KRAYON_KEGIATAN, type JenisKegiatan } from "@/lib/krayon";

export const IKON_KEGIATAN: Record<JenisKegiatan, LucideIcon> = {
  makan: Utensils,
  tidur: Moon,
  bermain: Puzzle,
  foto: Camera,
  toilet: Toilet,
  obat: Pill,
  momen: Sparkles,
};

export const LABEL_KEGIATAN: Record<JenisKegiatan, string> = {
  makan: "Makan",
  tidur: "Tidur",
  bermain: "Bermain",
  foto: "Foto",
  toilet: "Toilet",
  obat: "Obat",
  momen: "Momen spesial",
};

/**
 * Baris kegiatan (feed): bilah krayon + jam. Warna = jenis kegiatan (satu-satunya tempat ikon berwarna).
 */
export function FeedItem({
  jenis,
  waktu,
  title,
  detail,
  children,
  className,
}: {
  jenis: JenisKegiatan;
  /** Date/ISO atau "HH:MM"; kosong bila jam tidak tercatat */
  waktu?: Date | string | null;
  title?: string;
  detail?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const k = KELAS_KRAYON[KRAYON_KEGIATAN[jenis]];
  const Icon = IKON_KEGIATAN[jenis];
  return (
    <div className={cn("flex gap-3", className)}>
      <span aria-hidden className={cn("w-1.5 shrink-0 self-stretch rounded-full", k.bg)} />
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-1">
        <span className="flex items-center gap-2">
          {waktu && <span className="tabular text-[13px] text-muted-foreground">{formatJam(waktu)}</span>}
          <Icon className={cn("h-4 w-4", k.ink)} aria-hidden />
          <b className="text-[15px]">{title ?? LABEL_KEGIATAN[jenis]}</b>
        </span>
        {detail && <span className="text-sm text-foreground-2">{detail}</span>}
        {children}
      </div>
    </div>
  );
}

/**
 * Baris urusan admin (Hari Ini · Mendesak): judul, keterangan, aksi utama + "Tunda".
 */
export function BriefingItem({
  title,
  sub,
  actions,
  tone,
  className,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: "urgent";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5 border-b border-border-subtle px-[18px] py-3 last:border-b-0", className)}>
      <span>
        <span className={cn("block text-[15px] font-semibold", tone === "urgent" && "text-destructive")}>{title}</span>
        {sub && <span className="block text-[13px] text-muted-foreground">{sub}</span>}
      </span>
      {actions && <span className="flex flex-wrap items-center gap-2">{actions}</span>}
    </div>
  );
}
