"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Clock,
  CalendarDays,
  Target,
  Trash2,
  MoreVertical,
  Pencil,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  createLessonPlan,
  deleteLessonPlan,
  updateLessonPlan,
  type LessonPlanRow,
} from "@/server/actions/lessonPlans";

const statusLabels: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" }> = {
  draft: { label: "Draft", variant: "secondary" },
  upcoming: { label: "Akan Datang", variant: "info" },
  in_progress: { label: "Sedang Berjalan", variant: "warning" },
  completed: { label: "Selesai", variant: "success" },
};

interface ActivityForm {
  id: string;
  title: string;
  durationMinutes: string;
  description: string;
  completed: boolean;
}

interface PlanFormState {
  id?: string;
  title: string;
  subject: string;
  classId: string; // "none" = tanpa kelas
  planDate: string;
  timeRange: string;
  objectivesText: string;
  activities: ActivityForm[];
  materialsText: string;
  activitiesStatus?: string;
}

function emptyActivities(): ActivityForm[] {
  return [{ id: crypto.randomUUID(), title: "", durationMinutes: "15", description: "", completed: false }];
}

function emptyForm(today: string): PlanFormState {
  return {
    title: "",
    subject: "",
    classId: "none",
    planDate: today,
    timeRange: "",
    objectivesText: "",
    activities: emptyActivities(),
    materialsText: "",
  };
}

function totalMinutes(activities: ActivityForm[]): number {
  return activities.reduce((s, a) => s + (Number(a.durationMinutes) || 0), 0);
}

interface LessonPlansProps {
  plans: LessonPlanRow[];
  classOptions: { id: string; name: string }[];
  today: string;
}

