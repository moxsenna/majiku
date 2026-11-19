import Staf from "@/views/pengaturan/Staf";
import { getPengaturan } from "@/server/actions/pengaturan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staf & peran" };

export default async function Page() {
  // Galat dimuat sebagai bendera: view menampilkan banner + Coba lagi, bukan "Belum ada guru".
  const initialData = await getPengaturan().catch(() => undefined);
  return <Staf initialData={initialData} />;
}
