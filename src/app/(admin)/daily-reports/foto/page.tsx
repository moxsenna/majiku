import FotoKegiatan from "@/views/laporan/FotoKegiatan";
import { getFotoKegiatan } from "@/server/actions/laporanHarian";

export const dynamic = "force-dynamic";
export const metadata = { title: "Foto kegiatan" };

export default async function Page() {
  const initialData = await getFotoKegiatan().catch(() => undefined);
  return <FotoKegiatan initialData={initialData} />;
}
