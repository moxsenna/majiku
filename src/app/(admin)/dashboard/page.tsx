import HariIni from "@/views/HariIni";
import { getHariIni } from "@/server/actions/hariIni";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hari Ini" };

export default async function Page() {
  // Galat di server tidak menjatuhkan halaman: layar menampilkan banner per bagian dan mencoba lagi dari klien.
  const data = await getHariIni().catch(() => undefined);
  return <HariIni initialData={data} />;
}
