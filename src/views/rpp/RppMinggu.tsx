"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ClipboardCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { EmptyState, ErrorBanner, InfoBox, PageBody, PageHeader, Panel, PanelRowsSkeleton, Stale, StatusDot } from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { formatJam, formatTanggal } from "@/lib/format";
import { HARI_JADWAL, jamSelesai } from "@/lib/jadwal";
import { KELAS_KRAYON, KRAYON } from "@/lib/krayon";
import type { StatusInfo } from "@/lib/status";
import { cn } from "@/lib/utils";
import { createLessonPlan } from "@/server/actions/lessonPlans";
import { getRppMinggu, type Rpp, type RppMingguData } from "@/server/actions/rpp";
import { LABEL_STATUS_RPP, RppDialog } from "./RppDialog";

/**
 * O8 RPP — papan mingguan per kelas, kolom per hari (pengganti kartu panjang).
 * Disembunyikan (BARU, REDESIGN-BACKLOG O8): libur bertanggal yang otomatis mengosongkan hari,
 * tujuan terhubung ke indikator Perkembangan, trial yang ikut sesi.
 */

function geser(tgl: string, hari: number) {
  const [y, m, d] = tgl.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + hari)).toISOString().slice(0, 10);
}

const STATUS: Record<Rpp["status"], StatusInfo> = {
  draft: { label: LABEL_STATUS_RPP.draft, varian: "off" },
  upcoming: { label: LABEL_STATUS_RPP.upcoming, varian: "info" },
  in_progress: { label: LABEL_STATUS_RPP.in_progress, varian: "wait" },
  completed: { label: LABEL_STATUS_RPP.completed, varian: "ok" },
};

/** Jam mulai tiap kegiatan: jam mulai RPP + durasi kegiatan sebelumnya. */
function jamKegiatan(r: Rpp): (string | null)[] {
  const mulai = r.timeRange?.split(/\s*-\s*/)[0];
  if (!mulai) return r.activities.map(() => null);
  let jam = mulai;
  return r.activities.map((a) => {
    const ini = jam;
    jam = jamSelesai(jam, a.durationMinutes);
    return ini;
  });
}

function judulMinggu(senin: string, akhir: string) {
  return senin.slice(0, 7) === akhir.slice(0, 7)
    ? `${Number(senin.slice(8))}–${formatTanggal(akhir, { tanpaTahun: true })}`
    : `${formatTanggal(senin, { tanpaTahun: true })}–${formatTanggal(akhir, { tanpaTahun: true })}`;
}

