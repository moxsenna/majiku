"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBanner, KidAvatar, Panel, PanelRowsSkeleton, StatusDot } from "@/components/bunayo";
import { formatJam, formatPeriode, formatRupiah, formatTanggal, formatUmur } from "@/lib/format";
import { STATUS_AKUN_WALI, STATUS_LAPORAN, statusKehadiran, statusTagihan } from "@/lib/status";
import { getProfilSiswa, type ProfilSiswa } from "@/server/actions/siswa";
import { TautkanWaliDialog, UbahSiswaDialog } from "./SiswaDialogs";

function Bagian({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{judul}</span>
      {children}
    </div>
  );
}

function Baris({ kiri, kanan }: { kiri: React.ReactNode; kanan: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[15px]">
      <span className="min-w-0">{kiri}</span>
      <span className="shrink-0">{kanan}</span>
    </div>
  );
}

export function Kesehatan({ k }: { k: ProfilSiswa["kesehatan"] }) {
  if (!k) {
    return <p className="text-[15px] text-muted-foreground">Belum tercatat. Data kesehatan saat ini hanya terisi dari formulir trial.</p>;
  }
  return (
    <>
      <span className="text-[15px]">
        <b className={k.alergi ? "text-destructive" : undefined}>{k.alergi ? `Alergi: ${k.alergi}` : "Alergi tidak dicatat"}</b>
        {k.catatanMedis && ` · ${k.catatanMedis}`}
      </span>
      {k.kontakDarurat && (
        <span className="text-[13px] text-muted-foreground">
          Kontak darurat: {k.kontakDarurat}
          {k.teleponDarurat && <span className="tabular"> · {k.teleponDarurat}</span>}
        </span>
      )}
    </>
  );
}

