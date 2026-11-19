"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ClassChip,
  ErrorBanner,
  InfoBox,
  PageBody,
  PageHeader,
  Panel,
  PanelHeader,
  PanelRow,
  ProgressBar,
  Stale,
  StatCard,
  StatRow,
  StatRowSkeleton,
} from "@/components/bunayo";
import { formatRupiah, formatRupiahSingkat } from "@/lib/format";
import { getKeuangan, type KeuanganData } from "@/server/actions/keuangan";

/**
 * K1 Ringkasan keuangan. Angka dari action yang sama dengan P1 (selaras). Satu stabilo: Diterima.
 * Grafik uang masuk membandingkan bulan berjalan s.d. hari ini dengan bulan-bulan penuh sebelumnya.
 * Panel Pencairan/settlement disembunyikan (data belum ada — BARU, REDESIGN-BACKLOG).
 */

export default function Ringkasan({ initialData }: { initialData?: KeuanganData }) {
  const query = useQuery({ queryKey: ["keuangan"], queryFn: getKeuangan, initialData });
  const { data, isError, refetch } = query;

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="KEUANGAN" title="Ringkasan" />
        <PageBody>
          <StatRowSkeleton count={4} />
          <div className="grid gap-5 min-[1001px]:grid-cols-[1.2fr_1fr]">
            <PanelSkeleton />
            <div className="flex flex-col gap-5">
              <PanelSkeleton />
              <PanelSkeleton />
            </div>
          </div>
        </PageBody>
      </>
    );
  }

  const belumTerbit = data.perluDitagih.estimasi;
  const maxBulan = Math.max(...data.perBulan.map((b) => b.total), 1);

  return (
    <>
      <PageHeader eyebrow="KEUANGAN" title={`Ringkasan ${data.periode}`} />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Angka di layar ini adalah contoh, bukan data lembaga mana pun.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner
            title="Ringkasan gagal diperbarui"
            description={`Yang tampil adalah data terakhir pukul ${new Date(data.diambilPada).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.`}
            onRetry={() => refetch()}
          />
        )}

        {data.kosong ? (
          <Panel className="p-0">
            <BelumAdaTagihan />
          </Panel>
        ) : (
          <Stale stale={isError}>
            <div className="flex flex-col gap-5">
              <StatRow className="rise">
                <StatCard
                  label="Total tagihan"
                  periode={data.periode}
                  value={formatRupiah(data.terbit + belumTerbit)}
                  linkLabel={`${data.terbitKeluarga} keluarga terbit · ${data.perluDitagih.anak} belum`}
                />
                <StatCard
                  label="Diterima"
                  periode={data.periode}
                  value={formatRupiahSingkat(data.diterima)}
                  big
                  stabilo
                  href="/billing"
                  linkLabel={`${data.diterimaKeluarga} keluarga lunas`}
                />
                <StatCard
                  label="Menunggu"
                  periode="belum jatuh tempo"
                  value={formatRupiah(data.menunggu)}
                  href="/billing"
                  linkLabel={`${data.menungguKeluarga} keluarga`}
                />
                <StatCard
                  label="Belum terbit"
                  periode={data.periode}
                  value={formatRupiah(belumTerbit)}
                  tone="red"
                  href="/billing"
                  linkLabel={`${data.perluDitagih.anak} anak · Tinjau & terbitkan`}
                />
              </StatRow>

              <div className="grid items-start gap-5 min-[1001px]:grid-cols-[1.2fr_1fr]">
                <div className="flex min-w-0 flex-col gap-5">
                  <Panel>
                    <PanelHeader title="Uang masuk per bulan" meta="6 bulan terakhir · per tanggal bayar" />
                    <PanelRow stacked>
                      <GrafikBulan perBulan={data.perBulan} max={maxBulan} />
                      <p className="text-[13px] text-muted-foreground">
                        dalam juta Rupiah · bulan berjalan dihitung s.d. hari ini, bulan sebelumnya penuh.
                      </p>
                    </PanelRow>
                  </Panel>

                  <Panel>
                    <PanelHeader title="Per kelas" meta={data.periode} />
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-[13px] font-medium text-muted-foreground">
                            <th className="px-[18px] py-2.5">Kelas</th>
                            <th className="px-3 py-2.5 text-right">Anak</th>
                            <th className="px-3 py-2.5 text-right">Tagihan</th>
                            <th className="px-3 py-2.5 text-right">Diterima</th>
                            <th className="w-[28%] px-[18px] py-2.5">Progres</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.perKelas.map((k) => (
                            <tr key={k.id} className="border-b border-border-subtle last:border-b-0">
                              <td className="px-[18px] py-[11px]">
                                <ClassChip id={k.id} name={k.name} />
                              </td>
                              <td className="tabular px-3 py-[11px] text-right">{k.anak}</td>
                              <td className="tabular px-3 py-[11px] text-right">{k.tagihan > 0 ? formatRupiah(k.tagihan) : "—"}</td>
                              <td className="tabular px-3 py-[11px] text-right">{k.diterima > 0 ? formatRupiah(k.diterima) : "—"}</td>
                              <td className="px-[18px] py-[11px]">
                                <ProgressBar value={k.diterima} max={k.tagihan} label={`Diterima ${k.name}`} />
                              </td>
                            </tr>
                          ))}
                          {data.perKelas.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-[18px] py-6 text-center text-muted-foreground">
                                Belum ada tagihan per kelas bulan ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Panel>
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                  <Panel>
                    <PanelHeader title="Tunggakan" meta="semua periode" />
                    <PanelRow stacked>
                      <span className="tabular font-display text-lg font-bold text-destructive">
                        {formatRupiah(data.terlambat)} <span className="text-[13px] font-normal text-muted-foreground">· {data.terlambatKeluarga} keluarga</span>
                      </span>
                      {(["1-30", "31-60", "60+"] as const).map((k) => {
                        const label = k === "60+" ? "> 60 hari" : k.replace("-", "–") + " hari";
                        return (
                          <div key={k} className="flex flex-col gap-1">
                            <span className="flex items-baseline justify-between text-[13px]">
                              <span>{label}</span>
                              <span className="tabular">{formatRupiah(data.aging[k].total)}</span>
                            </span>
                            <ProgressBar value={data.aging[k].total} max={Math.max(data.terlambat, 1)} tone="red" label={`Tunggakan ${label}`} />
                          </div>
                        );
                      })}
                      <span className="text-[13px] text-muted-foreground">
                        Pengingat manual lewat <Link href="/billing" className="font-semibold text-primary hover:underline">tab Terlambat</Link> di Penagihan. Pengingat otomatis belum tersedia.
                      </span>
                    </PanelRow>
                  </Panel>

                  <Panel>
                    <PanelHeader title="Cara bayar" meta={`${data.caraBayar.onlineCount + data.caraBayar.manualCount} pembayaran ${data.periode}`} />
                    <PanelRow>
                      <span className="flex-1">Online (otomatis)</span>
                      <span className="tabular">{data.caraBayar.onlineCount > 0 ? `${data.caraBayar.onlineCount} · ${formatRupiah(data.caraBayar.online)}` : "—"}</span>
                    </PanelRow>
                    <PanelRow>
                      <span className="flex-1">Tunai / transfer · dicatat admin</span>
                      <span className="tabular">{data.caraBayar.manualCount > 0 ? `${data.caraBayar.manualCount} · ${formatRupiah(data.caraBayar.manual)}` : "—"}</span>
                    </PanelRow>
                    <PanelRow stacked>
                      <span className="text-[13px] text-muted-foreground">
                        Pecahan QRIS / Virtual Account belum tercatat terpisah di sistem, jadi tidak ditampilkan (tercatat di backlog).
                      </span>
                    </PanelRow>
                  </Panel>
                </div>
              </div>
            </div>
          </Stale>
        )}
      </PageBody>
    </>
  );
}

