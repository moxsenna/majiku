import { StatusDot } from "@/components/bunayo";
import { STATUS_PERLU_DITAGIH, statusTagihan } from "@/lib/status";
import type { StatusTagihanSiswa } from "@/server/actions/siswa";

/** Status tagihan bulan ini untuk satu anak (kamus: Lunas, Menunggu Pembayaran, Terlambat, Dibayar Sebagian, Perlu Ditagih). */
export function TagihanSiswaDot({ t, size = "sm" }: { t: StatusTagihanSiswa; size?: "sm" | "md" }) {
  if (t.jenis === "invoice") return <StatusDot info={statusTagihan(t.status, t.hariTerlambat)} size={size} />;
  if (t.jenis === "perlu-ditagih") return <StatusDot info={STATUS_PERLU_DITAGIH} size={size} />;
  if (t.jenis === "belum-waktunya") return <StatusDot varian="off" size={size}>Belum jatuh tanggal tagih</StatusDot>;
  return <span className="text-[13px] text-muted-foreground">—</span>;
}

export function urutanTagihan(t: StatusTagihanSiswa): number {
  if (t.jenis === "invoice") return { overdue: 0, partial: 2, unpaid: 3, paid: 5 }[t.status];
  if (t.jenis === "perlu-ditagih") return 1;
  if (t.jenis === "belum-waktunya") return 4;
  return 6;
}
