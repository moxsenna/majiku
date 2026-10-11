"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  Building2,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  HelpCircle,
  FileText,
  DollarSign,
  Activity,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import UserManagementTab from "@/components/vendor/UserManagementTab";
import DaycareManagementTab from "@/components/vendor/DaycareManagementTab";
import FinanceTab from "@/components/vendor/FinanceTab";
import PlatformSettingsTab from "@/components/vendor/PlatformSettingsTab";
import MonitoringTab from "@/components/vendor/MonitoringTab";
import NotificationsTab from "@/components/vendor/NotificationsTab";
import SecurityTab from "@/components/vendor/SecurityTab";
import HelpCenterTab from "@/components/vendor/HelpCenterTab";
import ReportsTab from "@/components/vendor/ReportsTab";

import { useQuery } from "@tanstack/react-query";
import {
  getVendorPlatformOverview,
  type VendorPlatformData,
} from "@/server/actions/vendorDashboard";

const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
  return `Rp ${(amount / 1000).toFixed(0)}K`;
};

interface VendorDashboardProps {
  initialData?: VendorPlatformData;
}

export default function VendorDashboard({ initialData }: VendorDashboardProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: platformData } = useQuery({
    queryKey: ["vendor-platform-overview"],
    queryFn: getVendorPlatformOverview,
    initialData,
  });

  const data = platformData || initialData;
  const isDemo = data?.isDemo ?? false;

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/vendor/login";
  };

  const displayName = user?.name || "Super Admin";
  const displayEmail = user?.email || "admin@majiku.web.id";

  const totalUsersCount = data?.totalUsers ?? 0;
  const totalDaycaresCount = data?.totalDaycares ?? 0;
  const activeDaycaresCount = data?.activeDaycaresCount ?? 0;
  const totalRevenueAmount = data?.totalRevenue ?? 0;

  // Hitung distribusi tipe tenant dari data overview secara riil
  const calculatedTypeDistribution = (() => {
    if (data?.typeDistribution && data.typeDistribution.length > 0) {
      const colors = [
        "hsl(var(--primary))",
        "hsl(var(--info))",
        "hsl(var(--chart-3))",
        "hsl(var(--success))",
      ];
      return data.typeDistribution
        .filter((t) => t.value > 0)
        .map((t, idx) => ({
          name: t.name,
          value: t.value,
          color: colors[idx % colors.length],
        }));
    }
    if (data?.daycares && data.daycares.length > 0) {
      const counts: Record<string, number> = {};
      for (const d of data.daycares) {
        counts[d.type] = (counts[d.type] || 0) + 1;
      }
      const colors = [
        "hsl(var(--primary))",
        "hsl(var(--info))",
        "hsl(var(--chart-3))",
        "hsl(var(--success))",
      ];
      return Object.entries(counts).map(([name, value], idx) => ({
        name,
        value,
        color: colors[idx % colors.length],
      }));
    }
    return [];
  })();

  // Hitung distribusi peranan pengguna dari data overview secara riil
  const roleDistributionData = [
    { role: "Super Admin", count: data?.roleDistribution?.superAdmin ?? 0, fill: "hsl(var(--destructive))" },
    { role: "Admin Lembaga", count: data?.roleDistribution?.adminDaycare ?? 0, fill: "hsl(var(--primary))" },
    { role: "Staf / Tutor", count: data?.roleDistribution?.staff ?? 0, fill: "hsl(var(--info))" },
    { role: "Wali / Parent", count: data?.roleDistribution?.parent ?? 0, fill: "hsl(var(--success))" },
  ];

  // Hitung distribusi paket langganan dari data daycares
  const calculatedSubscriptionDistribution = (() => {
    if (!data?.daycares || data.daycares.length === 0) return [];
    const counts: Record<string, number> = { Basic: 0, Pro: 0, Enterprise: 0 };
    for (const d of data.daycares) {
      const planKey = d.plan === "Enterprise" ? "Enterprise" : d.plan === "Basic" ? "Basic" : "Pro";
      counts[planKey] = (counts[planKey] || 0) + 1;
    }
    const total = Object.values(counts).reduce((s, c) => s + c, 0);
    return Object.entries(counts).map(([plan, count]) => {
      const revenue =
        plan === "Enterprise"
          ? count * 1500000
          : plan === "Pro"
          ? count * 599000
          : count * 299000;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { plan, count, revenue, percentage };
    });
  })();

  const stats = [
    {
      title: "Total Pengguna",
      value: totalUsersCount.toLocaleString("id-ID"),
      sub: "Super Admin, Pengelola, Staf, Wali Murid",
      icon: Users,
      color: "primary",
    },
    {
      title: "Lembaga Terdaftar",
      value: totalDaycaresCount.toLocaleString("id-ID"),
      sub: `Lembaga Aktif: ${activeDaycaresCount}`,
      icon: Building2,
      color: "info",
    },
    {
      title: "Volume Transaksi (Lunas)",
      value: formatCurrency(totalRevenueAmount),
      sub: isDemo ? "Data demonstrasi platform" : "Total volume terverifikasi",
      icon: DollarSign,
      color: "success",
    },
    {
      title: "Kesehatan Platform",
      value: "Normal",
      sub: "Cloudflare Edge Global",
      icon: Activity,
      color: "success",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg hidden sm:block">MAJIKU</span>
              </Link>
              <Badge variant="secondary" className="hidden sm:flex">
                Super Admin
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary">SA</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">{displayName}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-xs font-semibold">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground">{displayEmail}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Pengaturan
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Super Admin</h1>
          <p className="text-muted-foreground">Kelola seluruh platform MAJIKU dari satu tempat</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max h-auto gap-1 bg-muted/50 p-1 rounded-lg">
              {[
                { value: "overview", icon: BarChart3, label: "Ringkasan" },
                { value: "users", icon: Users, label: "Pengguna" },
                { value: "daycares", icon: Building2, label: "Daycare" },
                { value: "finance", icon: CreditCard, label: "Keuangan" },
                { value: "settings", icon: Settings, label: "Pengaturan" },
                { value: "monitoring", icon: Activity, label: "Monitoring" },
                { value: "notifications", icon: Bell, label: "Notifikasi" },
                { value: "security", icon: Shield, label: "Keamanan" },
                { value: "help", icon: HelpCircle, label: "Bantuan" },
                { value: "reports", icon: FileText, label: "Laporan" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 whitespace-nowrap"
                >
                  <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <Card key={i}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{s.title}</p>
                        <p className="text-xl sm:text-2xl font-bold mt-1">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${s.color}/10`}>
                        <s.icon className={`w-5 h-5 text-${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts: Pendapatan & Distribusi Lembaga */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Panel Pendapatan: Tidak menampilkan grafik palsu jika data time-series belum ada di action */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Pendapatan Platform</CardTitle>
                  <CardDescription>Ringkasan akumulasi transaksi langganan dan tagihan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] rounded-lg border border-dashed border-border flex flex-col items-center justify-center p-6 text-center bg-muted/20">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <CalendarClock className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base mb-1">Riwayat Tren Bulanan Segera Hadir</h3>
                    <p className="text-xs text-muted-foreground max-w-md mb-4">
                      Grafik time-series historis per bulan sedang dalam tahap pengembangan agregasi data.
                      Total pendapatan lunas tercatat saat ini adalah:
                    </p>
                    <div className="bg-card border border-border px-4 py-2 rounded-lg">
                      <span className="text-xl font-bold text-success">
                        {formatCurrency(totalRevenueAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Distribusi Lembaga Riil (Dihitung dari overview) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribusi Jenis Lembaga</CardTitle>
                  <CardDescription>Berdasarkan data lembaga terdaftar di platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {calculatedTypeDistribution.length > 0 ? (
                    <>
                      <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={calculatedTypeDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {calculatedTypeDistribution.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {calculatedTypeDistribution.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-xs truncate">
                              {item.name}: {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                      Belum ada data lembaga terdaftar
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Distribusi Pengguna Riil & Paket Berlangganan */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribusi Pengguna Riil</CardTitle>
                  <CardDescription>Jumlah akun per peranan dalam sistem platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roleDistributionData} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="role" type="category" className="text-xs" width={90} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Total Akun">
                          {roleDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribusi Paket Mitra</CardTitle>
                  <CardDescription>Proporsi paket langganan lembaga aktif</CardDescription>
                </CardHeader>
                <CardContent>
                  {calculatedSubscriptionDistribution.length > 0 ? (
                    <div className="space-y-4">
                      {calculatedSubscriptionDistribution.map((plan, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  plan.plan === "Enterprise"
                                    ? "default"
                                    : plan.plan === "Pro"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {plan.plan}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {plan.count} lembaga ({plan.percentage}%)
                              </span>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(plan.revenue)}</span>
                          </div>
                          <Progress value={plan.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                      Belum ada paket aktif
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagementTab users={data?.users} />
          </TabsContent>
          <TabsContent value="daycares">
            <DaycareManagementTab daycares={data?.daycares} />
          </TabsContent>
          <TabsContent value="finance">
            <FinanceTab />
          </TabsContent>
          <TabsContent value="settings">
            <PlatformSettingsTab />
          </TabsContent>
          <TabsContent value="monitoring">
            <MonitoringTab />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
          <TabsContent value="help">
            <HelpCenterTab />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
