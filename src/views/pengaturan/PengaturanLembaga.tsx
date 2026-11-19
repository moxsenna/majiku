"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ErrorBanner,
  InfoBox,
  PageBody,
  PageHeader,
  Panel,
  PanelHeader,
  PanelRowsSkeleton,
  RowText,
  Stale,
  StatCard,
  StatRow,
  StatusDot,
} from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { formatJam } from "@/lib/format";
import { LABEL_JENIS_LEMBAGA, istilahLembaga } from "@/lib/istilah";
import { updateTenantProfile } from "@/server/actions/adminDashboard";
import { getPengaturan, type PengaturanData } from "@/server/actions/pengaturan";

/**
 * K6 (bagian yang ada) — Pengaturan lembaga: profil yang bisa diubah (nama, WhatsApp, alamat) + ringkasan + tautan modul.
 * Disembunyikan (BARU, REDESIGN-BACKLOG K6): jadwal terbit tagihan, pengingat otomatis, rekening pencairan, denda,
 * biaya transaksi, cabang, logo, notifikasi, langganan.
 */

const BARIS = "flex min-h-[52px] items-center gap-3 border-b border-border-subtle px-[18px] py-3 last:border-b-0 hover:bg-muted";

function Field({ id, label, hint, children }: { id: string; label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function PengaturanLembaga({ initialData }: { initialData?: PengaturanData }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: ["pengaturan"], queryFn: getPengaturan, initialData });
  const { data, isError, refetch } = query;
  const [form, setForm] = useState({ name: "", whatsapp: "", address: "" });

  useEffect(() => {
    if (data) setForm({ name: data.lembaga.name, whatsapp: data.lembaga.whatsapp ?? "", address: data.lembaga.address ?? "" });
  }, [data]);

  const simpan = useMutation({
    mutationFn: () => updateTenantProfile({ name: form.name.trim(), phone: form.whatsapp.trim() || undefined, address: form.address.trim() || undefined }),
    onSuccess: () => {
      toast({ title: "Profil lembaga disimpan" });
      qc.invalidateQueries({ queryKey: ["pengaturan"] });
    },
    onError: (err: Error) => toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" }),
  });

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="PENGATURAN" title="Lembaga" />
        <PageBody>
          {isError ? (
            <ErrorBanner title="Pengaturan gagal dimuat" description="Tidak ada data yang berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <Panel>
              <PanelRowsSkeleton rows={4} />
            </Panel>
          )}
        </PageBody>
      </>
    );
  }

  const bisaUbah = !data.isDemo;
  const istilah = istilahLembaga(data.lembaga.type);
  const berubah =
    form.name.trim() !== data.lembaga.name ||
    form.whatsapp.trim() !== (data.lembaga.whatsapp ?? "") ||
    form.address.trim() !== (data.lembaga.address ?? "");
  const r = data.ringkasan;

  return (
    <>
      <PageHeader eyebrow="PENGATURAN" title="Lembaga" />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Profil di layar ini adalah contoh, bukan data lembaga mana pun. Penyimpanan dinonaktifkan.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner title="Pengaturan gagal diperbarui" description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`} onRetry={() => refetch()} />
        )}
        <Stale stale={isError}>
          <div className="grid grid-cols-1 items-start gap-5 min-[1001px]:grid-cols-2">
            <Panel>
              <PanelHeader title="Profil lembaga" meta={data.lembaga.isVerified ? <StatusDot varian="ok" size="sm">Terverifikasi</StatusDot> : undefined} />
              <form
                className="flex flex-col gap-5 px-[18px] py-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!form.name.trim()) return;
                  simpan.mutate();
                }}
              >
                <Field id="l-nama" label="Nama lembaga" hint="Tampil di aplikasi orang tua, tagihan, dan pengumuman.">
                  <Input id="l-nama" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} disabled={!bisaUbah} required maxLength={120} />
                </Field>
                <Field id="l-wa" label="WhatsApp lembaga" hint="Nomor yang dihubungi orang tua.">
                  <Input
                    id="l-wa"
                    inputMode="tel"
                    value={form.whatsapp}
                    onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                    disabled={!bisaUbah}
                    placeholder="0812…"
                  />
                </Field>
                <Field id="l-alamat" label="Alamat">
                  <Input id="l-alamat" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} disabled={!bisaUbah} />
                </Field>
                <dl className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-2 text-[15px]">
                  <dt className="text-muted-foreground">Jenis</dt>
                  <dd>{LABEL_JENIS_LEMBAGA[data.lembaga.type]}</dd>
                  <dt className="text-muted-foreground">Kota</dt>
                  <dd>{data.lembaga.city}</dd>
                  <dt className="text-muted-foreground">Pemilik</dt>
                  <dd className="break-all">{data.pemilik ? `${data.pemilik.name} · ${data.pemilik.email}` : "—"}</dd>
                </dl>
                {bisaUbah && (
                  <span className="flex justify-end gap-2">
                    {berubah && (
                      <Button
                        type="button"
                        variant="sec"
                        onClick={() => setForm({ name: data.lembaga.name, whatsapp: data.lembaga.whatsapp ?? "", address: data.lembaga.address ?? "" })}
                      >
                        Batal
                      </Button>
                    )}
                    <Button type="submit" disabled={!berubah || simpan.isPending || !form.name.trim()}>
                      {simpan.isPending ? "Menyimpan…" : "Simpan"}
                    </Button>
                  </span>
                )}
              </form>
            </Panel>

            <div className="flex flex-col gap-5">
              <StatRow>
                <StatCard label="Anak aktif" periode="saat ini" value={r.anakAktif} href="/students" linkLabel="Siswa" />
                <StatCard label="Kelas aktif" periode="saat ini" value={r.kelasAktif} suffix={r.kapasitas ? ` · ${r.kapasitas} kursi` : undefined} href="/classes" linkLabel="Kelas" />
                <StatCard label={`${istilah.guru} aktif`} periode="saat ini" value={r.stafAktif} href="/settings/staff" linkLabel="Staf" />
              </StatRow>
              <Panel>
                <PanelHeader title="Diatur di tempat lain" />
                <Link href="/settings/staff" className={BARIS}>
                  <RowText title="Staf & peran" sub={`Tambah ${istilah.guruKecil}, tautkan akun, tugaskan ke kelas`} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
                <Link href="/classes" className={BARIS}>
                  <RowText title="Kelas & program" sub="Kapasitas, harga per bulan, guru kelas" />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
                <Link href="/schedule" className={BARIS}>
                  <RowText title="Kalender sesi" sub="Jam kelas mingguan" />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
                <Link href="/billing/honor" className={BARIS}>
                  <RowText title={istilah.honor} sub={`Tarif per sesi tiap ${istilah.guruKecil}`} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
              </Panel>
              <p className="text-[13px] text-muted-foreground">
                Pengaturan penagihan (tanggal terbit otomatis, pengingat, rekening pencairan, denda, biaya transaksi), cabang, logo, dan notifikasi
                belum tersedia. Tagihan saat ini diterbitkan manual dari Keuangan.
              </p>
            </div>
          </div>
        </Stale>
      </PageBody>
    </>
  );
}
