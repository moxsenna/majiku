import PembayaranMasuk from "@/views/keuangan/PembayaranMasuk";
import { getPembayaranMasuk } from "@/server/actions/keuangan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pembayaran masuk" };

export default async function Page({ searchParams }: { searchParams: Promise<{ bulan?: string }> }) {
  const { bulan } = await searchParams;
  // Galat dimuat sebagai bendera: view menampilkan banner + Coba lagi, bukan "belum ada pembayaran".
  const initialData = await getPembayaranMasuk(bulan).catch(() => undefined);
  return <PembayaranMasuk key={bulan ?? "sekarang"} initialData={initialData} ym={bulan} />;
}
