"use client";

import { useEffect, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { todayInWib, timeInWib } from "@/lib/datetime";
import { scheduleTrial } from "@/server/actions/trial";
import type { KelasKursi, TrialItem } from "@/server/actions/pendaftaran";

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

/** Jadwalkan / ubah jadwal trial (action lama scheduleTrial; hanya untuk status Diajukan & Terjadwal). Jam dalam WIB. */
export function JadwalTrialDialog({
  trial,
  kelas,
  guru,
  open,
  onOpenChange,
}: {
  trial: TrialItem | null;
  kelas: KelasKursi[];
  guru: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ tanggal: "", jam: "09:00", classId: "", tutorId: "" });

  useEffect(() => {
    if (!open || !trial) return;
    const d = trial.trialScheduledAt ? new Date(trial.trialScheduledAt) : null;
    setForm({
      tanggal: d ? todayInWib(d) : "",
      jam: d ? timeInWib(d).slice(0, 5) : "09:00",
      classId: trial.classId ?? "",
      tutorId: trial.tutorId ?? "",
    });
  }, [trial, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trial) return;
    if (!form.tanggal || !form.jam || !form.classId || !form.tutorId) {
      toast({ title: "Lengkapi tanggal, jam, kelas, dan guru", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        await scheduleTrial(trial.id, {
          scheduledAt: new Date(`${form.tanggal}T${form.jam}:00+07:00`).toISOString(),
          classId: form.classId,
          tutorId: form.tutorId,
        });
        toast({ title: trial.tahap === "terjadwal" ? "Jadwal trial diubah" : "Trial dijadwalkan" });
        onOpenChange(false);
        qc.invalidateQueries({ queryKey: ["pendaftaran"] });
      } catch (err) {
        toast({ title: "Gagal menjadwalkan", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{trial?.tahap === "terjadwal" ? "Ubah jadwal trial" : "Jadwalkan trial"}</DialogTitle>
            <DialogDescription>{trial ? `${trial.childName} · wali ${trial.parentName ?? "—"}` : ""}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="t-tanggal" label="Tanggal">
              <Input id="t-tanggal" type="date" min={todayInWib()} value={form.tanggal} onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))} required />
            </Field>
            <Field id="t-jam" label="Jam (WIB)">
              <Input id="t-jam" type="time" value={form.jam} onChange={(e) => setForm((f) => ({ ...f, jam: e.target.value }))} required />
            </Field>
          </div>
          <Field id="t-kelas" label="Kelas">
            <Select value={form.classId} onValueChange={(v) => setForm((f) => ({ ...f, classId: v }))}>
              <SelectTrigger id="t-kelas">
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {kelas.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name}
                    {k.capacity ? ` · ${k.terisi}/${k.capacity}${k.terisi >= k.capacity ? " penuh" : ""}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="t-guru" label="Guru pendamping">
            <Select value={form.tutorId} onValueChange={(v) => setForm((f) => ({ ...f, tutorId: v }))}>
              <SelectTrigger id="t-guru">
                <SelectValue placeholder={guru.length ? "Pilih guru" : "Belum ada guru aktif"} />
              </SelectTrigger>
              <SelectContent>
                {guru.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <p className="text-[13px] text-muted-foreground">Guru pendamping menulis catatan observasi dari aplikasinya setelah trial.</p>
          <DialogFooter>
            <Button type="button" variant="sec" onClick={() => onOpenChange(false)} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan…" : "Simpan jadwal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
