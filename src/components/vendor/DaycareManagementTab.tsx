"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Search,
  ExternalLink,
  Users,
  DollarSign,
  TrendingUp,
  Power,
  PowerOff,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import {
  setTenantActive,
  toggleTenantVerified,
  listVendorTenants,
  type VendorTenantRow,
} from "@/server/actions/vendorActions";
import type { DaycareItem } from "@/server/actions/vendorDashboard";

const demoDaycares = [
  { id: "demo-1", slug: "tk-ceria-mandiri", name: "TK Ceria Mandiri", type: "TK/PAUD", plan: "Pro", students: 120, staff: 12, revenue: 8500000, status: "active" as const, joinDate: "Jan 2024", isVerified: true },
  { id: "demo-2", slug: "bimbel-prestasi-gemilang", name: "Bimbel Prestasi Gemilang", type: "Bimbel", plan: "Pro", students: 85, staff: 8, revenue: 6200000, status: "active" as const, joinDate: "Mar 2024", isVerified: true },
  { id: "demo-3", slug: "daycare-happy-kids", name: "Daycare Happy Kids", type: "Daycare", plan: "Enterprise", students: 200, staff: 25, revenue: 15000000, status: "active" as const, joinDate: "Nov 2023", isVerified: false },
  { id: "demo-4", slug: "paud-tunas-harapan", name: "PAUD Tunas Harapan", type: "TK/PAUD", plan: "Basic", students: 35, staff: 4, revenue: 2100000, status: "trial" as const, joinDate: "Des 2024", isVerified: false },
  { id: "demo-5", slug: "kursus-bahasa-abc", name: "Kursus Bahasa ABC", type: "Kursus", plan: "Pro", students: 60, staff: 6, revenue: 4500000, status: "active" as const, joinDate: "Jun 2024", isVerified: false },
  { id: "demo-6", slug: "daycare-sunshine", name: "Daycare Sunshine", type: "Daycare", plan: "Basic", students: 45, staff: 5, revenue: 3200000, status: "inactive" as const, joinDate: "Feb 2024", isVerified: false },
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

interface DaycareManagementTabProps {
  daycares?: DaycareItem[];
}

interface CombinedDaycare {
  id: string;
  slug: string;
  name: string;
  type: string;
  plan: string;
  students: number;
  staff: number;
  revenue: number;
  status: "active" | "trial" | "inactive";
  isActive: boolean;
  isVerified: boolean;
  joinDate: string;
}

export default function DaycareManagementTab({ daycares }: DaycareManagementTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data: realTenants } = useQuery<VendorTenantRow[]>({
    queryKey: ["vendor-tenants-list"],
    queryFn: () => listVendorTenants(),
    staleTime: 10_000,
  });

  // Gabungkan data realTenants dengan overview daycares
  const list: CombinedDaycare[] = (() => {
    if (realTenants && realTenants.length > 0) {
      return realTenants.map((rt) => {
        const matched = daycares?.find((d) => String(d.id) === rt.id);
        const typeLabel = rt.type === "daycare" ? "Daycare" : rt.type === "preschool" ? "TK/PAUD" : "Bimbel";
        return {
          id: rt.id,
          slug: rt.slug,
          name: rt.name,
          type: typeLabel,
          plan: matched?.plan ?? "Pro",
          students: matched?.students ?? 0,
          staff: matched?.staff ?? 0,
          revenue: matched?.revenue ?? 0,
          status: rt.isActive ? ("active" as const) : ("inactive" as const),
          isActive: rt.isActive,
          isVerified: rt.isVerified,
          joinDate: rt.createdAt
            ? new Date(rt.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })
            : "2024",
        };
      });
    }

    if (daycares && daycares.length > 0) {
      return daycares.map((d) => ({
        id: String(d.id),
        slug: String(d.id),
        name: d.name,
        type: d.type,
        plan: d.plan,
        students: d.students,
        staff: d.staff,
        revenue: d.revenue,
        status: d.status,
        isActive: d.status === "active",
        isVerified: false,
        joinDate: d.joinDate,
      }));
    }

    return demoDaycares.map((d) => ({
      ...d,
      isActive: d.status === "active",
    }));
  })();

  const filtered = list.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || d.type === typeFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalRevenue = list.reduce((s, d) => s + d.revenue, 0);
  const totalStudents = list.reduce((s, d) => s + d.students, 0);

  const handleToggleActive = async (tenantId: string, currentActive: boolean) => {
    const nextActive = !currentActive;
    setLoadingId(tenantId);
    try {
      await setTenantActive(tenantId, nextActive);
      await queryClient.invalidateQueries({ queryKey: ["vendor-tenants-list"] });
      await queryClient.invalidateQueries({ queryKey: ["vendor-platform-overview"] });
      toast({
        title: "Status Diperbarui",
        description: `Lembaga berhasil ${nextActive ? "diaktifkan" : "dinonaktifkan"}.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengubah status lembaga";
      toast({
        title: "Gagal Mengubah Status",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleVerified = async (tenantId: string, currentVerified: boolean) => {
    const nextVerified = !currentVerified;
    setLoadingId(tenantId);
    try {
      await toggleTenantVerified(tenantId, nextVerified);
      await queryClient.invalidateQueries({ queryKey: ["vendor-tenants-list"] });
      toast({
        title: "Verifikasi Diperbarui",
        description: `Lembaga berhasil ${nextVerified ? "diverifikasi" : "dicabut verifikasinya"}.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengubah status verifikasi";
      toast({
        title: "Gagal Mengubah Verifikasi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Lembaga</p><p className="text-xl font-bold">{list.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-success" /></div><div><p className="text-xs text-muted-foreground">Total Pendapatan</p><p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center"><Users className="w-5 h-5 text-info" /></div><div><p className="text-xs text-muted-foreground">Total Siswa</p><p className="text-xl font-bold">{totalStudents}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Lembaga Terverifikasi</p><p className="text-xl font-bold">{list.filter((d) => d.isVerified).length}</p></div></div></CardContent></Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Daftar Daycare & Lembaga</CardTitle>
              <CardDescription>Kelola status aktif, verifikasi resmi, dan tautan direktori publik lembaga</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari lembaga..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
            {filtered.map((dc) => {
              const isLoading = loadingId === dc.id;
              return (
                <div key={dc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary">{dc.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{dc.name}</p>
                        {dc.isVerified && (
                          <Badge variant="outline" className="border-blue-500/40 text-blue-600 bg-blue-50 text-[10px] py-0 h-4">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{dc.type} • {dc.students} siswa • {dc.staff} staf • Sejak {dc.joinDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                    <div className="text-right hidden md:block mr-2">
                      <p className="text-sm font-medium">{formatCurrency(dc.revenue)}/bln</p>
                      <Badge variant="secondary" className="text-xs">{dc.plan}</Badge>
                    </div>

                    <Badge className={`${statusColors[dc.status]} text-xs`} variant="secondary">
                      {dc.isActive ? "Aktif" : "Non-aktif"}
                    </Badge>

                    {/* Link Lihat Halaman Publik */}
                    <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs">
                      <Link href={`/marketplace/${dc.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Halaman Publik</span>
                      </Link>
                    </Button>

                    {/* Toggle Verifikasi */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVerified(dc.id, dc.isVerified)}
                      disabled={isLoading}
                      className={`h-8 gap-1.5 text-xs ${
                        dc.isVerified
                          ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {dc.isVerified ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden md:inline">Terverifikasi</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Verifikasi</span>
                        </>
                      )}
                    </Button>

                    {/* Toggle Aktif/Nonaktif */}
                    {dc.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(dc.id, true)}
                        disabled={isLoading}
                        className="h-8 gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                        <span>Nonaktifkan</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(dc.id, false)}
                        disabled={isLoading}
                        className="h-8 gap-1.5 text-xs border-success/30 text-success hover:bg-success/10"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Aktifkan</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
