"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Palette, CreditCard, Link2, CheckCircle2, Plug } from "lucide-react";

const features = [
  { id: "attendance", name: "Manajemen Kehadiran", description: "QR Code check-in, absensi manual", enabled: true },
  { id: "billing", name: "Billing & Pembayaran", description: "Invoice otomatis, integrasi gateway PayCore", enabled: true },
  { id: "reports", name: "Laporan Harian", description: "Laporan aktivitas anak ke orang tua", enabled: true },
  { id: "gallery", name: "Galeri Foto", description: "Upload dan share foto aktivitas via Cloudflare R2", enabled: true },
  { id: "messaging", name: "Komunikasi", description: "Chat admin-parent, broadcast", enabled: true },
  { id: "lesson_plan", name: "Lesson Plan", description: "Rencana pembelajaran tutor", enabled: false },
  { id: "crm", name: "CRM & Marketing", description: "Pipeline lead, kampanye marketing", enabled: false },
];

const integrations = [
  { name: "PayCore", category: "Payment Gateway", status: "connected", icon: CreditCard, description: "Gerbang pembayaran otomatis QRIS & Virtual Account" },
  { name: "WhatsApp Business API", category: "Notifikasi", status: "connected", icon: Plug, description: "Notifikasi kehadiran dan pengumuman instan" },
  { name: "Cloudflare R2", category: "Penyimpanan Media", status: "connected", icon: Link2, description: "Penyimpanan foto laporan & aset lembaga" },
];

export default function PlatformSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Settings (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Pengaturan Umum
            </CardTitle>
            <CardDescription>Konfigurasi dasar platform MAJIKU (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Platform</Label>
              <Input defaultValue="MAJIKU" disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Email Support</Label>
              <Input defaultValue="support@majiku.web.id" disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Versi Sistem</Label>
              <div className="flex items-center gap-2">
                <Input defaultValue="v2.4.1" disabled className="bg-muted/50" />
                <Badge variant="secondary" className="whitespace-nowrap">
                  Stabil
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme & Branding (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Branding & Tema
            </CardTitle>
            <CardDescription>Identitas visual dan aset merek platform (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Warna Primer</Label>
              <div className="flex gap-3">
                {["bg-primary", "bg-info", "bg-success", "bg-warning"].map((c, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-xl ${c} ${i === 0 ? "ring-2 ring-ring ring-offset-2" : ""}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input defaultValue="https://majiku.web.id/logo.png" disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input defaultValue="https://majiku.web.id/favicon.ico" disabled className="bg-muted/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Management (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ketersediaan Modul & Fitur</CardTitle>
          <CardDescription>Status ketersediaan modul pada paket berlangganan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {features.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium text-sm">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
                <Badge variant={f.enabled ? "default" : "secondary"} className="text-xs">
                  {f.enabled ? "Aktif" : "Segera Hadir"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrations (Read-only, PayCore / WhatsApp / R2) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plug className="w-4 h-4" />
            Integrasi Layanan Aktif
          </CardTitle>
          <CardDescription>Daftar gerbang koneksi eksternal yang terpasang pada platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrations.map((intg, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <intg.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{intg.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {intg.category} • {intg.description}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="gap-1 text-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  Terhubung
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
