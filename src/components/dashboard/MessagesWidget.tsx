import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, ChevronRight, Clock, Send, Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  senderName: string;
  senderType: "parent" | "tutor" | "other";
  avatar?: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  childName?: string;
}

const demoMessages: Message[] = [
  {
    id: "1",
    senderName: "Ibu Sari Dewi",
    senderType: "parent",
    message: "Selamat pagi, saya ingin tanya tentang program playgroup untuk anak saya yang berusia 3 tahun. Apakah masih tersedia slot?",
    timestamp: "5 menit lalu",
    isRead: false,
    childName: "Aisyah",
  },
  {
    id: "2",
    senderName: "Bapak Andi",
    senderType: "parent",
    message: "Mau konfirmasi jadwal trial untuk anak saya besok. Apakah jam 9 pagi bisa?",
    timestamp: "15 menit lalu",
    isRead: false,
  },
  {
    id: "3",
    senderName: "Ibu Maya",
    senderType: "parent",
    message: "Anak saya hari ini tidak bisa hadir karena sakit. Mohon izinnya.",
    timestamp: "30 menit lalu",
    isRead: false,
    childName: "Budi",
  },
  {
    id: "4",
    senderName: "Ibu Fitri",
    senderType: "parent",
    message: "Berapa biaya pendaftaran untuk program TK A?",
    timestamp: "1 jam lalu",
    isRead: true,
  },
  {
    id: "5",
    senderName: "Bapak Hendra",
    senderType: "parent",
    message: "Terima kasih atas infonya. Saya akan datang untuk survei lokasi besok.",
    timestamp: "2 jam lalu",
    isRead: true,
  },
];

interface MessagesWidgetProps {
  onViewAll?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MessagesWidget({ onViewAll, isOpen, onOpenChange }: MessagesWidgetProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState(demoMessages);
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");

  // Support both controlled and uncontrolled mode
  const detailOpen = isOpen !== undefined ? isOpen : internalOpen;
  const setDetailOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const parentMessages = messages.filter((m) => m.senderType === "parent");

  const handleOpenMessage = (message: Message) => {
    setSelectedMessage(message);
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m))
    );
    setDetailOpen(true);
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedMessage) return;

    toast({
      title: "Pesan Terkirim",
      description: `Balasan berhasil dikirim ke ${selectedMessage.senderName}`,
    });
    setReplyText("");
    setDetailOpen(false);
  };

  return (
    <>
      <Card variant="interactive">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center relative">
                <MessageSquare className="h-4 w-4 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              Pesan Masuk
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {parentMessages.length} dari orang tua
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {messages.slice(0, 4).map((message) => (
            <div
              key={message.id}
              onClick={() => handleOpenMessage(message)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                message.isRead ? "bg-muted/30 hover:bg-muted/50" : "bg-primary/5 hover:bg-primary/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar size="sm">
                  <AvatarImage src={message.avatar} />
                  <AvatarFallback className="text-xs">
                    {message.senderName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${!message.isRead ? "font-semibold" : ""}`}>
                      {message.senderName}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {message.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {message.message}
                  </p>
                </div>
                {!message.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full gap-2" onClick={() => setDetailOpen(true)}>
            Lihat Semua Pesan
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-lg max-h-[85vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {selectedMessage ? selectedMessage.senderName : "Semua Pesan"}
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 pt-3">
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-sm">{selectedMessage.senderName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedMessage.senderName}</p>
                      <p className="text-sm text-muted-foreground">{selectedMessage.timestamp}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{selectedMessage.message}</p>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Ketik balasan..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleReply()}
                    className="flex-1"
                  />
                  <Button onClick={handleReply} disabled={!replyText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="ghost" className="w-full" onClick={() => setSelectedMessage(null)}>
                  Kembali ke Daftar
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[60vh]">
                <div className="space-y-2 pr-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleOpenMessage(message)}
                      className={`p-4 rounded-xl cursor-pointer transition-colors ${
                        message.isRead ? "bg-muted/30 hover:bg-muted/50" : "bg-primary/5 hover:bg-primary/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-sm">{message.senderName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className={`font-medium ${!message.isRead ? "font-semibold" : ""}`}>
                              {message.senderName}
                            </p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {message.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                        {!message.isRead && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
