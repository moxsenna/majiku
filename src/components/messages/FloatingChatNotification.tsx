import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FloatingChatNotificationProps {
  unreadCount: number;
  onClick?: () => void;
}

export function FloatingChatNotification({ unreadCount, onClick }: FloatingChatNotificationProps) {
  if (unreadCount <= 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4"
    >
      <MessageCircle className="h-6 w-6" />
      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center text-xs font-bold"
      >
        {unreadCount > 9 ? "9+" : unreadCount}
      </Badge>
    </button>
  );
}
