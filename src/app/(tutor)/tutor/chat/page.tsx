import TutorChat from "@/views/TutorChat";
import {
  listMyConversations,
  getChatPartners,
} from "@/server/actions/chat";

export default async function Page() {
  const [conversations, partners] = await Promise.all([
    listMyConversations(),
    getChatPartners(),
  ]);

  return <TutorChat conversations={conversations} partners={partners} />;
}
