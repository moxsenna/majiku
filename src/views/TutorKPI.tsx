"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, Target, CheckCircle2, Clock, 
  MessageCircle, Camera, Zap, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getMyTutorAttendanceHistory } from "@/server/actions/attendance";
import { getTutorDashboardOverview } from "@/server/actions/tutorDashboard";

export default function TutorKPI() {
  const { data: dbHistory = [] } = useQuery({
    queryKey: ["tutor-attendance-history-kpi"],
    queryFn: () => getMyTutorAttendanceHistory(30),
  });

  const { data: overview } = useQuery({
    queryKey: ["tutor-dashboard-overview-kpi"],
    queryFn: getTutorDashboardOverview,
  });

  // 1. Hitung Kehadiran dari riwayat nyata
  const totalDays = dbHistory.length;
  const presentDays = dbHistory.filter((h) => h.status === "hadir").length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // 2. Hitung Kelengkapan Laporan dari overview siswa hari ini
  const students = overview?.todayStudents || [];
  const reportsDone = students.filter((s) => !s.needsReport).length;
  const reportRate = students.length > 0 
    ? Math.round((reportsDone / students.length) * 100) 
    : (overview?.pendingReportsCount === 0 ? 100 : 0);

  // 3. Respon Komunikasi dari pesan belum terbaca
  const unreadMessages = overview?.unreadMessagesCount ?? 0;
  const responseRate = unreadMessages === 0 ? 100 : Math.max(50, 100 - unreadMessages * 10);

  // Skor Keseluruhan terhitung dari metrik nyata
  const overallScore = totalDays > 0 || students.length > 0
    ? Math.round((attendanceRate * 0.4) + (reportRate * 0.4) + (responseRate * 0.2))
    : 0;

  const currentMonthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  const metrics = [
    {
      id: "attendance",
      label: "Tingkat Kehadiran",
      value: attendanceRate,
      target: 95,
      icon: Clock,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      detail: `${presentDays} dari ${totalDays} sesi kehadiran tercatat`,
      description: "Persentase kehadiran tepat waktu berdasarkan riwayat presensi",
    },
    {
      id: "reports",
      label: "Kelengkapan Laporan Harian",
      value: reportRate,
      target: 90,
      icon: Camera,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      detail: students.length > 0 
        ? `${reportsDone} dari ${students.length} siswa telah dibuatkan laporan`
        : "Tidak ada siswa aktif hari ini",
      description: "Kelengkapan laporan perkembangan harian siswa di kelas Anda",
    },
    {
      id: "response",
      label: "Respon Komunikasi Orang Tua",
      value: responseRate,
      target: 85,
      icon: MessageCircle,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      detail: `${unreadMessages} pesan belum terbaca`,
      description: "Tingkat penanganan pesan masuk dari orang tua siswa",
    },
  ];

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
            <h1 className="font-bold text-lg">KPI & Kinerja Pengajar</h1>
            <p className="text-xs text-muted-foreground">Evaluasi berbasis data operasional</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Overall Score Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-center text-primary-foreground">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="12"
                  fill="none"
                  className="stroke-primary-foreground/20"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="12"
                  fill="none"
                  className="stroke-primary-foreground"
                  strokeLinecap="round"
                  strokeDasharray={`${(overallScore / 100) * 352} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{overallScore}</span>
                <span className="text-sm opacity-80">dari 100</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-1">Skor Kinerja Pengajar</h2>
            <p className="text-primary-foreground/80 text-sm">Periode {currentMonthLabel}</p>
            <Badge variant="secondary" className="mt-3 bg-white/20 text-white border-0 text-xs">
              Berbasis data absensi & laporan harian
            </Badge>
          </div>
        </Card>

        {/* Metrik Kinerja Nyata */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">Rincian Indikator Kinerja</h3>
            <span className="text-xs text-muted-foreground">Kalkulasi Otomatis</span>
          </div>

          {metrics.map((metric) => (
            <Card key={metric.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", metric.bgColor)}>
                    <metric.icon className={cn("w-6 h-6", metric.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate">{metric.label}</h4>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-base font-bold", metric.color)}>{metric.value}%</span>
                        {metric.value >= metric.target ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Target className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <Progress value={metric.value} className="h-2 mb-2" />
                    <p className="text-xs text-foreground font-medium mb-0.5">{metric.detail}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <p className="truncate">{metric.description}</p>
                      <p className="shrink-0 ml-2">Target: {metric.target}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ringkasan Kejujuran Data */}
        {totalDays === 0 && students.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-4 text-center text-muted-foreground space-y-1">
              <AlertCircle className="w-6 h-6 mx-auto opacity-50" />
              <p className="text-sm font-medium text-foreground">Data Kinerja Belum Terakumulasi</p>
              <p className="text-xs">
                Lakukan pencatatan kehadiran dan pengunggahan laporan harian siswa untuk membentuk skor KPI riil.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Pedoman Kinerja Pengajar</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Skor dihitung langsung dari kepatuhan presensi harian, ketuntasan upload laporan perkembangan sebelum pukul 16:00 WIB, dan responsivitas percakapan dengan orang tua.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
