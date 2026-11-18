import Ringkasan from "@/views/keuangan/Ringkasan";
import { getKeuangan } from "@/server/actions/keuangan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ringkasan keuangan" };

export default async function Page() {
  const initialData = await getKeuangan().catch(() => undefined);
  return <Ringkasan initialData={initialData} />;
}
