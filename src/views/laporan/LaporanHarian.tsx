"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  ErrorBanner,
  FeedItem,
  InfoBox,
  KidAvatar,
  PageBody,
  PageHeader,
  Panel,
  PanelHeader,
  PanelRow,
  PanelRowsSkeleton,
  Stale,
  StatusDot,
} from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { formatEyebrow, formatJam, formatTanggal } from "@/lib/format";
import { KELAS_KRAYON, KRAYON_KEGIATAN, type JenisKegiatan } from "@/lib/krayon";
import type { StatusInfo } from "@/lib/status";
import { cn } from "@/lib/utils";
import { deleteDailyReport } from "@/server/actions/dailyReports";
import { getLaporanHarian, type BarisLaporan, type LaporanAnak, type LaporanHarianData } from "@/server/actions/laporanHarian";
import { TulisLaporanDialog } from "./TulisLaporanDialog";

/**
 * O7 Laporan harian per kelas: siapa sudah dilaporkan, kegiatan apa saja yang tercatat (bilah krayon), dan isi laporan.
 * Disembunyikan (BARU, REDESIGN-BACKLOG O7): feed event berwaktu, insiden + konfirmasi baca, status "Belum dibaca",
 * "Kurang makan", ringkasan otomatis 16.00, "Lihat sebagai ortu", izin publikasi foto.
 */

function kegiatan(l: LaporanAnak): JenisKegiatan[] {
  const out: JenisKegiatan[] = [];
  if (l.meals) out.push("makan");
  if (l.activities) out.push("bermain");
  if (l.photos.length) out.push("foto");
  if (l.nap) out.push("tidur");
  if (l.mood || l.notes) out.push("momen");
  return out;
}

const LABEL: Record<JenisKegiatan, string> = { makan: "Makan", bermain: "Kegiatan", foto: "foto", tidur: "Tidur", momen: "Catatan", toilet: "Toilet", obat: "Obat" };

function ringkas(b: BarisLaporan): string {
  if (b.laporan) {
    return kegiatan(b.laporan)
      .map((k) => (k === "foto" ? `${b.laporan!.photos.length} foto` : LABEL[k]))
      .join(" · ");
  }
  if (b.absen === "permit") return "Izin";
  if (b.absen === "absent") return "Tidak hadir";
  if (!b.absen) return "Belum tiba";
  return "Belum ada laporan";
}

function status(b: BarisLaporan): StatusInfo {
  if (b.laporan) return { label: "Terkirim", varian: "ok" };
  if (b.absen === "present" || b.absen === "late") return { label: "Belum ditulis", varian: "wait" };
  return { label: "—", varian: "off" };
}

const fotoSrc = (k: string) => (k.startsWith("http") || k.startsWith("/") ? k : `/api/photos/${k}`);

function DetailLaporan({ b, bisaUbah, onHapus }: { b: BarisLaporan; bisaUbah: boolean; onHapus: (id: string) => void }) {
  const l = b.laporan;
  return (
    <Panel className="min-[1001px]:sticky min-[1001px]:top-6">
      <PanelHeader title={`${b.name.split(" ")[0]} · laporan`} meta={l?.dikirim ? `dikirim ${formatJam(l.dikirim)}` : undefined} />
      {!l ? (
        <div className="px-[18px] py-4 text-[15px] text-muted-foreground">
          {b.absen === "present" || b.absen === "late" ? "Belum ada laporan untuk anak ini. Pilih lalu tulis laporan." : `${ringkas(b)}.`}
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-[18px] py-4">
          {l.meals && <FeedItem jenis="makan" detail={l.meals} />}
          {l.activities && <FeedItem jenis="bermain" title="Kegiatan" detail={l.activities} />}
          {l.photos.length > 0 && (
            <FeedItem jenis="foto" title={`${l.photos.length} foto`}>
              <span className="grid grid-cols-3 gap-1.5">
                {l.photos.map((k, i) => (
                  <img key={k} src={fotoSrc(k)} alt={`Foto ${b.name} ${i + 1}`} className="h-[74px] w-full rounded-input bg-muted object-cover" loading="lazy" />
                ))}
              </span>
            </FeedItem>
          )}
          {l.nap && <FeedItem jenis="tidur" detail={l.nap} />}
          {(l.mood || l.notes) && <FeedItem jenis="momen" title="Catatan" detail={[l.mood, l.notes].filter(Boolean).join(" · ")} />}
          <span className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3 text-[13px] text-muted-foreground">
            <span>
              Ditulis {l.penulis ?? "staf"}
              {l.dikirim ? ` · ${formatJam(l.dikirim)}` : ""}
            </span>
            {bisaUbah && (
              <Button variant="txt" size="sm" onClick={() => onHapus(l.id)}>
                <Trash2 aria-hidden />
                Hapus
              </Button>
            )}
          </span>
        </div>
      )}
    </Panel>
  );
}

