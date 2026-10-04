import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, Clock, MessageSquare, Plus, Settings, 
  Play, Pause, Trash2, Edit, CheckCircle2
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  template: string;
  isActive: boolean;
  lastRun?: string;
  sentCount: number;
}

const demoRules: AutomationRule[] = [
  {
    id: "1",
    name: "Welcome Message",
    trigger: "Lead Baru Masuk",
    action: "Kirim WhatsApp",
    template: "Halo {nama}, terima kasih telah menghubungi kami! Tim kami akan segera menghubungi Anda.",
    isActive: true,
    lastRun: "10 menit lalu",
    sentCount: 45,
  },
  {
    id: "2",
    name: "Follow Up Trial",
    trigger: "Setelah Trial 1 Hari",
    action: "Kirim WhatsApp",
    template: "Halo {nama}, bagaimana pengalaman {anak} saat trial kemarin? Kami ingin mendengar feedback Anda.",
    isActive: true,
    lastRun: "1 jam lalu",
    sentCount: 23,
  },
  {
    id: "3",
    name: "Reminder Pembayaran",
    trigger: "H-3 Jatuh Tempo",
    action: "Kirim WhatsApp + Email",
    template: "Pengingat pembayaran SPP untuk {anak}. Jatuh tempo: {tanggal}. Total: {jumlah}",
    isActive: true,
    lastRun: "3 jam lalu",
    sentCount: 156,
  },
  {
    id: "4",
    name: "Win-back Campaign",
    trigger: "Lead Lost > 30 Hari",
    action: "Kirim WhatsApp",
    template: "Halo {nama}, kami punya promo spesial untuk Anda! Diskon 20% untuk pendaftaran bulan ini.",
    isActive: false,
    sentCount: 12,
  },
];

export function AutoFollowUpWidget() {
  const { toast } = useToast();
  const [rules, setRules] = useState(demoRules);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const toggleRule = (id: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
    toast({
      title: "Automation diperbarui",
      description: "Status automation berhasil diubah",
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Send className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">Auto Follow-Up</span>
          </CardTitle>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 shrink-0 h-8">
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">Tambah</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Buat Automation Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Nama Automation</Label>
                  <Input placeholder="Nama automation..." />
                </div>
                <div>
                  <Label>Trigger</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_lead">Lead Baru Masuk</SelectItem>
                      <SelectItem value="after_trial">Setelah Trial</SelectItem>
                      <SelectItem value="payment_due">H-3 Jatuh Tempo</SelectItem>
                      <SelectItem value="order_sent">Pesanan Dikirim</SelectItem>
                      <SelectItem value="order_received">Pesanan Diterima</SelectItem>
                      <SelectItem value="order_return">Pesanan Retur</SelectItem>
                      <SelectItem value="birthday">Ulang Tahun</SelectItem>
                      <SelectItem value="enrollment">Pendaftaran Berhasil</SelectItem>
                      <SelectItem value="lead_lost">Lead Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Aksi</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih aksi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">Kirim WhatsApp</SelectItem>
                      <SelectItem value="email">Kirim Email</SelectItem>
                      <SelectItem value="both">WhatsApp + Email</SelectItem>
                      <SelectItem value="sms">Kirim SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Template Pesan</Label>
                  <Textarea 
                    placeholder="Gunakan {nama}, {anak}, {tanggal}, {jumlah} untuk personalisasi..."
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Variable: {'{nama}'}, {'{anak}'}, {'{tanggal}'}, {'{jumlah}'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    toast({ title: "Automation dibuat!" });
                    setAddDialogOpen(false);
                  }}>
                    Simpan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-3 sm:px-6">
        {rules.map((rule) => (
          <div 
            key={rule.id} 
            className={`p-2.5 sm:p-3 rounded-lg border transition-colors ${
              rule.isActive ? "bg-card" : "bg-muted/30 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-medium text-xs sm:text-sm truncate">{rule.name}</p>
                  {rule.isActive && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[9px] sm:text-[10px]">
                      Aktif
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {rule.trigger}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {rule.action}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] sm:text-xs">
                  <span className="text-muted-foreground">
                    {rule.sentCount} terkirim
                  </span>
                  {rule.lastRun && (
                    <span className="text-muted-foreground">
                      • {rule.lastRun}
                    </span>
                  )}
                </div>
              </div>
              <Switch 
                checked={rule.isActive} 
                onCheckedChange={() => toggleRule(rule.id)}
                className="shrink-0"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
