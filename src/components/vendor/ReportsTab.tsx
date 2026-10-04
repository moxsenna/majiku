import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Search, BarChart3, Users, Building2, DollarSign, Filter, Calendar } from "lucide-react";

const reports = [
  { id: 1, name: "Laporan Kinerja Vendor - Januari 2025", type: "performance", date: "1 Jan 2025", size: "2.4 MB" },
  { id: 2, name: "Laporan Keuangan - Desember 2024", type: "financial", date: "31 Des 2024", size: "1.8 MB" },
  { id: 3, name: "Laporan Pengguna Aktif - Januari 2025", type: "users", date: "15 Jan 2025", size: "1.2 MB" },
  { id: 4, name: "Laporan Churn Analysis - Q4 2024", type: "churn", date: "31 Des 2024", size: "3.1 MB" },
  { id: 5, name: "Laporan Vendor Baru - Januari 2025", type: "vendors", date: "15 Jan 2025", size: "0.8 MB" },
  { id: 6, name: "Laporan Revenue per Vendor - Desember 2024", type: "financial", date: "31 Des 2024", size: "2.0 MB" },
];

const daycarePerformance = [
  { name: "Daycare Happy Kids", students: 200, attendance: 95, revenue: 15000000, rating: 4.8 },
  { name: "TK Ceria Mandiri", students: 120, attendance: 92, revenue: 8500000, rating: 4.6 },
  { name: "Bimbel Prestasi", students: 85, attendance: 88, revenue: 6200000, rating: 4.5 },
  { name: "Kursus Bahasa ABC", students: 60, attendance: 90, revenue: 4500000, rating: 4.3 },
  { name: "PAUD Tunas Harapan", students: 35, attendance: 85, revenue: 2100000, rating: 4.1 },
];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

const typeIcons: Record<string, any> = {
  performance: BarChart3,
  financial: DollarSign,
  users: Users,
  churn: BarChart3,
  vendors: Building2,
};

export default function ReportsTab() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = reports.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Quick Export */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Export Pengguna", icon: Users, format: "CSV" },
          { label: "Export Keuangan", icon: DollarSign, format: "Excel" },
          { label: "Export Vendor", icon: Building2, format: "CSV" },
          { label: "Export Semua", icon: Download, format: "ZIP" },
        ].map((item, i) => (
          <Card key={i} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toast({ title: "Export dimulai", description: `Mengexport data ${item.label} dalam format ${item.format}` })}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.format}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daycare Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kinerja Daycare</CardTitle>
          <CardDescription>Perbandingan performa semua daycare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Daycare</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Siswa</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Kehadiran</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Pendapatan</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Rating</th>
                </tr>
              </thead>
              <tbody>
                {daycarePerformance.map((dc, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-3 font-medium">{dc.name}</td>
                    <td className="p-3 text-right">{dc.students}</td>
                    <td className="p-3 text-right">{dc.attendance}%</td>
                    <td className="p-3 text-right">{formatCurrency(dc.revenue)}</td>
                    <td className="p-3 text-right"><Badge variant="secondary">{dc.rating} ⭐</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Report List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Arsip Laporan</CardTitle>
              <CardDescription>Semua laporan yang pernah digenerate</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari laporan..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Semua Tipe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="performance">Kinerja</SelectItem>
                <SelectItem value="financial">Keuangan</SelectItem>
                <SelectItem value="users">Pengguna</SelectItem>
                <SelectItem value="vendors">Vendor</SelectItem>
                <SelectItem value="churn">Churn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {filtered.map(r => {
              const Icon = typeIcons[r.type] || FileText;
              return (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.date} • {r.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => toast({ title: "Downloading...", description: r.name })}>
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