export default function LaporanHarian({ initialData, tanggal }: { initialData?: LaporanHarianData; tanggal?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({
    queryKey: ["laporan-harian", tanggal ?? "hari-ini"],
    queryFn: () => getLaporanHarian(tanggal),
    initialData,
  });
  const { data, isError, refetch } = query;
  const [tab, setTab] = useState<string | null>(null);
  const [aktifId, setAktifId] = useState<string | null>(null);
  const [tulis, setTulis] = useState<{ open: boolean; awal: string[] }>({ open: false, awal: [] });
  const tanggalRef = useRef<HTMLInputElement>(null);

  const hapus = useMutation({
    mutationFn: (id: string) => deleteDailyReport(id),
    onSuccess: () => {
      toast({ title: "Laporan dihapus" });
      qc.invalidateQueries({ queryKey: ["laporan-harian"] });
    },
    onError: (err: Error) => toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" }),
  });

  const judul = "Laporan harian";
  const tabFoto = (
    <Button asChild variant="sec">
      <Link href="/daily-reports/foto">Foto</Link>
    </Button>
  );

  if (!data) {
    return (
      <>
        <PageHeader title={judul} actions={tabFoto} />
        <PageBody>
          {isError ? (
            <ErrorBanner title="Laporan harian gagal dimuat" description="Tidak ada data yang berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <Panel>
              <PanelRowsSkeleton rows={6} avatar />
            </Panel>
          )}
        </PageBody>
      </>
    );
  }

  const kelasIsi = data.kelas.filter((k) => k.terdaftar > 0);
  const aktifKelas = tab ?? kelasIsi[0]?.id ?? null;
  const rows = data.baris.filter((r) => r.classId === aktifKelas);
  const aktif = rows.find((r) => r.studentId === aktifId) ?? rows.find((r) => r.laporan) ?? rows[0] ?? null;
  const bisaUbah = !data.isDemo;
  const belumLapor = rows.filter((r) => !r.laporan);
  const hariIni = data.tanggal === data.hariIni;

  const pilihTanggal = (v: string) => {
    if (!v) return;
    router.push(v === data.hariIni ? "/daily-reports" : `/daily-reports?tanggal=${v}`);
  };

  return (
    <>
      <PageHeader
        eyebrow={hariIni ? formatEyebrow(new Date()) : formatTanggal(data.tanggal, { hari: true }).toUpperCase()}
        title={judul}
        actions={
          <>
            {tabFoto}
            <span className="relative">
              <Button variant="sec" onClick={() => tanggalRef.current?.showPicker?.()} aria-label="Pilih tanggal">
                {hariIni ? `Hari ini · ${formatTanggal(data.tanggal, { tanpaTahun: true })}` : formatTanggal(data.tanggal)}
                <ChevronDown aria-hidden />
              </Button>
              <Input
                ref={tanggalRef}
                type="date"
                tabIndex={-1}
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full opacity-0"
                value={data.tanggal}
                max={data.hariIni}
                onChange={(e) => pilihTanggal(e.target.value)}
              />
            </span>
            {bisaUbah && kelasIsi.length > 0 && (
              <Button
                onClick={() =>
                  setTulis({ open: true, awal: aktif && !aktif.laporan ? [aktif.studentId] : [] })
                }
              >
                <Plus aria-hidden />
                Tulis laporan
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Nama dan isi laporan di layar ini adalah contoh, bukan data lembaga mana pun. Penulisan dinonaktifkan.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner
            title="Laporan harian gagal diperbarui"
            description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`}
            onRetry={() => refetch()}
          />
        )}
        {!hariIni && !data.isDemo && (
          <InfoBox>
            Melihat <b>{formatTanggal(data.tanggal, { hari: true })}</b>. Laporan yang ditulis dari sini tercatat untuk tanggal itu.{" "}
            <Link href="/daily-reports" className="font-semibold text-primary hover:underline">
              Kembali ke hari ini
            </Link>
          </InfoBox>
        )}

        {kelasIsi.length === 0 ? (
          <EmptyState
            title="Belum ada anak di kelas"
            description="Laporan harian ditulis per anak. Daftarkan anak ke kelas dulu."
            action={
              <Button asChild>
                <Link href="/students/baru">Daftarkan anak</Link>
              </Button>
            }
          />
        ) : (
          <Stale stale={isError}>
            <div className="flex flex-col gap-5">
              <Tabs
                value={aktifKelas ?? undefined}
                onValueChange={(v) => {
                  setTab(v);
                  setAktifId(null);
                }}
              >
                <TabsList className="gap-5 overflow-x-auto">
                  {kelasIsi.map((k) => (
                    <TabsTrigger key={k.id} value={k.id} className="whitespace-nowrap">
                      {k.name}{" "}
                      <span className="tabular text-muted-foreground">
                        {k.terlapor}/{k.terdaftar}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="grid items-start gap-5 min-[1001px]:grid-cols-[minmax(0,1fr)_380px]">
                <Panel>
                  {rows.map((r) => {
                    const on = aktif?.studentId === r.studentId;
                    return (
                      <PanelRow
                        key={r.studentId}
                        role="button"
                        tabIndex={0}
                        aria-pressed={on}
                        onClick={() => setAktifId(r.studentId)}
                        onKeyDown={(e) => e.key === "Enter" && setAktifId(r.studentId)}
                        className={cn("cursor-pointer hover:bg-muted max-[560px]:flex-nowrap", on && "bg-muted shadow-[inset_3px_0_0_hsl(var(--foreground))]")}
                      >
                        <KidAvatar name={r.name} id={r.studentId} photoUrl={r.photoUrl} size="sm" />
                        <span className="min-w-0 flex-1">
                          <b className="block truncate text-[15px]">{r.name}</b>
                          <span className={cn("block truncate text-[13px]", r.laporan ? "text-foreground-2" : "text-muted-foreground")}>{ringkas(r)}</span>
                        </span>
                        {r.laporan && (
                          <span className="flex gap-1 max-[560px]:hidden" aria-hidden>
                            {kegiatan(r.laporan).map((k) => (
                              <span key={k} className={cn("h-[18px] w-[5px] rounded-full", KELAS_KRAYON[KRAYON_KEGIATAN[k]].bg)} />
                            ))}
                          </span>
                        )}
                        <span className="w-[110px] shrink-0 max-[560px]:w-auto">
                          <StatusDot info={status(r)} size="sm" />
                        </span>
                      </PanelRow>
                    );
                  })}
                  {bisaUbah && belumLapor.some((r) => r.absen === "present" || r.absen === "late") && (
                    <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-[18px] py-3 text-[13px] text-muted-foreground">
                      <span>{belumLapor.filter((r) => r.absen === "present" || r.absen === "late").length} anak hadir belum dilaporkan</span>
                      <Button
                        variant="sec"
                        size="sm"
                        onClick={() =>
                          setTulis({
                            open: true,
                            awal: belumLapor.filter((r) => r.absen === "present" || r.absen === "late").map((r) => r.studentId),
                          })
                        }
                      >
                        Tulis untuk semuanya
                      </Button>
                    </div>
                  )}
                </Panel>
                {aktif && <DetailLaporan b={aktif} bisaUbah={bisaUbah} onHapus={(id) => hapus.mutate(id)} />}
              </div>
              <p className="text-[13px] text-muted-foreground">
                Laporan ditulis guru dari portalnya atau admin dari sini, satu per anak per hari. Status dibaca orang tua, catatan insiden, dan ringkasan
                otomatis sore hari belum tersedia.
              </p>
            </div>
          </Stale>
        )}
      </PageBody>
      {bisaUbah && (
        <TulisLaporanDialog
          open={tulis.open}
          onOpenChange={(open) => setTulis((t) => ({ ...t, open }))}
          tanggal={data.tanggal}
          anak={belumLapor.map((r) => ({ id: r.studentId, name: r.name }))}
          terpilihAwal={tulis.awal}
        />
      )}
    </>
  );
}
