// foto anak dari R2 (URL bertanda), bukan aset statis 
import { cn } from "@/lib/utils";
import { inisial } from "@/lib/format";
import { KELAS_KRAYON, krayonDari, type Krayon } from "@/lib/krayon";

const SIZE = {
  xs: "h-7 w-7 text-[11px]",
  sm: "h-[34px] w-[34px] text-[13px]",
  md: "h-10 w-10 text-[15px]",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-[22px]",
  "2xl": "h-24 w-24 text-[32px]",
} as const;

export type AvatarSize = keyof typeof SIZE;

/**
 * Avatar inisial anak (warna lembut + tinta krayon). Foto asli menggantikannya begitu ada.
 * `tiba` menampilkan titik hijau (--success-ring) = sudah tiba.
 */
export function KidAvatar({
  name,
  id,
  krayon,
  photoUrl,
  size = "md",
  tiba,
  ink,
  className,
}: {
  name: string;
  id?: string | null;
  krayon?: Krayon;
  photoUrl?: string | null;
  size?: AvatarSize;
  tiba?: boolean;
  /** Avatar Tinta (staf/pengguna) alih-alih krayon. */
  ink?: boolean;
  className?: string;
}) {
  const k = KELAS_KRAYON[krayon ?? krayonDari(id ?? name)];
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full font-display font-bold",
        SIZE[size],
        ink ? "bg-foreground text-background" : [k.soft, k.ink],
        className,
      )}
      title={name}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span aria-hidden>{inisial(name)}</span>
      )}
      {tiba && (
        <span
          aria-label="sudah tiba"
          className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-card bg-success-ring"
        />
      )}
    </span>
  );
}

/** Tumpukan avatar (kit .avs). */
export function AvatarStack({
  people,
  max = 4,
  size = "sm",
  className,
}: {
  people: { id?: string; name: string; photoUrl?: string | null }[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className={cn("flex", className)}>
      {shown.map((p, i) => (
        <KidAvatar key={p.id ?? `${p.name}-${i}`} {...p} size={size} className={cn("border-2 border-card", i > 0 && "-ml-2")} />
      ))}
      {rest > 0 && (
        <span className={cn("relative -ml-2 grid place-items-center rounded-full border-2 border-card bg-muted font-sans font-semibold text-foreground", SIZE[size])}>
          +{rest}
        </span>
      )}
    </span>
  );
}
