import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Smartphone, Check, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NotificationPreferences {
  billing: boolean;
  lessonPlan: boolean;
  dailyReport: boolean;
  attendance: boolean;
  announcements: boolean;
}

interface PushNotificationSetupProps {
  role: "parent" | "tutor" | "admin";
  onPreferencesChange?: (prefs: NotificationPreferences) => void;
}

export function PushNotificationSetup({ role, onPreferencesChange }: PushNotificationSetupProps) {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    billing: true,
    lessonPlan: true,
    dailyReport: true,
    attendance: true,
    announcements: true,
  });

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported("Notification" in window && "serviceWorker" in navigator);
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Tidak didukung",
        description: "Browser Anda tidak mendukung push notification",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        // Here we would register with Firebase FCM
        // For demo, we'll just simulate it
        setIsSubscribed(true);
        toast({
          title: "Notifikasi diaktifkan!",
          description: "Anda akan menerima notifikasi penting dari MAJIKU",
        });
      } else if (result === "denied") {
        toast({
          title: "Izin ditolak",
          description: "Anda dapat mengaktifkan kembali di pengaturan browser",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Error",
        description: "Gagal mengaktifkan notifikasi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    onPreferencesChange?.(newPrefs);
  };

  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("Test Notifikasi MAJIKU", {
        body: "Ini adalah contoh notifikasi dari MAJIKU. Notifikasi berfungsi dengan baik!",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
      toast({
        title: "Test berhasil!",
        description: "Notifikasi test telah dikirim",
      });
    }
  };

  const notificationOptions = {
    parent: [
      { key: "billing", label: "Pengingat Tagihan SPP", description: "Notifikasi saat tagihan jatuh tempo" },
      { key: "dailyReport", label: "Laporan Harian Anak", description: "Update kegiatan dan progress anak" },
      { key: "attendance", label: "Kehadiran Anak", description: "Notifikasi saat anak check-in/check-out" },
      { key: "announcements", label: "Pengumuman Sekolah", description: "Info penting dari sekolah" },
    ],
    tutor: [
      { key: "lessonPlan", label: "Pengingat Lesson Plan", description: "Reminder lesson plan untuk besok" },
      { key: "attendance", label: "Absensi", description: "Pengingat untuk melakukan absensi" },
      { key: "dailyReport", label: "Laporan Pending", description: "Siswa yang belum ada laporan" },
      { key: "announcements", label: "Info dari Admin", description: "Pengumuman dan info penting" },
    ],
    admin: [
      { key: "billing", label: "Pembayaran Masuk", description: "Notifikasi pembayaran baru" },
      { key: "attendance", label: "Kehadiran Tutor", description: "Laporan kehadiran tutor" },
      { key: "dailyReport", label: "Laporan Pending Review", description: "Laporan menunggu approval" },
      { key: "announcements", label: "Aktivitas Sistem", description: "Notifikasi aktivitas penting" },
    ],
  };

  const options = notificationOptions[role];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notification
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              permission === "granted" 
                ? "bg-success/10 text-success border-success/20" 
                : permission === "denied"
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-warning/10 text-warning border-warning/20"
            )}
          >
            {permission === "granted" ? "Aktif" : permission === "denied" ? "Diblokir" : "Belum Aktif"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status & Enable Button */}
        {permission !== "granted" && (
          <div className={cn(
            "p-4 rounded-lg flex items-start gap-3",
            permission === "denied" 
              ? "bg-destructive/5 border border-destructive/20" 
              : "bg-primary/5 border border-primary/20"
          )}>
            {permission === "denied" ? (
              <>
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Notifikasi Diblokir</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Anda telah memblokir notifikasi. Untuk mengaktifkan kembali, 
                    buka pengaturan browser dan izinkan notifikasi untuk situs ini.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Aktifkan Push Notification</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Terima notifikasi penting langsung di perangkat Anda, 
                    bahkan saat tidak membuka aplikasi.
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-3" 
                    onClick={requestPermission}
                    disabled={loading}
                  >
                    {loading ? "Mengaktifkan..." : "Aktifkan Sekarang"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {permission === "granted" && (
          <>
            {/* Success State */}
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3">
              <Check className="w-5 h-5 text-success" />
              <div className="flex-1">
                <p className="text-sm font-medium text-success">Notifikasi Aktif</p>
                <p className="text-xs text-muted-foreground">
                  Anda akan menerima notifikasi sesuai preferensi di bawah
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={sendTestNotification}>
                Test
              </Button>
            </div>

            {/* Preferences */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Preferensi Notifikasi</p>
              {options.map((option) => (
                <div 
                  key={option.key} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <Label className="text-sm font-medium">{option.label}</Label>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  <Switch
                    checked={preferences[option.key as keyof NotificationPreferences]}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange(option.key as keyof NotificationPreferences, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {role === "parent" 
              ? "Notifikasi akan dikirim saat ada tagihan jatuh tempo, laporan aktivitas anak, dan pengumuman penting."
              : role === "tutor"
                ? "Notifikasi akan dikirim untuk mengingatkan lesson plan besok dan siswa yang belum ada laporannya."
                : "Notifikasi akan dikirim untuk pembayaran baru dan laporan yang menunggu review."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
