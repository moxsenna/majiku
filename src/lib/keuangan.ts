/** Konstanta & util tampilan keuangan (dipakai server & klien). */

export const URUTAN_AGING = ["1-30", "31-60", "60+"] as const;
export type AgingRentang = (typeof URUTAN_AGING)[number];

/** "081234…" → "6281234…" untuk wa.me. */
export function waLink(phone: string | null): string | null {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = `62${d.slice(1)}`;
  return d.length >= 9 ? `https://wa.me/${d}` : null;
}
