import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Megaphone, UserCheck, Clock } from "lucide-react";

export interface Conversation {
  id: string;
  type: "direct" | "broadcast";
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isRead: boolean;
  studentName?: string;
  parentStatus: "enrolled" | "waiting_list";
  labels: string[];
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (conv: Conversation) => void;
}

const labelColors: Record<string, string> = {
  "Pembayaran": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "Ketersediaan": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Keluhan": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "Info Umum": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Request Khusus": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Jadwal": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
};

export function ConversationList({ conversations, selectedId, searchQuery, onSearchChange, onSelect }: ConversationListProps) {
  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.studentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="lg:col-span-1 flex flex-col overflow-hidden">
      <CardHeader className="border-b border-border py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Percakapan</CardTitle>
          <Button variant="soft" size="icon-sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari percakapan..."
            className="pl-9"
            variant="filled"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto flex-1">
        {filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full p-4 flex items-start gap-3 border-b border-border hover:bg-muted/50 transition-colors text-left ${
              selectedId === conv.id ? "bg-muted/50" : ""
            }`}
          >
            {conv.type === "direct" ? (
              <Avatar>
                <AvatarImage src={conv.avatar} />
                <AvatarFallback>{conv.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="font-medium text-sm text-foreground truncate">{conv.name}</p>
                <span className="text-xs text-muted-foreground flex-shrink-0">{conv.lastMessageTime}</span>
              </div>
              {conv.type === "direct" && (
                <div className="flex items-center gap-1.5 mb-1">
                  {conv.parentStatus === "enrolled" ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      <UserCheck className="h-3 w-3" /> Terdaftar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      <Clock className="h-3 w-3" /> Waiting List
                    </span>
                  )}
                  {conv.studentName && (
                    <span className="text-[10px] text-muted-foreground">· {conv.studentName}</span>
                  )}
                </div>
              )}
              {/* Labels */}
              {conv.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {conv.labels.map((label) => (
                    <span
                      key={label}
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${labelColors[label] || "bg-muted text-muted-foreground"}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                {conv.unreadCount > 0 && (
                  <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs flex-shrink-0 ml-2">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
