import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConversationList, type Conversation } from "@/components/messages/ConversationList";
import { ChatArea, type ChatMessage } from "@/components/messages/ChatArea";
import { RequestAnalyticsChart } from "@/components/messages/RequestAnalyticsChart";
import { FloatingChatNotification } from "@/components/messages/FloatingChatNotification";

const initialConversations: Conversation[] = [
  {
    id: "1", type: "direct", name: "Ibu Sari Putri",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    lastMessage: "Terima kasih untuk updatenya, Bu", lastMessageTime: "10:30",
    unreadCount: 2, isRead: false, studentName: "Aisyah Putri",
    parentStatus: "enrolled", labels: ["Pembayaran"],
  },
  {
    id: "2", type: "direct", name: "Bpk. Rudi Pratama",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    lastMessage: "Raka pulang jam berapa hari ini?", lastMessageTime: "09:15",
    unreadCount: 0, isRead: true, studentName: "Raka Pratama",
    parentStatus: "enrolled", labels: ["Jadwal"],
  },
  {
    id: "3", type: "broadcast", name: "Pengumuman Kelas Bintang",
    lastMessage: "Reminder: Besok ada kegiatan outing...", lastMessageTime: "Kemarin",
    unreadCount: 0, isRead: true, parentStatus: "enrolled", labels: [],
  },
  {
    id: "4", type: "direct", name: "Ibu Dewi Azzahra",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    lastMessage: "Keisha hari ini bawa bekal dari rumah", lastMessageTime: "Kemarin",
    unreadCount: 0, isRead: true, studentName: "Keisha Azzahra",
    parentStatus: "enrolled", labels: ["Info Umum"],
  },
  {
    id: "5", type: "direct", name: "Ibu Rina Wulandari",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100",
    lastMessage: "Apakah kelas Bulan masih ada slot?", lastMessageTime: "08:45",
    unreadCount: 1, isRead: false, studentName: "Zahra Wulandari",
    parentStatus: "waiting_list", labels: ["Ketersediaan"],
  },
  {
    id: "6", type: "direct", name: "Bpk. Andi Susanto",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    lastMessage: "Mau tanya soal biaya pendaftaran", lastMessageTime: "Kemarin",
    unreadCount: 0, isRead: true, studentName: "Dika Susanto",
    parentStatus: "waiting_list", labels: ["Pembayaran", "Ketersediaan"],
  },
];

const sampleMessages: Record<string, ChatMessage[]> = {
  "1": [
    { id: "1", sender: "Ibu Sari Putri", content: "Selamat pagi Bu, bagaimana kondisi Aisyah hari ini?", time: "08:30", isMe: false },
    { id: "2", sender: "Admin", content: "Selamat pagi Bu Sari! Aisyah sudah check-in jam 07:45 tadi. Kondisinya baik dan ceria 😊", time: "08:35", isMe: true },
    { id: "3", sender: "Ibu Sari Putri", content: "Alhamdulillah, terima kasih untuk updatenya, Bu", time: "10:30", isMe: false },
  ],
  "5": [
    { id: "1", sender: "Ibu Rina Wulandari", content: "Selamat pagi, apakah kelas Bulan masih ada slot untuk anak saya?", time: "08:45", isMe: false },
  ],
};

export default function Messages() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const messages = selectedConversation ? (sampleMessages[selectedConversation.id] || []) : [];

  const totalUnread = useMemo(() => conversations.reduce((sum, c) => sum + c.unreadCount, 0), [conversations]);

  const labelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    conversations.forEach((c) => c.labels.forEach((l) => { counts[l] = (counts[l] || 0) + 1; }));
    return counts;
  }, [conversations]);

  const handleAddLabel = (label: string) => {
    if (!selectedConversation) return;
    setConversations((prev) =>
      prev.map((c) => c.id === selectedConversation.id && !c.labels.includes(label)
        ? { ...c, labels: [...c.labels, label] } : c)
    );
    setSelectedConversation((prev) => prev && !prev.labels.includes(label) ? { ...prev, labels: [...prev.labels, label] } : prev);
  };

  const handleRemoveLabel = (label: string) => {
    if (!selectedConversation) return;
    setConversations((prev) =>
      prev.map((c) => c.id === selectedConversation.id ? { ...c, labels: c.labels.filter((l) => l !== label) } : c)
    );
    setSelectedConversation((prev) => prev ? { ...prev, labels: prev.labels.filter((l) => l !== label) } : prev);
  };

  const handleSendMessage = (_text: string) => {
    // Will integrate with backend later
  };

  const handleScrollToUnread = () => {
    const firstUnread = conversations.find((c) => c.unreadCount > 0);
    if (firstUnread) setSelectedConversation(firstUnread);
  };

  return (
    <DashboardLayout title="Komunikasi" subtitle="Chat dengan orang tua wali murid" hideNavbarActions>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-140px)]">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id || null}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={setSelectedConversation}
        />
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <div className="flex-1 min-h-0">
            <ChatArea
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              onAddLabel={handleAddLabel}
              onRemoveLabel={handleRemoveLabel}
            />
          </div>
          <RequestAnalyticsChart labelCounts={labelCounts} />
        </div>
      </div>
      <FloatingChatNotification unreadCount={totalUnread} onClick={handleScrollToUnread} />
    </DashboardLayout>
  );
}
