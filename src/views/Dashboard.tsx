"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DailyReportFeed } from "@/components/dashboard/DailyReportFeed";
import { AttendanceWidget } from "@/components/dashboard/AttendanceWidget";
import { BirthdayWidget } from "@/components/dashboard/BirthdayWidget";
import { BillingWidget } from "@/components/dashboard/BillingWidget";
import { TutorListWidget } from "@/components/dashboard/TutorListWidget";
import { ClassListWidget } from "@/components/dashboard/ClassListWidget";
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
import { AdminOnboardingCard } from "@/components/dashboard/AdminOnboardingCard";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  ClipboardCheck,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import {
  getAdminDashboardOverview,
  type AdminDashboardOverviewData,
} from "@/server/actions/adminDashboard";
import { getDemoClassRevenues } from "@/lib/demoData";

interface DashboardProps {
  initialData?: AdminDashboardOverviewData;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatShortCurrency = (amount: number) => {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}Rb`;
  return `Rp ${amount}`;
};

const classColors = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B"];

export default function Dashboard({ initialData }: DashboardProps) {
  const { toast } = useToast();
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);

  // Fetch or use initial data
  const { data: dashboardData } = useQuery({
    queryKey: ["admin-dashboard-overview"],
    queryFn: getAdminDashboardOverview,
    initialData,
  });

  const data = dashboardData || initialData;
  const isDemo = data?.isDemo ?? true;

  const totalStudents = data?.totalStudents || 0;
  const totalCapacity = data?.totalCapacity || 0;
  const todayAttendancePercent = data?.todayAttendancePercent || 0;
  const todayPresentCount = data?.todayPresentCount || 0;
  const monthlyRevenue = data?.monthlyRevenue || 0;
  const unpaidInvoicesSum = data?.unpaidInvoicesSum || 0;
  const unreadMessagesCount = data?.unreadMessagesCount || 0;

  const statsData = [
    {
      title: "Total Siswa",
      value: totalStudents,
      description: totalCapacity > 0 ? `dari ${totalCapacity} kapasitas` : "Kapasitas belum diatur",
      icon: Users,
      trend: isDemo ? { value: 5, isPositive: true } : undefined,
      variant: "primary" as const,
      onClick: () => setStudentModalOpen(true),
    },
    {
      title: "Kehadiran Hari Ini",
      value: `${todayAttendancePercent}%`,
      description: `${todayPresentCount} siswa hadir`,
      icon: ClipboardCheck,
      trend: isDemo ? { value: 2, isPositive: true } : undefined,
      variant: "success" as const,
      onClick: () => setAttendanceModalOpen(true),
    },
    {
      title: "Pendapatan Bulan Ini",
      value: formatShortCurrency(monthlyRevenue),
      description:
        unpaidInvoicesSum > 0
          ? `Belum bayar: ${formatShortCurrency(unpaidInvoicesSum)}`
          : "Semua tagihan lunas",
      icon: CreditCard,
      trend: isDemo ? { value: 12, isPositive: true } : undefined,
      variant: "info" as const,
      onClick: () => setRevenueModalOpen(true),
    },
    {
      title: "Pesan Belum Dibaca",
      value: unreadMessagesCount,
      description: isDemo ? "8 dari orang tua" : "Pesan masuk",
      icon: MessageSquare,
      variant: "warning" as const,
      onClick: () => setMessagesModalOpen(true),
    },
  ];

  // Map Classes for widget
  const classesForWidget = (data?.classes || []).map((c, idx) => ({
    id: c.id,
    name: c.name,
    tutorName: c.schedule || "Jadwal reguler",
    studentsCount: c.studentsCount,
    capacity: c.capacity || 20,
    color: classColors[idx % classColors.length],
  }));

  // Map Tutors for widget
  const tutorsForWidget = (data?.tutors || []).map((t) => ({
    id: t.id,
    name: t.name,
    className: t.className || "Tutor",
    kpiScore: 90,
    studentsCount: 0,
    status: "active" as const,
  }));

  // Map Attendance for widget
  const attendanceForWidget = (data?.todayAttendanceEntries || []).map((a) => ({
    id: a.id,
    studentName: a.studentName,
    className: a.className,
    checkInTime: a.checkInTime || undefined,
    status: a.status,
  }));

  const showOnboarding = !isDemo && totalStudents === 0 && (data?.activeClassesCount || 0) === 0;

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={
        isDemo
          ? "Mode Demo: Menampilkan simulasi data operasional daycare."
          : "Selamat datang kembali! Berikut ringkasan operasional riil daycare Anda."
      }
    >
      {/* Onboarding Banner untuk Akun Daycare Baru Tanpa Data */}
      {showOnboarding && <AdminOnboardingCard />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {statsData.map((stat, index) => (
          <div key={index} onClick={stat.onClick} className="cursor-pointer">
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <DailyReportFeed reports={data?.recentDailyReports || []} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TutorListWidget tutors={tutorsForWidget} />
            <ClassListWidget classes={classesForWidget} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-5">
          {(isDemo || (data?.activeTutorsCount ?? 0) > 0) && (
            <TutorAttendanceWidget isDemo={isDemo} />
          )}
          <AttendanceWidget
            entries={attendanceForWidget}
            totalStudents={totalStudents}
            presentCount={todayPresentCount}
          />
          <WaitingListWidget />
          <MessagesWidget isOpen={messagesModalOpen} onOpenChange={setMessagesModalOpen} />
          {isDemo && (
            <>
              <TargetProgressWidget
                totalRevenue={234500000}
                targetRevenue={250000000}
              />
              <TopRevenueWidget classRevenues={getDemoClassRevenues()} />
              <QuotaStatsWidget classQuotas={getDemoClassRevenues()} />
            </>
          )}
          <BirthdayWidget birthdays={data?.birthdays || []} />
          <BillingWidget
            items={data?.billingItems || []}
            totalRevenue={monthlyRevenue}
            pendingAmount={unpaidInvoicesSum}
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
