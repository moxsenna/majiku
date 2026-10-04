import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Users, TrendingUp, BarChart3, Clock, Zap, Server, Database } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const featureUsage = [
  { feature: "Kehadiran", usage: 95 },
  { feature: "Billing", usage: 88 },
  { feature: "Laporan", usage: 76 },
  { feature: "Chat", usage: 72 },
  { feature: "Galeri", usage: 65 },
  { feature: "Jadwal", usage: 58 },
];

const dailyActive = [
  { day: "Sen", users: 420 },
  { day: "Sel", users: 445 },
  { day: "Rab", users: 390 },
  { day: "Kam", users: 460 },
  { day: "Jum", users: 380 },
  { day: "Sab", users: 220 },
  { day: "Min", users: 150 },
];

const performanceMetrics = [
  { label: "Uptime", value: "99.9%", icon: Server, color: "text-success" },
  { label: "Avg Response", value: "120ms", icon: Zap, color: "text-info" },
  { label: "DB Size", value: "2.4 GB", icon: Database, color: "text-warning" },
  { label: "Active Sessions", value: "342", icon: Activity, color: "text-primary" },
];

const churnData = [
  { month: "Jan", new: 25, churned: 5 },
  { month: "Feb", new: 30, churned: 8 },
  { month: "Mar", new: 22, churned: 3 },
  { month: "Apr", new: 35, churned: 6 },
  { month: "May", new: 28, churned: 4 },
  { month: "Jun", new: 40, churned: 7 },
];

export default function MonitoringTab() {
  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((m, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-xl font-bold">{m.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pengguna Aktif Harian</CardTitle>
            <CardDescription>Jumlah pengguna yang login per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyActive}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* New vs Churned */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendor Baru vs Churn</CardTitle>
            <CardDescription>Perbandingan akuisisi dan kehilangan vendor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={churnData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="new" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Baru" />
                  <Bar dataKey="churned" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Churn" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Penggunaan Fitur</CardTitle>
          <CardDescription>Persentase vendor yang menggunakan setiap fitur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureUsage.map((f, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{f.feature}</span>
                  <span className="text-sm font-medium">{f.usage}%</span>
                </div>
                <Progress value={f.usage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
