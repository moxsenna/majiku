"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageSquare,
  Plus,
  Search,
  Send,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  getMessages,
  listMyConversations,
  markConversationRead,
  sendMessage,
  startOrGetConversation,
  type ChatMessage,
  type ChatPartner,
  type ConversationSummary,
} from "@/server/actions/chat";

interface ChatShellProps {
  role: "parent" | "tutor";
  conversations?: ConversationSummary[];
  partners?: ChatPartner[];
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatTime(val: Date | string | null | undefined): string {
  if (!val) return "";
  const d = typeof val === "string" ? new Date(val) : val;
  if (!d || isNaN(d.getTime())) return "";
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Kemarin";
  return format(d, "d MMM", { locale: idLocale });
}

function formatMessageTime(val: Date | string | null | undefined): string {
  if (!val) return "";
  const d = typeof val === "string" ? new Date(val) : val;
  if (!d || isNaN(d.getTime())) return "";
  return format(d, "HH:mm");
}

export function ChatShell({
  role,
  conversations = [],
  partners = [],
}: ChatShellProps) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  // Conversations query with 30s refetch
  const { data: conversationList = conversations } = useQuery({
    queryKey: ["chat-conversations", role],
    queryFn: () => listMyConversations(),
    initialData: conversations,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  // Messages query for active conversation with 8s refetch
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["chat-messages", selectedId],
    queryFn: () => (selectedId ? getMessages(selectedId) : Promise.resolve([])),
    enabled: !!selectedId,
    refetchInterval: 8000,
    refetchIntervalInBackground: false,
  });

  // Mark conversation read on open or new incoming message
  useEffect(() => {
    if (!selectedId) return;

    let isMounted = true;
    markConversationRead(selectedId)
      .then(() => {
        if (isMounted) {
          queryClient.invalidateQueries({
            queryKey: ["chat-conversations", role],
          });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedId, messages?.length, role, queryClient]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (selectedId && messages.length > 0) {
      scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedId]);

  const selectedConversation = conversationList.find(
    (c) => c.id === selectedId
  );

  const selectedPartner = partners.find(
    (p) => p.userId === selectedConversation?.partnerUserId
  );

  const partnerSubtitle = selectedConversation?.studentName
    ? role === "parent"
      ? `Anak: ${selectedConversation.studentName}`
      : `Siswa: ${selectedConversation.studentName}`
    : selectedPartner?.contextName ||
      (role === "parent" ? "Tutor Lembaga" : "Wali Murid");

  const filteredConversations = conversationList.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.partnerName.toLowerCase().includes(q) ||
      (c.studentName && c.studentName.toLowerCase().includes(q)) ||
      (c.lastMessageBody && c.lastMessageBody.toLowerCase().includes(q))
    );
  });

