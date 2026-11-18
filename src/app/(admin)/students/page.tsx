import Siswa from "@/views/siswa/Siswa";
import { listKelasAktif, listSiswa } from "@/server/actions/siswa";
import { getLinkableParents } from "@/server/actions/studentsCrud";

export const dynamic = "force-dynamic";
export const metadata = { title: "Siswa" };

export default async function Page() {
  const [siswa, kelas, akunWali] = await Promise.all([
    listSiswa().catch(() => undefined),
    listKelasAktif().catch(() => []),
    getLinkableParents().catch(() => []),
  ]);
  return <Siswa initialData={siswa} kelas={kelas} akunWali={akunWali} />;
}
