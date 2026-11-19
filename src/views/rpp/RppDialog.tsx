"use client";

import { useEffect, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createLessonPlan, deleteLessonPlan, updateLessonPlan } from "@/server/actions/lessonPlans";
import type { Rpp } from "@/server/actions/rpp";

export const LABEL_STATUS_RPP: Record<Rpp["status"], string> = {
  draft: "Draf",
  upcoming: "Direncanakan",
  in_progress: "Berjalan",
  completed: "Selesai",
};

function Field({ id, label, hint, children }: { id: string; label: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

type Kegiatan = { id: string; title: string; durationMinutes: string; completed: boolean };
type Form = {
  classId: string;
  planDate: string;
  title: string;
  subject: string;
  mulai: string;
  selesai: string;
  tujuan: string;
  bahan: string;
  status: Rpp["status"];
  kegiatan: Kegiatan[];
};

const kegiatanBaru = (): Kegiatan => ({ id: crypto.randomUUID(), title: "", durationMinutes: "30", completed: false });

/** Tambah/ubah satu RPP harian (action lama lessonPlans.ts). Kegiatan berurutan; jam tiap kegiatan dihitung dari jam mulai + durasi. */
export function RppDialog({
  rpp,
  awal,
  kelas,
  open,
  onOpenChange,
}: {
  rpp: Rpp | null;
  awal?: { classId?: string; planDate?: string; subject?: string };
  kelas: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [yakinHapus, setYakinHapus] = useState(false);
  const [form, setForm] = useState<Form>({
    classId: "",
    planDate: "",
    title: "",
    subject: "",
    mulai: "09:00",
    selesai: "",
    tujuan: "",
    bahan: "",
    status: "upcoming",
    kegiatan: [kegiatanBaru()],
  });

  useEffect(() => {
    if (!open) return;
    setYakinHapus(false);
    const [m, s] = (rpp?.timeRange ?? "").split(/\s*-\s*/);
    setForm(
      rpp
        ? {
            classId: rpp.classId,
            planDate: rpp.planDate,
            title: rpp.title,
            subject: rpp.subject ?? "",
            mulai: m || "",
            selesai: s || "",
            tujuan: rpp.objectives.join("\n"),
            bahan: rpp.materials.join(", "),
            status: rpp.status,
            kegiatan: rpp.activities.length
              ? rpp.activities.map((a) => ({ id: a.id, title: a.title, durationMinutes: String(a.durationMinutes), completed: a.completed }))
              : [kegiatanBaru()],
          }
        : {
            classId: awal?.classId ?? kelas[0]?.id ?? "",
            planDate: awal?.planDate ?? "",
            title: "",
            subject: awal?.subject ?? "",
            mulai: "09:00",
            selesai: "",
            tujuan: "",
            bahan: "",
            status: "upcoming",
            kegiatan: [kegiatanBaru()],
          },
    );
  }, [rpp, awal, kelas, open]);

  const selesai = (judul: string) => {
    toast({ title: judul });
    onOpenChange(false);
    qc.invalidateQueries({ queryKey: ["rpp-minggu"] });
  };
  const gagal = (judul: string, err: unknown) =>
    toast({ title: judul, description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const timeRange = form.mulai && form.selesai ? `${form.mulai} - ${form.selesai}` : null;
    if ((form.mulai || form.selesai) && !timeRange) {
      toast({ title: "Isi jam mulai dan selesai, atau kosongkan keduanya", variant: "destructive" });
      return;
    }
    const isi = {
      title: form.title,
      subject: form.subject || null,
      classId: form.classId,
      planDate: form.planDate,
      timeRange,
      objectives: form.tujuan.split("\n").map((t) => t.trim()).filter(Boolean),
      activities: form.kegiatan
        .filter((k) => k.title.trim())
        .map((k) => ({ id: k.id, title: k.title, durationMinutes: Number(k.durationMinutes), completed: k.completed })),
      materials: form.bahan.split(/[,\n]/).map((t) => t.trim()).filter(Boolean),
    };
    startTransition(async () => {
      try {
        if (rpp) await updateLessonPlan(rpp.id, { ...isi, status: form.status });
        else {
          const { id } = await createLessonPlan(isi);
          if (form.status !== "upcoming") await updateLessonPlan(id, { status: form.status });
        }
        selesai(rpp ? "RPP diperbarui" : "RPP ditambahkan");
      } catch (err) {
        gagal("Gagal menyimpan RPP", err);
      }
    });
  };

  const hapus = () =>
    startTransition(async () => {
      try {
        await deleteLessonPlan(rpp!.id);
        selesai("RPP dihapus");
      } catch (err) {
        gagal("Gagal menghapus", err);
      }
    });

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const ubahKegiatan = (id: string, patch: Partial<Kegiatan>) =>
    setForm((f) => ({ ...f, kegiatan: f.kegiatan.map((k) => (k.id === id ? { ...k, ...patch } : k)) }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{rpp ? "Ubah RPP" : "RPP baru"}</DialogTitle>
            <DialogDescription>Rencana kegiatan satu kelas untuk satu hari. Guru melihatnya di aplikasi sebelum kelas dimulai.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="r-kelas" label="Kelas">
              <Select value={form.classId} onValueChange={(v) => setForm((f) => ({ ...f, classId: v }))}>
                <SelectTrigger id="r-kelas">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelas.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="r-tanggal" label="Tanggal">
              <Input id="r-tanggal" type="date" value={form.planDate} onChange={set("planDate")} required />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="r-judul" label="Judul">
              <Input id="r-judul" value={form.title} onChange={set("title")} placeholder="Contoh: Menanam biji" maxLength={150} required />
            </Field>
            <Field id="r-tema" label="Tema (opsional)">
              <Input id="r-tema" value={form.subject} onChange={set("subject")} placeholder="Contoh: Tanaman di sekitarku" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-5 max-[560px]:grid-cols-2">
            <Field id="r-mulai" label="Mulai">
              <Input id="r-mulai" type="time" value={form.mulai} onChange={set("mulai")} />
            </Field>
            <Field id="r-selesai" label="Selesai">
              <Input id="r-selesai" type="time" value={form.selesai} onChange={set("selesai")} />
            </Field>
            <Field id="r-status" label="Status">
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Rpp["status"] }))}>
                <SelectTrigger id="r-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LABEL_STATUS_RPP).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Kegiatan berurutan</span>
            {form.kegiatan.map((k, i) => (
              <div key={k.id} className="flex items-center gap-2">
                {rpp && (
                  <Checkbox
                    checked={k.completed}
                    onCheckedChange={(v) => ubahKegiatan(k.id, { completed: v === true })}
                    aria-label={`Kegiatan ${i + 1} selesai`}
                  />
                )}
                <Input
                  aria-label={`Kegiatan ${i + 1}`}
                  value={k.title}
                  onChange={(e) => ubahKegiatan(k.id, { title: e.target.value })}
                  placeholder={i === 0 ? "Contoh: Lingkaran pagi" : "Kegiatan berikutnya"}
                  className="flex-1"
                />
                <Input
                  aria-label={`Durasi kegiatan ${i + 1} (menit)`}
                  type="number"
                  min={1}
                  max={240}
                  inputMode="numeric"
                  value={k.durationMinutes}
                  onChange={(e) => ubahKegiatan(k.id, { durationMinutes: e.target.value })}
                  className="w-[84px]"
                />
                <span className="text-[13px] text-muted-foreground">mnt</span>
                <Button
                  type="button"
                  variant="txt"
                  size="icon-sm"
                  aria-label={`Buang kegiatan ${i + 1}`}
                  disabled={form.kegiatan.length === 1}
                  onClick={() => setForm((f) => ({ ...f, kegiatan: f.kegiatan.filter((x) => x.id !== k.id) }))}
                >
                  <X aria-hidden />
                </Button>
              </div>
            ))}
            <Button type="button" variant="txt" size="sm" className="self-start" onClick={() => setForm((f) => ({ ...f, kegiatan: [...f.kegiatan, kegiatanBaru()] }))}>
              <Plus aria-hidden />
              Tambah kegiatan
            </Button>
          </div>

          <Field id="r-tujuan" label="Tujuan" hint="Satu tujuan per baris.">
            <Textarea id="r-tujuan" rows={3} value={form.tujuan} onChange={set("tujuan")} placeholder={"Mengenal bagian tanaman\nMotorik halus: menempel"} required />
          </Field>
          <Field id="r-bahan" label="Bahan (opsional)" hint="Pisahkan dengan koma.">
            <Input id="r-bahan" value={form.bahan} onChange={set("bahan")} placeholder="kapas, gelas plastik, cat jari" />
          </Field>

          <DialogFooter className="gap-2 sm:justify-between">
            {rpp ? (
              yakinHapus ? (
                <Button type="button" variant="dng" onClick={hapus} disabled={isPending}>
                  Ya, hapus RPP
                </Button>
              ) : (
                <Button type="button" variant="txt" onClick={() => setYakinHapus(true)} disabled={isPending}>
                  Hapus
                </Button>
              )
            ) : (
              <span />
            )}
            <span className="flex gap-2">
              <Button type="button" variant="sec" onClick={() => onOpenChange(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending || !form.classId}>
                {isPending ? "Menyimpan…" : "Simpan"}
              </Button>
            </span>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
