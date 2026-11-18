"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  RowText,
  Stale,
  StatCard,
  StatRow,
  StatRowSkeleton,
  StatusDot,
} from "@/components/bunayo";
import { getHariIni, type HariIniData, type HariIniGuru, type HariIniKelas } from "@/server/actions/hariIni";
import { formatEyebrow, formatJam, formatPeriode, formatRupiah, formatRupiahSingkat } from "@/lib/format";
import { useIstilah } from "@/hooks/useIstilah";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Turunan data                                                         */
/* ------------------------------------------------------------------ */

interface Mendesak {
  key: string;
  title: React.ReactNode;
  sub: React.ReactNode;
  action: { label: string; href: string };
}

function daftarMendesak(d: HariIniData): Mendesak[] {
  const out: Mendesak[] = [];
  const bulan = formatPeriode(d.periode, { panjang: true }).split(" ")[0];
  if (d.perluDitagih.anak > 0) {
    out.push({
      key: "tagih",
      title: `Tagihan ${bulan} belum terbit · ${d.perluDitagih.anak} anak`,
      sub: (
        <>
          Tanggal tagih sudah tiba · perkiraan dari harga kelas <span className="tabular">{formatRupiah(d.perluDitagih.estimasi)}</span>
        </>
      ),
      action: { label: "Tinjau & terbitkan", href: "/billing" },
    });
  }
  if (d.tagihan.terlambatLama.length > 0) {
    out.push({
      key: "telat",
      title: `${d.tagihan.terlambatLama.length} keluarga terlambat > 30 hari`,
      sub: d.tagihan.terlambatLama.slice(0, 3).map((k, i) => (
        <span key={k.keluarga}>
          {i > 0 && " · "}
          {k.keluarga} <span className="tabular">{formatRupiah(k.total)}</span>
        </span>
      )),
      action: { label: "Lihat tagihan", href: "/billing" },
    });
  }
  return out;
}

function waktuHari(iso: string) {
  const jam = Number(formatJam(iso).slice(0, 2));
  if (jam < 11) return "pagi ini";
  if (jam < 15) return "siang ini";
  if (jam < 18) return "sore ini";
  return "malam ini";
}

function ketKelas(k: HariIniKelas) {
  const bagian = [k.izin && `${k.izin} izin`, k.sakit && `${k.sakit} sakit`, k.alpa && `${k.alpa} alpa`, k.belum && `${k.belum} belum`].filter(Boolean);
  return bagian.length ? bagian.join(" · ") : "Lengkap";
}

const LABEL_IZIN: Record<string, string> = { sick: "sakit", personal: "keperluan pribadi", annual: "cuti", emergency: "darurat" };

function GuruRow({ g }: { g: HariIniGuru }) {
  let status: React.ReactNode;
  if (g.jamPulang) status = <StatusDot varian="off" size="sm">Pulang {formatJam(g.jamPulang)}</StatusDot>;
  else if (g.jamMasuk) status = <StatusDot varian="ok" size="sm">Di lokasi</StatusDot>;
  else if (g.izin) status = <StatusDot varian="info" size="sm">Izin{g.izin.status === "pending" ? " · menunggu" : ""}</StatusDot>;
  else status = <StatusDot varian="wait" size="sm">Belum tiba</StatusDot>;
  return (
    <PanelRow>
      <span className="tabular w-11 shrink-0 text-muted-foreground">{g.jamMasuk ? formatJam(g.jamMasuk) : "—"}</span>
      <span className="min-w-0 flex-1 truncate text-[15px]">
        {g.name}
        {g.izin && !g.jamMasuk && <span className="text-[13px] text-info"> · izin {LABEL_IZIN[g.izin.jenis] ?? g.izin.jenis}</span>}
      </span>
      {status}
    </PanelRow>
  );
}

/* ------------------------------------------------------------------ */
/* Layar                                                                */
/* ------------------------------------------------------------------ */

/**
 * A1 Hari Ini (01-admin-harian-siswa). Bagian BARU yang belum punya data disembunyikan:
 * "Pesan > 4 jam", "kelas tanpa guru"/pengganti, tombol Tunda, Mode scan QR (lihat REDESIGN-BACKLOG).
 */
