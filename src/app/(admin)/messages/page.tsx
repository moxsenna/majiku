import Messages from "@/views/Messages";
import { listAnnouncements } from "@/server/actions/announcements";

export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = await listAnnouncements();
  return <Messages announcements={rows} />;
}
