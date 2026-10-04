import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Key, FileText, Clock, UserCheck, AlertTriangle, Lock, Eye } from "lucide-react";
import { useState } from "react";

const auditLogs = [
  { id: 1, action: "Login", user: "Budi Santoso", role: "Super Admin", ip: "192.168.1.1", time: "10 menit lalu", detail: "Login berhasil" },
  { id: 2, action: "Update Data", user: "Siti Nurhaliza", role: "Admin Daycare", ip: "192.168.1.45", time: "30 menit lalu", detail: "Mengubah data siswa #234" },
  { id: 3, action: "Pembayaran", user: "System", role: "Sistem", ip: "-", time: "1 jam lalu", detail: "Invoice INV-2024-005 dibayar" },
  { id: 4, action: "Hapus Akun", user: "Budi Santoso", role: "Super Admin", ip: "192.168.1.1", time: "2 jam lalu", detail: "Menghapus akun staf #45" },
  { id: 5, action: "Setting", user: "Budi Santoso", role: "Super Admin", ip: "192.168.1.1", time: "3 jam lalu", detail: "Mengubah pengaturan billing" },
  { id: 6, action: "Login Gagal", user: "unknown@test.com", role: "-", ip: "45.33.12.8", time: "5 jam lalu", detail: "3x percobaan login gagal" },
];

const actionColors: Record<string, string> = {
  Login: "bg-success/10 text-success",
  "Update Data": "bg-info/10 text-info",
  Pembayaran: "bg-primary/10 text-primary",
  "Hapus Akun": "bg-destructive/10 text-destructive",
  Setting: "bg-warning/10 text-warning-foreground",
  "Login Gagal": "bg-destructive/10 text-destructive",
};

export default function SecurityTab() {
  const [twoFA, setTwoFA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" />Pengaturan Keamanan</CardTitle>
            <CardDescription>Konfigurasi keamanan akun dan platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Autentikasi Dua Faktor (2FA)</p>
                  <p className="text-xs text-muted-foreground">Tambah lapisan keamanan untuk login</p>
                </div>
              </div>
              <Switch checked={twoFA} onCheckedChange={setTwoFA} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium text-sm">Session Timeout</p>
                  <p className="text-xs text-muted-foreground">Logout otomatis setelah 30 menit tidak aktif</p>
                </div>
              </div>
              <Switch checked={sessionTimeout} onCheckedChange={setSessionTimeout} />
            </div>
            <div className="space-y-2">
              <Label>Password Policy</Label>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Minimal 8 karakter</p>
                <p>• Harus mengandung huruf besar dan kecil</p>
                <p>• Harus mengandung angka dan simbol</p>
              </div>
            </div>
            <Button className="w-full gap-2"><Lock className="w-4 h-4" />Ubah Password Admin</Button>
          </CardContent>
        </Card>

        {/* Account Recovery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><UserCheck className="w-4 h-4" />Pemulihan Akun</CardTitle>
            <CardDescription>Kelola pemulihan akun pengguna</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <p className="font-medium text-sm">Reset Password Pengguna</p>
              <Input placeholder="Email pengguna..." />
              <Button variant="outline" className="w-full">Kirim Link Reset</Button>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <p className="font-medium text-sm">Restore Data</p>
              <p className="text-xs text-muted-foreground">Backup terakhir: Hari ini, 02:00 WIB</p>
              <Button variant="outline" className="w-full">Lihat Backup</Button>
            </div>
            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <p className="font-medium text-sm text-destructive">Zona Bahaya</p>
              </div>
              <p className="text-xs text-muted-foreground">Menghapus akun vendor beserta semua datanya.</p>
              <Button variant="destructive" size="sm">Hapus Akun Vendor</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />Audit Log</CardTitle>
              <CardDescription>Riwayat aktivitas pengguna di platform</CardDescription>
            </div>
            <Button variant="outline" size="sm">Export Log</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge className={`${actionColors[log.action] || "bg-muted"} text-xs`} variant="secondary">{log.action}</Badge>
                  <div>
                    <p className="font-medium text-sm">{log.detail}</p>
                    <p className="text-xs text-muted-foreground">{log.user} ({log.role}) • IP: {log.ip}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{log.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
