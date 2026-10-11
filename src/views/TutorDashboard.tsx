"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, MessageCircle, Clock, BookOpen, Camera, 
  ChevronRight, TrendingUp, AlertCircle,
  Upload, ClipboardCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuickActionButton } from "@/components/dashboard/QuickActionButton";
import { TutorScheduleWidget } from "@/components/dashboard/TutorScheduleWidget";
import { TutorEarningsWidget } from "@/components/dashboard/TutorEarningsWidget";
import { TutorNotificationsWidget } from "@/components/dashboard/TutorNotificationsWidget";
import { TutorLessonPlanWidget } from "@/components/dashboard/TutorLessonPlanWidget";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  getTutorDashboardOverview,
  type TutorDashboardData,
} from "@/server/actions/tutorDashboard";

interface TutorDashboardProps {
  initialData?: TutorDashboardData;
}

const earningsData = {
  baseSalary: 3000000,
  sessionEarnings: 2000000,
  sessionsCompleted: 20,
  kpiScore: 92,
  kpiBonus: 450000,
  totalEarnings: 5450000,
};

export default function TutorDashboard({ initialData }: TutorDashboardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: dashboardData } = useQuery({
    queryKey: ["tutor-dashboard-overview"],
    queryFn: getTutorDashboardOverview,
    initialData,
  });

  const data = dashboardData || initialData;
  const isDemo = data?.isDemo ?? true;
  const isAssigned = data?.isAssigned ?? isDemo;

  const displayName = data?.tutorName || user?.name || "Guru Pengajar";
  const studentsList = data?.todayStudents || [];
  const schedulesList = data?.schedules || [];

  // Sumber jujur: tugas pembuatan laporan harian siswa yang pending
  const honestNotifications = studentsList
    .filter((s) => s.needsReport)
    .map((s) => ({
      id: `report-pending-${s.id}`,
      type: "reminder" as const,
      title: "Laporan Belum Dibuat",
      message: `Laporan perkembangan untuk ${s.name} (${s.class}) belum dibuat hari ini.`,
      studentName: s.name,
      time: "Hari ini",
      isRead: false,
    }));

  const handleReviseReport = (notifId: string) => {
    const notif = honestNotifications.find(n => n.id === notifId);
    toast({
      title: "Buka Editor Laporan",
      description: `Mengisi laporan harian ${notif?.studentName || "siswa"}`,
    });
    router.push("/tutor/progress");
  };

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Selamat Datang, {displayName}! 👋</h2>
              <p className="text-sm text-primary-foreground/80">
                {isDemo
                  ? "Mode Demo: Menampilkan simulasi jadwal dan siswa aktif."
                  : "Pantau dan kelola aktivitas belajar mengajar harian siswa di kelas Anda."}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-xs text-primary-foreground/70">Portal Tutor MAJIKU</p>
                <Badge
                  variant="outline"
                  className="border-primary-foreground/40 text-primary-foreground text-xs mt-1"
                >
                  {isAssigned ? "Aktif Mengajar" : "Menunggu Penugasan"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Banner untuk Tutor yang Belum Ditugaskan ke Kelas */}
      {!isAssigned && !isDemo && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">Akun Belum Ditugaskan ke Kelas</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Akun Anda telah terdaftar sebagai Tutor, tetapi belum dihubungkan ke rombel/kelas aktif oleh Admin Daycare. Harap hubungi administrator daycare untuk penugasan kelas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.todayPresentCount || 0}</p>
                <p className="text-xs text-muted-foreground">Siswa Hadir</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.pendingReportsCount || 0}</p>
                <p className="text-xs text-muted-foreground">Laporan Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.unreadMessagesCount || 0}</p>
                <p className="text-xs text-muted-foreground">Pesan Baru</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isAssigned ? `${data?.kpiScore || 90}%` : "0%"}</p>
                <p className="text-xs text-muted-foreground">Skor KPI</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <QuickActionButton
          icon={ClipboardCheck}
          label="Antrean Trial"
          color="blue"
          onClick={() => router.push("/tutor/trials")}
        />
        <QuickActionButton
          icon={Upload}
          label="Upload Laporan"
          color="orange"
          onClick={() => router.push("/tutor/progress")}
        />
        <QuickActionButton
          icon={Clock}
          label="Absensi"
          color="green"
          onClick={() => router.push("/tutor/attendance")}
        />
        <QuickActionButton
          icon={MessageCircle}
          label="Chat"
          color="blue"
          onClick={() => router.push("/tutor/chat")}
        />
        <QuickActionButton
          icon={BookOpen}
          label="Panduan"
          color="purple"
          onClick={() => router.push("/tutor/guides")}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Students */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Siswa Hari Ini</CardTitle>
              <Badge variant="secondary">{studentsList.length} siswa</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {studentsList.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
                Belum ada siswa yang terdaftar di kelas Anda.
              </div>
            ) : (
              studentsList.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={student.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {student.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.status === "hadir" ? (
                      <Badge variant="default" className="bg-green-500">Hadir</Badge>
                    ) : student.status === "izin" ? (
                      <Badge variant="secondary">Izin</Badge>
                    ) : (
                      <Badge variant="outline">Belum Absen</Badge>
                    )}
                    {student.needsReport && (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                </div>
              ))
            )}
            <Link href="/tutor/progress">
              <Button variant="outline" className="w-full mt-2">
                Upload Laporan Harian
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Messages / Communication Hub */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pesan Orang Tua</CardTitle>
              <Badge variant="outline">Chat</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
              Gunakan fitur chat untuk berkomunikasi langsung dengan orang tua siswa di kelas Anda.
            </div>
            <Link href="/tutor/chat">
              <Button variant="outline" className="w-full mt-2">
                Buka Chat Siswa
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Lesson Plan Widget */}
        <TutorLessonPlanWidget />

        {/* Tutor Schedule */}
        <TutorScheduleWidget schedules={schedulesList} />

        {/* Notifications */}
        <TutorNotificationsWidget 
          notifications={honestNotifications} 
          onReviseReport={handleReviseReport}
        />

        {/* Earnings Widget (Hanya tampil untuk simulasi demo) */}
        {isDemo && <TutorEarningsWidget {...earningsData} />}
      </div>
    </div>
  );
}
