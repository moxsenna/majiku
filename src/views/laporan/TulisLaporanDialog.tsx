"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createDailyReport } from "@/server/actions/dailyReports";

const MAKS_FOTO = 6;
const TIPE = ["image/jpeg", "image/png", "image/webp"];

function Field({ id, label, children }: { id: string; label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

/**
 * Tulis laporan harian (action lama createDailyReport). Bisa beberapa anak sekaligus — isi yang sama terkirim
 * ke tiap anak; anak yang sudah punya laporan tanggal itu dilewati oleh action.
 */
export function TulisLaporanDialog({
  open,
  onOpenChange,
  tanggal,
  anak,
  terpilihAwal,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tanggal: string;
  /** Anak yang belum punya laporan di tanggal ini */
  anak: { id: string; name: string }[];
  terpilihAwal: string[];
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [pilih, setPilih] = useState<string[]>([]);
  const [isi, setIsi] = useState({ mood: "", meals: "", nap: "", activities: "", notes: "" });
  const [foto, setFoto] = useState<string[]>([]);
  const [unggah, setUnggah] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setPilih(terpilihAwal);
    setIsi({ mood: "", meals: "", nap: "", activities: "", notes: "" });
    setFoto([]);
  }, [open, terpilihAwal]);

  const set = (k: keyof typeof isi) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setIsi((v) => ({ ...v, [k]: e.target.value }));

  const pilihFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    if (foto.length + files.length > MAKS_FOTO) {
      toast({ title: `Maksimal ${MAKS_FOTO} foto per laporan`, variant: "destructive" });
      return;
    }
    const salah = files.find((f) => !TIPE.includes(f.type) || f.size > 5 * 1024 * 1024);
    if (salah) {
      toast({ title: "Foto tidak bisa dipakai", description: `${salah.name}: harus JPG/PNG/WebP maks. 5 MB.`, variant: "destructive" });
      return;
    }
    setUnggah(true);
    try {
      const fd = new FormData();
      fd.append("prefix", "reports");
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/photos", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto");
      if (Array.isArray(data.keys)) setFoto((p) => [...p, ...data.keys]);
    } catch (err) {
      toast({ title: "Gagal mengunggah foto", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
    } finally {
      setUnggah(false);
    }
  };

  const kirim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilih.length) {
      toast({ title: "Pilih minimal satu anak", variant: "destructive" });
      return;
    }
    if (!isi.activities.trim() && !isi.notes.trim()) {
      toast({ title: "Isi kegiatan atau catatan", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        const res = await createDailyReport({
          studentIds: pilih,
          reportDate: tanggal,
          mood: isi.mood.trim() || null,
          meals: isi.meals.trim() || null,
          nap: isi.nap.trim() || null,
          activities: isi.activities.trim() || null,
          notes: isi.notes.trim() || null,
          photos: foto.length ? foto : null,
        });
        toast({ title: `Laporan terkirim ke ${res.created} anak` });
        onOpenChange(false);
        qc.invalidateQueries({ queryKey: ["laporan-harian"] });
      } catch (err) {
        toast({ title: "Gagal mengirim laporan", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
      }
    });
  };

  const semua = anak.length > 0 && pilih.length === anak.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={kirim} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Tulis laporan</DialogTitle>
            <DialogDescription>Terkirim ke aplikasi orang tua begitu disimpan. Isi yang sama dipakai untuk tiap anak terpilih.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Anak · {pilih.length} dipilih</span>
              {anak.length > 1 && (
                <Button type="button" variant="txt" size="sm" onClick={() => setPilih(semua ? [] : anak.map((a) => a.id))}>
                  {semua ? "Kosongkan" : "Pilih semua"}
                </Button>
              )}
            </div>
            {anak.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">Semua anak di kelas ini sudah punya laporan untuk tanggal ini.</p>
            ) : (
              <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded border border-border p-2 max-[560px]:grid-cols-1">
                {anak.map((a) => (
                  <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted">
                    <Checkbox
                      checked={pilih.includes(a.id)}
                      onCheckedChange={() => setPilih((p) => (p.includes(a.id) ? p.filter((x) => x !== a.id) : [...p, a.id]))}
                    />
                    <span className="truncate">{a.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="l-makan" label="Makan">
              <Input id="l-makan" value={isi.meals} onChange={set("meals")} placeholder="Contoh: ½ porsi bubur" />
            </Field>
            <Field id="l-tidur" label="Tidur">
              <Input id="l-tidur" value={isi.nap} onChange={set("nap")} placeholder="Contoh: 12.30–14.00, nyenyak" />
            </Field>
          </div>
          <Field id="l-main" label="Kegiatan">
            <Textarea id="l-main" rows={2} value={isi.activities} onChange={set("activities")} placeholder="Contoh: Menanam biji kacang hijau" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="l-mood" label="Suasana hati">
              <Input id="l-mood" value={isi.mood} onChange={set("mood")} placeholder="Contoh: Ceria" />
            </Field>
            <Field id="l-catatan" label="Catatan untuk orang tua">
              <Input id="l-catatan" value={isi.notes} onChange={set("notes")} />
            </Field>
          </div>

          <div className="flex flex-col gap-2">
            <span className="flex items-center justify-between text-sm font-semibold">
              Foto <span className="tabular text-[13px] font-normal text-muted-foreground">{foto.length}/{MAKS_FOTO}</span>
            </span>
            <input ref={fileRef} type="file" multiple accept={TIPE.join(",")} className="hidden" onChange={pilihFile} />
            {foto.length > 0 && (
              <div className="grid grid-cols-6 gap-2 max-[560px]:grid-cols-3">
                {foto.map((k, i) => (
                  <span key={k} className="relative aspect-square overflow-hidden rounded-input bg-muted">
                    <img src={`/api/photos/${k}`} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Buang foto"
                      onClick={() => setFoto((p) => p.filter((x) => x !== k))}
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-foreground/80 text-background"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {foto.length < MAKS_FOTO && (
              <Button type="button" variant="sec" size="sm" onClick={() => fileRef.current?.click()} disabled={unggah || isPending}>
                {unggah ? <Loader2 className="animate-spin" aria-hidden /> : <Upload aria-hidden />}
                {unggah ? "Mengunggah…" : "Tambah foto"}
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="sec" onClick={() => onOpenChange(false)} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || unggah || pilih.length === 0}>
              {isPending ? "Mengirim…" : `Kirim ke ${pilih.length} anak`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
