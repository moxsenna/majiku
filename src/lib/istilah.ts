/**
 * Kamus istilah Bunayo yang bergantung pada jenis lembaga.
 * Label "Guru" otomatis menjadi "Tutor" bila tenants.type = 'bimbel'.
 */

export type JenisLembaga = "daycare" | "preschool" | "bimbel";

export interface Istilah {
  /** "Guru" / "Tutor" */
  guru: string;
  /** "guru" / "tutor" (huruf kecil, di tengah kalimat) */
  guruKecil: string;
  /** "Honor Guru" / "Honor Tutor" */
  honor: string;
  /** "Jadwal Guru" / "Jadwal Tutor" */
  jadwal: string;
  /** "Kehadiran Guru" / "Kehadiran Tutor" */
  kehadiran: string;
  /** "Daycare" / "Preschool" / "Bimbel" */
  jenis: string;
}

export function istilahLembaga(jenis: JenisLembaga | null | undefined): Istilah {
  const guru = jenis === "bimbel" ? "Tutor" : "Guru";
  return {
    guru,
    guruKecil: guru.toLowerCase(),
    honor: `Honor ${guru}`,
    jadwal: `Jadwal ${guru}`,
    kehadiran: `Kehadiran ${guru}`,
    jenis: jenis === "bimbel" ? "Bimbel" : jenis === "preschool" ? "Preschool" : "Daycare",
  };
}

/** Label jenis lembaga untuk ditampilkan. */
export const LABEL_JENIS_LEMBAGA: Record<JenisLembaga, string> = {
  daycare: "Daycare",
  preschool: "Preschool & PAUD",
  bimbel: "Bimbel",
};
