import LaporanKehadiran from "@/views/laporan/LaporanKehadiran";
import { getLaporanKehadiran } from "@/server/actions/laporan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Laporan kehadiran" };

export default async function Page({ searchParams }: { searchParams: Promise<{ bulan?: string }> }) {
  const { bulan } = await searchParams;
  // Galat dimuat sebagai bendera: view menampilkan banner + Coba lagi, bukan "Belum ada catatan".
  const initialData = await getLaporanKehadiran(bulan).catch(() => undefined);
  return <LaporanKehadiran initialData={initialData} bulan={bulan} />;
}
