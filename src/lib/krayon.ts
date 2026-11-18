/**
 * Warna krayon untuk kategori: tiap kelas, tiap jenis kegiatan, tiap anak.
 * Warna kelas/anak diturunkan secara deterministik dari ID, jadi selalu sama di semua layar.
 * (Tidak ada kolom warna di schema; bila kelak ditambah, prioritaskan nilai tersimpan.)
 */

export const KRAYON = ["matahari", "langit", "daun", "anggur", "permen", "tomat"] as const;
export type Krayon = (typeof KRAYON)[number];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Krayon untuk entitas (kelas/anak) berdasarkan ID-nya. */
export function krayonDari(id: string | null | undefined): Krayon {
  if (!id) return "langit";
  return KRAYON[hash(id) % KRAYON.length];
}

/** Warna jenis kegiatan (Design System §01): satu-satunya tempat ikon berwarna. */
export const KRAYON_KEGIATAN = {
  makan: "tomat",
  tidur: "anggur",
  bermain: "daun",
  foto: "langit",
  toilet: "matahari",
  obat: "permen",
  momen: "permen",
} as const satisfies Record<string, Krayon>;

export type JenisKegiatan = keyof typeof KRAYON_KEGIATAN;

/** Kelas Tailwind per krayon (ditulis lengkap agar terdeteksi JIT). */
export const KELAS_KRAYON: Record<Krayon, { bg: string; soft: string; ink: string; border: string }> = {
  tomat: { bg: "bg-tomat", soft: "bg-tomat-soft", ink: "text-tomat-ink", border: "border-tomat" },
  matahari: { bg: "bg-matahari", soft: "bg-matahari-soft", ink: "text-matahari-ink", border: "border-matahari" },
  daun: { bg: "bg-daun", soft: "bg-daun-soft", ink: "text-daun-ink", border: "border-daun" },
  langit: { bg: "bg-langit", soft: "bg-langit-soft", ink: "text-langit-ink", border: "border-langit" },
  anggur: { bg: "bg-anggur", soft: "bg-anggur-soft", ink: "text-anggur-ink", border: "border-anggur" },
  permen: { bg: "bg-permen", soft: "bg-permen-soft", ink: "text-permen-ink", border: "border-permen" },
};
