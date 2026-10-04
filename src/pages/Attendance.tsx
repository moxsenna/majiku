import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Search, QrCode, LogIn, LogOut, Clock, Users,
  CheckCircle2, XCircle, AlertCircle, ShieldAlert, Eye,
} from "lucide-react";

const formatTime = (t: string | null) => t ? t.slice(0, 5) : null;

export default function Attendance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Fetch attendance with student + class names
  const { data: attendanceData = [] } = useQuery({
    queryKey: ["attendance-page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*, students(name, parent_name), classes(name)")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch enrollments for quota tracking
  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_enrollments")
        .select("*, students(name), classes(name)")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Today's records
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = attendanceData.filter((r) => r.date === today);

  const stats = {
    total: enrollments.length,
    present: todayRecords.filter((r) => r.status === "present").length,
    late: todayRecords.filter((r) => r.status === "late").length,
    absent: todayRecords.filter((r) => r.status === "absent").length,
    permit: todayRecords.filter((r) => r.status === "permit").length,
  };

  const filteredData = todayRecords.filter((record) => {
    const name = (record.students as any)?.name || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Student detail modal data
  const studentEnrollment = selectedStudent
    ? enrollments.find((e) => e.student_id === selectedStudent)
    : null;
  const studentAttendance = selectedStudent
    ? attendanceData.filter((a) => a.student_id === selectedStudent)
    : [];
  const studentMonthAttendance = studentAttendance.filter((a) => {
    const d = new Date(a.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: any; label: string }> = {
      present: { variant: "success", label: "Hadir" },
      late: { variant: "warning", label: "Terlambat" },
      absent: { variant: "destructive", label: "Tidak Hadir" },
      permit: { variant: "info", label: "Izin" },
    };
    return map[status] || { variant: "muted", label: status };
  };

  return (
    <DashboardLayout title="Kehadiran" subtitle="Kelola check-in dan check-out siswa">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { icon: Users, label: "Total", value: stats.total, color: "bg-primary/10 text-primary" },
          { icon: CheckCircle2, label: "Hadir", value: stats.present, color: "bg-success/10 text-success" },
          { icon: Clock, label: "Terlambat", value: stats.late, color: "bg-warning/10 text-warning" },
          { icon: XCircle, label: "Tidak Hadir", value: stats.absent, color: "bg-destructive/10 text-destructive" },
          { icon: ShieldAlert, label: "Izin", value: stats.permit, color: "bg-info/10 text-info" },
        ].map((s, i) => (
          <Card key={i} variant="flat" className={i === 4 ? "col-span-2 lg:col-span-1" : ""}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color.split(" ")[0]}`}>
                  <s.icon className={`h-5 w-5 ${s.color.split(" ")[1]}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari siswa..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" variant="filled" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="all">Semua Status</option>
            <option value="present">Hadir</option>
            <option value="late">Terlambat</option>
            <option value="absent">Tidak Hadir</option>
            <option value="permit">Izin</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><LogIn className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Manual Check-in</span><span className="sm:hidden">Check-in</span></Button>
          <Button variant="hero" size="sm"><QrCode className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Scan QR Code</span><span className="sm:hidden">Scan QR</span></Button>
        </div>
      </div>

      {/* Quota Overview */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" /> Kuota Kelas Siswa Bulan Ini
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {enrollments.map((e) => {
              const remaining = e.sessions_quota - e.sessions_used;
              const pct = (e.sessions_used / e.sessions_quota) * 100;
              const freeLeft = e.free_permits_allowed - e.free_permits_used;
              return (
                <div key={e.id} className="p-3 rounded-lg bg-muted/30 border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedStudent(e.student_id)}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-foreground truncate">{(e.students as any)?.name}</p>
                    <Badge variant={remaining <= 1 ? "destructive" : remaining <= 3 ? "warning" : "success"} className="text-[10px]">
                      Sisa {remaining}/{e.sessions_quota}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{(e.classes as any)?.name}</p>
                  <Progress value={pct} className="h-1.5 mb-1" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{e.sessions_used} sesi terpakai</span>
                    <span>Izin gratis: {freeLeft > 0 ? `${freeLeft} tersisa` : "Habis"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Siswa</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm hidden md:table-cell">Kelas</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Check-in</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm hidden sm:table-cell">Check-out</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm hidden lg:table-cell">Keterangan</th>
                  <th className="text-right p-4 font-medium text-muted-foreground text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record) => {
                  const name = (record.students as any)?.name || "—";
                  const className = (record.classes as any)?.name || "—";
                  const badge = statusBadge(record.status);
                  return (
                    <tr key={record.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground text-sm">{name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{className}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell"><p className="text-sm text-muted-foreground">{className}</p></td>
                      <td className="p-4">
                        {record.check_in_time ? (
                          <div className="flex items-center gap-1 text-sm text-success"><LogIn className="h-3 w-3" />{formatTime(record.check_in_time)}</div>
                        ) : <span className="text-sm text-muted-foreground">-</span>}
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        {record.check_out_time ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground"><LogOut className="h-3 w-3" />{formatTime(record.check_out_time)}</div>
                        ) : <span className="text-sm text-muted-foreground">-</span>}
                      </td>
                      <td className="p-4"><Badge variant={badge.variant as any}>{badge.label}</Badge></td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {record.status === "permit" ? `${record.permit_type === "sick" ? "Sakit" : record.permit_type === "family" ? "Keluarga" : "Lainnya"}${record.permit_reason ? ` - ${record.permit_reason}` : ""}${record.is_free_permit ? " (Gratis)" : " (Kurangi kuota)"}` : record.checked_in_by || "-"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(record.student_id)}><Eye className="h-3 w-3" /></Button>
                          {!record.check_in_time && <Button variant="soft" size="sm"><LogIn className="h-3 w-3 mr-1" /><span className="hidden sm:inline">In</span></Button>}
                          {record.check_in_time && !record.check_out_time && <Button variant="outline" size="sm"><LogOut className="h-3 w-3 mr-1" /><span className="hidden sm:inline">Out</span></Button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredData.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Belum ada data kehadiran hari ini</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Laporan Kehadiran Siswa</DialogTitle>
          </DialogHeader>
          {studentEnrollment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{((studentEnrollment.students as any)?.name || "").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{(studentEnrollment.students as any)?.name}</p>
                  <p className="text-sm text-muted-foreground">{(studentEnrollment.classes as any)?.name}</p>
                </div>
              </div>

              {/* Quota */}
              <Card variant="flat">
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-3">Kuota Bulan Ini</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-success/10">
                      <p className="text-lg font-bold text-success">{studentEnrollment.sessions_used}</p>
                      <p className="text-[10px] text-muted-foreground">Sesi Terpakai</p>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <p className="text-lg font-bold text-primary">{studentEnrollment.sessions_quota - studentEnrollment.sessions_used}</p>
                      <p className="text-[10px] text-muted-foreground">Sisa Kuota</p>
                    </div>
                    <div className="p-2 rounded-lg bg-info/10">
                      <p className="text-lg font-bold text-info">{studentEnrollment.free_permits_allowed - studentEnrollment.free_permits_used}</p>
                      <p className="text-[10px] text-muted-foreground">Izin Gratis</p>
                    </div>
                  </div>
                  <Progress value={(studentEnrollment.sessions_used / studentEnrollment.sessions_quota) * 100} className="h-2 mt-3" />
                </CardContent>
              </Card>

              {/* Monthly Attendance */}
              <div>
                <h4 className="font-medium text-sm mb-2">Riwayat Bulan Ini</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {studentMonthAttendance.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data</p>}
                  {studentMonthAttendance.map((a) => {
                    const b = statusBadge(a.status);
                    return (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-20">{new Date(a.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                          <Badge variant={b.variant as any} className="text-[10px]">{b.label}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {a.check_in_time && formatTime(a.check_in_time)}
                          {a.check_out_time && ` - ${formatTime(a.check_out_time)}`}
                          {a.status === "permit" && a.permit_reason && ` (${a.permit_reason})`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
