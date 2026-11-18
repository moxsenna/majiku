import ProfilAnak from "@/views/siswa/ProfilAnak";
import { getProfilSiswa, listKelasAktif } from "@/server/actions/siswa";
import { getLinkableParents } from "@/server/actions/studentsCrud";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil anak" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profil, kelas, akunWali] = await Promise.all([
    getProfilSiswa(id).catch(() => undefined),
    listKelasAktif().catch(() => []),
    getLinkableParents().catch(() => []),
  ]);
  return <ProfilAnak id={id} initialData={profil} kelas={kelas} akunWali={akunWali} />;
}
