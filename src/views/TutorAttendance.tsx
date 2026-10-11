import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, Clock, MapPin, CheckCircle2, XCircle, 
  Calendar, TrendingUp, AlertCircle, FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LeaveRequestDialog, type LeaveRequestData } from "@/components/leave/LeaveRequestDialog";
import {
  recordTutorAttendance,
  getMyTutorAttendanceToday,
  getMyTutorAttendanceHistory,
} from "@/server/actions/attendance";
import {
  submitLeaveRequest,
  getMyLeaveRequests,
} from "@/server/actions/leave";
import { timeInWib } from "@/lib/datetime";

const LEAVE_TYPE_LABELS: Record<string, string> = {
  sick: "Sakit",
  personal: "Keperluan Pribadi",
  annual: "Cuti Tahunan",
  emergency: "Darurat",
};

export default function TutorAttendance() {
  const queryClient = useQueryClient();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [currentTime, setCurrentTime] = useState(() => timeInWib());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(timeInWib());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const { data: todayAttendance } = useQuery({
    queryKey: ["tutor-attendance-today"],
    queryFn: getMyTutorAttendanceToday,
  });

  const { data: dbHistory = [] } = useQuery({
    queryKey: ["tutor-attendance-history", historyLimit],
    queryFn: () => getMyTutorAttendanceHistory(historyLimit),
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ["tutor-leave-requests"],
    queryFn: getMyLeaveRequests,
  });

  useEffect(() => {
    if (todayAttendance) {
      if (todayAttendance.checkInTime && !todayAttendance.checkOutTime) {
        setIsCheckedIn(true);
        setCheckInTime(todayAttendance.checkInTime);
      } else if (todayAttendance.checkOutTime) {
        setIsCheckedIn(false);
        setCheckInTime(todayAttendance.checkInTime);
      }
    }
  }, [todayAttendance]);

  const checkMutation = useMutation({
    mutationFn: (input: { type: "check-in" | "check-out"; time: string; method: string }) =>
      recordTutorAttendance(input),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tutor-attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["tutor-attendance-history"] });
      if (res.type === "check-in") {
        setIsCheckedIn(true);
        setCheckInTime(res.time);
        toast.success(`Check-in berhasil tercatat pada ${res.time} WIB`);
      } else {
        setIsCheckedIn(false);
        toast.success(`Check-out berhasil tercatat pada ${res.time} WIB`);
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Gagal mencatat absensi");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (data: LeaveRequestData) =>
      submitLeaveRequest({
        leaveType: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        replacementTutorId: data.substituteId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutor-leave-requests"] });
      toast.success("Pengajuan izin / cuti berhasil dikirim", {
        description: "Pengajuan Anda telah disimpan dan menunggu peninjauan admin.",
      });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Gagal mengirim pengajuan izin");
    },
  });

  const handleCheckOut = async () => {
    checkMutation.mutate({ type: "check-out", time: currentTime, method: "manual" });
  };

  const handleManualCheckIn = () => {
    checkMutation.mutate({ type: "check-in", time: currentTime, method: "manual" });
  };

  const handleLeaveSubmit = (data: LeaveRequestData) => {
    leaveMutation.mutate(data);
  };

  const currentDate = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const presentCount = dbHistory.filter((h) => h.status === "hadir").length;
  const absentCount = dbHistory.filter((h) => h.status === "alpa" || h.status === "tidak_hadir").length;
  const leaveCount = dbHistory.filter((h) => h.status === "izin" || h.status === "sakit").length;
  const lateCount = dbHistory.filter((h) => h.status === "terlambat").length;
  const totalDays = dbHistory.length;
  const attendancePercentage = totalDays > 0 ? (presentCount / totalDays) * 100 : 0;

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
            <div className="text-white/80 text-sm mb-2">Waktu Sekarang (WIB)</div>
            <div className="text-5xl font-bold text-white mb-4">{currentTime}</div>
            
            <div className="flex items-center justify-center gap-2 text-white/80 text-sm mb-4">
              <MapPin className="w-4 h-4" />
              <span>MAJIKU Daycare - Presensi Pengajar</span>
            </div>

            {isCheckedIn ? (
              <div className="space-y-4">
                <div className="bg-white/20 rounded-xl p-4">
                  <p className="text-white/80 text-sm">Check-in pada</p>
                  <p className="text-white text-2xl font-bold">{checkInTime} WIB</p>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    Metode: Manual
                  </Badge>
                </div>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="w-full h-14 text-lg bg-white text-red-500 hover:bg-white/90"
                  onClick={handleCheckOut}
                  disabled={checkMutation.isPending}
                >
                  <XCircle className="w-6 h-6 mr-2" />
                  {checkMutation.isPending ? "Memproses..." : "Check Out"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-white/90 text-sm">Catat kehadiran Anda hari ini secara mandiri</p>
                </div>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="w-full h-14 text-lg bg-white text-primary hover:bg-white/90 font-semibold"
                  onClick={handleManualCheckIn}
                  disabled={checkMutation.isPending}
                >
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  {checkMutation.isPending ? "Memproses..." : "Check In Sekarang"}
                </Button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <CardContent className="p-4 border-t border-border">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-xl bg-green-500/10">
                <p className="text-2xl font-bold text-green-500">{presentCount}</p>
                <p className="text-xs text-muted-foreground">Hadir</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <p className="text-2xl font-bold text-red-500">{absentCount}</p>
                <p className="text-xs text-muted-foreground">Tidak Hadir</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <p className="text-2xl font-bold text-yellow-500">{leaveCount}</p>
                <p className="text-xs text-muted-foreground">Izin</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10">
                <p className="text-2xl font-bold text-orange-500">{lateCount}</p>
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
                Kehadiran Berdasarkan Riwayat
              </CardTitle>
              <Badge variant="secondary">{attendancePercentage.toFixed(0)}%</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={attendancePercentage} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">
              {presentCount} hadir dari {totalDays} sesi tercatat di database
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
              {dbHistory.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setHistoryLimit((prev) => (prev === 10 ? 50 : 10))}
                >
                  {historyLimit === 10 ? "Lihat Semua" : "Perkecil"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dbHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Belum ada riwayat absensi</p>
                <p className="text-xs mt-1">Data absensi akan muncul di sini setelah Anda melakukan check-in</p>
              </div>
            ) : (
              dbHistory.map((record, index) => (
                <div 
                  key={record.id || index}
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
                      <p className="font-medium text-sm">{String(record.date)}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.status === "hadir" 
                          ? `${record.checkInTime || "-"} - ${record.checkOutTime || "-"}` 
                          : "Izin"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={record.status === "hadir" ? "default" : "secondary"}>
                      {record.status === "hadir" ? "Hadir" : "Izin"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {record.method || "manual"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Daftar Pengajuan Cuti / Izin */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Pengajuan Izin & Cuti
              </CardTitle>
              <Badge variant="outline">{leaveRequests.length} diajukan</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaveRequests.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-xl">
                <p className="text-sm">Belum ada pengajuan izin atau cuti yang diajukan.</p>
              </div>
            ) : (
              leaveRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {LEAVE_TYPE_LABELS[req.leaveType] || req.leaveType}
                      </p>
                      <Badge
                        variant={
                          req.status === "approved"
                            ? "default"
                            : req.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {req.status === "approved"
                          ? "Disetujui"
                          : req.status === "rejected"
                          ? "Ditolak"
                          : "Menunggu Persetujuan"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Periode: {req.startDate} s/d {req.endDate}
                    </p>
                    {req.reason && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Alasan: {req.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Request Leave Action */}
        <Card>
          <CardContent className="p-4">
            <LeaveRequestDialog onSubmit={handleLeaveSubmit}>
              <Button variant="outline" className="w-full" disabled={leaveMutation.isPending}>
                <Calendar className="w-4 h-4 mr-2" />
                {leaveMutation.isPending ? "Mengirim Pengajuan..." : "Ajukan Izin / Cuti"}
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
