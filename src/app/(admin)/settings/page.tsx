import PengaturanLembaga from "@/views/pengaturan/PengaturanLembaga";
import { getPengaturan } from "@/server/actions/pengaturan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pengaturan lembaga" };

export default async function Page() {
  // Galat dimuat sebagai bendera: view menampilkan banner + Coba lagi.
  const initialData = await getPengaturan().catch(() => undefined);
  return <PengaturanLembaga initialData={initialData} />;
}
