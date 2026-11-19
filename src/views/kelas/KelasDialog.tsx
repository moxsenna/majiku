"use client";

import { useEffect, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIstilah } from "@/hooks/useIstilah";
import { createClass, updateClass } from "@/server/actions/classesCrud";
import type { GuruRingkas, KelasProgram } from "@/server/actions/kelasJadwal";

function Field({ id, label, hint, children }: { id: string; label: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

const KOSONG = { name: "", description: "", capacity: "", pricePerMonth: "", sessionsPerMonth: "", location: "", tutorId: "none" };

/**
 * Buat/ubah kelas (action lama createClass/updateClass). Kolom teks `classes.schedule` sengaja tidak ditanyakan:
 * jadwal diatur di Kalender Sesi (class_schedules, satu sumber — N21). Nilai lama tidak diubah.
 */
export function KelasDialog({
  kelas,
  guruPilihan,
  open,
  onOpenChange,
}: {
  /** null = kelas baru */
  kelas: KelasProgram | null;
  guruPilihan: GuruRingkas[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const istilah = useIstilah();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(KOSONG);

  useEffect(() => {
    if (!open) return;
    setForm(
      kelas
        ? {
            name: kelas.name,
            description: kelas.description ?? "",
            capacity: kelas.capacity != null ? String(kelas.capacity) : "",
            pricePerMonth: kelas.pricePerMonth ? String(Number(kelas.pricePerMonth)) : "",
            sessionsPerMonth: kelas.sessionsPerMonth != null ? String(kelas.sessionsPerMonth) : "",
            location: kelas.location ?? "",
            tutorId: kelas.guru[0]?.id ?? "none",
          }
        : KOSONG,
    );
  }, [kelas, open]);

  const set = (k: keyof typeof KOSONG) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Nama kelas wajib diisi", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        const tutorId = form.tutorId !== "none" ? form.tutorId : null;
        if (kelas) {
          await updateClass(kelas.id, {
            name: form.name.trim(),
            description: form.description.trim(),
            capacity: form.capacity ? Number(form.capacity) : null,
            pricePerMonth: form.pricePerMonth.trim() || null,
            sessionsPerMonth: form.sessionsPerMonth ? Number(form.sessionsPerMonth) : null,
            location: form.location.trim(),
            // updateClass menghapus lalu membuat ulang penugasan (tarif kembali ke bawaan) → kirim hanya bila guru diganti.
            ...(tutorId !== (kelas.guru[0]?.id ?? null) ? { tutorId } : {}),
          });
        } else {
          await createClass({
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            capacity: form.capacity ? Number(form.capacity) : undefined,
            pricePerMonth: form.pricePerMonth.trim() || undefined,
            sessionsPerMonth: form.sessionsPerMonth ? Number(form.sessionsPerMonth) : undefined,
            location: form.location.trim() || undefined,
            tutorId: tutorId ?? undefined,
          });
        }
        toast({ title: kelas ? "Kelas diperbarui" : "Kelas dibuat", description: form.name.trim() });
        onOpenChange(false);
        qc.invalidateQueries({ queryKey: ["kelas-program"] });
        qc.invalidateQueries({ queryKey: ["kalender-sesi"] });
      } catch (err) {
        toast({ title: "Gagal menyimpan kelas", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{kelas ? "Ubah kelas" : "Kelas baru"}</DialogTitle>
            <DialogDescription>Jam dan hari kelas diatur di Kalender Sesi setelah kelas dibuat.</DialogDescription>
          </DialogHeader>
          <Field id="k-nama" label="Nama kelas">
            <Input id="k-nama" value={form.name} onChange={set("name")} placeholder="Contoh: Toddler A" required />
          </Field>
          <Field id="k-desk" label="Keterangan" hint="Misalnya rentang usia: usia 2–3 th.">
            <Textarea id="k-desk" rows={2} value={form.description} onChange={set("description")} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="k-kap" label="Kapasitas (anak)">
              <Input id="k-kap" type="number" min={1} inputMode="numeric" value={form.capacity} onChange={set("capacity")} />
            </Field>
            <Field id="k-sesi" label="Sesi per bulan">
              <Input id="k-sesi" type="number" min={1} inputMode="numeric" value={form.sessionsPerMonth} onChange={set("sessionsPerMonth")} />
            </Field>
            <Field id="k-harga" label="Biaya per bulan (Rp)" hint="Dipakai sebagai nominal bawaan tagihan.">
              <Input id="k-harga" type="number" min={0} inputMode="numeric" value={form.pricePerMonth} onChange={set("pricePerMonth")} />
            </Field>
            <Field id="k-ruang" label="Ruang">
              <Input id="k-ruang" value={form.location} onChange={set("location")} placeholder="Contoh: Ruang Daun" />
            </Field>
          </div>
          <Field id="k-guru" label={`${istilah.guru} kelas`}>
            <Select value={form.tutorId} onValueChange={(v) => setForm((f) => ({ ...f, tutorId: v }))}>
              <SelectTrigger id="k-guru">
                <SelectValue placeholder={`Pilih ${istilah.guruKecil}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Belum ditugaskan</SelectItem>
                {guruPilihan.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button type="button" variant="sec" onClick={() => onOpenChange(false)} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan…" : kelas ? "Simpan perubahan" : "Buat kelas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
