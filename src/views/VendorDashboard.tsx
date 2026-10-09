import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, Users, Building2, CreditCard, TrendingUp, TrendingDown,
  Bell, Settings, LogOut, ChevronDown, ArrowUpRight, AlertTriangle,
  CheckCircle2, Clock, DollarSign, Activity, Sparkles,
  Shield, HelpCircle, FileText, Eye
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

import UserManagementTab from "@/components/vendor/UserManagementTab";
import DaycareManagementTab from "@/components/vendor/DaycareManagementTab";
import FinanceTab from "@/components/vendor/FinanceTab";
import PlatformSettingsTab from "@/components/vendor/PlatformSettingsTab";
import MonitoringTab from "@/components/vendor/MonitoringTab";
import NotificationsTab from "@/components/vendor/NotificationsTab";
import SecurityTab from "@/components/vendor/SecurityTab";
import HelpCenterTab from "@/components/vendor/HelpCenterTab";
import ReportsTab from "@/components/vendor/ReportsTab";
import FeedbackWidget from "@/components/vendor/FeedbackWidget";

import { useQuery } from "@tanstack/react-query";
import {
  getVendorPlatformOverview,
  type VendorPlatformData,
} from "@/server/actions/vendorDashboard";

// Demo data
const revenueData = [
  { month: "Jan", revenue: 45000000 }, { month: "Feb", revenue: 52000000 },
  { month: "Mar", revenue: 48000000 }, { month: "Apr", revenue: 61000000 },
  { month: "May", revenue: 55000000 }, { month: "Jun", revenue: 67000000 },
  { month: "Jul", revenue: 72000000 }, { month: "Aug", revenue: 69000000 },
  { month: "Sep", revenue: 78000000 }, { month: "Oct", revenue: 82000000 },
  { month: "Nov", revenue: 89000000 }, { month: "Des", revenue: 95000000 },
];

const vendorTypeData = [
  { name: "Daycare", value: 245, color: "hsl(var(--primary))" },
  { name: "TK/PAUD", value: 180, color: "hsl(var(--info))" },
  { name: "Bimbel", value: 120, color: "hsl(var(--chart-3))" },
  { name: "Kursus", value: 38, color: "hsl(var(--success))" },
];

const userActivityData = [
  { day: "Sen", admin: 85, staff: 220, parent: 450 },
  { day: "Sel", admin: 90, staff: 235, parent: 480 },
  { day: "Rab", admin: 78, staff: 210, parent: 420 },
  { day: "Kam", admin: 95, staff: 240, parent: 490 },
  { day: "Jum", admin: 70, staff: 200, parent: 380 },
  { day: "Sab", admin: 40, staff: 120, parent: 250 },
  { day: "Min", admin: 25, staff: 80, parent: 180 },
];

const expiringSubscriptions = [
  { id: 1, name: "TK Pelita Hati", daysLeft: 3, plan: "Pro", revenue: 599000 },
  { id: 2, name: "Daycare Sunshine", daysLeft: 5, plan: "Basic", revenue: 299000 },
  { id: 3, name: "Bimbel Cerdas Bangsa", daysLeft: 7, plan: "Pro", revenue: 599000 },
];

const subscriptionData = [
  { plan: "Basic", count: 210, revenue: 62790000 },
  { plan: "Pro", count: 285, revenue: 170715000 },
  { plan: "Enterprise", count: 88, revenue: 132000000 },
];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
  return `Rp ${(amount / 1000).toFixed(0)}K`;
};

interface VendorDashboardProps {
  initialData?: VendorPlatformData;
}

