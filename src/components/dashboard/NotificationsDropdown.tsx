import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bell, UserCheck, CreditCard, Calendar, MessageSquare,
  AlertTriangle, CheckCircle2, Clock, X, ChevronRight
} from "lucide-react";

interface Notification {
  id: string;
  type: "attendance" | "payment" | "leave" | "message" | "alert";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  priority: "high" | "medium" | "low";
  action?: string;
}

const demoNotifications: Notification[] = [
  {
    id: "1",
    type: "leave",
    title: "Pengajuan Izin Baru",
    description: "Ibu Ratna mengajukan izin untuk keperluan keluarga besok. Butuh persetujuan Anda.",
    timestamp: "5 menit lalu",
    isRead: false,
    priority: "high",
    action: "Lihat Detail",
  },
  {
    id: "2",
    type: "payment",
    title: "Pembayaran Terlambat",
    description: "3 orang tua belum membayar tagihan bulan ini. Total tagihan tertunggak Rp 8.500.000",
    timestamp: "30 menit lalu",
    isRead: false,
    priority: "high",
    action: "Kirim Pengingat",
  },
  {
    id: "3",
    type: "attendance",
    title: "Tutor Belum Check-in",
    description: "Ibu Yanti belum check-in hari ini padahal jadwal mengajar jam 08:00",
    timestamp: "1 jam lalu",
    isRead: false,
    priority: "medium",
    action: "Hubungi",
  },
  {
    id: "4",
    type: "message",
    title: "Pesan Baru dari Orang Tua",
    description: "Ibu Sari mengirim pesan tentang program TK A untuk anaknya",
    timestamp: "2 jam lalu",
    isRead: true,
    priority: "low",
    action: "Balas",
  },
  {
    id: "5",
    type: "alert",
    title: "Kuota Kelas Hampir Penuh",
    description: "Toddler B hanya tersisa 1 slot dari total 12 kapasitas",
    timestamp: "3 jam lalu",
    isRead: true,
    priority: "medium",
    action: "Lihat Kelas",
  },
  {
    id: "6",
    type: "attendance",
    title: "Siswa Baru Check-in",
    description: "5 siswa baru telah check-in hari ini di kelas TK A",
    timestamp: "4 jam lalu",
    isRead: true,
    priority: "low",
  },
];

const typeConfig = {
  attendance: { icon: UserCheck, color: "bg-success/10 text-success", bgColor: "bg-success" },
  payment: { icon: CreditCard, color: "bg-warning/10 text-warning", bgColor: "bg-warning" },
  leave: { icon: Calendar, color: "bg-info/10 text-info", bgColor: "bg-info" },
  message: { icon: MessageSquare, color: "bg-primary/10 text-primary", bgColor: "bg-primary" },
  alert: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive", bgColor: "bg-destructive" },
};

const priorityConfig = {
  high: { color: "border-destructive bg-destructive/5", badge: "Urgent", badgeColor: "destructive" as const },
  medium: { color: "border-warning bg-warning/5", badge: "Penting", badgeColor: "secondary" as const },
  low: { color: "border-border bg-background", badge: null, badgeColor: "secondary" as const },
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(demoNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const highPriorityCount = notifications.filter((n) => !n.isRead && n.priority === "high").length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(true)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-left flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifikasi
                </SheetTitle>
                <SheetDescription className="text-left">
                  {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
                </SheetDescription>
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Baca Semua
                </Button>
              )}
            </div>
            
            {/* Quick Stats */}
            {highPriorityCount > 0 && (
              <div className="flex gap-2 mt-3">
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {highPriorityCount} Perlu Tindakan
                </Badge>
              </div>
            )}
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Tidak ada notifikasi</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const config = typeConfig[notification.type];
                  const priority = priorityConfig[notification.priority];
                  const TypeIcon = config.icon;

                  return (
                    <Card 
                      key={notification.id}
                      className={`relative overflow-hidden transition-all ${
                        !notification.isRead ? priority.color : "bg-muted/30 border-border"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`shrink-0 h-10 w-10 rounded-xl ${config.color} flex items-center justify-center`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`font-semibold text-sm ${!notification.isRead ? "" : "text-muted-foreground"}`}>
                                  {notification.title}
                                </p>
                                {priority.badge && !notification.isRead && (
                                  <Badge variant={priority.badgeColor} className="text-[10px] h-5">
                                    {priority.badge}
                                  </Badge>
                                )}
                              </div>
                              {!notification.isRead && (
                                <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 animate-pulse" />
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {notification.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {notification.timestamp}
                              </span>
                              
                              {notification.action && !notification.isRead && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 text-xs gap-1"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  {notification.action}
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Dismiss Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity"
                            onClick={() => dismissNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
