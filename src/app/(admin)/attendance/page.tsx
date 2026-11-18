import KehadiranSiswa from "@/views/kehadiran/KehadiranSiswa";
import { getKehadiranSiswa } from "@/server/actions/kehadiran";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kehadiran" };

export default async function Page({ searchParams }: { searchParams: Promise<{ tanggal?: string }> }) {
  const { tanggal } = await searchParams;
  // Galat dimuat sebagai bendera: view menampilkan banner + Coba lagi, bukan "belum ada anak".
  const initialData = await getKehadiranSiswa(tanggal).catch(() => undefined);
  return <KehadiranSiswa key={tanggal ?? "hari-ini"} initialData={initialData} tanggal={tanggal} />;
}
