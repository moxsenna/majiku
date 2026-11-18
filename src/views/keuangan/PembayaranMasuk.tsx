"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DataTable,
  DataTableSkeleton,
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
import { formatJam, formatRupiah, formatTanggal } from "@/lib/format";
import { statusTagihan } from "@/lib/status";
import { getPembayaranMasuk, type BarisPembayaran, type PembayaranMasukData } from "@/server/actions/keuangan";

/**
 * K7 Pembayaran masuk. Sumber: tagihan Lunas per tanggal bayar + order PayCore yang masih pending.
 * "Uang masuk" = definisi yang sama dengan batang grafik K1 (per tanggal bayar), berbeda dari "Diterima" K1/P1
 * (tagihan periode berjalan yang Lunas) — karena itu labelnya dibedakan.
 * Disembunyikan (BARU, REDESIGN-BACKLOG): kartu & kolom Pencairan (settlement), pecahan QRIS/VA, nama admin pencatat,
 * tombol "Cek status" ke gateway (status sudah diperbarui otomatis oleh webhook).
 */

const STATUS_MENUNGGU_GATEWAY = { label: "Menunggu gateway", varian: "wait" as const };

function unduhCsv(nama: string, baris: (string | number)[][]) {
  const csv = baris.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nama}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const labelMetode = (r: BarisPembayaran) => (r.metode === "online" ? "Online" : "Dicatat admin");

