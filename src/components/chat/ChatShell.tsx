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
import { KidAvatar } from "@/components/bunayo";
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
    <div className="fixed inset-x-0 top-0 bottom-[calc(max(16px,env(safe-area-inset-bottom))+76px)] z-30 mx-auto max-w-[560px] bg-surface md:top-6 md:bottom-6 flex flex-col md:flex-row overflow-hidden">
      {/* Conversation List Column */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r border-border flex flex-col h-full bg-surface shrink-0",
          selectedId ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <header className="px-4 pb-3 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href={homeHref}>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="font-display text-[22px] font-bold tracking-tight">Pesan</h1>
            </div>
            <button
              type="button"
              onClick={() => setIsNewChatOpen(true)}
              className="press inline-flex h-9 items-center gap-1.5 rounded-full bg-nav-active px-3.5 text-sm font-semibold text-nav-active-foreground"
            >
              <Plus className="h-4 w-4" aria-hidden /> Baru
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-[15px] !rounded-full bg-card border-input"
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
                <button
                  type="button"
                  onClick={() => setIsNewChatOpen(true)}
                  className="press mt-2 inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-semibold text-background"
                >
                  <Plus className="h-4 w-4" aria-hidden /> Mulai Percakapan Baru
                </button>
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
                      "w-full flex items-center gap-3 p-3 rounded-sheet transition-colors text-left",
                      isSelected
                        ? "bg-primary-soft text-foreground"
                        : "hover:bg-muted/70 text-foreground"
                    )}
                  >
                    <KidAvatar name={conv.partnerName} id={conv.partnerUserId ?? conv.id} size="lg" />

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
                          <span className="tabular grid h-5 min-w-[20px] shrink-0 place-items-center rounded-full bg-tomat px-1.5 text-[11px] font-bold text-[hsl(249_26%_14%)]">
                            {conv.unreadCount}
                          </span>
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
          "flex-1 flex flex-col h-full bg-surface",
          !selectedId ? "hidden md:flex" : "flex"
        )}
      >
        {selectedId ? (
          <>
            {/* Chat Window Header */}
            <header className="sticky top-0 z-10 px-4 py-3 border-b border-border flex items-center gap-3 bg-surface/95 backdrop-blur shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                onClick={() => setSelectedId(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <KidAvatar name={selectedConversation?.partnerName || "?"} size="md" />

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
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                        "max-w-[82%] sm:max-w-[70%] rounded-[20px] px-3.5 py-2.5",
                        msg.isMine
                          ? "bg-nav-active text-nav-active-foreground rounded-br-sm"
                          : "bg-card text-foreground shadow-soft rounded-bl-sm"
                      )}
                    >
                      {!msg.isMine && (
                        <p className="text-[11px] font-semibold text-langit-ink mb-0.5">
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
            <div className="sticky bottom-0 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 border-t border-border bg-surface shrink-0">
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
                  className="flex-1 text-[15px] h-11 !rounded-full bg-card border-input"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="press h-11 w-11 shrink-0 rounded-full bg-nav-active text-nav-active-foreground hover:bg-nav-active/90"
                  disabled={isSending || !inputText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground bg-surface"><span className="hidden" />
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h2 className="font-display text-[22px] font-bold tracking-tight text-foreground mb-1">
              Pilih Percakapan
            </h2>
            <p className="text-sm max-w-sm mb-4">
              Pilih salah satu percakapan dari daftar di sebelah kiri atau mulai
              percakapan baru.
            </p>
            {partners.length > 0 && (
              <button
                type="button"
                onClick={() => setIsNewChatOpen(true)}
                className="press mt-2 inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-semibold text-background"
              >
                <Plus className="h-4 w-4" aria-hidden /> Mulai Percakapan Baru
              </button>
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
                    className="w-full flex items-center gap-3 p-3 rounded-sheet bg-card hover:bg-muted transition-colors text-left disabled:opacity-50"
                  >
                    <KidAvatar name={partner.name} id={partner.userId} size="md" />
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
