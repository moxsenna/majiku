import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle2, FileEdit } from "lucide-react";

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
}: TutorNotificationsWidgetProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifikasi & Tugas
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-xl">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500/70" />
            <p className="text-sm font-medium text-foreground">Semua Laporan Terpenuhi</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tidak ada laporan siswa yang tertunda untuk hari ini.</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notif) => {
            const config = typeConfig[notif.type];
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border ${
                  !notif.isRead 
                    ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20" 
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
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                    
                    {notif.type === "rejection" && notif.rejectionReason && (
                      <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive font-medium mb-1">Alasan penolakan:</p>
                        <p className="text-xs text-muted-foreground">{notif.rejectionReason}</p>
                      </div>
                    )}
                    
                    {onReviseReport && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-xs h-7"
                        onClick={() => onReviseReport(notif.id)}
                      >
                        <FileEdit className="w-3 h-3 mr-1" />
                        {notif.type === "rejection" ? "Revisi Laporan" : "Buat Laporan"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