  const handleStartConversation = async (partnerUserId: string) => {
    setIsStarting(true);
    try {
      const res = await startOrGetConversation(partnerUserId);
      await queryClient.invalidateQueries({
        queryKey: ["chat-conversations", role],
      });
      setSelectedId(res.id);
      setIsNewChatOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memulai percakapan";
      toast.error(message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !selectedId || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(selectedId, text);
      setInputText("");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["chat-messages", selectedId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["chat-conversations", role],
        }),
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengirim pesan";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const homeHref = role === "parent" ? "/parent" : "/tutor";

  return (
    <div className="h-screen max-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Conversation List Column */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r border-border flex flex-col h-full bg-background shrink-0",
          selectedId ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <header className="p-4 border-b border-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href={homeHref}>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="font-bold text-lg">Pesan</h1>
            </div>
            <Button
              size="sm"
              onClick={() => setIsNewChatOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Baru</span>
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </header>

        {/* Conversations Scroll Area */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium">
                {conversationList.length === 0
                  ? "Belum ada percakapan"
                  : "Percakapan tidak ditemukan"}
              </p>
              {conversationList.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewChatOpen(true)}
                  className="mt-2 text-xs"
                >
                  Mulai Percakapan Baru
                </Button>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conv) => {
                const isSelected = selectedId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                      isSelected
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted/70 text-foreground"
                    )}
                  >
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-sm font-semibold",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {getInitials(conv.partnerName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="font-medium text-sm truncate">
                          {conv.partnerName}
                        </p>
                        {conv.lastMessageAt && (
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>

                      {conv.studentName ? (
                        <p className="text-xs text-primary font-medium truncate mb-0.5">
                          {role === "parent"
                            ? `Anak: ${conv.studentName}`
                            : `Siswa: ${conv.studentName}`}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/70 truncate mb-0.5">
                          {role === "parent" ? "Tutor Lembaga" : "Wali Murid"}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessageBody || "Belum ada pesan"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge
                            variant="default"
                            className="h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px] rounded-full shrink-0"
                          >
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Window Column */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full bg-background",
          !selectedId ? "hidden md:flex" : "flex"
        )}
      >
        {selectedId ? (
          <>
            {/* Chat Window Header */}
            <header className="p-3.5 border-b border-border flex items-center gap-3 bg-background/95 backdrop-blur shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                onClick={() => setSelectedId(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {getInitials(selectedConversation?.partnerName || "")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {selectedConversation?.partnerName || "Percakapan"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {partnerSubtitle}
                </p>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {isLoadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Memuat pesan...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium">Belum ada pesan</p>
                  <p className="text-xs text-muted-foreground/80 max-w-xs">
                    Kirim pesan pertama untuk memulai obrolan dengan{" "}
                    {selectedConversation?.partnerName || "mitra"}.
                  </p>
                </div>
              ) : (
                messages.map((msg: ChatMessage) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.isMine ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-sm",
                        msg.isMine
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-background border border-border text-foreground rounded-bl-sm"
                      )}
                    >
                      {!msg.isMine && (
                        <p className="text-[11px] font-semibold text-primary mb-0.5">
                          {msg.senderName}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {msg.body}
                      </p>
                      <div
                        className={cn(
                          "flex items-center justify-end gap-1 mt-1 text-[10px]",
                          msg.isMine
                            ? "text-primary-foreground/75"
                            : "text-muted-foreground"
                        )}
                      >
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {msg.isMine &&
                          (msg.readAt ? (
                            <CheckCheck className="h-3 w-3 text-primary-foreground" />
                          ) : (
                            <Check className="h-3 w-3 text-primary-foreground/70" />
                          ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-background shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 max-w-4xl mx-auto"
              >
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ketik pesan..."
                  disabled={isSending}
                  maxLength={2000}
                  className="flex-1 text-sm h-10"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  disabled={isSending || !inputText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h2 className="font-semibold text-lg text-foreground mb-1">
              Pilih Percakapan
            </h2>
            <p className="text-sm max-w-sm mb-4">
              Pilih salah satu percakapan dari daftar di sebelah kiri atau mulai
              percakapan baru.
            </p>
            {partners.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewChatOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Mulai Percakapan Baru
              </Button>
            )}
          </div>
        )}
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mulai Percakapan Baru</DialogTitle>
            <DialogDescription>
              {role === "parent"
                ? "Pilih tutor kelas anak Anda untuk memulai obrolan."
                : "Pilih orang tua siswa untuk memulai obrolan."}
            </DialogDescription>
          </DialogHeader>

          {partners.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Belum ada mitra percakapan
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh] -mr-4 pr-4">
              <div className="space-y-2 py-2">
                {partners.map((partner) => (
                  <button
                    key={partner.userId}
                    onClick={() => handleStartConversation(partner.userId)}
                    disabled={isStarting}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/70 transition-colors text-left disabled:opacity-50"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {getInitials(partner.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground">
                        {partner.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {partner.contextName ||
                          (partner.role === "tutor" ? "Tutor" : "Orang Tua")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
