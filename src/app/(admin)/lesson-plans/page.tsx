import RppMinggu from "@/views/rpp/RppMinggu";
import { getRppMinggu } from "@/server/actions/rpp";

export const dynamic = "force-dynamic";
export const metadata = { title: "RPP" };

export default async function Page({ searchParams }: { searchParams: Promise<{ minggu?: string }> }) {
  const { minggu } = await searchParams;
  // Galat dimuat sebagai bendera: view menampilkan banner + Coba lagi, bukan "Belum ada RPP".
  const initialData = await getRppMinggu(minggu).catch(() => undefined);
  return <RppMinggu initialData={initialData} minggu={minggu} />;
}