/** Ringkasan A2 di panel samping S1. */
export function PanelProfil({
  id,
  kelas,
  akunWali,
}: {
  id: string;
  kelas: { id: string; name: string }[];
  akunWali: { id: string; name: string; email: string }[];
}) {
  const [ubah, setUbah] = useState(false);
  const [tautkan, setTautkan] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["profil-siswa", id], queryFn: () => getProfilSiswa(id) });

  if (isLoading && !data) {
    return (
      <Panel>
        <div className="flex items-center gap-3 border-b border-foreground px-[18px] py-4">
          <span className="sk sk-circle h-12 w-12" />
          <span className="flex flex-1 flex-col gap-2">
            <span className="sk h-4 w-2/3" />
            <span className="sk sk-light h-3 w-1/3" />
          </span>
        </div>
        <PanelRowsSkeleton rows={4} />
      </Panel>
    );
  }
  if (isError && !data) return <ErrorBanner title="Profil gagal dimuat" description="Tidak ada data yang berubah." onRetry={() => refetch()} />;
  if (!data) return <Panel className="p-5 text-sm text-muted-foreground">Anak ini tidak ditemukan di lembaga Anda.</Panel>;

  const s = data.siswa;
  const k = data.kehadiranBulanIni;
  const tagihanBulan = data.tagihan.find((t) => (t.periodeMulai ?? t.dueDate ?? "").slice(0, 7) === data.tanggal.slice(0, 7));
  const untukDialog = {
    id: s.id,
    name: s.name,
    dateOfBirth: s.dateOfBirth,
    parentName: s.parentName,
    parentPhone: s.parentPhone,
    parentEmail: s.parentEmail,
    parentUserId: s.parentUserId,
    classId: data.kelas[0]?.id ?? null,
  };

  return (
    <Panel className={isError ? "stale" : undefined}>
      <div className="flex items-center gap-3 border-b border-foreground px-[18px] py-4">
        <KidAvatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="lg" />
        <span className="min-w-0">
          <span className="block truncate font-display text-lg font-bold">{s.name}</span>
          <span className="text-[13px] text-muted-foreground">
            {[s.dateOfBirth && formatUmur(s.dateOfBirth), data.kelas.map((x) => x.name).join(", ")].filter(Boolean).join(" · ")}
          </span>
        </span>
      </div>
      <Tabs defaultValue="ringkasan" className="px-[18px] pb-4">
        <TabsList className="gap-4">
          <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
          <TabsTrigger value="hadir">Kehadiran</TabsTrigger>
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
          <TabsTrigger value="tagihan">Tagihan</TabsTrigger>
        </TabsList>

        <TabsContent value="ringkasan" className="flex flex-col gap-4">
          <Bagian judul="Kesehatan">
            <Kesehatan k={data.kesehatan} />
          </Bagian>
          <Bagian judul="Keluarga">
            <Baris
              kiri={s.parentName || <span className="text-muted-foreground">Wali belum diisi</span>}
              kanan={<StatusDot size="sm" info={s.parentUserId ? STATUS_AKUN_WALI.aktif : { label: "Belum tertaut", varian: "off" }} />}
            />
            {data.saudara.map((x) => (
              <Baris key={x.id} kiri={`${x.name}${x.kelas ? ` · ${x.kelas}` : ""}`} kanan={<span className="text-[13px] text-muted-foreground">saudara</span>} />
            ))}
          </Bagian>
          <Bagian judul="Bulan ini">
            <Baris
              kiri={`Kehadiran ${formatPeriode(k.periode)}`}
              kanan={
                <span className="tabular">
                  {k.hadir + k.terlambat} hadir{k.sakit + k.izin ? ` · ${k.sakit + k.izin} izin/sakit` : ""}
                </span>
              }
            />
            <Baris
              kiri={`Tagihan ${formatPeriode(k.periode)}`}
              kanan={tagihanBulan ? <StatusDot size="sm" info={statusTagihan(tagihanBulan.status)} /> : <span className="text-[13px] text-muted-foreground">Belum terbit</span>}
            />
          </Bagian>
          <div className="flex flex-wrap gap-2">
            <Button variant="sec" size="sm" className="flex-1" onClick={() => setUbah(true)}>
              Ubah data
            </Button>
            <Button variant="sec" size="sm" className="flex-1" onClick={() => setTautkan(true)}>
              Tautkan akun wali
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="hadir" className="flex flex-col gap-1">
          {data.kehadiranTerbaru.length === 0 ? (
            <p className="text-[15px] text-muted-foreground">Belum ada catatan kehadiran.</p>
          ) : (
            data.kehadiranTerbaru.slice(0, 10).map((a) => (
              <Baris
                key={a.id}
                kiri={
                  <span>
                    {formatTanggal(a.tanggal, { hari: true, tanpaTahun: true })}
                    {a.checkIn && <span className="tabular text-[13px] text-muted-foreground"> · {formatJam(a.checkIn)}{a.checkOut ? `–${formatJam(a.checkOut)}` : ""}</span>}
                  </span>
                }
                kanan={<StatusDot size="sm" info={statusKehadiran(a.status, a.permitType)} />}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="laporan" className="flex flex-col gap-2">
          {data.laporan.length === 0 ? (
            <p className="text-[15px] text-muted-foreground">Belum ada laporan harian.</p>
          ) : (
            data.laporan.slice(0, 6).map((r) => (
              <div key={r.id} className="flex flex-col gap-0.5 border-b border-border-subtle pb-2 last:border-b-0">
                <Baris kiri={<b className="text-[15px]">{formatTanggal(r.tanggal, { hari: true, tanpaTahun: true })}</b>} kanan={<StatusDot size="sm" info={STATUS_LAPORAN[r.status] ?? STATUS_LAPORAN.submitted} />} />
                <span className="line-clamp-2 text-[13px] text-muted-foreground">
                  {[r.activities, r.meals && `Makan: ${r.meals}`, r.fotoCount ? `${r.fotoCount} foto` : null].filter(Boolean).join(" · ") || "Tanpa catatan"}
                </span>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="tagihan" className="flex flex-col gap-1">
          {data.tagihan.length === 0 ? (
            <p className="text-[15px] text-muted-foreground">Belum ada tagihan.</p>
          ) : (
            data.tagihan.slice(0, 8).map((t) => (
              <Baris
                key={t.id}
                kiri={
                  <span>
                    {t.periodeMulai ? formatPeriode(t.periodeMulai) : t.nomor}
                    <span className="tabular block text-[13px] text-muted-foreground">{formatRupiah(t.total)}</span>
                  </span>
                }
                kanan={<StatusDot size="sm" info={statusTagihan(t.status)} />}
              />
            ))
          )}
        </TabsContent>

        <Link href={`/students/${s.id}`} className="mt-4 inline-flex min-h-touch items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          Buka profil lengkap <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Tabs>

      <UbahSiswaDialog siswa={untukDialog} kelas={kelas} open={ubah} onOpenChange={setUbah} onSaved={() => refetch()} />
      <TautkanWaliDialog siswa={untukDialog} akunWali={akunWali} open={tautkan} onOpenChange={setTautkan} onSaved={() => refetch()} />
    </Panel>
  );
}
