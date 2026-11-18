"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, MessageCircle, Pencil, Power, UserRoundCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ClassChip,
  EmptyState,
  ErrorBanner,
  KidAvatar,
  PageBody,
  PageHeader,
  Panel,
  PanelBody,
  PanelHeader,
  PanelRow,
  PanelRowsSkeleton,
  RowText,
  StatusDot,
} from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatJam, formatPeriode, formatRupiah, formatTanggal, formatUmur } from "@/lib/format";
import { STATUS_AKUN_WALI, STATUS_LAPORAN, statusKehadiran, statusTagihan } from "@/lib/status";
import { getProfilSiswa, type ProfilSiswa } from "@/server/actions/siswa";
import { toggleStudentActive } from "@/server/actions/studentsCrud";
import { TautkanWaliDialog, UbahSiswaDialog } from "./SiswaDialogs";

function waLink(phone: string | null) {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = `62${d.slice(1)}`;
  return d.length >= 9 ? `https://wa.me/${d}` : null;
}

function warnaHari(status: string, permitType: string | null) {
  if (status === "present") return "bg-daun";
  if (status === "late") return "bg-matahari";
  if (status === "permit") return permitType === "sick" ? "bg-langit" : "bg-anggur";
  if (status === "absent") return "bg-destructive";
  return "bg-muted";
}

function KesehatanPanel({ k }: { k: ProfilSiswa["kesehatan"] }) {
  const ada = !!k?.alergi;
  return (
    <Panel className={cn(ada && "border-destructive")}>
      <PanelHeader
        className={cn(ada && "border-b-destructive")}
        title={
          <span className="flex items-center gap-2">
            {ada && <AlertTriangle className="h-[18px] w-[18px] text-destructive" aria-hidden />}
            Kesehatan
          </span>
        }
        meta={k?.sumber.tanggal ? `dari formulir trial ${formatTanggal(k.sumber.tanggal)}` : undefined}
      />
      <PanelBody>
        {!k ? (
          <p className="text-[15px] text-muted-foreground">
            Belum tercatat. Saat ini alergi dan kontak darurat hanya terisi dari formulir trial; anak yang didaftarkan langsung belum punya kolom ini.
          </p>
        ) : (
          <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 text-[15px] max-[560px]:grid-cols-1">
            <dt className="text-muted-foreground">Alergi</dt>
            <dd className={cn(ada && "font-semibold text-destructive")}>{k.alergi ?? "Tidak dicatat"}</dd>
            <dt className="text-muted-foreground">Catatan medis</dt>
            <dd>{k.catatanMedis ?? "—"}</dd>
            <dt className="text-muted-foreground">Kontak darurat</dt>
            <dd>
              {k.kontakDarurat ?? "—"}
              {k.teleponDarurat && <span className="tabular"> · {k.teleponDarurat}</span>}
            </dd>
          </dl>
        )}
      </PanelBody>
    </Panel>
  );
}

/**
 * A2 Profil anak & keluarga. BARU yang disembunyikan: tab Perkembangan & Riwayat, Penjemput resmi,
 * Cuti sementara, Berhenti dengan alasan, ledger keluarga (lihat REDESIGN-BACKLOG).
 */
