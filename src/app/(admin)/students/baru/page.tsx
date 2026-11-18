import DaftarkanAnak from "@/views/siswa/DaftarkanAnak";
import { listKelasUntukDaftar, listSiswa } from "@/server/actions/siswa";

export const dynamic = "force-dynamic";
export const metadata = { title: "Daftarkan anak" };

export default async function Page() {
  const [kelas, siswa] = await Promise.all([listKelasUntukDaftar().catch(() => []), listSiswa().catch(() => [])]);
  return <DaftarkanAnak kelas={kelas} siswa={siswa} />;
}
