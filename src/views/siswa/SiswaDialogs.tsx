"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { linkStudentParent, updateStudent, type UpdateStudentInput } from "@/server/actions/studentsCrud";
import { moveStudentClass } from "@/server/actions/enrollments";

export interface SiswaUntukDiubah {
  id: string;
  name: string;
  dateOfBirth: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  parentUserId?: string | null;
  classId: string | null;
}

function Field({ id, label, children, hint }: { id: string; label: React.ReactNode; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Ubah data anak + pindah kelas (memakai action yang sudah ada: updateStudent, moveStudentClass). */
export function UbahSiswaDialog({
  siswa,
  kelas,
  open,
  onOpenChange,
  onSaved,
}: {
  siswa: SiswaUntukDiubah | null;
  kelas: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", dateOfBirth: "", parentName: "", parentPhone: "", parentEmail: "", classId: "none" });

  useEffect(() => {
    if (siswa && open) {
      setForm({
        name: siswa.name,
        dateOfBirth: siswa.dateOfBirth?.slice(0, 10) ?? "",
        parentName: siswa.parentName ?? "",
        parentPhone: siswa.parentPhone ?? "",
        parentEmail: siswa.parentEmail ?? "",
        classId: siswa.classId ?? "none",
      });
    }
  }, [siswa, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswa) return;
    if (!form.name.trim()) {
      toast({ title: "Nama anak wajib diisi", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        const partial: UpdateStudentInput = {
          name: form.name.trim(),
          dateOfBirth: form.dateOfBirth.trim() || null,
          parentName: form.parentName.trim(),
          parentPhone: form.parentPhone.trim(),
          parentEmail: form.parentEmail.trim(),
        };
        await updateStudent(siswa.id, partial);
        if (form.classId !== "none" && form.classId !== (siswa.classId ?? "none")) {
          await moveStudentClass({ studentId: siswa.id, fromClassId: siswa.classId, toClassId: form.classId });
        }
        toast({ title: "Data tersimpan", description: form.name.trim() });
        onOpenChange(false);
        onSaved?.();
        qc.invalidateQueries({ queryKey: ["siswa"] });
        qc.invalidateQueries({ queryKey: ["profil-siswa", siswa.id] });
        router.refresh();
      } catch (err) {
        toast({ title: "Gagal menyimpan", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Ubah data anak</DialogTitle>
            <DialogDescription>Perubahan tersimpan untuk semua portal (guru dan orang tua).</DialogDescription>
          </DialogHeader>
          <Field id="ubah-nama" label="Nama lengkap anak">
            <Input id="ubah-nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field id="ubah-lahir" label="Tanggal lahir">
            <Input id="ubah-lahir" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </Field>
          <Field id="ubah-wali" label="Nama wali">
            <Input id="ubah-wali" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="ubah-wa" label="Nomor WhatsApp wali">
              <Input id="ubah-wa" inputMode="tel" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
            </Field>
            <Field id="ubah-email" label="Email wali">
              <Input id="ubah-email" type="email" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} />
            </Field>
          </div>
          <Field id="ubah-kelas" label="Kelas" hint="Mengganti kelas memindahkan pendaftaran aktif anak ke kelas baru.">
            <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
              <SelectTrigger id="ubah-kelas">
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa kelas</SelectItem>
                {kelas.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name}
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
              {isPending ? "Menyimpan…" : "Simpan perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Tautkan akun orang tua yang sudah terdaftar (action yang sudah ada: linkStudentParent). */
export function TautkanWaliDialog({
  siswa,
  akunWali,
  open,
  onOpenChange,
  onSaved,
}: {
  siswa: SiswaUntukDiubah | null;
  akunWali: { id: string; name: string; email: string }[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [pilih, setPilih] = useState("none");

  useEffect(() => {
    if (siswa && open) setPilih(siswa.parentUserId ?? "none");
  }, [siswa, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswa) return;
    startTransition(async () => {
      try {
        const target = pilih !== "none" ? pilih : null;
        await linkStudentParent(siswa.id, target);
        toast({ title: target ? "Akun wali tertaut" : "Tautan akun wali dilepas", description: siswa.name });
        onOpenChange(false);
        onSaved?.();
        qc.invalidateQueries({ queryKey: ["siswa"] });
        qc.invalidateQueries({ queryKey: ["profil-siswa", siswa.id] });
        router.refresh();
      } catch (err) {
        toast({ title: "Gagal menautkan", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Tautkan akun wali</DialogTitle>
            <DialogDescription>
              Pilih akun orang tua yang sudah mendaftar agar bisa melihat kabar dan tagihan {siswa?.name}.
            </DialogDescription>
          </DialogHeader>
          <Field
            id="tautkan-wali"
            label="Akun orang tua"
            hint={akunWali.length === 0 ? "Belum ada akun orang tua. Minta wali mendaftar di portal orang tua dengan email yang sama dengan data anak." : undefined}
          >
            <Select value={pilih} onValueChange={setPilih}>
              <SelectTrigger id="tautkan-wali">
                <SelectValue placeholder="Pilih akun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ditautkan</SelectItem>
                {akunWali.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name || p.email} · {p.email}
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
              {isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
