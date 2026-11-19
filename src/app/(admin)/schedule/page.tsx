import KalenderSesi from "@/views/kelas/KalenderSesi";
import { getKalenderSesi } from "@/server/actions/kelasJadwal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kalender sesi" };

export default async function Page() {
  const initialData = await getKalenderSesi().catch(() => undefined);
  return <KalenderSesi initialData={initialData} />;
}
