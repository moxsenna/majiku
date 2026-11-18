import KehadiranGuru from "@/views/kehadiran/KehadiranGuru";
import { getKehadiranGuru } from "@/server/actions/kehadiran";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kehadiran guru" };

export default async function Page() {
  const initialData = await getKehadiranGuru().catch(() => undefined);
  return <KehadiranGuru initialData={initialData} />;
}