export default function ProfilAnak({
  id,
  initialData,
  kelas,
  akunWali,
}: {
  id: string;
  initialData?: ProfilSiswa | null;
  kelas: { id: string; name: string }[];
  akunWali: { id: string; name: string; email: string }[];
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [ubah, setUbah] = useState(false);
  const [tautkan, setTautkan] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["profil-siswa", id],
    queryFn: () => getProfilSiswa(id),
    initialData,
  });

  if (isLoading && data === undefined) {
    return (
      <>
        <PageHeader title={<span className="sk inline-block h-9 w-72" />} crumbs={[{ label: "Siswa & Keluarga", href: "/students" }]} />
        <PageBody>
          <div className="grid gap-5 min-[1001px]:grid-cols-[minmax(0,1fr)_380px]">
            <Panel>
              <PanelRowsSkeleton rows={5} />
            </Panel>
            <Panel>
              <PanelRowsSkeleton rows={4} avatar />
            </Panel>
          </div>
        </PageBody>
      </>
    );
  }
  if (data === undefined) {
    return (
      <PageBody>
        <ErrorBanner title="Profil anak gagal dimuat" description="Tidak ada data yang berubah." onRetry={() => refetch()} />
      </PageBody>
    );
  }
  if (data === null) {
    return (
      <PageBody>
        <EmptyState
          title="Anak tidak ditemukan"
          description="Data ini mungkin sudah dihapus atau milik lembaga lain."
          action={
            <Button asChild variant="sec">
              <Link href="/students">Kembali ke daftar siswa</Link>
            </Button>
          }
        />
      </PageBody>
    );
  }

  const s = data.siswa;
  const k = data.kehadiranBulanIni;
  const wa = waLink(s.parentPhone);
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
  const segarkan = () => {
    refetch();
    qc.invalidateQueries({ queryKey: ["siswa"] });
  };

  const ubahStatus = () =>
    startTransition(async () => {
      try {
        await toggleStudentActive(s.id, !s.isActive);
        toast({ title: s.isActive ? "Anak dinonaktifkan" : "Anak diaktifkan kembali", description: s.name });
        setKonfirmasi(false);
        segarkan();
        router.refresh();
      } catch (err) {
        toast({ title: "Gagal mengubah status", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
      }
    });

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Siswa & Keluarga", href: "/students" }, ...(s.parentName ? [{ label: `Keluarga ${s.parentName.split(" ").slice(-1)[0]}` }] : [])]}
        title={
          <span className="flex items-center gap-4">
            <KidAvatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="xl" />
            <span>
              {s.name}
              <span className="mt-2 flex flex-wrap items-center gap-2 font-sans text-[13px] font-normal tracking-normal text-muted-foreground">
                {data.kelas.map((c) => (
                  <ClassChip key={c.id} id={c.id} name={c.name} />
                ))}
                {[s.dateOfBirth && formatUmur(s.dateOfBirth), s.registrationDate && `masuk ${formatTanggal(s.registrationDate)}`].filter(Boolean).join(" · ")}
                <StatusDot size="sm" varian={s.isActive ? "ok" : "off"}>
                  {s.isActive ? "Aktif" : "Nonaktif"}
                </StatusDot>
              </span>
            </span>
          </span>
        }
        actions={
          <>
            {wa && (
              <Button asChild variant="sec">
                <a href={wa} target="_blank" rel="noreferrer">
                  <MessageCircle aria-hidden />
                  WhatsApp wali
                </a>
              </Button>
            )}
            <Button variant="sec" onClick={() => setUbah(true)}>
              <Pencil aria-hidden />
              Ubah data
            </Button>
          </>
        }
      />
      <PageBody>
        {isError && <ErrorBanner title="Profil gagal diperbarui" description="Yang tampil adalah data terakhir yang berhasil dimuat." onRetry={() => refetch()} />}
        <div className={cn(isError && "stale")}>
          <Tabs defaultValue="ringkasan">
            <TabsList>
              <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
              <TabsTrigger value="hadir">Kehadiran</TabsTrigger>
              <TabsTrigger value="laporan">Laporan</TabsTrigger>
              <TabsTrigger value="tagihan">Tagihan</TabsTrigger>
            </TabsList>

            <TabsContent value="ringkasan">
              <div className="grid items-start gap-5 min-[1001px]:grid-cols-[minmax(0,1fr)_380px]">
                <div className="flex min-w-0 flex-col gap-5">
                  <KesehatanPanel k={data.kesehatan} />
                  <div className="grid gap-5 min-[561px]:grid-cols-2">
                    <Panel>
                      <PanelHeader title="Kehadiran" meta={formatPeriode(k.periode)} />
                      <PanelBody className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-5">
                          {[
                            [k.hadir + k.terlambat, "hadir"],
                            [k.sakit, "sakit"],
                            [k.izin, "izin"],
                            [k.alpa, "alpa"],
                          ].map(([n, l]) => (
                            <span key={l as string}>
                              <span className="tabular block text-lg">{n}</span>
                              <span className="text-[13px] text-muted-foreground">{l}</span>
                            </span>
                          ))}
                          <span>
                            <span className="tabular block text-lg">{k.rataTiba ? formatJam(k.rataTiba) : "—"}</span>
                            <span className="text-[13px] text-muted-foreground">rata-rata tiba</span>
                          </span>
                        </div>
                        {k.hari.length > 0 ? (
                          <div className="grid grid-cols-10 gap-1" aria-label="Kehadiran per hari bulan ini">
                            {k.hari.map((h) => (
                              <span
                                key={h.tanggal}
                                title={`${formatTanggal(h.tanggal, { tanpaTahun: true })} · ${statusKehadiran(h.status, h.permitType).label}`}
                                className={cn("h-[22px] rounded-xs", warnaHari(h.status, h.permitType), h.tanggal === data.tanggal && "ring-2 ring-foreground")}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-[13px] text-muted-foreground">Belum ada catatan bulan ini.</p>
                        )}
                      </PanelBody>
                    </Panel>
                    <Panel>
                      <PanelHeader title="Kelas & tagihan" />
                      <PanelBody className="flex flex-col gap-3">
                        {data.kelas.length === 0 ? (
                          <p className="text-[15px] text-muted-foreground">Belum masuk kelas. Pilih kelas lewat Ubah data.</p>
                        ) : (
                          data.kelas.map((c) => (
                            <div key={c.enrollmentId} className="flex items-start justify-between gap-3">
                              <span>
                                <b>{c.name}</b>
                                <span className="block text-[13px] text-muted-foreground">
                                  {c.sessionsQuota ? `${c.sessionsUsed ?? 0}/${c.sessionsQuota} sesi terpakai` : "Tanpa kuota sesi"}
                                  {c.billingDay ? ` · tagih tgl ${c.billingDay}` : ""}
                                </span>
                              </span>
                              {c.pricePerMonth !== null && <span className="tabular">{formatRupiah(c.pricePerMonth)}</span>}
                            </div>
                          ))
                        )}
                        <div className="border-t border-border-subtle pt-3">
                          {data.tagihan[0] ? (
                            <div className="flex items-center justify-between gap-3">
                              <span>
                                Tagihan {data.tagihan[0].periodeMulai ? formatPeriode(data.tagihan[0].periodeMulai) : data.tagihan[0].nomor}
                                <span className="block text-[13px] text-muted-foreground">
                                  {data.tagihan[0].dueDate ? `Jatuh tempo ${formatTanggal(data.tagihan[0].dueDate)}` : ""}
                                  <span className="tabular"> · {formatRupiah(data.tagihan[0].total)}</span>
                                </span>
                              </span>
                              <StatusDot size="sm" info={statusTagihan(data.tagihan[0].status)} />
                            </div>
                          ) : (
                            <p className="text-[15px] text-muted-foreground">Belum ada tagihan.</p>
                          )}
                        </div>
                      </PanelBody>
                    </Panel>
                  </div>
                  <Panel>
                    <PanelHeader title="Kabar terakhir" action={<span className="text-[13px] text-muted-foreground">laporan harian</span>} />
                    {data.laporan.length === 0 ? (
                      <PanelRow>
                        <RowText title="Belum ada laporan harian" sub={`Laporan muncul di sini setelah guru mengirimnya.`} />
                      </PanelRow>
                    ) : (
                      data.laporan.slice(0, 3).map((r) => (
                        <PanelRow key={r.id}>
                          <span className="tabular w-14 shrink-0 text-muted-foreground">{formatTanggal(r.tanggal, { tanpaTahun: true })}</span>
                          <RowText
                            title={r.activities || r.mood || "Laporan harian"}
                            sub={[r.meals && `Makan: ${r.meals}`, r.nap && `Tidur: ${r.nap}`, r.fotoCount ? `${r.fotoCount} foto` : null].filter(Boolean).join(" · ")}
                          />
                        </PanelRow>
                      ))
                    )}
                  </Panel>
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                  <Panel>
                    <PanelHeader title="Keluarga" />
                    <PanelRow>
                      <KidAvatar name={s.parentName || "Wali"} size="sm" krayon="anggur" />
                      <RowText
                        title={s.parentName || "Wali belum diisi"}
                        sub={
                          <>
                            Wali{s.parentPhone && <span className="tabular"> · {s.parentPhone}</span>}
                            {s.parentEmail && ` · ${s.parentEmail}`}
                          </>
                        }
                      />
                      <StatusDot size="sm" info={s.parentUserId ? STATUS_AKUN_WALI.aktif : { label: "Belum tertaut", varian: "off" }} />
                    </PanelRow>
                    {data.saudara.map((x) => (
                      <Link key={x.id} href={`/students/${x.id}`} className="block hover:bg-background">
                        <PanelRow>
                          <KidAvatar name={x.name} id={x.id} size="sm" />
                          <RowText title={x.name} sub={["Saudara", x.kelas, x.dateOfBirth && formatUmur(x.dateOfBirth)].filter(Boolean).join(" · ")} />
                        </PanelRow>
                      </Link>
                    ))}
                  </Panel>
                  <Panel>
                    <PanelHeader title="Tindakan" />
                    <button type="button" onClick={() => setTautkan(true)} className="block w-full text-left hover:bg-background">
                      <PanelRow>
                        <UserRoundCheck className="h-[18px] w-[18px] text-muted-foreground" aria-hidden />
                        <RowText title={s.parentUserId ? "Ganti akun wali" : "Tautkan akun wali"} />
                      </PanelRow>
                    </button>
                    <button type="button" onClick={() => setUbah(true)} className="block w-full text-left hover:bg-background">
                      <PanelRow>
                        <Pencil className="h-[18px] w-[18px] text-muted-foreground" aria-hidden />
                        <RowText title="Ubah data & pindah kelas" />
                      </PanelRow>
                    </button>
                    <button type="button" onClick={() => setKonfirmasi(true)} className="block w-full text-left hover:bg-background">
                      <PanelRow>
                        <Power className={cn("h-[18px] w-[18px]", s.isActive ? "text-destructive" : "text-muted-foreground")} aria-hidden />
                        <RowText title={<span className={cn(s.isActive && "text-destructive")}>{s.isActive ? "Nonaktifkan anak" : "Aktifkan kembali"}</span>} />
                      </PanelRow>
                    </button>
                  </Panel>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hadir">
              <Panel>
                <PanelHeader title="Kehadiran terbaru" meta="30 catatan terakhir" />
                {data.kehadiranTerbaru.length === 0 ? (
                  <PanelRow>
                    <RowText title="Belum ada catatan kehadiran" sub="Catatan muncul setelah anak di-check-in di menu Kehadiran." />
                  </PanelRow>
                ) : (
                  data.kehadiranTerbaru.map((a) => (
                    <PanelRow key={a.id}>
                      <span className="w-28 shrink-0">{formatTanggal(a.tanggal, { hari: true, tanpaTahun: true })}</span>
                      <span className="tabular flex-1 text-muted-foreground">
                        {a.checkIn ? formatJam(a.checkIn) : "—"}
                        {a.checkOut && ` – ${formatJam(a.checkOut)}`}
                        {a.kelas && <span className="font-sans"> · {a.kelas}</span>}
                      </span>
                      <StatusDot size="sm" info={statusKehadiran(a.status, a.permitType)} />
                    </PanelRow>
                  ))
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="laporan">
              <Panel>
                <PanelHeader title="Laporan harian" meta="20 terakhir" />
                {data.laporan.length === 0 ? (
                  <PanelRow>
                    <RowText title="Belum ada laporan harian" />
                  </PanelRow>
                ) : (
                  data.laporan.map((r) => (
                    <PanelRow key={r.id} stacked>
                      <span className="flex items-center justify-between gap-3">
                        <b>{formatTanggal(r.tanggal, { hari: true })}</b>
                        <StatusDot size="sm" info={STATUS_LAPORAN[r.status] ?? STATUS_LAPORAN.submitted} />
                      </span>
                      <span className="text-[15px] text-foreground-2">
                        {[r.mood && `Suasana hati: ${r.mood}`, r.meals && `Makan: ${r.meals}`, r.nap && `Tidur: ${r.nap}`, r.activities, r.notes].filter(Boolean).join(" · ") || "Tanpa catatan"}
                        {r.fotoCount > 0 && <span className="text-muted-foreground"> · {r.fotoCount} foto</span>}
                      </span>
                    </PanelRow>
                  ))
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="tagihan">
              <Panel>
                <PanelHeader title="Tagihan" meta="24 terakhir" />
                {data.tagihan.length === 0 ? (
                  <PanelRow>
                    <RowText title="Belum ada tagihan" sub={<Link href="/billing" className="font-semibold text-primary hover:underline">Buka Tagihan</Link>} />
                  </PanelRow>
                ) : (
                  data.tagihan.map((t) => (
                    <PanelRow key={t.id}>
                      <RowText
                        title={t.periodeMulai ? `Periode ${formatPeriode(t.periodeMulai)}` : t.nomor}
                        sub={
                          <>
                            <span className="tabular">{t.nomor}</span>
                            {t.dueDate && ` · jatuh tempo ${formatTanggal(t.dueDate)}`}
                            {t.paidAt && ` · dibayar ${formatTanggal(t.paidAt)}`}
                          </>
                        }
                      />
                      <span className="tabular">{formatRupiah(t.total)}</span>
                      <StatusDot size="sm" info={statusTagihan(t.status)} className="w-40 justify-end" />
                    </PanelRow>
                  ))
                )}
              </Panel>
            </TabsContent>
          </Tabs>
        </div>
      </PageBody>

      <UbahSiswaDialog siswa={untukDialog} kelas={kelas} open={ubah} onOpenChange={setUbah} onSaved={segarkan} />
      <TautkanWaliDialog siswa={untukDialog} akunWali={akunWali} open={tautkan} onOpenChange={setTautkan} onSaved={segarkan} />
      <AlertDialog open={konfirmasi} onOpenChange={setKonfirmasi}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{s.isActive ? `Nonaktifkan ${s.name}?` : `Aktifkan kembali ${s.name}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {s.isActive
                ? "Anak tidak lagi muncul di absen, laporan harian, dan penagihan bulan berikutnya. Riwayatnya tetap tersimpan dan bisa diaktifkan kembali."
                : "Anak akan kembali muncul di absen, laporan harian, dan penagihan."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); ubahStatus(); }} disabled={isPending} className={s.isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}>
              {isPending ? "Menyimpan…" : s.isActive ? "Nonaktifkan" : "Aktifkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