export default function VendorDashboard({ initialData }: VendorDashboardProps) {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: platformData } = useQuery({
    queryKey: ["vendor-platform-overview"],
    queryFn: getVendorPlatformOverview,
    initialData,
  });

  const data = platformData || initialData;
  const isDemo = data?.isDemo ?? true;

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/vendor/login";
  };

  const displayName = user?.name || "Super Admin";
  const displayEmail = user?.email || "admin@majiku.web.id";

  const totalUsersCount = data ? data.totalUsers : 1247;
  const totalDaycaresCount = data ? data.totalDaycares : 583;
  const activeDaycaresCount = data ? data.activeDaycaresCount : 548;
  const totalRevenueAmount = data ? data.totalRevenue : 365505000;

  const stats = [
    {
      title: "Total Pengguna",
      value: totalUsersCount.toLocaleString("id-ID"),
      sub: "Admin, Staf, Orang Tua",
      change: isDemo ? "+8%" : "",
      isPositive: true,
      icon: Users,
      color: "primary",
    },
    {
      title: "Daycare Terdaftar",
      value: totalDaycaresCount.toLocaleString("id-ID"),
      sub: `Aktif: ${activeDaycaresCount}`,
      change: isDemo ? "+12%" : "",
      isPositive: true,
      icon: Building2,
      color: "info",
    },
    {
      title: "MRR / Revenue",
      value: formatCurrency(totalRevenueAmount),
      sub: isDemo ? "Dari subscription vendor" : "Total volume transaksi",
      change: isDemo ? "+15%" : "",
      isPositive: true,
      icon: DollarSign,
      color: "success",
    },
    {
      title: "Status Sistem",
      value: "Normal",
      sub: "Workers Edge 99.9%",
      change: "",
      isPositive: true,
      icon: Activity,
      color: "success",
    },
  ];

  const handleSendReminder = (vendorName: string) => {
    toast({ title: "Reminder Terkirim", description: `Email reminder telah dikirim ke ${vendorName}` });
  };

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
              <Badge variant="secondary" className="hidden sm:flex">Super Admin</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">7</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary/10 text-primary">SA</AvatarFallback></Avatar>
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
                  <DropdownMenuItem onClick={() => setActiveTab("settings")}><Settings className="w-4 h-4 mr-2" />Pengaturan</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Keluar</DropdownMenuItem>
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
              ].map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-xs px-3 py-2 whitespace-nowrap">
                  <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Alert */}
            {expiringSubscriptions.length > 0 && (
              <Card className="border-warning/50 bg-warning/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      Langganan Akan Berakhir
                    </CardTitle>
                    <Badge variant="outline" className="border-warning text-warning-foreground">{expiringSubscriptions.length} vendor</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expiringSubscriptions.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${v.daysLeft <= 3 ? 'bg-destructive/10' : 'bg-warning/10'}`}>
                            <Clock className={`w-5 h-5 ${v.daysLeft <= 3 ? 'text-destructive' : 'text-warning'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{v.name}</p>
                            <p className="text-xs text-muted-foreground">{v.plan} • Berakhir dalam {v.daysLeft} hari</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleSendReminder(v.name)}>Kirim Reminder</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                        {s.change && (
                          <div className={`flex items-center gap-1 mt-1 text-xs ${s.isPositive ? 'text-success' : 'text-destructive'}`}>
                            {s.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {s.change} dari bulan lalu
                          </div>
                        )}
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${s.color}/10`}>
                        <s.icon className={`w-5 h-5 text-${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Pendapatan Bulanan</CardTitle>
                  <CardDescription>Revenue dari subscription vendor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis tickFormatter={v => formatCurrency(v)} className="text-xs" />
                        <Tooltip formatter={(v: number) => [formatCurrency(v), "Revenue"]} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribusi Vendor</CardTitle>
                  <CardDescription>Berdasarkan jenis lembaga</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={vendorTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                          {vendorTypeData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {vendorTypeData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Chart + Subscription Plans */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aktivitas Pengguna</CardTitle>
                  <CardDescription>Jumlah login harian per jenis pengguna</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userActivityData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="admin" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} name="Admin" stackId="a" />
                        <Bar dataKey="staff" fill="hsl(var(--info))" radius={[2, 2, 0, 0]} name="Staf" stackId="a" />
                        <Bar dataKey="parent" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} name="Orang Tua" stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribusi Paket</CardTitle>
                  <CardDescription>Vendor berdasarkan subscription plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptionData.map((plan, i) => {
                      const totalVendors = subscriptionData.reduce((sum, p) => sum + p.count, 0);
                      const percentage = Math.round((plan.count / totalVendors) * 100);
                      return (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={plan.plan === "Enterprise" ? "default" : plan.plan === "Pro" ? "default" : "secondary"}>{plan.plan}</Badge>
                              <span className="text-sm text-muted-foreground">{plan.count} vendor ({percentage}%)</span>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(plan.revenue)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users"><UserManagementTab users={data?.users} /></TabsContent>
          <TabsContent value="daycares"><DaycareManagementTab daycares={data?.daycares} /></TabsContent>
          <TabsContent value="finance"><FinanceTab /></TabsContent>
          <TabsContent value="settings"><PlatformSettingsTab /></TabsContent>
          <TabsContent value="monitoring"><MonitoringTab /></TabsContent>
          <TabsContent value="notifications"><NotificationsTab /></TabsContent>
          <TabsContent value="security"><SecurityTab /></TabsContent>
          <TabsContent value="help"><HelpCenterTab /></TabsContent>
          <TabsContent value="reports"><ReportsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
