import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Clock, MapPin, CheckCircle2, XCircle, 
  Calendar, TrendingUp, AlertCircle, QrCode
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { QRCodeScanner } from "@/components/attendance/QRCodeScanner";
import { LeaveRequestDialog } from "@/components/leave/LeaveRequestDialog";

const attendanceHistory = [
  { date: "13 Des 2024", checkIn: "07:45", checkOut: "16:30", status: "hadir", duration: "8j 45m", method: "QR Scan" },
  { date: "12 Des 2024", checkIn: "07:50", checkOut: "16:15", status: "hadir", duration: "8j 25m", method: "QR Scan" },
  { date: "11 Des 2024", checkIn: "08:00", checkOut: "16:00", status: "hadir", duration: "8j 0m", method: "QR Scan" },
  { date: "10 Des 2024", checkIn: "-", checkOut: "-", status: "izin", duration: "-", method: "-" },
  { date: "9 Des 2024", checkIn: "07:55", checkOut: "16:20", status: "hadir", duration: "8j 25m", method: "QR Scan" },
];

const monthlyStats = {
  totalDays: 22,
  present: 20,
  absent: 1,
  leave: 1,
  late: 2,
};

export default function TutorAttendance() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"qr" | "manual">("qr");
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handleQRScanSuccess = (data: string) => {
    setIsCheckedIn(true);
    setCheckInTime(currentTime);
    toast.success(`Check-in berhasil via QR Code pada ${currentTime}`, {
      description: `ID: ${data.slice(0, 20)}...`,
    });
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    toast.success(`Check-out berhasil pada ${currentTime}`);
  };

  const handleLeaveSubmit = (data: any) => {
    console.log("Leave request submitted:", data);
  };

  const attendancePercentage = (monthlyStats.present / monthlyStats.totalDays) * 100;

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Link href="/tutor">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Absensi Tutor</h1>
            <p className="text-xs text-muted-foreground">{currentDate}</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Check In/Out Card */}
        <Card className="overflow-hidden">
          <div className={cn(
            "p-6 text-center",
            isCheckedIn 
              ? "bg-gradient-to-br from-green-500 to-green-600" 
              : "bg-gradient-to-br from-primary to-primary/80"
          )}>
            <div className="text-white/80 text-sm mb-2">Waktu Sekarang</div>
            <div className="text-5xl font-bold text-white mb-4">{currentTime}</div>
            
            <div className="flex items-center justify-center gap-2 text-white/80 text-sm mb-4">
              <MapPin className="w-4 h-4" />
              <span>MAJIKU Daycare - Jakarta</span>
            </div>

            {isCheckedIn ? (
              <div className="space-y-4">
                <div className="bg-white/20 rounded-xl p-4">
                  <p className="text-white/80 text-sm">Check-in pada</p>
                  <p className="text-white text-2xl font-bold">{checkInTime}</p>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
                    <QrCode className="w-3 h-3 mr-1" />
                    Via QR Code
                  </Badge>
                </div>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="w-full h-14 text-lg bg-white text-red-500 hover:bg-white/90"
                  onClick={handleCheckOut}
                >
                  <XCircle className="w-6 h-6 mr-2" />
                  Check Out
                </Button>
              </div>
            ) : (
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/80 text-sm mb-2">Scan QR Code untuk Check-in</p>
                <div className="flex items-center justify-center gap-2">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* QR Scanner Section */}
          {!isCheckedIn && (
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "qr" | "manual")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="qr" className="gap-2">
                    <QrCode className="w-4 h-4" />
                    Scan QR
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Manual
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="qr">
                  <QRCodeScanner 
                    onScanSuccess={handleQRScanSuccess}
                    onScanError={(error) => toast.error(error)}
                    locationName="MAJIKU Daycare - Jakarta"
                  />
                </TabsContent>
                <TabsContent value="manual">
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-4">
                      Check-in manual hanya untuk keadaan darurat dan perlu persetujuan admin
                    </p>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="w-full h-14"
                      onClick={() => {
                        setIsCheckedIn(true);
                        setCheckInTime(currentTime);
                        toast.info(`Check-in manual pada ${currentTime}`, {
                          description: "Menunggu verifikasi admin",
                        });
                      }}
                    >
                      <CheckCircle2 className="w-6 h-6 mr-2" />
                      Check In Manual
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}

          {/* Quick Stats */}
          <CardContent className="p-4 border-t border-border">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-xl bg-green-500/10">
                <p className="text-2xl font-bold text-green-500">{monthlyStats.present}</p>
                <p className="text-xs text-muted-foreground">Hadir</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <p className="text-2xl font-bold text-red-500">{monthlyStats.absent}</p>
                <p className="text-xs text-muted-foreground">Tidak Hadir</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <p className="text-2xl font-bold text-yellow-500">{monthlyStats.leave}</p>
                <p className="text-xs text-muted-foreground">Izin</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10">
                <p className="text-2xl font-bold text-orange-500">{monthlyStats.late}</p>
                <p className="text-xs text-muted-foreground">Terlambat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Kehadiran Bulan Ini
              </CardTitle>
              <Badge variant="secondary">{attendancePercentage.toFixed(0)}%</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={attendancePercentage} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">
              {monthlyStats.present} dari {monthlyStats.totalDays} hari kerja
            </p>
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Riwayat Absensi
              </CardTitle>
              <Button variant="ghost" size="sm">
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {attendanceHistory.map((record, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    record.status === "hadir" ? "bg-green-500/10" : "bg-yellow-500/10"
                  )}>
                    {record.status === "hadir" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{record.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.status === "hadir" 
                        ? `${record.checkIn} - ${record.checkOut}` 
                        : "Izin"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={record.status === "hadir" ? "default" : "secondary"}>
                    {record.status === "hadir" ? "Hadir" : "Izin"}
                  </Badge>
                  {record.method !== "-" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <QrCode className="w-3 h-3 inline mr-1" />
                      {record.method}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Request Leave */}
        <Card>
          <CardContent className="p-4">
            <LeaveRequestDialog onSubmit={handleLeaveSubmit}>
              <Button variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Ajukan Izin / Cuti
              </Button>
            </LeaveRequestDialog>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Chat akan otomatis dialihkan ke Admin/Pengganti saat cuti disetujui
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
