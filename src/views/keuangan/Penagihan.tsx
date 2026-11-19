"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DataTable,
  EmptyState,
  ErrorBanner,
  InfoBox,
  PageBody,
  PageHeader,
  Stale,
  StatCard,
  StatRow,
  StatRowSkeleton,
  StatusDot,
  type Column,
} from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatRupiahSingkat, formatTanggal } from "@/lib/format";
import { STATUS_PERLU_DITAGIH, statusTagihan } from "@/lib/status";
import { issueInvoicesBulk } from "@/server/actions/billing";
import { getKeuangan, type BarisPerluDitagih, type BarisTagihan, type KeuanganData } from "@/server/actions/keuangan";

/**
 * P1 Penagihan (versi 1 · tabel per status). Angka selaras dengan K1 Ringkasan (action yang sama).
 * Ditembuskan dari desain: satu tagihan gabungan per keluarga (butuh family_invoices — BARU), pengingat
 * otomatis + riwayatnya (BARU), jadwal terbit bulanan (BARU). Terbitkan = createInvoice per anak (action lama).
 */

function tambahHari(tanggal: string, n: number) {
  const [y, m, d] = tanggal.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function akhirBulan(tanggal: string) {
  const [y, m] = tanggal.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

function unduhCsv(nama: string, baris: (string | number)[][]) {
  const csv = baris.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nama}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const kolomKeluarga: Column<BarisTagihan> = {
  id: "keluarga",
  header: "Keluarga",
  sticky: true,
  sortValue: (r) => r.keluarga,
  cell: (r) => <b className="block truncate">{r.keluarga}</b>,
};

const kolomAnak = (kelasAda: boolean): Column<BarisTagihan> => ({
  id: "anak",
  header: "Anak",
  sortValue: (r) => r.anak,
  cell: (r) => (
    <span className="flex flex-col">
      <span>{r.anak}</span>
      {kelasAda && r.kelas && <span className="text-[13px] text-muted-foreground">{r.kelas}</span>}
    </span>
  ),
});

const kolomNominal: Column<BarisTagihan> = {
  id: "total",
  header: "Nominal",
  numeric: true,
  sortValue: (r) => r.total,
  cell: (r) => formatRupiah(r.total),
};

const kolomAksiWa = (label: string): Column<BarisTagihan> => ({
  id: "aksi",
  header: "",
  cell: (r) =>
    r.wa ? (
      <Button asChild variant="sec" size="sm" className="bulk-sec">
        <a href={r.wa} target="_blank" rel="noreferrer">
          <MessageCircle aria-hidden />
          {label}
        </a>
      </Button>
    ) : (
      <span className="text-[13px] text-muted-foreground">Tanpa nomor WA</span>
    ),
});

export default function Penagihan({ initialData }: { initialData?: KeuanganData }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: ["keuangan"], queryFn: getKeuangan, initialData });
  const { data, isError, refetch } = query;
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState("perlu");

  const terbitkan = useMutation({
    mutationFn: async (rows: BarisPerluDitagih[]) => {
      if (!data) throw new Error("Data belum siap");
      const jatuhTempo = tambahHari(data.tanggal, 7);
      // Server-side + idempoten: baris yang sudah ditagih di periode yang sama
      // dihitung duplikat, bukan dibuat dua kali.
      return issueInvoicesBulk(
        rows.map((r) => ({
          studentId: r.studentId,
          amount: r.nominal,
          dueDate: jatuhTempo,
          billingPeriodStart: `${data.tanggal.slice(0, 7)}-01`,
          billingPeriodEnd: akhirBulan(data.tanggal),
          notes: `Tagihan ${data.periode} · ${r.kelas.join(", ")}`,
        }))
      );
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["keuangan"] });
      qc.invalidateQueries({ queryKey: ["hari-ini"] });
      const bagian = [
        `${result.issued} tagihan baru terbit`,
        result.duplicates > 0 ? `${result.duplicates} dilewati (sudah ada)` : null,
        result.failures.length > 0 ? `${result.failures.length} gagal` : null,
      ].filter(Boolean);
      toast({
        title: "Terbitkan selesai",
        description: `${bagian.join(" · ")}. Jatuh tempo 7 hari dari sekarang. Wali bisa membayar online bila pembayaran aktif.`,
      });
      if (result.failures.length > 0) {
        console.error("Gagal menerbitkan tagihan:", result.failures);
      }
      startTransition(() => router.refresh());
    },
    onError: (err: Error) => {
      toast({ title: "Tagihan gagal diterbitkan", description: err.message, variant: "destructive" });
    },
  });

  if (!data) {
    return isError ? (
      <>
        <PageHeader title="Penagihan" />
        <PageBody>
          <ErrorBanner title="Daftar tagihan gagal dimuat" description="Tidak ada tagihan yang terkirim atau berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
        </PageBody>
      </>
    ) : (
      <>
        <PageHeader title="Penagihan" />
        <PageBody>
          <StatRowSkeleton />
        </PageBody>
      </>
    );
  }

  const { daftar, aging } = data;
  const t = daftar;
  // Mode demo hanya membaca: tidak ada tagihan yang benar-benar diterbitkan.
  const readOnly = data.isDemo;

  const kolomPeriode: Column<BarisTagihan> = {
    id: "periode",
    header: "Periode",
    hideOnMobile: true,
    sortValue: (r) => r.periode ?? "",
    cell: (r) => <span className="tabular">{r.periode ?? "—"}</span>,
  };

  const kolomTempo: Column<BarisTagihan> = {
    id: "tempo",
    header: "Jatuh tempo",
    sortValue: (r) => r.dueDate ?? "",
    cell: (r) => <span className="tabular">{r.dueDate ? formatTanggal(r.dueDate, { tanpaTahun: true }) : "Belum diisi"}</span>,
  };

  const ekspor = (nama: string, baris: (string | number)[][]) => unduhCsv(`${nama}-${data.periode.toLowerCase().replace(/\s/g, "")}`, baris);

  const kolomPerlu: Column<BarisPerluDitagih>[] = [
    {
      id: "keluarga",
      header: "Keluarga",
      sticky: true,
      sortValue: (r) => r.keluarga,
      cell: (r) => <b className="block truncate">{r.keluarga}</b>,
    },
    {
      id: "anak",
      header: "Anak · kelas",
      cell: (r) => (
        <span className="flex flex-col">
          <span>{r.anak}</span>
          <span className="text-[13px] text-muted-foreground">{r.kelas.join(", ") || "Tanpa kelas"}</span>
        </span>
      ),
    },
    {
      id: "nominal",
      header: "Nominal",
      numeric: true,
      sortValue: (r) => r.nominal,
      cell: (r) => formatRupiah(r.nominal),
    },
    {
      id: "tagih",
      header: "Tanggal tagih",
      hideOnMobile: true,
      sortValue: (r) => r.billingDay ?? 0,
      cell: (r) => <span className="tabular">{r.billingDay ? `tgl ${r.billingDay}` : "mengikuti tanggal masuk"}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: () => <StatusDot info={STATUS_PERLU_DITAGIH} size="sm" />,
    },
    {
      id: "aksi",
      header: "",
      cell: (r) => (
        <Button variant="sec" size="sm" className="bulk-sec" disabled={readOnly || isPending || terbitkan.isPending} onClick={() => terbitkan.mutate([r])}>
          Terbitkan
        </Button>
      ),
    },
  ];

  const kolomMenunggu: Column<BarisTagihan>[] = [
    kolomKeluarga,
    kolomAnak(true),
    kolomPeriode,
    kolomTempo,
    kolomNominal,
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusDot info={statusTagihan(r.status)} size="sm" />,
    },
    kolomAksiWa("Ingatkan"),
  ];

  const kolomTerlambat: Column<BarisTagihan>[] = [
    kolomKeluarga,
    kolomAnak(true),
    kolomPeriode,
    kolomTempo,
    kolomNominal,
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusDot info={statusTagihan("overdue", r.hariTerlambat)} size="sm" />,
    },
    kolomAksiWa("Ingatkan"),
  ];

  const kolomLunas: Column<BarisTagihan>[] = [
    kolomKeluarga,
    kolomAnak(true),
    {
      id: "dibayar",
      header: "Dibayar",
      sortValue: (r) => r.paidAt ?? "",
      cell: (r) => (
        <span className="text-[13px]">
          {r.paidAt ? formatTanggal(r.paidAt, { tanpaTahun: true }) : "—"}
          {r.metode && <span className="text-muted-foreground"> · {r.metode === "online" ? "online" : "dicatat admin"}</span>}
        </span>
      ),
    },
    kolomNominal,
    {
      id: "status",
      header: "Status",
      cell: () => <StatusDot info={statusTagihan("paid")} size="sm" />,
    },
    {
      id: "aksi",
      header: "",
      cell: (r) => (
        <Button asChild variant="txt" size="sm">
          <Link href={`/billing/${r.id}`}>Detail</Link>
        </Button>
      ),
    },
  ];

  const agingRingkas = `1–30: ${aging["1-30"].keluarga} · 31–60: ${aging["31-60"].keluarga} · >60: ${aging["60+"].keluarga} keluarga`;
  const persenDiterima = data.terbit > 0 ? Math.round((data.diterima / data.terbit) * 100) : 0;

  const tabKosong = (pesan: string) => <PanelKosong pesan={pesan} />;

  return (
    <>
      <PageHeader
        eyebrow="KEUANGAN"
        title="Penagihan"
        actions={
          <Button
            variant="sec"
            className="max-[560px]:hidden"
            onClick={() =>
              ekspor("tagihan", [
                ["No tagihan", "Keluarga", "Anak", "Kelas", "Periode", "Jatuh tempo", "Nominal", "Status"],
                ...[...t.terlambat, ...t.menunggu, ...t.lunas].map((r) => [
                  r.nomor,
                  r.keluarga,
                  r.anak,
                  r.kelas ?? "",
                  r.periode ?? "",
                  r.dueDate ?? "",
                  r.total,
                  statusTagihan(r.status, r.hariTerlambat).label,
                ]),
              ])
            }
          >
            <Download aria-hidden />
            Ekspor
          </Button>
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
            title="Daftar tagihan gagal diperbarui"
            description={`Yang tampil adalah data terakhir pukul ${new Date(data.diambilPada).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.`}
            onRetry={() => refetch()}
          />
        )}

        {data.kosong ? (
          <EmptyState
            title="Belum ada tagihan"
            description="Tagihan terbit dari daftar Perlu Ditagih di bawah, setelah ada anak yang terdaftar di kelas. Mulai dengan mendaftarkan anak."
            action={
              <Button asChild>
                <Link href="/students/baru">Daftarkan anak</Link>
              </Button>
            }
          />
        ) : (
          <Stale stale={isError}>
            <div className="flex flex-col gap-5">
              <StatRow className="rise">
                <StatCard
                  label="Ditagihkan"
                  periode={data.periode}
                  value={formatRupiah(data.terbit)}
                  linkLabel={`${data.terbitKeluarga} keluarga · ${data.terbitAnak} anak`}
                />
                <StatCard
                  label="Diterima"
                  periode={data.periode}
                  value={formatRupiahSingkat(data.diterima)}
                  stabilo
                  onClick={() => setTab("lunas")}
                  linkLabel={`${persenDiterima}% dari yang terbit · ${data.diterimaKeluarga} keluarga`}
                />
                <StatCard
                  label="Menunggu"
                  periode="belum jatuh tempo"
                  value={formatRupiah(data.menunggu)}
                  onClick={() => setTab("menunggu")}
                  linkLabel={`${data.menungguKeluarga} keluarga`}
                />
                <StatCard
                  label="Terlambat"
                  periode="semua periode"
                  value={formatRupiah(data.terlambat)}
                  tone={data.terlambat > 0 ? "red" : undefined}
                  onClick={() => setTab("terlambat")}
                  linkLabel={agingRingkas}
                />
              </StatRow>

              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="gap-5">
                  <TabsTrigger value="perlu">
                    Perlu Ditagih <span className="tabular text-muted-foreground">{t.perluDitagih.length}</span>
                  </TabsTrigger>
                  <TabsTrigger value="menunggu">
                    Menunggu <span className="tabular text-muted-foreground">{t.menunggu.length}</span>
                  </TabsTrigger>
                  <TabsTrigger value="terlambat">
                    Terlambat <span className="tabular text-destructive">{t.terlambat.length}</span>
                  </TabsTrigger>
                  <TabsTrigger value="lunas">
                    Lunas <span className="tabular text-muted-foreground">{t.lunas.length}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="perlu" className="flex flex-col gap-3">
                  {t.perluDitagih.length === 0 ? (
                    tabKosong(`Tidak ada anak yang menunggu ditagih untuk ${data.periode}.`)
                  ) : (
                    <DataTable
                      rows={t.perluDitagih}
                      columns={kolomPerlu}
                      getRowId={(r) => r.studentId}
                      selectable
                      pageSize={10}
                      bulkActions={(sel) => (
                        <>
                          <span className="tabular">{formatRupiah(sel.reduce((s, r) => s + r.nominal, 0))}</span>
                          <Button variant="sec" size="sm" className="bulk-sec press" disabled={readOnly || terbitkan.isPending} onClick={() => terbitkan.mutate(sel)}>
                            Terbitkan {sel.length} tagihan
                          </Button>
                        </>
                      )}
                      renderCard={(r) => (
                        <span className="flex items-center gap-3">
                          <span className="min-w-0 flex-1">
                            <b className="block truncate text-[15px]">{r.keluarga}</b>
                            <span className="block truncate text-[13px] text-muted-foreground">
                              {r.anak} · {r.kelas.join(", ") || "Tanpa kelas"} · {formatRupiah(r.nominal)}
                            </span>
                          </span>
                          <Button variant="sec" size="sm" disabled={readOnly || terbitkan.isPending} onClick={() => terbitkan.mutate([r])}>
                            Terbitkan
                          </Button>
                        </span>
                      )}
                      empty={tabKosong(`Tidak ada anak yang menunggu ditagih untuk ${data.periode}.`)}
                    />
                  )}
                  <p className="text-[13px] text-muted-foreground">
                    Tagihan terbit per anak dengan jatuh tempo 7 hari. Satu tagihan gabungan untuk semua anak sekeluarga belum tersedia (tercatat di backlog).
                  </p>
                </TabsContent>

                <TabsContent value="menunggu" className="flex flex-col gap-3">
                  <DataTable
                    rows={t.menunggu}
                    columns={kolomMenunggu}
                    getRowId={(r) => r.id}
                    onRowClick={readOnly ? undefined : (r) => router.push(`/billing/${r.id}`)}
                    pageSize={10}
                    renderCard={(r) => <BarisKartu r={r} aksi={kolomAksiWa("Ingatkan")} />}
                    empty={tabKosong("Tidak ada tagihan yang menunggu pembayaran.")}
                  />
                </TabsContent>

                <TabsContent value="terlambat" className="flex flex-col gap-3">
                  <DataTable
                    rows={t.terlambat}
                    columns={kolomTerlambat}
                    getRowId={(r) => r.id}
                    onRowClick={readOnly ? undefined : (r) => router.push(`/billing/${r.id}`)}
                    pageSize={10}
                    renderCard={(r) => <BarisKartu r={r} aksi={kolomAksiWa("Ingatkan")} />}
                    empty={tabKosong("Tidak ada tunggakan. Semua tagihan lunas atau belum jatuh tempo.")}
                  />
                </TabsContent>

                <TabsContent value="lunas" className="flex flex-col gap-3">
                  <DataTable
                    rows={t.lunas}
                    columns={kolomLunas}
                    getRowId={(r) => r.id}
                    onRowClick={readOnly ? undefined : (r) => router.push(`/billing/${r.id}`)}
                    pageSize={10}
                    renderCard={(r) => (
                      <span className="flex items-center gap-3">
                        <span className="min-w-0 flex-1">
                          <b className="block truncate text-[15px]">{r.keluarga}</b>
                          <span className="block truncate text-[13px] text-muted-foreground">
                            {r.anak} · {r.paidAt ? formatTanggal(r.paidAt, { tanpaTahun: true }) : "—"} · {formatRupiah(r.total)}
                          </span>
                        </span>
                        <StatusDot info={statusTagihan("paid")} size="sm" />
                      </span>
                    )}
                    empty={tabKosong(`Belum ada pembayaran untuk ${data.periode}.`)}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </Stale>
        )}
      </PageBody>
    </>
  );
}

function BarisKartu({ r, aksi }: { r: BarisTagihan; aksi: Column<BarisTagihan> }) {
  return (
    <span className="flex items-center gap-3">
      <span className="min-w-0 flex-1">
        <b className="block truncate text-[15px]">{r.keluarga}</b>
        <span className="block truncate text-[13px] text-muted-foreground">
          {r.anak} · {formatRupiah(r.total)} · {r.dueDate ? `tempo ${formatTanggal(r.dueDate, { tanpaTahun: true })}` : "tempo belum diisi"}
        </span>
      </span>
      {aksi.cell(r)}
    </span>
  );
}

function PanelKosong({ pesan }: { pesan: string }) {
  return <p className="rounded border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">{pesan}</p>;
}
