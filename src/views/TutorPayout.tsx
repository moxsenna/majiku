import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTutors,
  getTutorAssignments,
  getTutorBonuses,
  getClasses,
  updateTutorRate,
  addTutorBonus,
} from "@/server/actions/payout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Download, Search, Wallet, TrendingUp, Calendar, Award,
  CheckCircle2, Clock, Plus, Edit2, Trash2,
} from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function TutorPayout() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);
  const [rateDialog, setRateDialog] = useState<{ tutorId: string; classId: string; rate: number; assignmentId?: string } | null>(null);
  const [bonusDialog, setBonusDialog] = useState<{ tutorId: string; amount: string; description: string } | null>(null);

  // Fetch tutors
  const { data: tutors = [] } = useQuery({
    queryKey: ["tutors"],
    queryFn: getTutors,
  });

  // Fetch assignments with class info
  const { data: assignments = [] } = useQuery({
    queryKey: ["tutor-assignments"],
    queryFn: getTutorAssignments,
  });

  // Fetch bonuses for current month
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: bonuses = [] } = useQuery({
    queryKey: ["tutor-bonuses", currentMonth, currentYear],
    queryFn: () => getTutorBonuses(currentMonth, currentYear),
  });

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });

  // Update rate mutation
  const updateRate = useMutation({
    mutationFn: (params: { assignmentId?: string; tutorId: string; classId: string; rate: number }) =>
      updateTutorRate(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutor-assignments"] });
      toast({ title: "Berhasil", description: "Tarif per sesi berhasil diperbarui" });
      setRateDialog(null);
    },
  });

  // Add bonus mutation
  const addBonus = useMutation({
    mutationFn: (params: { tutorId: string; amount: number; description: string }) =>
      addTutorBonus({
        tutorId: params.tutorId,
        amount: params.amount,
        description: params.description,
        month: currentMonth,
        year: currentYear,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutor-bonuses"] });
      toast({ title: "Berhasil", description: "Bonus berhasil ditambahkan" });
      setBonusDialog(null);
    },
  });

  // Calculate tutor payouts
  const tutorPayouts = tutors.map((tutor) => {
    const tutorAssignments = assignments.filter((a) => a.tutor_id === tutor.id);
    const tutorBonuses = bonuses.filter((b) => b.tutor_id === tutor.id);
    const totalSessionEarnings = tutorAssignments.reduce((sum, a) => sum + (a.rate_per_session * ((a.classes as any)?.sessions_per_month || 0)), 0);
    const totalBonuses = tutorBonuses.reduce((sum, b) => sum + b.amount, 0);
    return {
      ...tutor,
      assignments: tutorAssignments,
      bonuses: tutorBonuses,
      sessionEarnings: totalSessionEarnings,
      totalBonuses,
      totalEarnings: totalSessionEarnings + totalBonuses,
    };
  });

  const filteredPayouts = tutorPayouts.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    totalPayout: tutorPayouts.reduce((s, t) => s + t.totalEarnings, 0),
    totalSessions: tutorPayouts.reduce((s, t) => s + t.sessionEarnings, 0),
    totalBonuses: tutorPayouts.reduce((s, t) => s + t.totalBonuses, 0),
    totalTutors: tutors.length,
  };

  const selectedTutorData = selectedTutor ? tutorPayouts.find((t) => t.id === selectedTutor) : null;

  const colorStyles: Record<string, { bg: string; text: string }> = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    success: { bg: "bg-success/10", text: "text-success" },
    warning: { bg: "bg-warning/10", text: "text-warning" },
    info: { bg: "bg-info/10", text: "text-info" },
  };

  const handleExportCSV = () => {
    const headers = ["Nama Tutor", "Email", "Telepon", "Total Sesi (Rp)", "Total Bonus (Rp)", "Total Gaji (Rp)"];
    const rows = filteredPayouts.map((t) => [
      `"${t.name}"`,
      `"${t.email || "-"}"`,
      `"${t.phone || "-"}"`,
      t.sessionEarnings,
      t.totalBonuses,
      t.totalEarnings,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payout-tutor-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Selesai ✓", description: "File CSV rekap gaji tutor berhasil diunduh." });
  };

  return (
    <DashboardLayout title="Manajemen Gaji Tutor" subtitle="Kelola tarif per sesi, bonus, dan total gaji tutor">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Wallet, label: "Total Gaji", value: formatCurrency(stats.totalPayout), color: "primary" },
          { icon: TrendingUp, label: "Total Sesi", value: formatCurrency(stats.totalSessions), color: "success" },
          { icon: Award, label: "Total Bonus", value: formatCurrency(stats.totalBonuses), color: "warning" },
          { icon: Calendar, label: "Jumlah Tutor", value: stats.totalTutors.toString(), color: "info" },
        ].map((s, i) => {
          const style = colorStyles[s.color] || colorStyles.primary;
          return (
            <Card key={i} variant="flat">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl ${style.bg} flex items-center justify-center`}>
                    <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${style.text}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-sm sm:text-lg font-bold truncate">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari tutor..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="h-4 w-4 mr-2" />Export</Button>
      </div>

      {/* Tutor Cards */}
      <div className="space-y-4">
        {filteredPayouts.map((tutor) => (
          <Card key={tutor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">{tutor.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{tutor.name}</p>
                      <p className="text-xs text-muted-foreground">{tutor.assignments.length} kelas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Gaji</p>
                    <p className="font-bold text-primary">{formatCurrency(tutor.totalEarnings)}</p>
                  </div>
                </div>

                {/* Class Assignments */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tarif Per Sesi</p>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedTutor(tutor.id)}>
                      <Edit2 className="h-3 w-3 mr-1" />Kelola
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tutor.assignments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm truncate">{(a.classes as any)?.name}</span>
                        <span className="text-sm font-medium text-primary">{formatCurrency(a.rate_per_session)}/sesi</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bonuses */}
                {tutor.bonuses.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Bonus</p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.bonuses.map((b) => (
                        <Badge key={b.id} variant="success" className="text-xs">
                          {b.description}: {formatCurrency(b.amount)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Sesi</p>
                    <p className="text-sm font-semibold">{formatCurrency(tutor.sessionEarnings)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Bonus</p>
                    <p className="text-sm font-semibold text-success">{formatCurrency(tutor.totalBonuses)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-primary/10">
                    <p className="text-xs text-primary">Total</p>
                    <p className="text-sm font-bold text-primary">{formatCurrency(tutor.totalEarnings)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manage Tutor Dialog */}
      <Dialog open={!!selectedTutor} onOpenChange={() => setSelectedTutor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kelola Gaji — {selectedTutorData?.name}</DialogTitle>
          </DialogHeader>
          {selectedTutorData && (
            <div className="space-y-4">
              {/* Assignments */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Tarif Per Kelas</h4>
                </div>
                <div className="space-y-2">
                  {selectedTutorData.assignments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm">{(a.classes as any)?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatCurrency(a.rate_per_session)}/sesi</span>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                          onClick={() => setRateDialog({ tutorId: selectedTutorData.id, classId: a.class_id, rate: a.rate_per_session, assignmentId: a.id })}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {/* Add new class assignment */}
                  {classes.filter((c) => !selectedTutorData.assignments.some((a) => a.class_id === c.id)).length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-2">Tambah kelas baru:</p>
                      <div className="flex flex-wrap gap-2">
                        {classes.filter((c) => !selectedTutorData.assignments.some((a) => a.class_id === c.id)).map((c) => (
                          <Button key={c.id} variant="outline" size="sm" className="text-xs"
                            onClick={() => setRateDialog({ tutorId: selectedTutorData.id, classId: c.id, rate: 0 })}>
                            <Plus className="h-3 w-3 mr-1" />{c.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bonuses */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Bonus Bulan Ini</h4>
                  <Button variant="soft" size="sm" className="h-7 text-xs"
                    onClick={() => setBonusDialog({ tutorId: selectedTutorData.id, amount: "", description: "" })}>
                    <Plus className="h-3 w-3 mr-1" />Tambah Bonus
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedTutorData.bonuses.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-success/5">
                      <span className="text-sm">{b.description}</span>
                      <span className="text-sm font-medium text-success">{formatCurrency(b.amount)}</span>
                    </div>
                  ))}
                  {selectedTutorData.bonuses.length === 0 && <p className="text-sm text-muted-foreground">Belum ada bonus</p>}
                </div>
              </div>

              {/* Total */}
              <Card variant="flat">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Gaji Bulan Ini</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(selectedTutorData.totalEarnings)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTutor(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate Edit Dialog */}
      <Dialog open={!!rateDialog} onOpenChange={() => setRateDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Tarif Per Sesi</DialogTitle>
          </DialogHeader>
          {rateDialog && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Kelas: {classes.find((c) => c.id === rateDialog.classId)?.name}</p>
              <Input type="number" placeholder="Tarif per sesi" value={rateDialog.rate || ""} 
                onChange={(e) => setRateDialog({ ...rateDialog, rate: Number(e.target.value) })} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateDialog(null)}>Batal</Button>
            <Button onClick={() => rateDialog && updateRate.mutate(rateDialog)}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bonus Dialog */}
      <Dialog open={!!bonusDialog} onOpenChange={() => setBonusDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Bonus</DialogTitle>
          </DialogHeader>
          {bonusDialog && (
            <div className="space-y-4">
              <Input placeholder="Deskripsi bonus" value={bonusDialog.description}
                onChange={(e) => setBonusDialog({ ...bonusDialog, description: e.target.value })} />
              <Input type="number" placeholder="Jumlah (Rp)" value={bonusDialog.amount}
                onChange={(e) => setBonusDialog({ ...bonusDialog, amount: e.target.value })} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBonusDialog(null)}>Batal</Button>
            <Button onClick={() => bonusDialog && addBonus.mutate({
              tutorId: bonusDialog.tutorId, amount: Number(bonusDialog.amount), description: bonusDialog.description,
            })}>Tambah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
