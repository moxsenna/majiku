"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  MoreVertical,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import { addDays, format, startOfWeek } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { todayInWib } from "@/lib/datetime";
import {
  createClassSchedule,
  deleteClassSchedule,
  toggleClassScheduleActive,
  updateClassSchedule,
  type ScheduleRow,
} from "@/server/actions/schedules";

const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const fullWeekDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const typeColors: Record<string, string> = {
  class: "bg-success/10 text-success border-success/30",
  activity: "bg-primary/10 text-primary border-primary/30",
  event: "bg-highlight/10 text-highlight-foreground border-highlight/30",
  holiday: "bg-secondary text-secondary-foreground border-secondary",
};

const typeLabels: Record<string, string> = {
  class: "Kelas",
  activity: "Kegiatan",
  event: "Acara",
  holiday: "Libur",
};

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h} jam` : `${h} jam ${m} menit`;
  }
  return `${minutes} menit`;
}

interface ScheduleFormState {
  id?: string;
  title: string;
  classId: string; // "all" = Semua Kelas
  dayOfWeek: number;
  startTime: string;
  durationMinutes: string;
  location: string;
  type: string;
}

const emptyForm: ScheduleFormState = {
  title: "",
  classId: "all",
  dayOfWeek: 1,
  startTime: "08:00",
  durationMinutes: "30",
  location: "",
  type: "class",
};

interface ScheduleProps {
  schedules: ScheduleRow[];
  classOptions: { id: string; name: string }[];
}

export default function Schedule({ schedules, classOptions }: ScheduleProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ScheduleFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Senin minggu ini (basis WIB)
  const monday = useMemo(() => {
    const today = new Date(`${todayInWib()}T00:00:00`);
    return startOfWeek(today, { weekStartsOn: 1 });
  }, []);
  const weekLabel = useMemo(
    () =>
      `${format(monday, "d", { locale: idLocale })} - ${format(addDays(monday, 5), "d MMMM yyyy", { locale: idLocale })}`,
    [monday]
  );
  const todayDow = useMemo(() => new Date(`${todayInWib()}T00:00:00`).getDay(), []);

  const byDay = useMemo(() => {
    const map: Record<number, ScheduleRow[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    schedules.forEach((s) => {
      if (s.isActive && map[s.dayOfWeek]) map[s.dayOfWeek].push(s);
    });
    return map;
  }, [schedules]);

  const openCreate = (dayOfWeek: number) => {
    setForm({ ...emptyForm, dayOfWeek });
    setFormOpen(true);
  };

  const openEdit = (s: ScheduleRow) => {
    setForm({
      id: s.id,
      title: s.title,
      classId: s.classId ?? "all",
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      durationMinutes: String(s.durationMinutes),
      location: s.location ?? "",
      type: s.type,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: form.title,
        classId: form.classId === "all" ? null : form.classId,
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        durationMinutes: Number(form.durationMinutes),
        location: form.location,
        type: form.type,
      };
      if (form.id) {
        await updateClassSchedule(form.id, payload);
        toast({ title: "Jadwal diperbarui" });
      } else {
        await createClassSchedule(payload);
        toast({ title: "Kegiatan ditambahkan" });
      }
      setFormOpen(false);
      startTransition(() => router.refresh());
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Gagal menyimpan jadwal",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (s: ScheduleRow) => {
    try {
      await toggleClassScheduleActive(s.id, !s.isActive);
      toast({ title: s.isActive ? "Kegiatan dinonaktifkan" : "Kegiatan diaktifkan" });
      startTransition(() => router.refresh());
    } catch (e) {
      const err = e as Error;
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteClassSchedule(deleteTarget.id);
      toast({ title: "Kegiatan dihapus" });
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } catch (e) {
      const err = e as Error;
      toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderEventCard = (event: ScheduleRow, compact: boolean) => (
    <div className={`p-2 rounded-lg border ${typeColors[event.type] ?? typeColors.class}`}>
      <div className={compact ? "" : "flex items-start justify-between gap-1"}>
        <p className="font-medium text-xs">{event.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5" aria-label="Opsi kegiatan">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(event)}>
              <Pencil className="h-3 w-3 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggle(event)}>
              <Power className="h-3 w-3 mr-2" /> {event.isActive ? "Nonaktifkan" : "Aktifkan"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteTarget(event)}
            >
              <Trash2 className="h-3 w-3 mr-2" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
        <Clock className="h-3 w-3" />
        <span>
          {event.startTime} · {formatDuration(event.durationMinutes)}
        </span>
      </div>
      <p className="text-xs opacity-80 mt-1">{event.classId ? event.className : "Semua Kelas"}</p>
      {event.location && (
        <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
          <MapPin className="h-3 w-3" />
          <span>{event.location}</span>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout
      title="Jadwal Kelas"
      subtitle="Kelola jadwal kegiatan mingguan berulang"
    >
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Minggu {weekLabel}</span>
        </div>
        <Button variant="hero" size="sm" onClick={() => openCreate(todayDow >= 1 && todayDow <= 6 ? todayDow : 1)}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Tambah Kegiatan</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      {/* Weekly Schedule - Desktop */}
      <div className="hidden lg:grid grid-cols-6 gap-4">
        {weekDays.map((day, index) => {
          const dow = index + 1;
          return (
            <Card key={day} className={todayDow === dow ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-center">
                  <span className="block text-muted-foreground">{fullWeekDays[index]}</span>
                  <span className="text-lg">{format(addDays(monday, index), "d")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {byDay[dow]?.length > 0 ? (
                  byDay[dow].map((event) => <div key={event.id}>{renderEventCard(event, true)}</div>)
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-xs">
                    Tidak ada kegiatan
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => openCreate(dow)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Tambah
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly Schedule - Mobile */}
      <div className="lg:hidden space-y-4">
        {weekDays.map((day, index) => {
          const dow = index + 1;
          return (
            <Card key={day}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {fullWeekDays[index]}, {format(addDays(monday, index), "d MMM", { locale: idLocale })}
                  </CardTitle>
                  {todayDow === dow && <Badge variant="default">Hari Ini</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                {byDay[dow]?.length > 0 ? (
                  <div className="space-y-3">
                    {byDay[dow].map((event) => (
                      <div key={event.id}>{renderEventCard(event, false)}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Tidak ada kegiatan
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs text-muted-foreground"
                  onClick={() => openCreate(dow)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Tambah kegiatan
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Kegiatan" : "Tambah Kegiatan"}</DialogTitle>
            <DialogDescription>
              Jadwal mingguan berulang untuk {fullWeekDays[form.dayOfWeek - 1]}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="sched-title">Judul</Label>
              <Input
                id="sched-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="cth. Circle Time"
                maxLength={120}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {classOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Hari</Label>
                <Select
                  value={String(form.dayOfWeek)}
                  onValueChange={(v) => setForm({ ...form, dayOfWeek: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weekDays.map((d, i) => (
                      <SelectItem key={d} value={String(i + 1)}>
                        {fullWeekDays[i]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="sched-time">Mulai</Label>
                <Input
                  id="sched-time"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sched-duration">Durasi (menit)</Label>
                <Input
                  id="sched-duration"
                  type="number"
                  min={5}
                  max={480}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sched-location">Lokasi (opsional)</Label>
                <Input
                  id="sched-location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="cth. Ruang Kelas 1"
                />
              </div>
              <div className="space-y-1">
                <Label>Tipe</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !form.title.trim()}>
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
            <AlertDialogTitle>Hapus kegiatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Kegiatan &ldquo;{deleteTarget?.title}&rdquo; akan dihapus dari jadwal. Tindakan ini
              tidak dapat dibatalkan.
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
