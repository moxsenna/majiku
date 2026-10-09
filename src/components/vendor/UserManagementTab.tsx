import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, UserPlus, Shield, Trash2, Edit, Filter } from "lucide-react";

const demoUsers = [
  { id: 1, name: "Budi Santoso", email: "budi@daycare-a.com", role: "super_admin", status: "active", daycare: "Platform MAJIKU", lastLogin: "2 jam lalu" },
  { id: 2, name: "Siti Nurhaliza", email: "siti@tkceria.com", role: "admin_daycare", status: "active", daycare: "TK Ceria Mandiri", lastLogin: "5 jam lalu" },
  { id: 3, name: "Ahmad Fauzi", email: "ahmad@bimbelprestasi.com", role: "admin_daycare", status: "active", daycare: "Bimbel Prestasi", lastLogin: "1 hari lalu" },
  { id: 4, name: "Dewi Lestari", email: "dewi@happykids.com", role: "staff", status: "active", daycare: "Daycare Happy Kids", lastLogin: "3 jam lalu" },
  { id: 5, name: "Rina Wati", email: "rina@parent.com", role: "parent", status: "active", daycare: "TK Ceria Mandiri", lastLogin: "30 menit lalu" },
  { id: 6, name: "Joko Widodo", email: "joko@paud.com", role: "admin_daycare", status: "inactive", daycare: "PAUD Tunas", lastLogin: "1 minggu lalu" },
  { id: 7, name: "Maya Sari", email: "maya@staff.com", role: "staff", status: "active", daycare: "Bimbel Prestasi", lastLogin: "2 hari lalu" },
  { id: 8, name: "Hendra Gunawan", email: "hendra@parent.com", role: "parent", status: "inactive", daycare: "Daycare Happy Kids", lastLogin: "2 minggu lalu" },
];

const roleLabels: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-destructive/10 text-destructive" },
  admin_daycare: { label: "Admin Daycare", color: "bg-primary/10 text-primary" },
  staff: { label: "Staf", color: "bg-info/10 text-info" },
  parent: { label: "Orang Tua", color: "bg-success/10 text-success" },
};

import type { VendorUserItem } from "@/server/actions/vendorDashboard";

interface UserManagementTabProps {
  users?: VendorUserItem[];
}

export default function UserManagementTab({ users }: UserManagementTabProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const list = users && users.length > 0 ? users : demoUsers;

  const filtered = list.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const superAdminCount = list.filter(u => u.role === "super_admin").length;
  const adminDaycareCount = list.filter(u => u.role === "admin_daycare").length;
  const parentCount = list.filter(u => u.role === "parent").length;

  const stats = [
    { label: "Total Pengguna", value: list.length, icon: Users },
    { label: "Super Admin", value: superAdminCount, icon: Shield },
    { label: "Admin Daycare", value: adminDaycareCount, icon: Shield },
    { label: "Orang Tua", value: parentCount, icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Daftar Pengguna</CardTitle>
              <CardDescription>Kelola semua akun pengguna platform</CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Tambah Pengguna
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari nama atau email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Semua Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin_daycare">Admin Daycare</SelectItem>
                <SelectItem value="staff">Staf</SelectItem>
                <SelectItem value="parent">Orang Tua</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Non-aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filtered.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email} • {user.daycare}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${roleLabels[user.role]?.color} text-xs`} variant="secondary">
                    {roleLabels[user.role]?.label}
                  </Badge>
                  <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                    {user.status === "active" ? "Aktif" : "Non-aktif"}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden md:block">{user.lastLogin}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