export default function RppMinggu({ initialData, minggu }: { initialData?: RppMingguData; minggu?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: ["rpp-minggu", minggu ?? "ini"], queryFn: () => getRppMinggu(minggu), initialData });
  const { data, isError, refetch } = query;
  const [tab, setTab] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; rpp: Rpp | null; awal?: { classId?: string; planDate?: string; subject?: string } }>({
    open: false,
    rpp: null,
  });
  const [salinOpen, setSalinOpen] = useState(false);

  const salin = useMutation({
    mutationFn: async (daftar: Rpp[]) => {
      for (const r of daftar) {
        await createLessonPlan({
          title: r.title,
          subject: r.subject,
          classId: r.classId,
          planDate: geser(r.planDate, 7),
          timeRange: r.timeRange,
          objectives: r.objectives,
          activities: r.activities.map((a) => ({ title: a.title, durationMinutes: a.durationMinutes, description: a.description })),
          materials: r.materials,
        });
      }
      return daftar.length;
    },
    onSuccess: (n) => {
      toast({ title: `${n} RPP disalin dari minggu lalu` });
      setSalinOpen(false);
      qc.invalidateQueries({ queryKey: ["rpp-minggu"] });
    },
    onError: (err: Error) => {
      toast({ title: "Gagal menyalin", description: err.message, variant: "destructive" });
      qc.invalidateQueries({ queryKey: ["rpp-minggu"] });
    },
  });

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="PEMBELAJARAN" title="RPP" />
        <PageBody>
          {isError ? (
            <ErrorBanner title="RPP gagal dimuat" description="Tidak ada data yang berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <div className="grid gap-5 min-[1001px]:grid-cols-5 min-[561px]:grid-cols-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Panel key={i}>
                  <PanelRowsSkeleton rows={3} />
                </Panel>
              ))}
            </div>
          )}
        </PageBody>
      </>
    );
  }

  const bisaUbah = !data.isDemo;
  const aktifKelas = tab && data.kelas.some((k) => k.id === tab) ? tab : (data.kelas[0]?.id ?? null);
  const rppKelas = data.rpp.filter((r) => r.classId === aktifKelas);
  const sesi = (aktifKelas && data.hariSesi[aktifKelas]) || [];
  const pakaiSabtu = sesi.includes(6) || rppKelas.some((r) => r.planDate === geser(data.senin, 5));
  const hari = HARI_JADWAL.filter((h) => h.dow <= (pakaiSabtu ? 6 : 5));
  const akhir = geser(data.senin, hari.length - 1);
  const tema = [...new Set(rppKelas.map((r) => r.subject).filter(Boolean))] as string[];
  const tujuan = [...new Set(rppKelas.flatMap((r) => r.objectives))];
  const tanggalTerisi = new Set(rppKelas.map((r) => r.planDate));
  const bisaDisalin = data.mingguLalu.filter((r) => r.classId === aktifKelas && !tanggalTerisi.has(geser(r.planDate, 7)));
  const namaKelas = data.kelas.find((k) => k.id === aktifKelas)?.name ?? "";
  const kelasOpsi = data.kelas;

  const keMinggu = (offset: number) => {
    const s = geser(data.senin, offset);
    const seninIni = geser(data.hariIni, -((new Date(`${data.hariIni}T00:00:00Z`).getUTCDay() + 6) % 7));
    router.push(s === seninIni ? "/lesson-plans" : `/lesson-plans?minggu=${s}`);
  };
  const tambah = (planDate?: string) =>
    setDialog({ open: true, rpp: null, awal: { classId: aktifKelas ?? undefined, planDate: planDate ?? data.hariIni, subject: tema[0] } });

  return (
    <>
      <PageHeader
        eyebrow={`PEMBELAJARAN${tema.length === 1 ? ` · TEMA: ${tema[0].toUpperCase()}` : ""}`}
        title={`RPP ${judulMinggu(data.senin, akhir)}`}
        actions={
          <>
            <span className="flex">
              <Button variant="sec" size="icon" className="rounded-r-none" aria-label="Minggu sebelumnya" onClick={() => keMinggu(-7)}>
                <ChevronLeft aria-hidden />
              </Button>
              <Button variant="sec" size="icon" className="-ml-[1.5px] rounded-l-none" aria-label="Minggu berikutnya" onClick={() => keMinggu(7)}>
                <ChevronRight aria-hidden />
              </Button>
            </span>
            {bisaUbah && bisaDisalin.length > 0 && (
              <Button variant="sec" onClick={() => setSalinOpen(true)}>
                Salin dari minggu lalu
              </Button>
            )}
            {bisaUbah && data.kelas.length > 0 && (
              <Button onClick={() => tambah()}>
                <Plus aria-hidden />
                RPP
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Rencana di layar ini adalah contoh dari desain, bukan data lembaga mana pun. Perubahan dinonaktifkan.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner title="RPP gagal diperbarui" description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`} onRetry={() => refetch()} />
        )}
        {data.kelas.length === 0 ? (
          <EmptyState
            title="Belum ada kelas aktif"
            description="RPP disusun per kelas. Buat kelas dulu, lalu kembali ke sini."
            action={
              <Button asChild>
                <Link href="/classes">Buka Kelas & Program</Link>
              </Button>
            }
          />
        ) : (
          <Stale stale={isError}>
            <div className="flex flex-col gap-5">
              <Tabs value={aktifKelas ?? undefined} onValueChange={setTab}>
                <TabsList className="gap-5 overflow-x-auto">
                  {data.kelas.map((k) => (
                    <TabsTrigger key={k.id} value={k.id} className="whitespace-nowrap">
                      {k.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {rppKelas.length === 0 ? (
                <EmptyState
                  title="Belum ada RPP minggu ini"
                  description={`Buat rencana kegiatan per hari untuk ${namaKelas}. Guru melihatnya di aplikasi sebelum kelas dimulai.`}
                  action={
                    bisaUbah ? (
                      <span className="flex flex-wrap gap-2">
                        <Button onClick={() => tambah(sesi.length ? geser(data.senin, Math.min(...sesi) - 1) : data.senin)}>Buat RPP</Button>
                        {bisaDisalin.length > 0 && (
                          <Button variant="sec" onClick={() => setSalinOpen(true)}>
                            Salin {bisaDisalin.length} RPP minggu lalu
                          </Button>
                        )}
                      </span>
                    ) : undefined
                  }
                />
              ) : (
                <div
                  className={cn(
                    "grid items-start gap-4 max-[560px]:grid-cols-1 min-[561px]:grid-cols-2",
                    pakaiSabtu ? "min-[1001px]:grid-cols-6" : "min-[1001px]:grid-cols-5",
                  )}
                >
                  {hari.map((h, i) => {
                    const tgl = geser(data.senin, i);
                    const isi = rppKelas.filter((r) => r.planDate === tgl);
                    const adaSesi = sesi.includes(h.dow);
                    const hariIni = tgl === data.hariIni;
                    return (
                      <Panel
                        key={h.dow}
                        className={cn(hariIni && "border-2 border-foreground", !isi.length && !adaSesi && "opacity-60")}
                      >
                        <header className="flex min-h-[53px] items-center justify-between gap-2 border-b border-foreground px-4 py-2">
                          <h3 className="font-display text-[17px] font-bold tracking-tight">
                            <span className={cn(hariIni && "hl")}>
                              {h.pendek} {Number(tgl.slice(8))}
                            </span>
                          </h3>
                          {isi.length === 1 ? (
                            <StatusDot info={STATUS[isi[0].status]} size="sm" />
                          ) : bisaUbah && isi.length === 0 && adaSesi ? (
                            <Button variant="txt" size="sm" onClick={() => tambah(tgl)}>
                              <Plus aria-hidden />
                              RPP
                            </Button>
                          ) : null}
                        </header>
                        {isi.length === 0 ? (
                          <p className="px-4 py-3 text-[13px] text-muted-foreground">{adaSesi ? "Belum ada rencana" : "Tidak ada sesi"}</p>
                        ) : (
                          isi.map((r) => {
                            const jam = jamKegiatan(r);
                            return (
                              <button
                                key={r.id}
                                type="button"
                                disabled={!bisaUbah}
                                onClick={() => setDialog({ open: true, rpp: r })}
                                className="block w-full border-b border-border-subtle text-left last:border-b-0 enabled:hover:bg-muted disabled:cursor-default"
                              >
                                <span className="flex items-baseline justify-between gap-2 px-4 pt-3 text-[13px]">
                                  <b className="truncate">{r.title}</b>
                                  {isi.length > 1 && <StatusDot info={STATUS[r.status]} size="sm" />}
                                </span>
                                {r.activities.map((a, j) => (
                                  <span key={a.id} className="flex gap-2.5 px-4 py-1.5 text-[13px] leading-snug">
                                    <span className="tabular w-[38px] shrink-0 text-muted-foreground">{jam[j] ? formatJam(jam[j]!) : `${a.durationMinutes}′`}</span>
                                    <span className={cn(a.completed && "text-muted-foreground line-through decoration-1")}>{a.title}</span>
                                  </span>
                                ))}
                                {r.materials.length > 0 && (
                                  <span className="flex gap-2 px-4 pb-1.5 text-[13px] text-muted-foreground">
                                    <ClipboardCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                                    Bahan: {r.materials.join(", ")}
                                  </span>
                                )}
                                <span className="block px-4 pb-3 pt-1 text-xs text-muted-foreground">{r.penulis ?? "Admin"}</span>
                              </button>
                            );
                          })
                        )}
                      </Panel>
                    );
                  })}
                </div>
              )}

              {tujuan.length > 0 && (
                <Panel className="flex flex-wrap items-center gap-3 px-[18px] py-3.5">
                  <b className="text-[15px]">Tujuan minggu ini</b>
                  {tujuan.map((t, i) => {
                    const k = KELAS_KRAYON[KRAYON[(i + 2) % KRAYON.length]];
                    return (
                      <span key={t} className={cn("rounded-full px-2.5 py-0.5 text-[13px] font-semibold", k.soft, k.ink)}>
                        {t}
                      </span>
                    );
                  })}
                </Panel>
              )}
              <p className="text-[13px] text-muted-foreground">
                Hari tanpa sesi di jadwal kelas tampil redup. Libur bertanggal yang otomatis mengosongkan hari dan tujuan yang terhubung ke
                indikator perkembangan belum tersedia.
              </p>
            </div>
          </Stale>
        )}
      </PageBody>
      {bisaUbah && (
        <>
          <RppDialog rpp={dialog.rpp} awal={dialog.awal} kelas={kelasOpsi} open={dialog.open} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
          <AlertDialog open={salinOpen} onOpenChange={setSalinOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Salin {bisaDisalin.length} RPP {namaKelas} dari minggu lalu?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Tiap RPP disalin ke hari yang sama minggu ini dengan status Direncanakan dan kegiatan belum dicentang. Hari yang sudah punya RPP
                  tidak ditimpa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={salin.isPending}>Batal</AlertDialogCancel>
                <AlertDialogAction
                  disabled={salin.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    salin.mutate(bisaDisalin);
                  }}
                >
                  {salin.isPending ? "Menyalin…" : "Salin"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
}
