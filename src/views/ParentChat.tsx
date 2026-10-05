"use client";

import { ChatShell } from "@/components/chat/ChatShell";
import type { ConversationSummary, ChatPartner } from "@/server/actions/chat";

interface ParentChatProps {
  conversations?: ConversationSummary[];
  partners?: ChatPartner[];
}

export default function ParentChat({
  conversations = [],
  partners = [],
}: ParentChatProps) {
  return (
    <ChatShell
      role="parent"
      conversations={conversations}
      partners={partners}
    />
  );
}
