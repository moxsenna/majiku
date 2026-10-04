import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Users, MessageCircle, Clock, Target, BookOpen, Camera, 
  Bell, ChevronRight, TrendingUp, CheckCircle2, AlertCircle,
  Home, Upload, ClipboardCheck, Award, GraduationCap, Menu, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { QuickActionButton } from "@/components/dashboard/QuickActionButton";
import { TutorScheduleWidget } from "@/components/dashboard/TutorScheduleWidget";
import { TutorEarningsWidget } from "@/components/dashboard/TutorEarningsWidget";
import { TutorNotificationsWidget } from "@/components/dashboard/TutorNotificationsWidget";
import { TutorLessonPlanWidget } from "@/components/dashboard/TutorLessonPlanWidget";
import { useToast } from "@/hooks/use-toast";

const tutorNav = [
  { icon: Home, label: "Dashboard", path: "/tutor" },
  { icon: Upload, label: "Upload Progress", path: "/tutor/progress" },
  { icon: MessageCircle, label: "Chat", path: "/tutor/chat" },
  { icon: ClipboardCheck, label: "Absensi", path: "/tutor/attendance" },
  { icon: Target, label: "KPI", path: "/tutor/kpi" },
];

const todayStudents = [
  { id: 1, name: "Ahmad Rizki", class: "Kelas A", avatar: "", status: "hadir", needsReport: true },
  { id: 2, name: "Siti Aisyah", class: "Kelas A", avatar: "", status: "hadir", needsReport: false },
  { id: 3, name: "Budi Santoso", class: "Kelas A", avatar: "", status: "hadir", needsReport: true },
  { id: 4, name: "Dewi Lestari", class: "Kelas A", avatar: "", status: "izin", needsReport: false },
];

const recentMessages = [
  { id: 1, parent: "Ibu Rizki", message: "Bagaimana perkembangan Ahmad hari ini?", time: "10 menit lalu", unread: true },
  { id: 2, parent: "Ibu Aisyah", message: "Terima kasih atas laporannya", time: "1 jam lalu", unread: false },
];

const tutorSchedules = [
  { id: "1", date: "15", dayName: "Min", className: "Kelas Bunga Matahari", time: "08:00 - 12:00", location: "Ruang A1", studentsCount: 15, status: "today" as const },
  { id: "2", date: "17", dayName: "Sel", className: "Kelas Pelangi", time: "08:00 - 12:00", location: "Ruang A2", studentsCount: 12, status: "upcoming" as const },
  { id: "3", date: "19", dayName: "Kam", className: "Kelas Bunga Matahari", time: "08:00 - 12:00", location: "Ruang A1", studentsCount: 15, status: "upcoming" as const },
  { id: "4", date: "22", dayName: "Min", className: "Kelas Bintang", time: "13:00 - 17:00", location: "Ruang B1", studentsCount: 10, status: "upcoming" as const },
];

const tutorNotifications = [
  { 
    id: "1", 
    type: "rejection" as const, 
    title: "Laporan Ditolak", 
    message: "Laporan harian Ahmad Rizki perlu direvisi",
    studentName: "Ahmad Rizki",
    rejectionReason: "Foto kegiatan kurang jelas, mohon upload ulang dengan kualitas yang lebih baik. Tambahkan juga deskripsi kegiatan yang lebih detail.",
    time: "30 menit lalu",
    isRead: false,
  },
  { 
    id: "2", 
    type: "approval" as const, 
    title: "Laporan Disetujui", 
    message: "Laporan Siti Aisyah telah dipublish ke orang tua",
    studentName: "Siti Aisyah",
    time: "1 jam lalu",
    isRead: false,
  },
  { 
    id: "3", 
    type: "reminder" as const, 
    title: "Pengingat Laporan", 
    message: "3 siswa belum ada laporan hari ini",
    time: "2 jam lalu",
    isRead: true,
  },
];

const earningsData = {
  baseSalary: 3000000,
  sessionEarnings: 2000000,
  sessionsCompleted: 20,
  kpiScore: 92,
  kpiBonus: 450000,
  totalEarnings: 5450000,
};