function GrafikBulan({ perBulan, max }: { perBulan: KeuanganData["perBulan"]; max: number }) {
  return (
    <div>
      <div className="grid grid-cols-6 items-end gap-3 border-b border-foreground px-1" style={{ height: 180 }}>
        {perBulan.map((b) => (
          <div key={b.ym} className="flex flex-col items-center justify-end gap-1 self-stretch">
            <span className="tabular whitespace-nowrap text-[12px] text-muted-foreground">{b.total > 0 ? formatRupiahSingkat(b.total).replace("Rp ", "") : "0"}</span>
            <span
              className={`w-full rounded-t-xs ${b.selesai ? "bg-border" : "bg-foreground"}`}
              style={{ height: `${Math.max(2, (b.total / max) * 148)}px` }}
              aria-hidden
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-3 px-1 pt-1.5 text-center text-[12px] text-muted-foreground">
        {perBulan.map((b) => (
          <span key={b.ym} className={b.selesai ? "" : "font-semibold text-foreground"}>
            {b.label.split(" ")[0]}
          </span>
        ))}
      </div>
    </div>
  );
}

function BelumAdaTagihan() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <b className="font-display text-lg">Belum ada uang masuk</b>
      <span className="max-w-md text-sm text-muted-foreground">
        Ringkasan muncul setelah tagihan pertama terbit. Mulai dari mendaftarkan anak beserta kelasnya, lalu terbitkan tagihan dari menu Penagihan.
      </span>
      <Button asChild variant="sec" className="mt-2">
        <Link href="/students/baru">Daftarkan anak</Link>
      </Button>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded border border-border bg-card p-4">
      <span className="sk h-4 w-40" />
      <span className="sk h-24 w-full" />
    </div>
  );
}
