import DaftarkanAnak from "@/views/siswa/DaftarkanAnak";
import { listKelasUntukDaftar, listSiswa } from "@/server/actions/siswa";

export const dynamic = "force-dynamic";
export const metadata = { title: "Daftarkan anak" };

export default async function Page() {
  // Galat tidak boleh tampil sebagai "belum ada kelas/keluarga": diteruskan ke view sebagai bendera.
  const [kelas, siswa] = await Promise.all([
    listKelasUntukDaftar().then((d) => ({ d, ok: true }), () => ({ d: [], ok: false })),
    listSiswa().then((d) => ({ d, ok: true }), () => ({ d: [], ok: false })),
  ]);
  return <DaftarkanAnak kelas={kelas.d} siswa={siswa.d} galatMuat={!kelas.ok || !siswa.ok} />;
}
