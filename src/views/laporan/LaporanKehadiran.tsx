"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ClassChip,
  EmptyState,
  ErrorBanner,
  InfoBox,
  PageBody,
  PageHeader,
  Panel,
  PanelHeader,
  PanelRow,
  PanelRowsSkeleton,
  ProgressBar,
  RowText,
  Stale,
  StatCard,
  StatRow,
  StatRowSkeleton,
} from "@/components/bunayo";
import { formatJam, formatPeriode, formatTanggal } from "@/lib/format";
import { getLaporanKehadiran, type LaporanKehadiranData } from "@/server/actions/laporan";

/**
 * O12 Laporan — kehadiran anak per bulan per kelas.
 * Disembunyikan (BARU, REDESIGN-BACKLOG O12): jenis laporan lain (keuangan, pendaftaran, check-in guru, komunikasi,
 * laporan harian terkirim) dan kirim terjadwal via email. Ekspor memakai CSV yang dibuat di peramban dari angka yang tampil.
 */

const persen = (a: number, b: number) => (b > 0 ? Math.floor((a / b) * 100) : 0);

function unduhCsv(d: LaporanKehadiranData) {
  const baris = [
    ["Kelas", "Anak", "Hadir (hari-anak)", "Izin/Sakit", "Alpa", "Kehadiran %"],
    ...d.kelas.map((k) => [k.name, k.anak, k.hadir, k.izin, k.alpa, persen(k.hadir, k.hadir + k.izin + k.alpa)]),
    ["Total", d.total.anak, d.total.hadir, d.total.izin, d.total.alpa, persen(d.total.hadir, d.total.hadir + d.total.izin + d.total.alpa)],
  ];
  const csv = baris.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `kehadiran-${d.bulan}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LaporanKehadiran({ initialData, bulan }: { initialData?: LaporanKehadiranData; bulan?: string }) {
  const router = useRouter();
  const query = useQuery({ queryKey: ["laporan-kehadiran", bulan ?? "ini"], queryFn: () => getLaporanKehadiran(bulan), initialData });
  const { data, isError, refetch } = query;

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="LAPORAN" title="Kehadiran" />
        <PageBody>
          {isError ? (
            <ErrorBanner title="Laporan gagal dimuat" description="Tidak ada data yang berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <>
              <StatRowSkeleton />
              <Panel>
                <PanelRowsSkeleton rows={4} />
              </Panel>
            </>
          )}
        </PageBody>
      </>
    );
  }

  const periode = formatPeriode(`${data.bulan}-01`);
  const t = data.total;
  const tercatat = t.hadir + t.izin + t.alpa;
  const anakAlpa = data.alpa.length;

  return (
    <>
      <PageHeader
        eyebrow="LAPORAN"
        title={`Kehadiran · ${periode}`}
        actions={
          <>
            <Select value={data.bulan} onValueChange={(v) => router.push(v === data.bulanIni ? "/reports" : `/reports?bulan=${v}`)}>
              <SelectTrigger aria-label="Pilih bulan" className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.bulanTersedia.map((b) => (
                  <SelectItem key={b} value={b}>
                    {formatPeriode(`${b}-01`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {data.kelas.length > 0 && (
              <Button variant="sec" onClick={() => unduhCsv(data)}>
                <Download aria-hidden />
                CSV
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Angka di layar ini adalah contoh dari desain, bukan data lembaga mana pun.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner title="Laporan gagal diperbarui" description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`} onRetry={() => refetch()} />
        )}
        <Stale stale={isError}>
          <div className="grid grid-cols-1 items-start gap-5 min-[1001px]:grid-cols-[260px_minmax(0,1fr)]">
            <Panel className="max-[1000px]:hidden">
              <div className="flex items-center gap-3 bg-muted px-[18px] py-3.5">
                <ClipboardCheck className="h-[18px] w-[18px]" aria-hidden />
                <b className="flex-1">Kehadiran anak</b>
              </div>
              <p className="px-[18px] py-3 text-[13px] text-muted-foreground">
                Laporan keuangan ada di{" "}
                <Link href="/billing/ringkasan" className="font-semibold text-primary hover:underline">
                  Keuangan › Ringkasan
                </Link>
                . Jenis laporan lain belum tersedia.
              </p>
            </Panel>

            {data.kelas.length === 0 ? (
              <EmptyState
                title={`Belum ada catatan kehadiran ${periode}`}
                description="Laporan terisi dari absen harian di menu Kehadiran. Pilih bulan lain atau mulai mengabsen anak."
                action={
                  <Button asChild>
                    <Link href="/attendance">Buka Kehadiran</Link>
                  </Button>
                }
              />
            ) : (
              <div className="flex min-w-0 flex-col gap-5">
                <StatRow>
                  <StatCard
                    label="Rata-rata hadir"
                    periode={periode}
                    value={`${persen(t.hadir, tercatat)}%`}
                    big
                    stabilo
                    linkLabel={`${t.hariSekolah} hari tercatat · ${t.anak} anak`}
                  />
                  <StatCard label="Izin + sakit" periode={periode} value={t.izin} suffix=" hari-anak" />
                  <StatCard
                    label="Alpa"
                    periode={periode}
                    value={t.alpa}
                    tone={t.alpa ? "red" : undefined}
                    linkLabel={anakAlpa ? `${anakAlpa} anak · lihat` : undefined}
                    onClick={anakAlpa ? () => document.getElementById("daftar-alpa")?.scrollIntoView({ behavior: "smooth" }) : undefined}
                  />
                  <StatCard label="Rata-rata tiba" periode={periode} value={t.rataTibaMenit != null ? formatJam(`${Math.floor(t.rataTibaMenit / 60)}:${String(t.rataTibaMenit % 60).padStart(2, "0")}`) : "—"} />
                </StatRow>

                <Panel>
                  <PanelHeader title="Per kelas" meta="hadir ÷ hari-anak tercatat" />
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="px-[18px] py-2.5 font-semibold">Kelas</th>
                          <th className="w-[40%] px-3.5 py-2.5 font-semibold">Kehadiran</th>
                          <th className="px-3.5 py-2.5 text-right font-semibold">Hadir</th>
                          <th className="px-3.5 py-2.5 text-right font-semibold">Izin/Sakit</th>
                          <th className="px-[18px] py-2.5 text-right font-semibold">Alpa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.kelas.map((k) => {
                          const p = persen(k.hadir, k.hadir + k.izin + k.alpa);
                          return (
                            <tr key={k.classId} className="border-b border-border-subtle last:border-b-0">
                              <td className="px-[18px] py-3">
                                <ClassChip name={k.name} id={k.classId} />
                              </td>
                              <td className="px-3.5 py-3">
                                <span className="flex items-center gap-3">
                                  <ProgressBar value={p} max={100} tone={p < 80 ? "matahari" : "daun"} className="flex-1" label={`Kehadiran ${k.name}`} />
                                  <span className="tabular w-10 text-[13px]">{p}%</span>
                                </span>
                              </td>
                              <td className="tabular px-3.5 py-3 text-right">{k.hadir}</td>
                              <td className="tabular px-3.5 py-3 text-right">{k.izin}</td>
                              <td className={`tabular px-[18px] py-3 text-right ${k.alpa ? "font-semibold text-destructive" : ""}`}>{k.alpa}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Panel>

                {anakAlpa > 0 && (
                  <Panel id="daftar-alpa">
                    <PanelHeader title="Anak dengan alpa" meta={periode} />
                    {data.alpa.map((a) => (
                      <PanelRow key={`${a.studentId}:${a.classId}`}>
                        <RowText
                          title={
                            data.isDemo ? (
                              a.name
                            ) : (
                              <Link href={`/students/${a.studentId}`} className="hover:underline">
                                {a.name}
                              </Link>
                            )
                          }
                          sub={a.tanggal.length ? a.tanggal.map((d) => formatTanggal(d, { tanpaTahun: true })).join(", ") : undefined}
                        />
                        <ClassChip name={a.className} id={a.classId} className="max-[560px]:hidden" />
                        <span className="tabular w-[70px] text-right font-semibold text-destructive">{a.alpa} hari</span>
                      </PanelRow>
                    ))}
                  </Panel>
                )}

                <p className="text-[13px] text-muted-foreground">
                  Persentase dihitung dari hari yang diabsen (hadir + terlambat dibanding semua catatan), bukan dari hari sekolah terjadwal, karena
                  kalender libur belum ada. Kirim laporan terjadwal via email belum tersedia.
                </p>
              </div>
            )}
          </div>
        </Stale>
      </PageBody>
    </>
  );
}
