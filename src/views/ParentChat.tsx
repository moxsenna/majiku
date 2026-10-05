import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Send,
  CheckCheck,
  Phone,
  MoreVertical,
  Home,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  User,
} from "lucide-react";

const messages = [
  {
    id: "1",
    sender: "Ibu Sarah",
    content: "Selamat pagi Bu, Aisyah sudah check-in jam 07:45 tadi. Kondisinya baik dan ceria 😊",
    time: "08:35",
    isMe: false,
  },
  {
    id: "2",
    sender: "Me",
    content: "Terima kasih Bu Sarah! Alhamdulillah. Tolong diingatkan minum susu ya Bu.",
    time: "08:40",
    isMe: true,
  },
  {
    id: "3",
    sender: "Ibu Sarah",
    content: "Siap Bu, akan saya ingatkan saat snack time nanti. Kalau ada perkembangan akan saya update.",
    time: "08:42",
    isMe: false,
  },
  {
    id: "4",
    sender: "Me",
    content: "Baik Bu, terima kasih banyak 🙏",
    time: "08:45",
    isMe: true,
  },
];

export default function ParentChat() {
  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link href="/parent">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" />
              <AvatarFallback>IS</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">Ibu Sarah</p>
              <p className="text-xs text-muted-foreground">Guru Kelas Bunga Matahari</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        <div className="text-center">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Hari ini
          </span>
        </div>
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.isMe
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className={`flex items-center gap-1 mt-1 ${message.isMe ? "justify-end" : ""}`}>
                <span className={`text-xs ${message.isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {message.time}
                </span>
                {message.isMe && <CheckCheck className="h-3 w-3 text-primary-foreground/70" />}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <Input
            placeholder="Ketik pesan..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1"
          />
          <Button variant="hero" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <Link href="/parent" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <Home className="h-6 w-6" />
            <span className="text-xs">Beranda</span>
          </Link>
          <Link href="/parent/catalog" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs">Katalog</span>
          </Link>
          <Link href="/parent/billing" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <CreditCard className="h-6 w-6" />
            <span className="text-xs">Tagihan</span>
          </Link>
          <button className="flex flex-col items-center gap-1 p-2 text-primary">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs">Chat</span>
          </button>
          <Link href="/parent/profile" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <User className="h-6 w-6" />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
