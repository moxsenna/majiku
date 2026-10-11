"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Calendar,
  Utensils,
  Moon,
  Smile,
  Activity,
  FileText,
  MoreVertical,
  Trash2,
  Loader2,
  Clock,
  Sparkles,
  Camera,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { todayInWib } from "@/lib/datetime";
import {
  createDailyReport,
  deleteDailyReport,
  type DailyReportItem,
  type StudentOption,
} from "@/server/actions/dailyReports";

interface DailyReportsProps {
  initialReports: DailyReportItem[];
  studentOptions: StudentOption[];
  selectedDate: string;
}

function formatReportTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
}

function formatReportDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function DailyReports({
  initialReports,
  studentOptions,
  selectedDate,
}: DailyReportsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [createOpen, setCreateOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [reportDate, setReportDate] = useState(selectedDate);
  const [mood, setMood] = useState("");
  const [meals, setMeals] = useState("");
  const [nap, setNap] = useState("");
  const [activities, setActivities] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = todayInWib();

  const resetForm = () => {
    setStudentId("");
    setReportDate(selectedDate);
    setMood("");
    setMeals("");
    setNap("");
    setActivities("");
    setNotes("");
    setPhotos([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    e.target.value = "";

    if (photos.length + files.length > 6) {
      toast({
        title: "Batas foto tercapai",
        description: `Maksimal 6 foto per laporan (tersisa kuota ${6 - photos.length})`,
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Format tidak didukung",
          description: `Format file "${file.name}" harus JPG/PNG/WebP`,
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Ukuran terlalu besar",
          description: `Ukuran file "${file.name}" melebihi batas 5MB`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("prefix", "reports");
      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah foto");
      }

      if (Array.isArray(data.keys)) {
        setPhotos((prev) => [...prev, ...data.keys]);
        toast({
          title: "Foto terunggah",
          description: `${data.keys.length} foto berhasil diunggah`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto";
      toast({
        title: "Gagal mengunggah foto",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      toast({
        title: "Validasi gagal",
        description: "Pilih siswa terlebih dahulu",
        variant: "destructive",
      });
      return;
    }
    if (!reportDate) {
      toast({
        title: "Validasi gagal",
        description: "Tanggal laporan wajib diisi",
        variant: "destructive",
      });
      return;
    }
    if (!activities.trim() && !notes.trim()) {
      toast({
        title: "Validasi gagal",
        description: "Isi aktivitas atau catatan",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        await createDailyReport({
          studentIds: [studentId],
          reportDate,
          mood: mood.trim() || null,
          meals: meals.trim() || null,
          nap: nap.trim() || null,
          activities: activities.trim() || null,
          notes: notes.trim() || null,
          photos: photos.length > 0 ? photos : null,
        });

        toast({
          title: "Laporan tersimpan",
          description: "Laporan harian berhasil dibuat dan dikirim.",
        });

        setCreateOpen(false);
        resetForm();
        router.refresh();
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan laporan";
        toast({
          title: "Gagal menyimpan laporan",
          description: errorMsg,
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus laporan harian untuk ${name}?`)) return;

    startTransition(async () => {
      try {
        await deleteDailyReport(id);
        toast({
          title: "Laporan dihapus",
          description: `Laporan untuk ${name} berhasil dihapus.`,
        });
        router.refresh();
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menghapus laporan";
        toast({
          title: "Gagal menghapus",
          description: errorMsg,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <DashboardLayout
      title="Laporan Harian"
      subtitle="Timeline aktivitas dan perkembangan anak"
    >
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <form
          action="/daily-reports"
          method="get"
          className="flex flex-wrap items-center gap-2 sm:gap-3"
        >
          <div className="flex items-center gap-2">
            <Input
              type="date"
              name="date"
              defaultValue={selectedDate}
              className="w-40 sm:w-44"
              aria-label="Filter tanggal laporan"
            />
            <Button type="submit" variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1.5" />
              Filter
            </Button>
            {selectedDate !== today && (
              <a
                href="/daily-reports"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Hari Ini
              </a>
            )}
          </div>
        </form>

        <Button
          variant="hero"
          size="sm"
          onClick={() => {
            setReportDate(selectedDate);
            setCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Tulis Laporan</span>
        </Button>
      </div>

      {/* Date Header Indicator */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Menampilkan laporan untuk:{" "}
          <strong className="text-foreground">
            {formatReportDate(selectedDate)}
          </strong>{" "}
          ({initialReports.length} laporan)
        </p>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4 max-w-3xl">
        {initialReports.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  Belum ada laporan harian
                </p>
                <p className="text-sm text-muted-foreground">
                  Tidak ada laporan yang dicatat untuk tanggal{" "}
                  {formatReportDate(selectedDate)}.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setReportDate(selectedDate);
                  setCreateOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Tulis Laporan Sekarang
              </Button>
            </CardContent>
          </Card>
        ) : (
          initialReports.map((report) => (
            <Card key={report.id} variant="interactive" className="border-border">
              <CardContent className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      {report.studentAvatar && (
                        <AvatarImage src={report.studentAvatar} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {report.studentName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground text-base">
                        {report.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        {report.className && <span>{report.className} &bull;</span>}
                        <Clock className="h-3 w-3 inline" />
                        <span>
                          {report.createdAt
                            ? formatReportTime(report.createdAt)
                            : report.reportDate}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        report.status === "submitted" ? "default" : "secondary"
                      }
                    >
                      {report.status === "submitted" ? "Terkirim" : "Draft"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={isPending}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() =>
                            handleDelete(report.id, report.studentName)
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus Laporan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Report Sections */}
                <div className="space-y-3 mt-3 text-sm">
                  {report.mood && (
                    <div className="flex items-start gap-2.5 bg-highlight/10 p-2.5 rounded-lg border border-highlight/20">
                      <Smile className="h-4 w-4 text-highlight shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground text-xs block">
                          Mood & Emosi
                        </span>
                        <p className="text-foreground/90 text-sm mt-0.5">
                          {report.mood}
                        </p>
                      </div>
                    </div>
                  )}

                  {report.meals && (
                    <div className="flex items-start gap-2.5 bg-success/10 p-2.5 rounded-lg border border-success/20">
                      <Utensils className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground text-xs block">
                          Makan & Minum
                        </span>
                        <p className="text-foreground/90 text-sm mt-0.5">
                          {report.meals}
                        </p>
                      </div>
                    </div>
                  )}

                  {report.nap && (
                    <div className="flex items-start gap-2.5 bg-info/10 p-2.5 rounded-lg border border-info/20">
                      <Moon className="h-4 w-4 text-info shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground text-xs block">
                          Tidur Siang
                        </span>
                        <p className="text-foreground/90 text-sm mt-0.5">
                          {report.nap}
                        </p>
                      </div>
                    </div>
                  )}

                  {report.activities && (
                    <div className="flex items-start gap-2.5 bg-primary/10 p-2.5 rounded-lg border border-primary/20">
                      <Activity className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground text-xs block">
                          Aktivitas & Pembelajaran
                        </span>
                        <p className="text-foreground/90 text-sm mt-0.5">
                          {report.activities}
                        </p>
                      </div>
                    </div>
                  )}

                  {report.notes && (
                    <div className="flex items-start gap-2.5 bg-muted/60 p-2.5 rounded-lg border border-border">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground text-xs block">
                          Catatan Guru
                        </span>
                        <p className="text-foreground/90 text-sm mt-0.5 whitespace-pre-wrap">
                          {report.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {Array.isArray(report.photos) && report.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {report.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={
                            photo.startsWith("http") || photo.startsWith("/")
                              ? photo
                              : `/api/photos/${photo}`
                          }
                          alt={`Foto aktivitas ${i + 1}`}
                          className="rounded-lg object-cover w-full h-36"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog Tulis Laporan */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Tulis Laporan Harian
            </DialogTitle>
            <DialogDescription>
              Catat perkembangan, makanan, tidur, dan aktivitas anak untuk hari ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 mt-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="report-student">Pilih Siswa *</Label>
                <Select
                  value={studentId}
                  onValueChange={setStudentId}
                  disabled={isPending || studentOptions.length === 0}
                >
                  <SelectTrigger id="report-student">
                    <SelectValue
                      placeholder={
                        studentOptions.length === 0
                          ? "Belum ada siswa aktif"
                          : "Pilih Siswa"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {studentOptions.map((stu) => (
                      <SelectItem key={stu.id} value={stu.id}>
                        {stu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {studentOptions.length === 0 && (
                  <p className="text-[11px] text-destructive">
                    Belum ada siswa aktif terdaftar.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-date">Tanggal Laporan *</Label>
                <Input
                  id="report-date"
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-mood">Mood & Suasana Hati</Label>
                <Input
                  id="report-mood"
                  placeholder="Contoh: Ceria, bersemangat bermain dengan teman"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-meals">Makan & Minum</Label>
                <Input
                  id="report-meals"
                  placeholder="Contoh: Habis 1 porsi nasi, sayur bayam, dan ayam. Minum air cukup."
                  value={meals}
                  onChange={(e) => setMeals(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-nap">Tidur Siang</Label>
                <Input
                  id="report-nap"
                  placeholder="Contoh: Tidur 1.5 jam (12:30 - 14:00), bangun tanpa rewel."
                  value={nap}
                  onChange={(e) => setNap(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-activities">Aktivitas & Pembelajaran</Label>
                <Textarea
                  id="report-activities"
                  placeholder="Contoh: Menggambar dengan krayon, menyusun balok lego, melatih sensorik pasir kinetik."
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  disabled={isPending}
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-notes">Catatan Tambahan untuk Orang Tua</Label>
                <Textarea
                  id="report-notes"
                  placeholder="Contoh: Anak sempat terantuk pelan di karpet tapi tidak ada luka. Baju ganti sudah dipakai 1 set."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isPending}
                  rows={2}
                />
              </div>

              {/* Upload Foto */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-primary" />
                    Foto Dokumentasi Kegiatan
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {photos.length}/6 foto
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  disabled={isPending || isUploading || photos.length >= 6}
                />

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((key, idx) => (
                      <div
                        key={key}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border group bg-muted"
                      >
                        <img
                          src={`/api/photos/${key}`}
                          alt={`Foto kegiatan ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          disabled={isPending || isUploading}
                          aria-label="Hapus foto"
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-opacity shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {photos.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending || isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {isUploading ? "Mengunggah..." : "Tambah Foto Kegiatan"}
                  </Button>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending || studentOptions.length === 0}
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Kirim Laporan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
