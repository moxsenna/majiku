import LaporanHarian from "@/views/laporan/LaporanHarian";
import { getLaporanHarian } from "@/server/actions/laporanHarian";

export const dynamic = "force-dynamic";
export const metadata = { title: "Laporan harian" };

export default async function Page({ searchParams }: { searchParams: Promise<{ tanggal?: string; date?: string }> }) {
  const { tanggal, date } = await searchParams;
  const t = tanggal ?? date;
  const initialData = await getLaporanHarian(t).catch(() => undefined);
  return <LaporanHarian key={t ?? "hari-ini"} initialData={initialData} tanggal={t} />;
}