export default function PembayaranMasuk({ initialData, ym }: { initialData?: PembayaranMasukData; ym?: string }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["pembayaran-masuk", ym ?? "sekarang"],
    queryFn: () => getPembayaranMasuk(ym),
    initialData,
  });
  const { data, isError, refetch } = query;

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="KEUANGAN" title="Pembayaran masuk" />
        <PageBody>
          {isError ? (
            <ErrorBanner title="Pembayaran masuk gagal dimuat" description="Tidak ada data yang berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <>
              <StatRowSkeleton count={3} />
              <DataTableSkeleton rows={5} cols={6} />
            </>
          )}
        </PageBody>
      </>
    );
  }

  const kolom: Column<BarisPembayaran>[] = [
    {
      id: "waktu",
      header: "Waktu",
      sortValue: (r) => r.waktu,
      cell: (r) => (
        <span className="tabular whitespace-nowrap">
          {formatTanggal(r.waktu, { tanpaTahun: true })} {formatJam(r.waktu)}
        </span>
      ),
    },
    {
      id: "keluarga",
      header: "Keluarga",
      sticky: true,
      sortValue: (r) => r.keluarga,
      cell: (r) => (
        <span className="flex flex-col">
          <b className="truncate">{r.keluarga}</b>
          <span className="text-[13px] text-muted-foreground">{r.anak}</span>
        </span>
      ),
    },
    {
      id: "nomor",
      header: "Tagihan",
      hideOnMobile: true,
      cell: (r) => <span className="tabular whitespace-nowrap text-[13px]">{r.nomor}</span>,
    },
    {
      id: "metode",
      header: "Metode",
      sortValue: labelMetode,
      cell: (r) => labelMetode(r),
    },
    {
      id: "nominal",
      header: "Nominal",
      numeric: true,
      sortValue: (r) => r.nominal,
      cell: (r) => formatRupiah(r.nominal),
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusDot info={r.status === "lunas" ? statusTagihan("paid") : STATUS_MENUNGGU_GATEWAY} size="sm" />,
    },
  ];

  const ekspor = () =>
    unduhCsv(`pembayaran-masuk-${data.ym}`, [
      ["Waktu", "Keluarga", "Anak", "No tagihan", "Metode", "Nominal", "Status"],
      ...data.baris.map((r) => [
        `${formatTanggal(r.waktu)} ${formatJam(r.waktu)}`,
        r.keluarga,
        r.anak,
        r.nomor,
        labelMetode(r),
        r.nominal,
        r.status === "lunas" ? "Lunas" : "Menunggu gateway",
      ]),
    ]);

  const pilihBulan = (v: string) => router.push(v === data.pilihanBulan[0].ym ? "/billing/masuk" : `/billing/masuk?bulan=${v}`);

  return (
    <>
      <PageHeader
        eyebrow="KEUANGAN"
        title="Pembayaran masuk"
        crumbs={[{ label: "Keuangan", href: "/billing/ringkasan" }]}
        actions={
          <>
            <Select value={data.ym} onValueChange={pilihBulan}>
              <SelectTrigger className="w-[170px]" aria-label="Pilih bulan">
                <SelectValue>{data.rentang}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {data.pilihanBulan.map((b) => (
                  <SelectItem key={b.ym} value={b.ym}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="sec" className="max-[560px]:hidden" onClick={ekspor} disabled={data.baris.length === 0}>
              <Download aria-hidden />
              Ekspor CSV
            </Button>
          </>
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
            title="Pembayaran masuk gagal diperbarui"
            description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`}
            onRetry={() => refetch()}
          />
        )}

        <Stale stale={isError}>
          <div className="flex flex-col gap-5">
            <StatRow>
              <StatCard
                label="Uang masuk"
                periode={data.rentang}
                value={formatRupiah(data.diterima)}
                stabilo
                linkLabel={`${data.diterimaCount} pembayaran`}
              />
              <StatCard
                label="Online · otomatis"
                periode={data.rentang}
                value={formatRupiah(data.online)}
                linkLabel={`${data.onlineCount} pembayaran`}
              />
              <StatCard
                label="Dicatat admin"
                periode={data.rentang}
                value={formatRupiah(data.manual)}
                linkLabel={`${data.manualCount} · tunai / transfer`}
              />
            </StatRow>

            {data.baris.length === 0 ? (
              <EmptyState
                title={`Belum ada pembayaran ${data.rentang}`}
                description="Pembayaran online muncul otomatis di sini setelah orang tua membayar. Pembayaran tunai muncul setelah dicatat dari detail tagihan."
                action={
                  <Button asChild variant="sec">
                    <Link href="/billing">Buka Penagihan</Link>
                  </Button>
                }
              />
            ) : (
              <DataTable
                rows={data.baris}
                columns={kolom}
                getRowId={(r) => r.id}
                searchPlaceholder="Cari keluarga atau nomor tagihan"
                searchText={(r) => `${r.keluarga} ${r.anak} ${r.nomor}`}
                filters={[
                  { id: "semua", label: "Semua", predicate: () => true },
                  { id: "online", label: "Online", predicate: (r) => r.metode === "online" && r.status === "lunas" },
                  { id: "manual", label: "Dicatat admin", predicate: (r) => r.metode === "manual" },
                  ...(data.menungguCount > 0
                    ? [{ id: "cek", label: "Perlu dicek", predicate: (r: BarisPembayaran) => r.status === "menunggu" }]
                    : []),
                ]}
                highlightRow={(r) => r.status === "menunggu"}
                onRowClick={data.isDemo ? undefined : (r) => router.push(`/billing/${r.invoiceId}`)}
                renderCard={(r) => (
                  <span className="flex items-center gap-3">
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-[15px]">{r.keluarga}</b>
                      <span className="block truncate text-[13px] text-muted-foreground">
                        {formatTanggal(r.waktu, { tanpaTahun: true })} {formatJam(r.waktu)} · {labelMetode(r)}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-0.5">
                      <span className="tabular">{formatRupiah(r.nominal)}</span>
                      <StatusDot info={r.status === "lunas" ? statusTagihan("paid") : STATUS_MENUNGGU_GATEWAY} size="sm" />
                    </span>
                  </span>
                )}
              />
            )}

            {data.menungguCount > 0 && (
              <InfoBox>
                <b>Menunggu gateway</b> berarti orang tua sudah membuka pembayaran online tetapi konfirmasinya belum masuk. Status
                berubah otomatis begitu pembayaran berhasil — jangan dicatat manual agar tidak terjadi bayar ganda.
              </InfoBox>
            )}
            <p className="text-[13px] text-muted-foreground">
              Rincian QRIS / Virtual Account dan jadwal pencairan ke rekening lembaga belum tercatat di sistem, jadi belum ditampilkan.
            </p>
          </div>
        </Stale>
      </PageBody>
    </>
  );
}
