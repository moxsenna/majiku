"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Frown, Loader2, Meh, Moon, Smile, SmilePlus, Sparkles, StickyNote, Thermometer, Utensils, UsersRound, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatTanggal } from "@/lib/format";
import { KidAvatar, MobileSubHeader } from "@/components/bunayo";
import { createDailyReport, type MyStudentItem } from "@/server/actions/dailyReports";

export interface TutorProgressProps {
  students: MyStudentItem[];
  today: string;
}

const MOOD: { value: string; icon: LucideIcon }[] = [
  { value: "Senang", icon: Smile },
  { value: "Biasa", icon: Meh },
  { value: "Sedih", icon: Frown },
  { value: "Lelah", icon: Moon },
  { value: "Kurang Sehat", icon: Thermometer },
];
const MAKAN = ["Habis", "Setengah", "Sedikit", "Tidak Makan"];
const TIDUR = ["Tidur Nyenyak", "Tidur Sebentar", "Sulit Tidur", "Tidak Tidur"];

/** Grup chip pilihan satu ketukan; terpilih = pil Tinta. */
function Chips({
  options,
  value,
  onPick,
  disabled,
}: {
  options: string[];
  value: string;
  onPick: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onPick(o)}
            disabled={disabled}
            aria-pressed={on}
            className={cn(
              "press min-h-9 rounded-full px-3.5 text-sm font-semibold transition-colors disabled:opacity-60",
              on ? "bg-nav-active text-nav-active-foreground" : "bg-muted text-foreground hover:bg-border",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** GV3/G5/G6: kirim kabar harian banyak anak dalam satu ketukan per grup pilihan. */
export default function TutorProgress({ students, today }: TutorProgressProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [moodValue, setMoodValue] = useState("");
  const [mealValue, setMealValue] = useState("");
  const [napValue, setNapValue] = useState("");
  const [activities, setActivities] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleStudent = (id: string) =>
    setSelectedStudents((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const selectAll = () => {
    if (selectedStudents.length === students.length) setSelectedStudents([]);
    else setSelectedStudents(students.map((s) => s.id));
  };

  const resetForm = () => {
    setSelectedStudents([]);
    setMoodValue("");
    setMealValue("");
    setNapValue("");
    setActivities("");
    setNotes("");
    setPhotos([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    // Reset input agar memilih file yang sama memicu event lagi.
    e.target.value = "";

    if (photos.length + files.length > 6) {
      toast.error(`Maksimal 6 foto per laporan (tersisa kuota ${6 - photos.length})`);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Format file "${file.name}" harus JPG/PNG/WebP`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Ukuran file "${file.name}" melebihi batas 5MB`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("prefix", "reports");
      for (const file of files) formData.append("files", file);

      const res = await fetch("/api/photos", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto");

      if (Array.isArray(data.keys)) {
        setPhotos((prev) => [...prev, ...data.keys]);
        toast.success(`${data.keys.length} foto berhasil diunggah`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (selectedStudents.length === 0) {
      toast.error("Pilih minimal satu anak");
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
          photos: photos.length > 0 ? photos : undefined,
        });

        toast.success(`Kabar untuk ${res.created} anak terkirim`);
        resetForm();
        router.refresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan laporan";
        toast.error(msg);
      }
    });
  };

  const selesai = students.filter((s) => s.hasReportToday).length;

  return (
    <>
      <MobileSubHeader title="Kirim kabar" eyebrow={`Kabar harian ${formatTanggal(today)}`} backHref="/tutor" />

      <div className="flex flex-col gap-4 px-4 pb-4">
        {/* Anak */}
        <section className="flex flex-col gap-2.5 rounded-sheet bg-card p-4" aria-labelledby="pilih-anak">
          <div className="flex items-center justify-between gap-2">
            <h2 id="pilih-anak" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
              <UsersRound className="h-5 w-5 text-langit-ink" aria-hidden /> Pilih anak
            </h2>
            {students.length > 0 && (
              <button type="button" onClick={selectAll} disabled={isPending} className="text-sm font-semibold text-primary">
                {selectedStudents.length === students.length ? "Batal semua" : "Pilih semua"}
              </button>
            )}
          </div>
          {students.length === 0 ? (
            <p className="py-3 text-sm text-foreground-2">Belum ada anak yang ditugaskan di kelas Anda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {students.map((s) => {
                const on = selectedStudents.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => !isPending && toggleStudent(s.id)}
                    disabled={isPending}
                    aria-pressed={on}
                    className={cn(
                      "press relative flex items-center gap-2.5 rounded-[16px] p-2.5 text-left transition-colors",
                      on ? "bg-primary-soft ring-2 ring-primary" : "bg-muted hover:bg-border",
                      isPending && "opacity-70 pointer-events-none",
                    )}
                  >
                    <KidAvatar id={s.id} name={s.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm">{s.name.split(" ")[0]}</b>
                      {s.className && <small className="block truncate text-[11px] text-muted-foreground">{s.className}</small>}
                    </span>
                    {on && (
                      <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-nav-active">
                        <Check className="h-3 w-3 text-nav-active-foreground" aria-hidden />
                      </span>
                    )}
                    {s.hasReportToday && (
                      <span className="absolute inset-x-2.5 bottom-1.5 block truncate text-[10px] font-medium text-muted-foreground">
                        Sudah terkirim
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {selectedStudents.length > 0 && (
            <p className="tabular text-sm font-medium text-primary">{selectedStudents.length} anak dipilih</p>
          )}
          {selesai > 0 && selectedStudents.length === 0 && (
            <p className="text-[13px] text-daun-ink">{selesai} dari {students.length} anak sudah ada kabarnya hari ini</p>
          )}
        </section>

        {/* Pilihan cepat */}
        <section className="flex flex-col gap-3 rounded-sheet bg-card p-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <SmilePlus className="h-5 w-5 text-matahari-ink" aria-hidden /> Kabar singkat
          </h2>
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-muted-foreground">Suasana hati</p>
            <div className="flex flex-wrap gap-1.5">
              {MOOD.map(({ value, icon: Icon }) => {
                const on = moodValue === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMoodValue((p) => (p === value ? "" : value))}
                    disabled={isPending}
                    aria-pressed={on}
                    className={cn(
                      "press inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors disabled:opacity-60",
                      on ? "bg-nav-active text-nav-active-foreground" : "bg-muted text-foreground hover:bg-border",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden /> {value}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-muted-foreground">Makan</p>
            <Chips options={MAKAN} value={mealValue} onPick={(v) => setMealValue((p) => (p === v ? "" : v))} disabled={isPending} />
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-muted-foreground">Tidur siang</p>
            <Chips options={TIDUR} value={napValue} onPick={(v) => setNapValue((p) => (p === v ? "" : v))} disabled={isPending} />
          </div>
        </section>

        {/* Cerita */}
        <section className="flex flex-col gap-3 rounded-sheet bg-card p-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
              <Sparkles className="h-5 w-5 text-daun-ink" aria-hidden /> Kegiatan hari ini
            </h2>
            <textarea
              placeholder="Main apa hari ini? Sensorik, motorik, lagu, atau materi belajar…"
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              rows={3}
              disabled={isPending}
              className="mt-2 w-full rounded-[16px] border border-input bg-background px-3.5 py-2.5 text-[15px] leading-relaxed placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft disabled:opacity-60"
            />
          </div>
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
              <StickyNote className="h-5 w-5 text-anggur-ink" aria-hidden /> Catatan untuk orang tua
            </h2>
            <textarea
              placeholder="Obat, baju ganti, atau pesan penting…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              disabled={isPending}
              className="mt-2 w-full rounded-[16px] border border-input bg-background px-3.5 py-2.5 text-[15px] leading-relaxed placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft disabled:opacity-60"
            />
          </div>
        </section>

        {/* Foto */}
        <section className="flex flex-col gap-3 rounded-sheet bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
              <Camera className="h-5 w-5 text-langit-ink" aria-hidden /> Foto kegiatan
            </h2>
            <span className="tabular text-[13px] text-muted-foreground">{photos.length}/6</span>
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
            <div className="grid grid-cols-3 gap-1.5">
              {photos.map((key, idx) => (
                <div key={key} className="relative aspect-square overflow-hidden rounded-[12px] bg-muted">
                  <img src={`/api/photos/${key}`} alt={`Foto kegiatan ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    disabled={isPending || isUploading}
                    aria-label="Hapus foto"
                    className="absolute right-1 top-1 rounded-full bg-[hsl(249_26%_14%/.7)] p-1 text-[hsl(40_60%_96%)]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < 6 && (
            <button
              type="button"
              onClick={() => !isPending && !isUploading && fileInputRef.current?.click()}
              disabled={isPending || isUploading}
              className={cn(
                "flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-[16px] border-2 border-dashed border-border text-center transition-colors hover:border-primary/60 hover:bg-muted/40",
                (isPending || isUploading) && "opacity-60 pointer-events-none",
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
                  <p className="text-sm font-medium">Mengunggah foto…</p>
                </>
              ) : (
                <>
                  <Camera className="h-6 w-6 text-muted-foreground" aria-hidden />
                  <p className="text-sm font-semibold">{photos.length === 0 ? "Unggah foto kegiatan" : "Tambah foto lagi"}</p>
                  <p className="text-[11px] text-muted-foreground">JPG, PNG, WebP · maks 5MB · sisa {6 - photos.length} foto</p>
                </>
              )}
            </button>
          )}
        </section>

        {/* Kirim */}
        <div className="sticky bottom-[86px] z-10">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || isUploading || students.length === 0}
            className="press grid h-btn-lg w-full place-items-center rounded-full bg-nav-active text-base font-semibold text-nav-active-foreground shadow-float disabled:bg-disabled disabled:text-primary-foreground"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Mengirim…
              </span>
            ) : isUploading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Mengunggah foto…
              </span>
            ) : selectedStudents.length > 0 ? (
              `Kirim ke ${selectedStudents.length} anak`
            ) : (
              "Kirim kabar"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
