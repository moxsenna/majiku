import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle2, FileEdit, ChevronRight } from "lucide-react";

interface Notification {
  id: string;
  type: "rejection" | "approval" | "reminder";
  title: string;
  message: string;
  studentName?: string;
  rejectionReason?: string;
  time: string;
  isRead: boolean;
}

interface TutorNotificationsWidgetProps {
  notifications: Notification[];
  onReviseReport?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}

const typeConfig = {
  rejection: { 
    icon: AlertTriangle, 
    color: "text-destructive", 
    bg: "bg-destructive/10",
    label: "Revisi" 
  },
  approval: { 
    icon: CheckCircle2, 
    color: "text-green-500", 
    bg: "bg-green-500/10",
    label: "Disetujui" 
  },
  reminder: { 
    icon: Bell, 
    color: "text-amber-500", 
    bg: "bg-amber-500/10",
    label: "Pengingat" 
  },
};

export function TutorNotificationsWidget({ 
  notifications, 
  onReviseReport,
  onMarkRead 
}: TutorNotificationsWidgetProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifikasi
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} baru</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Tidak ada notifikasi</p>
          </div>
        ) : (
          notifications.slice(0, 4).map((notif) => {
            const config = typeConfig[notif.type];
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border ${
                  !notif.isRead 
                    ? "border-primary/30 bg-primary/5" 
                    : "border-transparent bg-muted/50"
                }`}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                    
                    {notif.type === "rejection" && notif.rejectionReason && (
                      <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive font-medium mb-1">Alasan penolakan:</p>
                        <p className="text-xs text-muted-foreground">{notif.rejectionReason}</p>
                      </div>
                    )}
                    
                    {notif.type === "rejection" && onReviseReport && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => onReviseReport(notif.id)}
                      >
                        <FileEdit className="w-3 h-3 mr-1" />
                        Revisi Laporan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {notifications.length > 4 && (
          <Button variant="outline" className="w-full text-sm">
            Lihat Semua Notifikasi
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
