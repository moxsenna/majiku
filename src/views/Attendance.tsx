import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTodayAttendance,
  getMonthlyAttendance,
  getAttendanceEnrollments,
  recordStudentCheckIn,
  recordStudentCheckOut,
} from "@/server/actions/attendance";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Search, LogIn, LogOut, Clock, Users,
  CheckCircle2, XCircle, AlertCircle, ShieldAlert, Eye,
} from "lucide-react";
import { todayInWib } from "@/lib/datetime";

const formatTime = (t: string | null) => t ? t.slice(0, 5) : null;

export default function Attendance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isManualCheckInOpen, setIsManualCheckInOpen] = useState(false);
  const [manualStudentId, setManualStudentId] = useState("");

  const checkInMutation = useMutation({
    mutationFn: (input: { attendanceId?: string; studentId: string; classId?: string }) =>
      recordStudentCheckIn(input),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["attendance-page"] });
      toast({
        title: "Check-in Berhasil ✓",
        description: `Check-in berhasil tercatat pada ${res.time} WIB.`,
      });
      setIsManualCheckInOpen(false);
      setManualStudentId("");
    },
    onError: (err: any) => {
      toast({
        title: "Gagal Check-in",
        description: err?.message || "Terjadi kesalahan.",
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (input: { attendanceId: string }) => recordStudentCheckOut(input),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["attendance-page"] });
      toast({
        title: "Check-out Berhasil ✓",
        description: `Check-out berhasil tercatat pada ${res.time} WIB.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Gagal Check-out",
        description: err?.message || "Terjadi kesalahan.",
        variant: "destructive",
      });
    },
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Fetch attendance with student + class names
  const { data: attendanceData = [] } = useQuery({
    queryKey: ["attendance-page"],
    queryFn: getTodayAttendance,
  });

  // Fetch monthly attendance for student detail modal
  const { data: monthlyAttendance = [] } = useQuery({
    queryKey: ["attendance-monthly", currentYear, currentMonth],
    queryFn: () => getMonthlyAttendance(currentYear, currentMonth),
  });

  // Fetch enrollments for quota tracking
  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments"],
    queryFn: getAttendanceEnrollments,
  });

  // Today's records
  const today = todayInWib();
  const todayRecords = attendanceData.filter((r) => r.date === today);

  const stats = {
    total: enrollments.length,
    present: todayRecords.filter((r) => r.status === "present").length,
    late: todayRecords.filter((r) => r.status === "late").length,
    absent: todayRecords.filter((r) => r.status === "absent").length,
    permit: todayRecords.filter((r) => r.status === "permit").length,
  };

  const filteredData = todayRecords.filter((record) => {
    const name = record.studentName || record.students?.name || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Student detail modal data
  const studentEnrollment = selectedStudent
    ? enrollments.find((e) => e.student_id === selectedStudent)
    : null;
  const studentAttendance = selectedStudent
    ? monthlyAttendance.filter((a) => a.student_id === selectedStudent)
    : [];
  const studentMonthAttendance = studentAttendance.filter((a) => {
    const d = new Date(a.date);
    const currentDate = new Date();
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  type BadgeVariant = NonNullable<BadgeProps["variant"]>;

  const statusBadge = (status: string): { variant: BadgeVariant; label: string } => {
    const map: Record<string, { variant: BadgeVariant; label: string }> = {
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
          <Button variant="outline" size="sm" onClick={() => setIsManualCheckInOpen(true)}>
            <LogIn className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Manual Check-in</span><span className="sm:hidden">Check-in</span>
          </Button>
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
                    <p className="font-medium text-sm text-foreground truncate">{e.studentName || e.students?.name}</p>
                    <Badge variant={remaining <= 1 ? "destructive" : remaining <= 3 ? "warning" : "success"} className="text-[10px]">
                      Sisa {remaining}/{e.sessions_quota}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{e.className || e.classes?.name}</p>
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
                  const name = record.studentName || record.students?.name || "—";
                  const className = record.className || record.classes?.name || "—";
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
                      <td className="p-4"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {record.status === "permit" ? `${record.permit_type === "sick" ? "Sakit" : record.permit_type === "family" ? "Keluarga" : "Lainnya"}${record.permit_reason ? ` - ${record.permit_reason}` : ""}${record.is_free_permit ? " (Gratis)" : " (Kurangi kuota)"}` : record.checked_in_by || "-"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(record.student_id ?? null)}><Eye className="h-3 w-3" /></Button>
                          {!record.check_in_time && (
                            <Button
                              variant="soft"
                              size="sm"
                              disabled={checkInMutation.isPending}
                              onClick={() => checkInMutation.mutate({ attendanceId: record.id, studentId: record.studentId || record.student_id || "" })}
                            >
                              <LogIn className="h-3 w-3 mr-1" /><span className="hidden sm:inline">In</span>
                            </Button>
                          )}
                          {record.check_in_time && !record.check_out_time && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={checkOutMutation.isPending}
                              onClick={() => checkOutMutation.mutate({ attendanceId: record.id })}
                            >
                              <LogOut className="h-3 w-3 mr-1" /><span className="hidden sm:inline">Out</span>
                            </Button>
                          )}
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
                  <AvatarFallback>{((studentEnrollment.studentName || studentEnrollment.students?.name || "").slice(0, 2).toUpperCase())}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{studentEnrollment.studentName || studentEnrollment.students?.name}</p>
                  <p className="text-sm text-muted-foreground">{studentEnrollment.className || studentEnrollment.classes?.name}</p>
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
                          <Badge variant={b.variant} className="text-[10px]">{b.label}</Badge>
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

      {/* QR Code Scanner Dialog — dihapus: scanner QR belum terhubung ke pencatatan
          kehadiran nyata; presensi memakai Manual Check-in yang persist ke DB */}

      {/* Manual Check-in Dialog */}
      <Dialog open={isManualCheckInOpen} onOpenChange={setIsManualCheckInOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Check-in Siswa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Pilih Siswa Terdaftar
              </label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                value={manualStudentId}
                onChange={(e) => setManualStudentId(e.target.value)}
              >
                <option value="">-- Pilih Siswa --</option>
                {enrollments.map((e) => (
                  <option key={e.id} value={e.studentId || e.student_id}>
                    {e.studentName || (e.students as any)?.name} — {e.className || (e.classes as any)?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsManualCheckInOpen(false)}>
              Batal
            </Button>
            <Button
              disabled={!manualStudentId || checkInMutation.isPending}
              onClick={() => {
                if (manualStudentId) {
                  const enrollment = enrollments.find(
                    (e) => (e.studentId || e.student_id) === manualStudentId
                  );
                  checkInMutation.mutate({
                    studentId: manualStudentId,
                    classId: enrollment?.classId || enrollment?.class_id,
                  });
                }
              }}
            >
              {checkInMutation.isPending ? "Menyimpan..." : "Simpan Check-in"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
