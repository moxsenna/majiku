import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, MessageSquare, BookOpen, Search, Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const tickets = [
  { id: "TKT-001", subject: "Fitur absensi QR tidak berfungsi", from: "TK Ceria Mandiri", status: "open", priority: "high", created: "2 jam lalu" },
  { id: "TKT-002", subject: "Tidak bisa export laporan bulanan", from: "Bimbel Prestasi", status: "in_progress", priority: "medium", created: "5 jam lalu" },
  { id: "TKT-003", subject: "Cara menambahkan staf baru?", from: "PAUD Tunas", status: "resolved", priority: "low", created: "1 hari lalu" },
  { id: "TKT-004", subject: "Invoice salah jumlah", from: "Daycare Happy Kids", status: "open", priority: "high", created: "1 hari lalu" },
  { id: "TKT-005", subject: "Request fitur broadcast WhatsApp", from: "Kursus ABC", status: "resolved", priority: "medium", created: "3 hari lalu" },
];

const guides = [
  { title: "Panduan Memulai MAJIKU", category: "Getting Started", views: 1250 },
  { title: "Cara Setup Absensi QR Code", category: "Fitur", views: 890 },
  { title: "Manajemen Billing & Invoice", category: "Billing", views: 750 },
  { title: "Mengelola Staf dan Hak Akses", category: "Admin", views: 620 },
  { title: "Komunikasi dengan Orang Tua", category: "Fitur", views: 540 },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "Terbuka", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
  in_progress: { label: "Diproses", color: "bg-warning/10 text-warning-foreground", icon: Clock },
  resolved: { label: "Selesai", color: "bg-success/10 text-success", icon: CheckCircle2 },
};

export default function HelpCenterTab() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filteredTickets = tickets.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) || t.from.toLowerCase().includes(search.toLowerCase())
  );

  const openTickets = tickets.filter(t => t.status === "open").length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-destructive" /></div><div><p className="text-xs text-muted-foreground">Tiket Terbuka</p><p className="text-xl font-bold">{openTickets}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="w-5 h-5 text-warning" /></div><div><p className="text-xs text-muted-foreground">Diproses</p><p className="text-xl font-bold">{tickets.filter(t => t.status === "in_progress").length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-success" /></div><div><p className="text-xs text-muted-foreground">Selesai</p><p className="text-xl font-bold">{tickets.filter(t => t.status === "resolved").length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-info" /></div><div><p className="text-xs text-muted-foreground">Panduan</p><p className="text-xl font-bold">{guides.length}</p></div></div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Tiket Dukungan</CardTitle>
                <CardDescription>Keluhan dan pertanyaan dari vendor</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari tiket..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="space-y-2">
              {filteredTickets.map(t => {
                const sc = statusConfig[t.status];
                return (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge className={`${sc.color} text-xs`} variant="secondary">{sc.label}</Badge>
                      <div>
                        <p className="font-medium text-sm">{t.subject}</p>
                        <p className="text-xs text-muted-foreground">{t.id} • {t.from} • {t.created}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toast({ title: "Membalas tiket", description: `Membuka tiket ${t.id}` })}>
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Guides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4" />Panduan Pengguna</CardTitle>
            <CardDescription>Dokumentasi dan tutorial</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {guides.map((g, i) => (
                <div key={i} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <p className="font-medium text-sm">{g.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{g.category}</Badge>
                    <span className="text-xs text-muted-foreground">{g.views} views</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full gap-2"><BookOpen className="w-4 h-4" />Tambah Panduan</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
