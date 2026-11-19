import Pendaftaran from "@/views/pendaftaran/Pendaftaran";
import { getPendaftaran } from "@/server/actions/pendaftaran";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pendaftaran & Trial" };

export default async function Page() {
  // Galat dimuat sebagai bendera: view menampilkan banner + Coba lagi, bukan "Belum ada calon siswa".
  const initialData = await getPendaftaran().catch(() => undefined);
  return <Pendaftaran initialData={initialData} />;
}
