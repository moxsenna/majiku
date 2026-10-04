import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Search, Send, Image, Paperclip, 
  MoreVertical, Phone, Video, Check, CheckCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const conversations = [
  { 
    id: 1, 
    name: "Ibu Rizki (Ahmad)", 
    avatar: "", 
    lastMessage: "Bagaimana perkembangan Ahmad?", 
    time: "10:30", 
    unread: 2,
    online: true 
  },
  { 
    id: 2, 
    name: "Ibu Aisyah (Siti)", 
    avatar: "", 
    lastMessage: "Terima kasih laporannya", 
    time: "09:15", 
    unread: 0,
    online: false 
  },
  { 
    id: 3, 
    name: "Bapak Budi (Budi Jr)", 
    avatar: "", 
    lastMessage: "Budi hari ini makan apa?", 
    time: "Kemarin", 
    unread: 1,
    online: false 
  },
  { 
    id: 4, 
    name: "Admin MAJIKU", 
    avatar: "", 
    lastMessage: "Jadwal rapat besok jam 10", 
    time: "Kemarin", 
    unread: 0,
    online: true,
    isAdmin: true
  },
];

const messages = [
  { id: 1, text: "Selamat pagi Ibu Sarah 🙏", sender: "parent", time: "10:00", read: true },
  { id: 2, text: "Selamat pagi Ibu Rizki! Ada yang bisa saya bantu?", sender: "tutor", time: "10:02", read: true },
  { id: 3, text: "Bagaimana perkembangan Ahmad hari ini?", sender: "parent", time: "10:30", read: true },
  { id: 4, text: "Ahmad hari ini sangat aktif dan ceria! Dia bermain dengan teman-temannya dengan baik.", sender: "tutor", time: "10:32", read: true },
  { id: 5, text: "Alhamdulillah, senang mendengarnya. Apakah makannya habis?", sender: "parent", time: "10:33", read: false },
];

export default function TutorChat() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!messageInput.trim()) return;
    // Handle send message
    setMessageInput("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Conversations List */}
      <div className={cn(
        "w-full lg:w-80 border-r border-border flex flex-col",
        selectedChat ? "hidden lg:flex" : "flex"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border p-4">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/tutor">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-lg">Chat</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </header>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                  selectedChat === conv.id ? "bg-primary/10" : "hover:bg-muted"
                )}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback className={cn(
                      "text-sm",
                      conv.isAdmin ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    )}>
                      {conv.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{conv.name}</p>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col",
        !selectedChat ? "hidden lg:flex" : "flex"
      )}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border p-4">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden"
                  onClick={() => setSelectedChat(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConversation?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedConversation?.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedConversation?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation?.online ? "Online" : "Offline"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-2xl mx-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.sender === "tutor" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      msg.sender === "tutor" 
                        ? "bg-primary text-primary-foreground rounded-br-sm" 
                        : "bg-muted rounded-bl-sm"
                    )}>
                      <p className="text-sm">{msg.text}</p>
                      <div className={cn(
                        "flex items-center justify-end gap-1 mt-1",
                        msg.sender === "tutor" ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        <span className="text-xs">{msg.time}</span>
                        {msg.sender === "tutor" && (
                          msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2 max-w-2xl mx-auto">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Image className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Ketik pesan..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Pilih Percakapan</h3>
              <p className="text-muted-foreground">Pilih percakapan dari daftar untuk mulai chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
