import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Palette, CreditCard, Link2, RefreshCw, CheckCircle2, XCircle, Plug } from "lucide-react";

const features = [
  { id: "attendance", name: "Manajemen Kehadiran", description: "QR Code check-in, absensi manual", enabled: true },
  { id: "billing", name: "Billing & Pembayaran", description: "Invoice otomatis, tracking pembayaran", enabled: true },
  { id: "reports", name: "Laporan Harian", description: "Laporan aktivitas anak ke orang tua", enabled: true },
  { id: "gallery", name: "Galeri Foto", description: "Upload dan share foto aktivitas", enabled: true },
  { id: "messaging", name: "Komunikasi", description: "Chat admin-parent, broadcast", enabled: true },
  { id: "lesson_plan", name: "Lesson Plan", description: "Rencana pembelajaran tutor", enabled: false },
  { id: "crm", name: "CRM & Marketing", description: "Pipeline lead, kampanye marketing", enabled: false },
];

const integrations = [
  { name: "Midtrans", category: "Pembayaran", status: "connected", icon: CreditCard },
  { name: "WhatsApp Business API", category: "Notifikasi", status: "connected", icon: Plug },
  { name: "Google Analytics", category: "Analitik", status: "disconnected", icon: Link2 },
  { name: "Xendit", category: "Pembayaran", status: "disconnected", icon: CreditCard },
];

export default function PlatformSettingsTab() {
  const { toast } = useToast();
  const [featureStates, setFeatureStates] = useState(
    features.reduce((acc, f) => ({ ...acc, [f.id]: f.enabled }), {} as Record<string, boolean>)
  );

  const toggleFeature = (id: string) => {
    setFeatureStates(prev => ({ ...prev, [id]: !prev[id] }));
    toast({ title: "Fitur diperbarui", description: `Fitur berhasil ${featureStates[id] ? "dinonaktifkan" : "diaktifkan"}` });
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4" />Pengaturan Umum</CardTitle>
            <CardDescription>Konfigurasi dasar platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Platform</Label>
              <Input defaultValue="MAJIKU" />
            </div>
            <div className="space-y-2">
              <Label>Email Support</Label>
              <Input defaultValue="support@majiku.id" />
            </div>
            <div className="space-y-2">
              <Label>Versi Sistem</Label>
              <div className="flex items-center gap-2">
                <Input defaultValue="v2.4.1" disabled />
                <Badge variant="secondary" className="whitespace-nowrap">Stabil</Badge>
              </div>
            </div>
            <Button className="w-full">Simpan Pengaturan</Button>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Palette className="w-4 h-4" />Branding & Tema</CardTitle>
            <CardDescription>Sesuaikan tampilan platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Warna Primer</Label>
              <div className="flex gap-3">
                {["bg-primary", "bg-info", "bg-success", "bg-warning"].map((c, i) => (
                  <button key={i} className={`w-10 h-10 rounded-xl ${c} ${i === 0 ? "ring-2 ring-ring ring-offset-2" : ""}`} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input defaultValue="https://majiku.id/logo.png" />
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input defaultValue="https://majiku.id/favicon.ico" />
            </div>
            <Button className="w-full">Simpan Branding</Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pengelolaan Fitur</CardTitle>
          <CardDescription>Aktifkan atau nonaktifkan fitur untuk vendor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {features.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-sm">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
                <Switch checked={featureStates[f.id]} onCheckedChange={() => toggleFeature(f.id)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Plug className="w-4 h-4" />Integrasi</CardTitle>
          <CardDescription>Koneksi ke layanan pihak ketiga</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrations.map((intg, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <intg.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{intg.name}</p>
                    <p className="text-xs text-muted-foreground">{intg.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {intg.status === "connected" ? (
                    <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" />Terhubung</Badge>
                  ) : (
                    <Button variant="outline" size="sm">Hubungkan</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
