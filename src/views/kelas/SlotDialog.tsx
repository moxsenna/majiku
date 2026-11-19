"use client";

import { useEffect, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { HARI_JADWAL, LABEL_JENIS_JADWAL } from "@/lib/jadwal";
import {
  createClassSchedule,
  deleteClassSchedule,
  toggleClassScheduleActive,
  updateClassSchedule,
} from "@/server/actions/schedules";
import type { SlotJadwal } from "@/server/actions/kelasJadwal";

function Field({ id, label, hint, children }: { id: string; label: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

type Form = { title: string; classId: string; dayOfWeek: string; startTime: string; durationMinutes: string; location: string; type: string };

/**
 * Tambah/ubah slot jadwal mingguan (action lama schedules.ts). Slot wajib terkait kelas: action listSchedules/update/delete
 * memfilter tenant lewat kelas, jadi slot "semua kelas" (class_id kosong) tidak akan pernah tampil lagi — pilihan itu dihapus.
 */
export function SlotDialog({
  slot,
  awal,
  kelas,
  open,
  onOpenChange,
}: {
  slot: SlotJadwal | null;
  /** Nilai awal untuk slot baru */
  awal?: { dayOfWeek?: number; classId?: string };
  kelas: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<Form>({ title: "", classId: "", dayOfWeek: "1", startTime: "08:00", durationMinutes: "60", location: "", type: "class" });
  const [yakinHapus, setYakinHapus] = useState(false);

  useEffect(() => {
    if (!open) return;
    setYakinHapus(false);
    setForm(
      slot
        ? {
            title: slot.title,
            classId: slot.classId ?? "",
            dayOfWeek: String(slot.dayOfWeek),
            startTime: slot.startTime,
            durationMinutes: String(slot.durationMinutes),
            location: slot.location ?? "",
            type: slot.type,
          }
        : {
            title: "",
            classId: awal?.classId ?? kelas[0]?.id ?? "",
            dayOfWeek: String(awal?.dayOfWeek ?? 1),
            startTime: "08:00",
            durationMinutes: "60",
            location: "",
            type: "class",
          },
    );
  }, [slot, awal, kelas, open]);

  const selesai = (judul: string) => {
    toast({ title: judul });
    onOpenChange(false);
    qc.invalidateQueries({ queryKey: ["kalender-sesi"] });
    qc.invalidateQueries({ queryKey: ["kelas-program"] });
  };
  const gagal = (judul: string, err: unknown) =>
    toast({ title: judul, description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });

  const namaKelas = kelas.find((k) => k.id === form.classId)?.name ?? "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.classId) {
      toast({ title: "Pilih kelas dulu", variant: "destructive" });
      return;
    }
    const payload = {
      title: form.title.trim() || namaKelas,
      classId: form.classId,
      dayOfWeek: Number(form.dayOfWeek),
      startTime: form.startTime,
      durationMinutes: Number(form.durationMinutes),
      location: form.location,
      type: form.type,
    };
    startTransition(async () => {
      try {
        if (slot) await updateClassSchedule(slot.id, payload);
        else await createClassSchedule(payload);
        selesai(slot ? "Jadwal diperbarui" : "Sesi ditambahkan");
      } catch (err) {
        gagal("Gagal menyimpan jadwal", err);
      }
    });
  };

  const hapus = () =>
    startTransition(async () => {
      try {
        await deleteClassSchedule(slot!.id);
        selesai("Sesi dihapus dari jadwal");
      } catch (err) {
        gagal("Gagal menghapus", err);
      }
    });

  const toggle = () =>
    startTransition(async () => {
      try {
        await toggleClassScheduleActive(slot!.id, !slot!.isActive);
        selesai(slot!.isActive ? "Sesi dijeda" : "Sesi diaktifkan");
      } catch (err) {
        gagal("Gagal mengubah status", err);
      }
    });

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{slot ? "Ubah sesi" : "Sesi baru"}</DialogTitle>
            <DialogDescription>Berulang setiap minggu pada hari yang dipilih.</DialogDescription>
          </DialogHeader>
          {kelas.length === 0 ? (
            <p className="text-[15px] text-muted-foreground">Buat kelas dulu di Kelas & Program, lalu tambahkan sesinya di sini.</p>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="s-kelas" label="Kelas">
                  <Select value={form.classId} onValueChange={(v) => setForm((f) => ({ ...f, classId: v }))}>
                    <SelectTrigger id="s-kelas">
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
                <Field id="s-jenis" label="Jenis">
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    <SelectTrigger id="s-jenis">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LABEL_JENIS_JADWAL).map(([v, l]) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field id="s-judul" label="Judul" hint="Kosongkan untuk memakai nama kelas.">
                <Input id="s-judul" value={form.title} onChange={set("title")} placeholder={namaKelas || "Contoh: Sentra balok"} maxLength={120} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field id="s-hari" label="Hari">
                  <Select value={form.dayOfWeek} onValueChange={(v) => setForm((f) => ({ ...f, dayOfWeek: v }))}>
                    <SelectTrigger id="s-hari">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HARI_JADWAL.map((h) => (
                        <SelectItem key={h.dow} value={String(h.dow)}>
                          {h.panjang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id="s-mulai" label="Mulai">
                  <Input id="s-mulai" type="time" value={form.startTime} onChange={set("startTime")} required />
                </Field>
                <Field id="s-durasi" label="Durasi (menit)">
                  <Input id="s-durasi" type="number" min={5} max={480} inputMode="numeric" value={form.durationMinutes} onChange={set("durationMinutes")} required />
                </Field>
              </div>
              <Field id="s-ruang" label="Ruang (opsional)">
                <Input id="s-ruang" value={form.location} onChange={set("location")} />
              </Field>
            </>
          )}
          <DialogFooter className="gap-2 sm:justify-between">
            {slot ? (
              <span className="flex gap-2">
                {yakinHapus ? (
                  <Button type="button" variant="dng" onClick={hapus} disabled={isPending}>
                    Ya, hapus sesi
                  </Button>
                ) : (
                  <Button type="button" variant="txt" onClick={() => setYakinHapus(true)} disabled={isPending}>
                    Hapus
                  </Button>
                )}
                <Button type="button" variant="txt" onClick={toggle} disabled={isPending}>
                  {slot.isActive ? "Jeda" : "Aktifkan"}
                </Button>
              </span>
            ) : (
              <span />
            )}
            <span className="flex gap-2">
              <Button type="button" variant="sec" onClick={() => onOpenChange(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending || kelas.length === 0}>
                {isPending ? "Menyimpan…" : "Simpan"}
              </Button>
            </span>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
