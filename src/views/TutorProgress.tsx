"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Upload, Camera, Check, 
  Utensils, Moon, Smile, BookOpen,
  Users, FileText, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createDailyReport, type MyStudentItem } from "@/server/actions/dailyReports";

export interface TutorProgressProps {
  students: MyStudentItem[];
  today: string;
}

const moodOptions = ["😊 Senang", "😐 Biasa", "😢 Sedih", "😴 Lelah", "🤒 Kurang Sehat"];
const mealOptions = ["Habis", "Setengah", "Sedikit", "Tidak Makan"];
const napOptions = ["Tidur Nyenyak", "Tidur Sebentar", "Sulit Tidur", "Tidak Tidur"];

export default function TutorProgress({ students, today }: TutorProgressProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [moodValue, setMoodValue] = useState("");
  const [mealValue, setMealValue] = useState("");
  const [napValue, setNapValue] = useState("");
  const [activities, setActivities] = useState("");
  const [notes, setNotes] = useState("");

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  };

  const resetForm = () => {
    setSelectedStudents([]);
    setMoodValue("");
    setMealValue("");
    setNapValue("");
    setActivities("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (selectedStudents.length === 0) {
      toast.error("Pilih minimal satu siswa");
      return;
    }
    if (!activities.trim() && !notes.trim()) {
      toast.error("Isi aktivitas atau catatan");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createDailyReport({
          studentIds: selectedStudents,
          reportDate: today,
          mood: moodValue.trim() || undefined,
          meals: mealValue.trim() || undefined,
          nap: napValue.trim() || undefined,
          activities: activities.trim() || undefined,
          notes: notes.trim() || undefined,
        });

        toast.success(`Laporan untuk ${res.created} siswa terkirim`);
        resetForm();
        router.refresh();
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan laporan";
        toast.error(errorMsg);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Link href="/tutor">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Upload Laporan Progress</h1>
            <p className="text-xs text-muted-foreground">Buat laporan harian siswa</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Select Students */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Pilih Siswa
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Laporan akan dibuat untuk setiap siswa yang dipilih
                </p>
              </div>
              {students.length > 0 && (
                <Button variant="outline" size="sm" onClick={selectAll} disabled={isPending}>
                  {selectedStudents.length === students.length ? "Batal Semua" : "Pilih Semua"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                <p className="text-sm">Belum ada siswa yang ditugaskan di kelas Anda.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {students.map((student) => {
                    const isSelected = selectedStudents.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => !isPending && toggleStudent(student.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (!isPending) toggleStudent(student.id);
                          }
                        }}
                        className={cn(
                          "relative flex flex-col justify-between p-3 rounded-xl border-2 cursor-pointer transition-all text-left",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50",
                          isPending && "opacity-70 pointer-events-none"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate text-foreground">
                              {student.name}
                            </p>
                            {student.className && (
                              <p className="text-xs text-muted-foreground truncate">
                                {student.className}
                              </p>
                            )}
                          </div>
                        </div>

                        {student.hasReportToday && (
                          <div className="mt-2 pt-1 border-t border-border/60">
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground bg-muted w-full justify-center truncate"
                            >
                              Sudah dilaporkan hari ini
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {selectedStudents.length > 0 && (
                  <p className="text-sm text-primary mt-3 font-medium">
                    {selectedStudents.length} siswa dipilih
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Mood */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Smile className="w-5 h-5 text-amber-500" />
              Mood Anak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((mood) => (
                <button
                  type="button"
                  key={mood}
                  onClick={() => setMoodValue((prev) => (prev === mood ? "" : mood))}
                  disabled={isPending}
                  className={cn(
                    "px-4 py-2 rounded-full border-2 text-sm transition-all font-medium",
                    moodValue === mood
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border hover:border-primary/50 text-foreground bg-card"
                  )}
                >
                  {mood}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Makan & Tidur */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-500" />
                Status Makan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mealOptions.map((meal) => (
                  <button
                    type="button"
                    key={meal}
                    onClick={() => setMealValue((prev) => (prev === meal ? "" : meal))}
                    disabled={isPending}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full border-2 text-xs sm:text-sm transition-all font-medium",
                      mealValue === meal
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border hover:border-primary/50 text-foreground bg-card"
                    )}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Moon className="w-5 h-5 text-blue-500" />
                Status Tidur Siang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {napOptions.map((nap) => (
                  <button
                    type="button"
                    key={nap}
                    onClick={() => setNapValue((prev) => (prev === nap ? "" : nap))}
                    disabled={isPending}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full border-2 text-xs sm:text-sm transition-all font-medium",
                      napValue === nap
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border hover:border-primary/50 text-foreground bg-card"
                    )}
                  >
                    {nap}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              Aktivitas & Pembelajaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ceritakan aktivitas bermain, sensorik, motorik, atau materi belajar hari ini..."
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isPending}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Catatan Tambahan untuk Orang Tua
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Catatan kondisi khusus anak, konsumsi obat, baju ganti, atau pesan penting untuk orang tua..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[90px] resize-none"
              disabled={isPending}
            />
          </CardContent>
        </Card>

        {/* Photo Upload Placeholder */}
        <Card className="border-border bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
              <Camera className="w-5 h-5" />
              Foto Kegiatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-border bg-muted/50 p-6 text-center">
              <Camera className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                Unggah foto — menyusul
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Fitur penyimpanan foto kegiatan akan tersedia pada pembaruan mendatang.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full h-12 text-base font-semibold"
          size="lg"
          disabled={isPending || students.length === 0}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Mengirim Laporan...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Kirim Laporan
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
