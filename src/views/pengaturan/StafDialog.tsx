"use client";

import { useEffect, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClassChip } from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah } from "@/lib/format";
import {
  assignTutorClass,
  createTutor,
  linkTutorUser,
  removeTutorClassAssignment,
  toggleTutorActive,
  unlinkTutorUser,
  updateTutor,
} from "@/server/actions/tutorsCrud";
import type { StafItem } from "@/server/actions/pengaturan";

function Field({ id, label, hint, children }: { id: string; label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * Tambah/ubah staf (action lama tutorsCrud.ts). Akun tertaut otomatis bila email sama dengan akun terdaftar.
 * Penugasan kelas baru memakai tarif bawaan action (Rp 50.000/sesi); tarif diubah di Honor Guru.
 */
export function StafDialog({
  staf,
  kelas,
  akunBisaDitaut,
  guru,
  open,
  onOpenChange,
}: {
  staf: StafItem | null;
  kelas: { id: string; name: string }[];
  akunBisaDitaut: { id: string; name: string; email: string }[];
  guru: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [kelasBaru, setKelasBaru] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm({ name: staf?.name ?? "", email: staf?.email ?? "", phone: staf?.phone ?? "" });
    setKelasBaru("");
  }, [staf, open]);

  const jalan = (fn: () => Promise<unknown>, sukses: string, tutup = false) =>
    startTransition(async () => {
      try {
        await fn();
        toast({ title: sukses });
        qc.invalidateQueries({ queryKey: ["pengaturan"] });
        if (tutup) onOpenChange(false);
      } catch (err) {
        toast({ title: "Gagal", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
      }
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const isi = { name: form.name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null };
    jalan(() => (staf ? updateTutor(staf.id, isi) : createTutor(isi)), staf ? "Data staf disimpan" : `${guru} ditambahkan`, true);
  };

  const akunCocok = staf && !staf.akun && staf.email ? akunBisaDitaut.find((a) => a.email.toLowerCase() === staf.email!.toLowerCase()) : undefined;
  const kelasTersedia = kelas.filter((k) => !staf?.kelas.some((s) => s.classId === k.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{staf ? staf.name : `${guru} baru`}</DialogTitle>
            <DialogDescription>
              {staf ? "Ubah data, akun, dan kelas yang diampu." : `Isi email yang dipakai ${guru.toLowerCase()} untuk masuk; akunnya tertaut otomatis bila sudah terdaftar.`}
            </DialogDescription>
          </DialogHeader>
          <Field id="st-nama" label="Nama">
            <Input id="st-nama" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required maxLength={120} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="st-email" label="Email">
              <Input id="st-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </Field>
            <Field id="st-hp" label="WhatsApp">
              <Input id="st-hp" inputMode="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </Field>
          </div>

          {staf && (
            <>
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <span className="text-sm font-semibold">Akun aplikasi</span>
                {staf.akun ? (
                  <span className="flex flex-wrap items-center justify-between gap-2 text-[15px]">
                    <span className="break-all">Tertaut ke {staf.akun.email}</span>
                    <Button type="button" variant="txt" size="sm" disabled={isPending} onClick={() => jalan(() => unlinkTutorUser(staf.id), "Akun dilepas")}>
                      Lepas
                    </Button>
                  </span>
                ) : akunCocok ? (
                  <span className="flex flex-wrap items-center justify-between gap-2 text-[15px]">
                    <span className="break-all">Ada akun terdaftar dengan email {akunCocok.email}</span>
                    <Button type="button" variant="sec" size="sm" disabled={isPending} onClick={() => jalan(() => linkTutorUser(staf.id, akunCocok.id), "Akun ditautkan")}>
                      Tautkan
                    </Button>
                  </span>
                ) : (
                  <p className="text-[13px] text-muted-foreground">
                    Belum punya akun. Minta {guru.toLowerCase()} mendaftar dengan email di atas; akun tertaut otomatis saat data ini disimpan ulang.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <span className="text-sm font-semibold">Kelas yang diampu</span>
                {staf.kelas.length === 0 && <p className="text-[13px] text-muted-foreground">Belum ditugaskan ke kelas.</p>}
                <span className="flex flex-wrap gap-2">
                  {staf.kelas.map((k) => (
                    <span key={k.assignmentId} className="inline-flex items-center gap-1">
                      <ClassChip name={k.name} id={k.classId} />
                      <span className="tabular text-xs text-muted-foreground">{k.ratePerSession ? `${formatRupiah(k.ratePerSession)}/sesi` : ""}</span>
                      <Button
                        type="button"
                        variant="txt"
                        size="icon-sm"
                        aria-label={`Lepas dari ${k.name}`}
                        disabled={isPending}
                        onClick={() => jalan(() => removeTutorClassAssignment(k.assignmentId), `Dilepas dari ${k.name}`)}
                      >
                        <X aria-hidden />
                      </Button>
                    </span>
                  ))}
                </span>
                {kelasTersedia.length > 0 && (
                  <span className="flex gap-2">
                    <Select value={kelasBaru} onValueChange={setKelasBaru}>
                      <SelectTrigger aria-label="Tambah kelas" className="flex-1">
                        <SelectValue placeholder="Tambah kelas…" />
                      </SelectTrigger>
                      <SelectContent>
                        {kelasTersedia.map((k) => (
                          <SelectItem key={k.id} value={k.id}>
                            {k.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="sec"
                      disabled={!kelasBaru || isPending}
                      onClick={() =>
                        jalan(async () => {
                          await assignTutorClass(staf.id, kelasBaru);
                          setKelasBaru("");
                        }, "Kelas ditambahkan")
                      }
                    >
                      Tugaskan
                    </Button>
                  </span>
                )}
                <p className="text-[13px] text-muted-foreground">Tarif per sesi diubah di Keuangan › Honor.</p>
              </div>
            </>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            {staf ? (
              <Button
                type="button"
                variant="txt"
                disabled={isPending}
                onClick={() => jalan(() => toggleTutorActive(staf.id, !staf.isActive), staf.isActive ? "Staf dinonaktifkan" : "Staf diaktifkan", true)}
              >
                {staf.isActive ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            ) : (
              <span />
            )}
            <span className="flex gap-2">
              <Button type="button" variant="sec" onClick={() => onOpenChange(false)} disabled={isPending}>
                Tutup
              </Button>
              <Button type="submit" disabled={isPending || !form.name.trim()}>
                {isPending ? "Menyimpan…" : "Simpan"}
              </Button>
            </span>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