export default function TutorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(tutorNotifications);

  const handleReviseReport = (notifId: string) => {
    const notif = notifications.find(n => n.id === notifId);
    toast({
      title: "Buka Editor Laporan",
      description: `Merevisi laporan ${notif?.studentName}`,
    });
    navigate("/tutor/progress");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">MAJIKU Tutor</h1>
              <p className="text-xs text-muted-foreground">Selamat datang, Ibu Sarah</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">3</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="border-t border-border bg-background p-4 space-y-2">
            {tutorNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 min-h-screen bg-card border-r border-border flex-col p-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">MAJIKU</h1>
              <p className="text-xs text-muted-foreground">Portal Tutor</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {tutorNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-3 p-3">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">SS</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">Ibu Sarah</p>
                <p className="text-xs text-muted-foreground">Tutor Kelas A</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          {/* Welcome Card */}
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Selamat Pagi, Ibu Sarah! 👋</h2>
                  <p className="text-primary-foreground/80">Hari ini ada 12 siswa hadir di kelas Anda</p>
                </div>
                <div className="hidden md:block">
                  <div className="text-right">
                    <p className="text-sm text-primary-foreground/70">Jumat, 13 Desember 2024</p>
                    <p className="text-3xl font-bold">08:30</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
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
                    <p className="text-2xl font-bold">5</p>
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
                    <p className="text-2xl font-bold">3</p>
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
                    <p className="text-2xl font-bold">92%</p>
                    <p className="text-xs text-muted-foreground">Skor KPI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - Now styled as distinct buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <QuickActionButton
              icon={Upload}
              label="Upload Laporan"
              color="orange"
              onClick={() => navigate("/tutor/progress")}
            />
            <QuickActionButton
              icon={Clock}
              label="Absensi"
              color="green"
              onClick={() => navigate("/tutor/attendance")}
            />
            <QuickActionButton
              icon={MessageCircle}
              label="Chat"
              color="blue"
              onClick={() => navigate("/tutor/chat")}
            />
            <QuickActionButton
              icon={BookOpen}
              label="Panduan"
              color="purple"
              onClick={() => navigate("/tutor/guides")}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Today's Students */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Siswa Hari Ini</CardTitle>
                  <Badge variant="secondary">{todayStudents.length} siswa</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {student.name.split(' ').map(n => n[0]).join('')}
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
                      ) : (
                        <Badge variant="secondary">Izin</Badge>
                      )}
                      {student.needsReport && (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                ))}
                <Link to="/tutor/progress">
                  <Button variant="outline" className="w-full mt-2">
                    Upload Laporan Harian
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pesan Terbaru</CardTitle>
                  <Badge variant="destructive">2 baru</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "p-3 rounded-xl",
                    msg.unread ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{msg.parent}</p>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{msg.message}</p>
                  </div>
                ))}
                <Link to="/tutor/chat">
                  <Button variant="outline" className="w-full mt-2">
                    Lihat Semua Pesan
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Lesson Plan Widget */}
            <TutorLessonPlanWidget />

            {/* Tutor Schedule */}
            <TutorScheduleWidget schedules={tutorSchedules} />

            {/* Notifications with rejection info */}
            <TutorNotificationsWidget 
              notifications={notifications} 
              onReviseReport={handleReviseReport}
            />

            {/* Earnings Widget */}
            <TutorEarningsWidget {...earningsData} />

            {/* KPI Progress */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Progress KPI Bulan Ini</CardTitle>
                  <Link to="/tutor/kpi">
                    <Button variant="ghost" size="sm">
                      Detail <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Kehadiran</span>
                      <span className="text-sm text-green-500">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Laporan Harian</span>
                      <span className="text-sm text-blue-500">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Respon Chat</span>
                      <span className="text-sm text-purple-500">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border lg:hidden z-50">
        <div className="flex items-center justify-around py-2">
          {tutorNav.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px]",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
