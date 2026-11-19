import KelasProgram from "@/views/kelas/KelasProgram";
import { getKelasProgram } from "@/server/actions/kelasJadwal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kelas & program" };

export default async function Page() {
  // Galat dimuat sebagai bendera: view menampilkan banner + Coba lagi, bukan "Belum ada kelas".
  const initialData = await getKelasProgram().catch(() => undefined);
  return <KelasProgram initialData={initialData} />;
}
