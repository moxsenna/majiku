import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Building2, Search, Plus, Eye, Edit, Trash2, Users, DollarSign, TrendingUp } from "lucide-react";

const demoDaycares = [
  { id: 1, name: "TK Ceria Mandiri", type: "TK/PAUD", plan: "Pro", students: 120, staff: 12, revenue: 8500000, status: "active", joinDate: "Jan 2024" },
  { id: 2, name: "Bimbel Prestasi Gemilang", type: "Bimbel", plan: "Pro", students: 85, staff: 8, revenue: 6200000, status: "active", joinDate: "Mar 2024" },
  { id: 3, name: "Daycare Happy Kids", type: "Daycare", plan: "Enterprise", students: 200, staff: 25, revenue: 15000000, status: "active", joinDate: "Nov 2023" },
  { id: 4, name: "PAUD Tunas Harapan", type: "TK/PAUD", plan: "Basic", students: 35, staff: 4, revenue: 2100000, status: "trial", joinDate: "Des 2024" },
  { id: 5, name: "Kursus Bahasa ABC", type: "Kursus", plan: "Pro", students: 60, staff: 6, revenue: 4500000, status: "active", joinDate: "Jun 2024" },
  { id: 6, name: "Daycare Sunshine", type: "Daycare", plan: "Basic", students: 45, staff: 5, revenue: 3200000, status: "inactive", joinDate: "Feb 2024" },
];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
  return `Rp ${(amount / 1000).toFixed(0)}K`;
};

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  trial: "bg-warning/10 text-warning-foreground",
  inactive: "bg-muted text-muted-foreground",
};

import type { DaycareItem } from "@/server/actions/vendorDashboard";

interface DaycareManagementTabProps {
  daycares?: DaycareItem[];
}

export default function DaycareManagementTab({ daycares }: DaycareManagementTabProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const list = daycares && daycares.length > 0 ? daycares : demoDaycares;

  const filtered = list.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || d.type === typeFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalRevenue = list.reduce((s, d) => s + d.revenue, 0);
  const totalStudents = list.reduce((s, d) => s + d.students, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Daycare</p><p className="text-xl font-bold">{list.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-success" /></div><div><p className="text-xs text-muted-foreground">Total Pendapatan</p><p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center"><Users className="w-5 h-5 text-info" /></div><div><p className="text-xs text-muted-foreground">Total Siswa</p><p className="text-xl font-bold">{totalStudents}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-warning" /></div><div><p className="text-xs text-muted-foreground">Uji Coba</p><p className="text-xl font-bold">{list.filter(d => d.status === "trial").length}</p></div></div></CardContent></Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Daftar Daycare</CardTitle>
              <CardDescription>Semua daycare yang terdaftar di platform</CardDescription>
            </div>
            <Button size="sm" className="gap-2" onClick={() => toast({ title: "Tambah Daycare", description: "Membuka formulir pendaftaran daycare mitra baru..." })}>
              <Plus className="w-4 h-4" />Tambah Daycare
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari daycare..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Semua Jenis" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="Daycare">Daycare</SelectItem>
                <SelectItem value="TK/PAUD">TK/PAUD</SelectItem>
                <SelectItem value="Bimbel">Bimbel</SelectItem>
                <SelectItem value="Kursus">Kursus</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Semua Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="trial">Uji Coba</SelectItem>
                <SelectItem value="inactive">Non-aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filtered.map(dc => (
              <div key={dc.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary">{dc.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{dc.name}</p>
                    <p className="text-xs text-muted-foreground">{dc.type} • {dc.students} siswa • {dc.staff} staf • Sejak {dc.joinDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium">{formatCurrency(dc.revenue)}/bln</p>
                    <Badge variant="secondary" className="text-xs">{dc.plan}</Badge>
                  </div>
                  <Badge className={`${statusColors[dc.status]} text-xs`} variant="secondary">
                    {dc.status === "active" ? "Aktif" : dc.status === "trial" ? "Uji Coba" : "Non-aktif"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: dc.name, description: `Membuka detail daycare ${dc.name}...` })}><Eye className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: "Edit Daycare", description: `Membuka editor konfigurasi untuk ${dc.name}...` })}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => toast({ title: "Nonaktifkan Daycare", description: `Status daycare ${dc.name} diubah.`, variant: "destructive" })}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