export default function HariIni({ initialData }: { initialData?: HariIniData }) {
  const istilah = useIstilah();
  const query = useQuery({
    queryKey: ["hari-ini"],
    queryFn: getHariIni,
    initialData,
    refetchInterval: 60_000,
  });
  const { data, isLoading, isError, refetch } = query;

  if (!data) {
    return (
      <>
        <PageHeader title="Hari Ini" eyebrow={<span className="sk inline-block h-3.5 w-56" />} />
        <PageBody>
          {isError && !isLoading ? (
            <ErrorBanner
              title="Ringkasan hari ini gagal dimuat"
              description="Tidak ada data yang berubah. Coba muat ulang."
              onRetry={() => refetch()}
            />
          ) : (
            <>
              <StatRowSkeleton count={3} />
              <div className="grid gap-5 min-[561px]:grid-cols-2 min-[1001px]:grid-cols-[1.25fr_1fr_1fr]">
                {[0, 1, 2].map((i) => (
                  <Panel key={i}>
                    <PanelHeader title={<span className="sk inline-block h-5 w-28" />} />
                    <PanelRowsSkeleton rows={4} />
                  </Panel>
                ))}
              </div>
            </>
          )}
        </PageBody>
      </>
    );
  }

  if (data.kosong) {
    return (
      <>
        <PageHeader title="Hari Ini" eyebrow={formatEyebrow(data.diambilPada)} />
        <PageBody>
          <EmptyState
            title="Selamat datang di Bunayo"
            description={`Ringkasan ini terisi sendiri setelah kelas dan anak pertama masuk. Mulai dengan membuat kelas, lalu daftarkan anak dan tugaskan ${istilah.guruKecil}.`}
            action={
              <>
                <Button asChild>
                  <Link href="/classes">Buat kelas pertama</Link>
                </Button>
                <Button asChild variant="sec">
                  <Link href="/students">Daftarkan anak</Link>
                </Button>
              </>
            }
          />
        </PageBody>
      </>
    );
  }

  const mendesak = daftarMendesak(data);
  const t = data.tagihan;
  const periode = formatPeriode(data.periode);
  const guruTiba = data.guru.filter((g) => g.jamMasuk).length;
  const nantiCount = data.laporanBelum.length + data.trialLewat.length + data.belumPulangKemarin.length + (data.ulangTahun.length ? 1 : 0);

  return (
    <>
      <PageHeader
        eyebrow={formatEyebrow(data.diambilPada)}
        title={
          mendesak.length > 0 ? (
            <>
              Ada <span className="hl">{mendesak.length} hal mendesak</span> {waktuHari(data.diambilPada)}.
            </>
          ) : (
            <>
              <span className="hl">Tidak ada yang mendesak</span> {waktuHari(data.diambilPada)}.
            </>
          )
        }
      />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Angka di layar ini adalah contoh, bukan data lembaga mana pun.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner
            title="Ringkasan hari ini gagal diperbarui"
            description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`}
            onRetry={() => refetch()}
          />
        )}

        <Stale stale={isError}>
          <div className="flex flex-col gap-5">
            <StatRow>
              <StatCard
                label="Tiba"
                periode="hari ini"
                value={data.kehadiran.tiba}
                suffix={`/${data.kehadiran.aktif}`}
                href="/attendance"
                linkLabel={data.kehadiran.belumTiba > 0 ? `${data.kehadiran.belumTiba} belum tiba` : "Lihat kehadiran"}
              />
              <StatCard
                label="Diterima"
                periode={periode}
                value={formatRupiahSingkat(t.diterima)}
                suffix={` dari ${formatRupiahSingkat(t.terbit)} terbit`}
                href="/billing"
                linkLabel={`${t.diterimaKeluarga} keluarga lunas`}
              />
              <StatCard
                label="Terlambat"
                periode="semua periode"
                value={formatRupiahSingkat(t.terlambat)}
                tone={t.terlambat > 0 ? "red" : undefined}
                href="/billing"
                linkLabel={`${t.terlambatKeluarga} keluarga`}
              />
            </StatRow>

            <div className="grid items-start gap-5 min-[561px]:grid-cols-2 min-[1001px]:grid-cols-[1.25fr_1fr_1fr]">
              <Panel>
                <PanelHeader title="Mendesak" meta={<span className={cn("tabular", mendesak.length > 0 && "text-destructive")}>{mendesak.length}</span>} />
                {mendesak.length === 0 ? (
                  <PanelRow>
                    <RowText title="Semua beres" sub="Tagihan sudah terbit dan tidak ada yang terlambat lebih dari 30 hari." />
                  </PanelRow>
                ) : (
                  mendesak.map((m, i) => (
                    <PanelRow key={m.key} stacked>
                      <span>
                        <span className="block text-[15px] font-semibold">{m.title}</span>
                        <span className="block text-[13px] text-muted-foreground">{m.sub}</span>
                      </span>
                      <span>
                        <Button asChild size="sm" variant={i === 0 ? "pri" : "sec"}>
                          <Link href={m.action.href}>{m.action.label}</Link>
                        </Button>
                      </span>
                    </PanelRow>
                  ))
                )}
              </Panel>

              <Panel>
                <PanelHeader
                  title="Kelas hari ini"
                  action={
                    <Link href="/attendance" className="text-[13px] font-semibold text-primary hover:underline">
                      Lihat absen
                    </Link>
                  }
                />
                {data.kelas.length === 0 ? (
                  <PanelRow>
                    <RowText title="Belum ada kelas aktif" sub={<Link href="/classes" className="text-primary hover:underline">Buat kelas</Link>} />
                  </PanelRow>
                ) : (
                  data.kelas.map((k) => (
                    <PanelRow key={k.id}>
                      <ClassChip name={k.name} id={k.id} />
                      <span className="flex-1" />
                      <span className="tabular text-lg">
                        {k.tiba}
                        <span className="text-[13px] text-muted-foreground">/{k.terdaftar}</span>
                      </span>
                      <span className="w-28 text-right text-[13px] text-muted-foreground">{ketKelas(k)}</span>
                    </PanelRow>
                  ))
                )}
                <div className="flex items-baseline justify-between gap-3 border-y border-b-border-subtle border-t-border px-[18px] py-3">
                  <h4 className="font-display text-base font-bold">{istilah.guru}</h4>
                  <span className="text-[13px] text-muted-foreground">
                    {data.guru.length ? `${guruTiba} dari ${data.guru.length} tiba` : "Belum ada"}
                  </span>
                </div>
                {data.guru.length === 0 ? (
                  <PanelRow>
                    <RowText title={`Belum ada ${istilah.guruKecil} aktif`} sub={<Link href="/settings/staff" className="text-primary hover:underline">Tambah {istilah.guruKecil}</Link>} />
                  </PanelRow>
                ) : (
                  data.guru.map((g) => <GuruRow key={g.id} g={g} />)
                )}
              </Panel>

              <Panel className="min-[561px]:max-[1000px]:col-span-2">
                <PanelHeader title="Nanti" meta={<span className="tabular">{nantiCount}</span>} />
                {nantiCount === 0 && (
                  <PanelRow>
                    <RowText title="Tidak ada tindak lanjut" sub="Laporan harian, trial, dan check-out sudah lengkap." />
                  </PanelRow>
                )}
                {data.laporanBelum.map((l) => (
                  <PanelRow key={`lap-${l.kelas}`}>
                    <RowText
                      title={`Laporan harian ${l.kelas} · ${l.belum} dari ${l.tiba} anak belum dibuat`}
                      sub={<Link href="/daily-reports" className="font-semibold text-primary hover:underline">Buka laporan harian</Link>}
                    />
                  </PanelRow>
                ))}
                {data.trialLewat.map((tr) => (
                  <PanelRow key={`trial-${tr.id}`}>
                    <RowText
                      title={`Trial ${tr.nama} lewat ${tr.hari} hari tanpa observasi`}
                      sub={<Link href="/crm" className="font-semibold text-primary hover:underline">Buka trial</Link>}
                    />
                  </PanelRow>
                ))}
                {data.belumPulangKemarin.map((b) => (
                  <PanelRow key={`co-${b.nama}`}>
                    <RowText
                      title={`${b.nama} belum check-out kemarin`}
                      sub={<Link href="/attendance" className="font-semibold text-primary hover:underline">Buka kehadiran</Link>}
                    />
                  </PanelRow>
                ))}
                {data.ulangTahun.length > 0 && (
                  <PanelRow>
                    <Cake className="h-[18px] w-[18px] shrink-0 text-permen" aria-hidden />
                    <RowText
                      title={
                        <>
                          Ulang tahun:{" "}
                          {data.ulangTahun
                            .map((u) => `${u.nama} ${u.umur} th (${u.hari === 0 ? "hari ini" : u.hari === 1 ? "besok" : `${u.hari} hari lagi`})`)
                            .join(" · ")}
                        </>
                      }
                      className="[&>span:first-child]:whitespace-normal"
                    />
                  </PanelRow>
                )}
              </Panel>
            </div>
          </div>
        </Stale>
      </PageBody>
    </>
  );
}
