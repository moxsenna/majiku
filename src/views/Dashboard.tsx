import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DailyReportFeed } from "@/components/dashboard/DailyReportFeed";
import { AttendanceWidget } from "@/components/dashboard/AttendanceWidget";
import { BirthdayWidget } from "@/components/dashboard/BirthdayWidget";
import { BillingWidget } from "@/components/dashboard/BillingWidget";
import { TutorListWidget } from "@/components/dashboard/TutorListWidget";
import { ClassListWidget } from "@/components/dashboard/ClassListWidget";
import { PendingReportsWidget } from "@/components/dashboard/PendingReportsWidget";
import { TargetProgressWidget } from "@/components/dashboard/TargetProgressWidget";
import { TopRevenueWidget } from "@/components/dashboard/TopRevenueWidget";
import { QuotaStatsWidget } from "@/components/dashboard/QuotaStatsWidget";
import { WaitingListWidget } from "@/components/dashboard/WaitingListWidget";
import { MessagesWidget } from "@/components/dashboard/MessagesWidget";
import { TutorAttendanceWidget } from "@/components/dashboard/TutorAttendanceWidget";
import { AttendanceDetailModal } from "@/components/dashboard/AttendanceDetailModal";
import { RevenueDetailModal } from "@/components/dashboard/RevenueDetailModal";
import { StudentDetailModal } from "@/components/dashboard/StudentDetailModal";
import { AdminBottomNav } from "@/components/dashboard/AdminBottomNav";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  ClipboardCheck,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import {
  demoDailyReports,
  demoAttendanceEntries,
  demoBirthdays,
  demoBillingItems,
  demoPendingReports,
  getDemoClassRevenues,
  getDemoTutorsForWidget,
  getDemoClassesForWidget,
} from "@/lib/demoData";

const classRevenues = getDemoClassRevenues();
const tutorsData = getDemoTutorsForWidget();
const classesData = getDemoClassesForWidget();

export default function Dashboard() {
  const { toast } = useToast();
  const [reports, setReports] = useState(demoPendingReports);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);

  const handleApproveReport = (id: string) => {
    const report = reports.find(r => r.id === id);
    setReports(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Laporan Disetujui ✓",
      description: `Laporan ${report?.studentName} telah dipublish ke parent.`,
    });
  };

  const handleRejectReport = (id: string) => {
    const report = reports.find(r => r.id === id);
    setReports(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Laporan Dikembalikan",
      description: `Laporan ${report?.studentName} dikembalikan ke tutor untuk revisi.`,
      variant: "destructive",
    });
  };

  const statsData = [
    {
      title: "Total Siswa",
      value: 156,
      description: "dari 180 kapasitas",
      icon: Users,
      trend: { value: 5, isPositive: true },
      variant: "primary" as const,
      onClick: () => setStudentModalOpen(true),
    },
    {
      title: "Kehadiran Hari Ini",
      value: "94%",
      description: "147 siswa hadir",
      icon: ClipboardCheck,
      trend: { value: 2, isPositive: true },
      variant: "success" as const,
      onClick: () => setAttendanceModalOpen(true),
    },
    {
      title: "Pendapatan Bulan Ini",
      value: "Rp 234M",
      description: "dari target Rp 250M",
      icon: CreditCard,
      trend: { value: 12, isPositive: true },
      variant: "info" as const,
      onClick: () => setRevenueModalOpen(true),
    },
    {
      title: "Pesan Belum Dibaca",
      value: 23,
      description: "8 dari orang tua",
      icon: MessageSquare,
      variant: "warning" as const,
      onClick: () => setMessagesModalOpen(true),
    },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Selamat datang kembali! Berikut ringkasan hari ini."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {statsData.map((stat, index) => (
          <div key={index} onClick={stat.onClick} className={stat.onClick ? "cursor-pointer" : ""}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <PendingReportsWidget 
            reports={reports}
            onApprove={handleApproveReport}
            onReject={handleRejectReport}
          />
          <DailyReportFeed reports={demoDailyReports} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TutorListWidget tutors={tutorsData} />
            <ClassListWidget classes={classesData} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-5">
          <TutorAttendanceWidget />
          <AttendanceWidget
            entries={demoAttendanceEntries}
            totalStudents={156}
            presentCount={147}
          />
          <WaitingListWidget />
          <MessagesWidget isOpen={messagesModalOpen} onOpenChange={setMessagesModalOpen} />
          <TargetProgressWidget 
            totalRevenue={234500000}
            targetRevenue={250000000}
          />
          <TopRevenueWidget classRevenues={classRevenues} />
          <QuotaStatsWidget classQuotas={classRevenues} />
          <BirthdayWidget birthdays={demoBirthdays} />
          <BillingWidget
            items={demoBillingItems}
            totalRevenue={187500000}
            pendingAmount={45500000}
          />
        </div>
      </div>

      {/* Modals */}
      <AttendanceDetailModal open={attendanceModalOpen} onOpenChange={setAttendanceModalOpen} />
      <RevenueDetailModal open={revenueModalOpen} onOpenChange={setRevenueModalOpen} />
      <StudentDetailModal open={studentModalOpen} onOpenChange={setStudentModalOpen} />
      
      {/* Bottom Navigation for Mobile */}
      <AdminBottomNav />
      
      {/* Add padding at bottom for mobile nav */}
      <div className="h-20 lg:hidden" />
    </DashboardLayout>
  );
}
