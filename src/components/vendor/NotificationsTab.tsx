import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, CreditCard, AlertTriangle, Server, MessageSquare, CheckCircle2, Clock, Send } from "lucide-react";

const notifications = [
  { id: 1, type: "payment", title: "Pembayaran Terlambat", description: "Daycare Sunshine belum membayar invoice INV-2024-003 (jatuh tempo 10 Jan)", time: "2 jam lalu", severity: "high", read: false },
  { id: 2, type: "system", title: "Pemeliharaan Terjadwal", description: "Pemeliharaan server dijadwalkan pada 25 Jan 2025 pukul 02:00-04:00 WIB", time: "5 jam lalu", severity: "medium", read: false },
  { id: 3, type: "subscription", title: "Langganan Akan Berakhir", description: "3 vendor memiliki langganan yang akan berakhir dalam 7 hari", time: "1 hari lalu", severity: "high", read: false },
  { id: 4, type: "feedback", title: "Keluhan Baru", description: "TK Ceria melaporkan masalah dengan fitur absensi QR Code", time: "1 hari lalu", severity: "medium", read: true },
  { id: 5, type: "payment", title: "Pembayaran Diterima", description: "Bimbel Prestasi membayar invoice INV-2024-002 sebesar Rp 599.000", time: "2 hari lalu", severity: "low", read: true },
  { id: 6, type: "system", title: "Backup Selesai", description: "Backup database harian berhasil diselesaikan", time: "3 hari lalu", severity: "low", read: true },
];

const typeIcons: Record<string, any> = {
  payment: CreditCard,
  system: Server,
  subscription: Clock,
  feedback: MessageSquare,
};

const severityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning-foreground",
  low: "bg-success/10 text-success",
};

export default function NotificationsTab() {
  const { toast } = useToast();
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState("all");

  const filtered = items.filter(n => filter === "all" || (filter === "unread" && !n.read) || n.type === filter);
  const unreadCount = items.filter(n => !n.read).length;

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "Semua notifikasi ditandai telah dibaca" });
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><Bell className="w-5 h-5 text-destructive" /></div><div><p className="text-xs text-muted-foreground">Belum Dibaca</p><p className="text-xl font-bold">{unreadCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-warning" /></div><div><p className="text-xs text-muted-foreground">Pembayaran</p><p className="text-xl font-bold">{items.filter(n => n.type === "payment").length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center"><Server className="w-5 h-5 text-info" /></div><div><p className="text-xs text-muted-foreground">Sistem</p><p className="text-xl font-bold">{items.filter(n => n.type === "system").length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Feedback</p><p className="text-xl font-bold">{items.filter(n => n.type === "feedback").length}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Notifikasi & Pengingat</CardTitle>
              <CardDescription>Semua pemberitahuan platform</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllRead}>Tandai Semua Dibaca</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "unread", "payment", "system", "subscription", "feedback"].map(f => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
                {f === "all" ? "Semua" : f === "unread" ? "Belum Dibaca" : f === "payment" ? "Pembayaran" : f === "system" ? "Sistem" : f === "subscription" ? "Langganan" : "Feedback"}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map(n => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg border border-border transition-colors ${!n.read ? "bg-primary/5" : "hover:bg-muted/50"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${severityColors[n.severity]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{n.title}</p>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  {n.type === "payment" && n.severity === "high" && (
                    <Button variant="outline" size="sm" className="shrink-0" onClick={() => toast({ title: "Reminder terkirim" })}>
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
