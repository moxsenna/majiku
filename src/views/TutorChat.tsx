"use client";

import { ChatShell } from "@/components/chat/ChatShell";
import type { ConversationSummary, ChatPartner } from "@/server/actions/chat";

interface TutorChatProps {
  conversations?: ConversationSummary[];
  partners?: ChatPartner[];
}

export default function TutorChat({
  conversations = [],
  partners = [],
}: TutorChatProps) {
  return (
    <ChatShell
      role="tutor"
      conversations={conversations}
      partners={partners}
    />
  );
}
