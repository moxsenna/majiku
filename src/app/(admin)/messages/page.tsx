import Pengumuman from "@/views/pesan/Pengumuman";
import { getPengumuman } from "@/server/actions/pesan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pengumuman" };

export default async function Page() {
  const initialData = await getPengumuman().catch(() => undefined);
  return <Pengumuman initialData={initialData} />;
}
