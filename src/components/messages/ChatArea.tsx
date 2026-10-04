import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Send, Megaphone, MessageSquare, CheckCheck, MoreVertical, Tag, UserCheck, Clock,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Conversation } from "./ConversationList";

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
}

const LABELS = ["Pembayaran", "Ketersediaan", "Keluhan", "Info Umum", "Request Khusus", "Jadwal"];

const TEMPLATES = [
  { label: "Info Pembayaran", text: "Terima kasih telah menghubungi kami. Untuk informasi pembayaran, silakan cek menu Tagihan di portal orang tua atau hubungi admin kami di jam kerja." },
  { label: "Ketersediaan Kelas", text: "Terima kasih atas minatnya! Saat ini kami sedang mengecek ketersediaan kelas. Kami akan segera menginformasikan hasilnya." },
  { label: "Konfirmasi Jadwal", text: "Jadwal telah dikonfirmasi. Silakan cek detail jadwal di portal orang tua Anda." },
  { label: "Terima Kasih", text: "Terima kasih atas informasinya. Kami akan segera menindaklanjuti." },
];

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
}

export function ChatArea({ conversation, messages, onSendMessage, onAddLabel, onRemoveLabel }: ChatAreaProps) {
  const [messageInput, setMessageInput] = useState("");

  const handleSend = () => {
    if (!messageInput.trim()) return;
    onSendMessage(messageInput.trim());
    setMessageInput("");
  };

  const handleTemplate = (text: string) => {
    setMessageInput(text);
  };

  if (!conversation) {
    return (
      <Card className="lg:col-span-2 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Pilih percakapan untuk memulai chat</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 flex flex-col overflow-hidden">
      {/* Header */}
      <CardHeader className="border-b border-border py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {conversation.type === "direct" ? (
              <Avatar>
                <AvatarImage src={conversation.avatar} />
                <AvatarFallback>{conversation.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">{conversation.name}</p>
              <div className="flex items-center gap-2">
                {conversation.type === "direct" && (
                  conversation.parentStatus === "enrolled" ? (
                    <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                      <UserCheck className="h-3 w-3" /> Terdaftar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                      <Clock className="h-3 w-3" /> Waiting List
                    </span>
                  )
                )}
                {conversation.studentName && (
                  <span className="text-xs text-muted-foreground">· {conversation.studentName}</span>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Tag className="h-4 w-4 mr-2" /> Tambah Label
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {LABELS.filter(l => !conversation.labels.includes(l)).map((label) => (
                    <DropdownMenuItem key={label} onClick={() => onAddLabel(label)}>
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {conversation.labels.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Hapus Label
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {conversation.labels.map((label) => (
                      <DropdownMenuItem key={label} onClick={() => onRemoveLabel(label)}>
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <MessageSquare className="h-4 w-4 mr-2" /> Template Pesan
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {TEMPLATES.map((t) => (
                    <DropdownMenuItem key={t.label} onClick={() => handleTemplate(t.text)}>
                      {t.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
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
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ketik pesan..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button variant="hero" size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