export default function LessonPlans({ plans, classOptions, today }: LessonPlansProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PlanFormState>(emptyForm(today));
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LessonPlanRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(
    () =>
      plans.filter((p) => {
        const q = searchQuery.toLowerCase();
        const matchQ =
          !q ||
          p.title.toLowerCase().includes(q) ||
          (p.subject ?? "").toLowerCase().includes(q) ||
          (p.className ?? "").toLowerCase().includes(q);
        const matchStatus = statusFilter === "all" || p.status === statusFilter;
        return matchQ && matchStatus;
      }),
    [plans, searchQuery, statusFilter]
  );

  const openCreate = () => {
    setForm(emptyForm(today));
    setFormOpen(true);
  };

  const openEdit = (p: LessonPlanRow) => {
    setForm({
      id: p.id,
      title: p.title,
      subject: p.subject ?? "",
      classId: p.classId ?? "none",
      planDate: p.planDate,
      timeRange: p.timeRange ?? "",
      objectivesText: (p.objectives ?? []).join("\n"),
      activities: (p.activities ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        durationMinutes: String(a.durationMinutes),
        description: a.description ?? "",
        completed: Boolean(a.completed),
      })),
      materialsText: (p.materials ?? []).join("\n"),
      activitiesStatus: p.status,
    });
    setFormOpen(true);
  };

  const toggleActivity = async (plan: LessonPlanRow, activityId: string) => {
    const updated = (plan.activities ?? []).map((a) =>
      a.id === activityId ? { ...a, completed: !a.completed } : a
    );
    try {
      await updateLessonPlan(plan.id, { activities: updated });
      startTransition(() => router.refresh());
    } catch (e) {
      const err = e as Error;
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    }
  };

  const changeStatus = async (plan: LessonPlanRow, status: string) => {
    try {
      await updateLessonPlan(plan.id, { status });
      toast({ title: "Status diperbarui" });
      startTransition(() => router.refresh());
    } catch (e) {
      const err = e as Error;
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: form.title,
        subject: form.subject,
        classId: form.classId === "none" ? null : form.classId,
        planDate: form.planDate,
        timeRange: form.timeRange,
        objectives: form.objectivesText.split("\n").map((s) => s.trim()).filter(Boolean),
        activities: form.activities.map((a) => ({
          id: a.id,
          title: a.title,
          durationMinutes: Number(a.durationMinutes),
          description: a.description,
          completed: a.completed,
        })),
        materials: form.materialsText.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      if (form.id) {
        await updateLessonPlan(form.id, {
          activities: payload.activities,
          status: form.activitiesStatus,
        });
        toast({ title: "Progress RPP diperbarui" });
      } else {
        await createLessonPlan(payload);
        toast({ title: "RPP berhasil dibuat", description: payload.title });
      }
      setFormOpen(false);
      startTransition(() => router.refresh());
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Gagal menyimpan RPP",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteLessonPlan(deleteTarget.id);
      toast({ title: "RPP dihapus" });
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } catch (e) {
      const err = e as Error;
      toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const updateActivityForm = (id: string, patch: Partial<ActivityForm>) => {
    setForm((f) => ({
      ...f,
      activities: f.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  };

  return (
    <DashboardLayout
      title="Lesson Plans"
      subtitle="Kelola rencana pembelajaran dan kegiatan kelas"
    >
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari RPP, mata pelajaran, kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {Object.entries(statusLabels).map(([value, s]) => (
                <SelectItem key={value} value={value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="hero" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Buat RPP
        </Button>
      </div>

      {/* Plans list */}
      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            Tidak ada RPP yang cocok dengan pencarian.
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map((plan) => {
          const st = statusLabels[plan.status] ?? statusLabels.upcoming;
          const total = (plan.activities ?? []).reduce(
            (s, a) => s + (Number(a.durationMinutes) || 0),
            0
          );
          const done = (plan.activities ?? []).filter((a) => a.completed).length;
          return (
            <Card key={plan.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base">{plan.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap mt-1">
                      {plan.subject && <Badge variant="outline">{plan.subject}</Badge>}
                      {plan.className && <Badge variant="secondary">{plan.className}</Badge>}
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Opsi RPP">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(plan)}>
                        <Pencil className="h-3 w-3 mr-2" /> Progress Aktivitas
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteTarget(plan)}
                      >
                        <Trash2 className="h-3 w-3 mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {plan.planDate
                      ? format(new Date(plan.planDate), "d MMMM yyyy", { locale: idLocale })
                      : "-"}
                  </span>
                  {plan.timeRange && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {plan.timeRange}
                    </span>
                  )}
                  {plan.tutorName && <span>Tutor: {plan.tutorName}</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Objectives */}
                {(plan.objectives ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold flex items-center gap-1 mb-1">
                      <Target className="h-3 w-3 text-primary" /> Tujuan Pembelajaran
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                      {(plan.objectives ?? []).map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Activities checklist */}
                {(plan.activities ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3 text-primary" /> Aktivitas ({done}/
                      {(plan.activities ?? []).length} selesai · {total} menit)
                    </p>
                    <div className="space-y-1.5">
                      {(plan.activities ?? []).map((a) => (
                        <label
                          key={a.id}
                          className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={Boolean(a.completed)}
                            onCheckedChange={() => toggleActivity(plan, a.id)}
                          />
                          <span
                            className={
                              a.completed ? "line-through text-muted-foreground" : ""
                            }
                          >
                            {a.title}
                          </span>
                          <span className="ml-auto text-muted-foreground">
                            {a.durationMinutes} mnt
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {/* Materials */}
                {(plan.materials ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold flex items-center gap-1 mb-1">
                      <Package className="h-3 w-3 text-primary" /> Material
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(plan.materials ?? []).map((m, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Progress RPP" : "Buat RPP Baru"}</DialogTitle>
            <DialogDescription>
              {form.id
                ? "Centang aktivitas yang sudah selesai."
                : "Rencana Pembelajaran dengan tujuan, aktivitas, dan material."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {!form.id && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="lp-title">Judul RPP</Label>
                  <Input
                    id="lp-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="cth. Mengenal Angka 1-10"
                    maxLength={150}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="lp-subject">Mata Pelajaran</Label>
                    <Input
                      id="lp-subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="cth. Numerasi"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Kelas</Label>
                    <Select
                      value={form.classId}
                      onValueChange={(v) => setForm({ ...form, classId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tanpa Kelas</SelectItem>
                        {classOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lp-date">Tanggal</Label>
                    <Input
                      id="lp-date"
                      type="date"
                      value={form.planDate}
                      onChange={(e) => setForm({ ...form, planDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lp-time">Rentang Waktu</Label>
                    <Input
                      id="lp-time"
                      value={form.timeRange}
                      onChange={(e) => setForm({ ...form, timeRange: e.target.value })}
                      placeholder="08:00 - 10:00"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lp-objectives">Tujuan Pembelajaran (satu per baris)</Label>
                  <Textarea
                    id="lp-objectives"
                    value={form.objectivesText}
                    onChange={(e) => setForm({ ...form, objectivesText: e.target.value })}
                    rows={3}
                    placeholder={"Anak mampu mengenal angka 1-10\nAnak mampu menghitung benda konkrit"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aktivitas</Label>
                  {form.activities.map((a) => (
                    <div key={a.id} className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <Input
                          value={a.title}
                          onChange={(e) => updateActivityForm(a.id, { title: e.target.value })}
                          placeholder={`Judul aktivitas`}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={240}
                            value={a.durationMinutes}
                            onChange={(e) =>
                              updateActivityForm(a.id, { durationMinutes: e.target.value })
                            }
                            className="w-24"
                            placeholder="Menit"
                          />
                          <Input
                            value={a.description}
                            onChange={(e) =>
                              updateActivityForm(a.id, { description: e.target.value })
                            }
                            placeholder="Deskripsi (opsional)"
                          />
                        </div>
                      </div>
                      {form.activities.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Hapus aktivitas"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              activities: f.activities.filter((x) => x.id !== a.id),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        activities: [
                          ...f.activities,
                          {
                            id: crypto.randomUUID(),
                            title: "",
                            durationMinutes: "15",
                            description: "",
                            completed: false,
                          },
                        ],
                      }))
                    }
                  >
                    <Plus className="h-3 w-3 mr-1" /> Tambah aktivitas
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lp-materials">Material (satu per baris)</Label>
                  <Textarea
                    id="lp-materials"
                    value={form.materialsText}
                    onChange={(e) => setForm({ ...form, materialsText: e.target.value })}
                    rows={2}
                    placeholder={"Manik-manik warna\nNampan pasir"}
                  />
                </div>
              </>
            )}
            {form.id && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {form.title} — {totalMinutes(form.activities)} menit total
                </p>
                <div className="space-y-1.5">
                  {form.activities.map((a) => (
                    <label
                      key={a.id}
                      className="flex items-center gap-2 text-sm p-2 rounded border cursor-pointer hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={a.completed}
                        onCheckedChange={(v) =>
                          updateActivityForm(a.id, { completed: Boolean(v) })
                        }
                      />
                      <span className={a.completed ? "line-through text-muted-foreground" : ""}>
                        {a.title}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {a.durationMinutes} mnt
                      </span>
                    </label>
                  ))}
                </div>
                <div className="space-y-1">
                  <Label>Status RPP</Label>
                  <Select
                    value={form.activitiesStatus ?? "upcoming"}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, activitiesStatus: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, s]) => (
                        <SelectItem key={value} value={value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus RPP?</AlertDialogTitle>
            <AlertDialogDescription>
              RPP &ldquo;{deleteTarget?.title}&rdquo; akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
