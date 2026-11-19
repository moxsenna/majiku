import { formatRentangJam } from "@/lib/format";

/** Utilitas jadwal mingguan (class_schedules.day_of_week: 1 = Senin … 6 = Sabtu). */

export const HARI_JADWAL = [
  { dow: 1, pendek: "Sen", panjang: "Senin" },
  { dow: 2, pendek: "Sel", panjang: "Selasa" },
  { dow: 3, pendek: "Rab", panjang: "Rabu" },
  { dow: 4, pendek: "Kam", panjang: "Kamis" },
  { dow: 5, pendek: "Jum", panjang: "Jumat" },
  { dow: 6, pendek: "Sab", panjang: "Sabtu" },
] as const;

export const LABEL_JENIS_JADWAL: Record<string, string> = {
  class: "Kelas",
  activity: "Kegiatan",
  event: "Acara",
  holiday: "Libur",
};

/** "09:00" + 120 → "11:00" */
export function jamSelesai(mulai: string, durasiMenit: number): string {
  const [h, m] = mulai.split(":").map(Number);
  const total = h * 60 + m + durasiMenit;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function menitDari(jam: string): number {
  const [h, m] = jam.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Rangkai hari berurutan: [1,2,3,4,5] → "Sen–Jum", [1,3] → "Sen, Rab". */
function rangkaiHari(dows: number[]): string {
  const urut = [...new Set(dows)].sort((a, b) => a - b);
  const potong: number[][] = [];
  for (const d of urut) {
    const akhir = potong[potong.length - 1];
    if (akhir && akhir[akhir.length - 1] === d - 1) akhir.push(d);
    else potong.push([d]);
  }
  const nama = (d: number) => HARI_JADWAL.find((h) => h.dow === d)?.pendek ?? "?";
  return potong
    .map((p) => (p.length >= 3 ? `${nama(p[0])}–${nama(p[p.length - 1])}` : p.map(nama).join(", ")))
    .join(", ");
}

/** Ringkasan jadwal kelas: "Sen–Jum 09.00–11.00" (beberapa pola dipisah " · "). */
export function ringkasJadwal(slot: { dayOfWeek: number; startTime: string; durationMinutes: number }[]): string | null {
  if (!slot.length) return null;
  const pola = new Map<string, number[]>();
  for (const s of slot) {
    const kunci = `${s.startTime}|${s.durationMinutes}`;
    pola.set(kunci, [...(pola.get(kunci) ?? []), s.dayOfWeek]);
  }
  return [...pola.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([kunci, dows]) => {
      const [mulai, durasi] = kunci.split("|");
      return `${rangkaiHari(dows)} ${formatRentangJam(mulai, jamSelesai(mulai, Number(durasi)))}`;
    })
    .join(" · ");
}
