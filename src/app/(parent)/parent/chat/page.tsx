import ParentChat from "@/views/ParentChat";
import {
  listMyConversations,
  getChatPartners,
} from "@/server/actions/chat";

export default async function Page() {
  const [conversations, partners] = await Promise.all([
    listMyConversations(),
    getChatPartners(),
  ]);

  return <ParentChat conversations={conversations} partners={partners} />;
}
