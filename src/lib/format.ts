/**
 * Format tampilan Bunayo (kamus Design System):
 *   Rupiah "Rp 1.250.000" · singkatan "Rp 1,25 jt" (hanya angka ringkasan) · tanggal "17 Nov 2026" · jam "09.30".
 * Semua waktu ditampilkan dalam WIB (Asia/Jakarta).
 */

const TZ = "Asia/Jakarta";
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const BULAN_PANJANG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const HARI_PANJANG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

type DateInput = Date | string | number | null | undefined;

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** "Rp 1.250.000" (minus: "−Rp 50.000"). */
export function formatRupiah(value: number | string | null | undefined): string {
  const n = Math.round(toNumber(value));
  const abs = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${n < 0 ? "−" : ""}Rp ${abs}`;
}

/** Angka ringkasan saja: "Rp 1,25 jt", "Rp 12,1 jt", "Rp 850 rb", "Rp 2,4 M". */
export function formatRupiahSingkat(value: number | string | null | undefined): string {
  const n = toNumber(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  const dec = (x: number, digits: number) =>
    x.toLocaleString("id-ID", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  if (abs >= 1e9) return `${sign}Rp ${dec(abs / 1e9, 2)} M`;
  if (abs >= 1e6) return `${sign}Rp ${dec(abs / 1e6, abs >= 1e7 ? 1 : 2)} jt`;
  if (abs >= 1e3) return `${sign}Rp ${dec(abs / 1e3, 0)} rb`;
  return formatRupiah(n);
}

/** Ambil komponen tanggal di WIB. String "YYYY-MM-DD" diperlakukan sebagai tanggal kalender (tanpa zona). */
function parts(input: DateInput): { y: number; m: number; d: number; wd: number; hh: number; mm: number } | null {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-").map(Number);
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return { y, m: m - 1, d, wd, hh: 0, mm: 0 };
  }
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, year: "numeric", month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(date);
  const get = (t: string) => f.find((p) => p.type === t)?.value ?? "0";
  const wdMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    y: Number(get("year")), m: Number(get("month")) - 1, d: Number(get("day")),
    wd: wdMap[get("weekday")] ?? 0, hh: Number(get("hour")) % 24, mm: Number(get("minute")),
  };
}

/**
 * "17 Nov 2026". Opsi: `hari` → "Sel 17 Nov 2026"; `panjang` → "Selasa, 17 November 2026"; `tanpaTahun` → "17 Nov".
 */
export function formatTanggal(
  input: DateInput,
  opts: { hari?: boolean; panjang?: boolean; tanpaTahun?: boolean } = {},
): string {
  const p = parts(input);
  if (!p) return "—";
  const bulan = opts.panjang ? BULAN_PANJANG[p.m] : BULAN[p.m];
  const tahun = opts.tanpaTahun ? "" : ` ${p.y}`;
  const hari = opts.hari ? (opts.panjang ? `${HARI_PANJANG[p.wd]}, ` : `${HARI[p.wd]} `) : "";
  return `${hari}${p.d} ${bulan}${tahun}`;
}

/** "09.30". Menerima Date/ISO, atau string jam "09:30"/"09:30:00". */
export function formatJam(input: DateInput): string {
  if (typeof input === "string" && /^\d{1,2}[:.]\d{2}/.test(input)) {
    const [h, m] = input.split(/[:.]/);
    return `${h.padStart(2, "0")}.${m.slice(0, 2)}`;
  }
  const p = parts(input);
  if (!p) return "—";
  return `${String(p.hh).padStart(2, "0")}.${String(p.mm).padStart(2, "0")}`;
}

/** "09.00–11.00" */
export function formatRentangJam(mulai: DateInput, selesai: DateInput): string {
  return `${formatJam(mulai)}–${formatJam(selesai)}`;
}

/** Label periode bulan: "Nov 2026" (atau "November 2026" bila `panjang`). */
export function formatPeriode(input: DateInput | { year: number; month: number }, opts: { panjang?: boolean } = {}): string {
  let y: number;
  let m: number;
  if (input && typeof input === "object" && !(input instanceof Date) && "year" in input) {
    y = input.year;
    m = input.month - 1;
  } else {
    const p = parts(input as DateInput);
    if (!p) return "—";
    y = p.y;
    m = p.m;
  }
  return `${opts.panjang ? BULAN_PANJANG[m] : BULAN[m]} ${y}`;
}

/** Eyebrow halaman: "SEL 17 NOV 2026 · 09.12 WIB" */
export function formatEyebrow(input: DateInput = new Date()): string {
  return `${formatTanggal(input, { hari: true }).toUpperCase()} · ${formatJam(input)} WIB`;
}

/** Umur anak: "2 th 1 bln" / "11 bln". */
export function formatUmur(tanggalLahir: DateInput, acuan: DateInput = new Date()): string {
  const a = parts(tanggalLahir);
  const b = parts(acuan);
  if (!a || !b) return "—";
  let bulan = (b.y - a.y) * 12 + (b.m - a.m);
  if (b.d < a.d) bulan -= 1;
  if (bulan < 0) return "—";
  const th = Math.floor(bulan / 12);
  const bl = bulan % 12;
  if (th === 0) return `${bl} bln`;
  return bl === 0 ? `${th} th` : `${th} th ${bl} bln`;
}

/** Selisih hari kalender (b − a) di WIB; dipakai untuk "Terlambat 33 hari". */
export function selisihHari(a: DateInput, b: DateInput = new Date()): number {
  const pa = parts(a);
  const pb = parts(b);
  if (!pa || !pb) return 0;
  return Math.round((Date.UTC(pb.y, pb.m, pb.d) - Date.UTC(pa.y, pa.m, pa.d)) / 86_400_000);
}

/** "2 menit lalu", "3 jam lalu", lalu tanggal. */
export function formatRelatif(input: DateInput, acuan: Date = new Date()): string {
  if (!input) return "—";
  const date = input instanceof Date ? input : new Date(input);
  const detik = Math.round((acuan.getTime() - date.getTime()) / 1000);
  if (Number.isNaN(detik)) return "—";
  if (detik < 60) return "baru saja";
  if (detik < 3600) return `${Math.floor(detik / 60)} menit lalu`;
  if (detik < 86_400) return `${Math.floor(detik / 3600)} jam lalu`;
  const hari = selisihHari(date, acuan);
  if (hari === 1) return `kemarin ${formatJam(date)}`;
  return formatTanggal(date, { tanpaTahun: parts(date)?.y === parts(acuan)?.y });
}

/** Inisial nama untuk avatar: "Kayla Putri" → "KP". */
export function inisial(nama: string | null | undefined): string {
  if (!nama) return "?";
  // Tanda baca diabaikan: "TK Pelangi (Uji)" → "TU", bukan "T(".
  const kata = nama.replace(/[^\p{L}\p{N}\s]/gu, "").trim().split(/\s+/).filter(Boolean);
  if (!kata.length) return "?";
  return ((kata[0]?.[0] ?? "") + (kata.length > 1 ? kata[kata.length - 1][0] : kata[0]?.[1] ?? "")).toUpperCase();
}
