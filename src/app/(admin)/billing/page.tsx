import Penagihan from "@/views/keuangan/Penagihan";
import { getKeuangan } from "@/server/actions/keuangan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Penagihan" };

export default async function Page() {
  // Galat dimuat sebagai bendera: view menampilkan banner + Coba lagi, bukan "tidak ada tagihan".
  const initialData = await getKeuangan().catch(() => undefined);
  return <Penagihan initialData={initialData} />;
}
