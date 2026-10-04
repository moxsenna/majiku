import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, Clock, Plus, Send, Users, Repeat, 
  PlayCircle, PauseCircle, Trash2
} from "lucide-react";

interface ScheduledMessage {
  id: string;
  title: string;
  message: string;
  scheduledAt: string;
  repeat: string;
  recipients: number;
  status: "pending" | "sent" | "paused";
  channel: "whatsapp" | "email" | "both";
}

const demoScheduled: ScheduledMessage[] = [
  {
    id: "1",
    title: "Promo Awal Tahun",
    message: "Selamat tahun baru! Dapatkan diskon 15% untuk pendaftaran di bulan Januari.",
    scheduledAt: "2024-01-15 09:00",
    repeat: "Sekali",
    recipients: 150,
    status: "pending",
    channel: "whatsapp",
  },
  {
    id: "2",
    title: "Reminder Mingguan",
    message: "Jangan lupa cek update aktivitas anak Anda di aplikasi!",
    scheduledAt: "Setiap Senin 08:00",
    repeat: "Mingguan",
    recipients: 85,
    status: "pending",
    channel: "both",
  },
  {
    id: "3",
    title: "Newsletter Bulanan",
    message: "Highlight kegiatan bulan ini dan info penting untuk orang tua.",
    scheduledAt: "Setiap tanggal 1",
    repeat: "Bulanan",
    recipients: 200,
    status: "pending",
    channel: "email",
  },
];

export function ScheduledMessagesWidget() {
  const { toast } = useToast();
  const [messages, setMessages] = useState(demoScheduled);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px]">Terjadwal</Badge>;
      case "sent":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">Terkirim</Badge>;
      case "paused":
        return <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">Pause</Badge>;
      default:
        return null;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return "📱";
      case "email":
        return "📧";
      case "both":
        return "📱📧";
      default:
        return "📨";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-primary" />
            Pesan Terjadwal
          </CardTitle>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">Jadwal</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Jadwalkan Pesan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Judul Campaign</Label>
                  <Input placeholder="Nama campaign..." />
                </div>
                <div>
                  <Label>Pesan</Label>
                  <Textarea 
                    placeholder="Tulis pesan..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tanggal</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Waktu</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Pengulangan</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Sekali</SelectItem>
                        <SelectItem value="daily">Harian</SelectItem>
                        <SelectItem value="weekly">Mingguan</SelectItem>
                        <SelectItem value="monthly">Bulanan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Channel</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="both">Keduanya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Penerima</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih segmen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kontak</SelectItem>
                      <SelectItem value="leads">Lead Aktif</SelectItem>
                      <SelectItem value="parents">Orang Tua Aktif</SelectItem>
                      <SelectItem value="new">Lead Baru (7 hari)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={() => {
                    toast({ title: "Pesan dijadwalkan!" });
                    setAddDialogOpen(false);
                  }}>
                    Jadwalkan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="p-3 rounded-lg border bg-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span>{getChannelIcon(msg.channel)}</span>
                  <p className="font-medium text-sm truncate">{msg.title}</p>
                  {getStatusBadge(msg.status)}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {msg.message}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {msg.scheduledAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {msg.recipients} penerima
                  </span>
                  {msg.repeat !== "Sekali" && (
                    <span className="flex items-center gap-1">
                      <Repeat className="w-3 h-3" />
                      {msg.repeat}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm">
                  {msg.status === "paused" ? (
                    <PlayCircle className="w-4 h-4 text-success" />
                  ) : (
                    <PauseCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
