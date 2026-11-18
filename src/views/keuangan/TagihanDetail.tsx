"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ErrorBanner,
  InfoBox,
  PageBody,
  PageHeader,
  Panel,
  PanelHeader,
  PanelRow,
  Stale,
  StatusDot,
} from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { statusTagihan } from "@/lib/status";
import { markInvoicePaid } from "@/server/actions/billing";
import { getTagihanDetail, type TagihanDetail as TagihanDetailData } from "@/server/actions/keuangan";

/**
 * K2 Detail tagihan keluarga + ledger (ala buku kas) dan K3 Catat pembayaran.
 * BARU yang disembunyikan: pembayaran parsial (nominal + saldo parsial), foto bukti, kuitansi ke WA,
 * pengingat terjadwal, ubah rincian/diskon, batalkan tagihan. K3 hanya mencatat Lunas penuh (action lama).
 */

export default function TagihanDetail({ initialData, id }: { initialData?: TagihanDetailData | null; id: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: ["tagihan", id], queryFn: () => getTagihanDetail(id), initialData: initialData ?? undefined, enabled: !initialData });
  const { data, isError, refetch } = query;

  const tandaiLunas = useMutation({
    mutationFn: () => markInvoicePaid(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tagihan", id] });
      qc.invalidateQueries({ queryKey: ["keuangan"] });
      qc.invalidateQueries({ queryKey: ["hari-ini"] });
      toast({ title: "Pembayaran tercatat Lunas", description: "Tagihan ini kini masuk Diterima periode berjalan." });
    },
    onError: (err: Error) => {
      toast({ title: "Gagal mencatat pembayaran", description: err.message, variant: "destructive" });
    },
  });

  if (!data) {
    return (
      <>
        <PageHeader title="Detail tagihan" crumbs={[{ label: "Keuangan", href: "/billing" }]} />
        <PageBody>
          {isError ? (
            <ErrorBanner title="Detail tagihan gagal dimuat" description="Tidak ada data yang berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <div className="flex flex-col gap-3">
              <span className="sk h-24 w-full" />
              <span className="sk h-48 w-full" />
            </div>
          )}
        </PageBody>
      </>
    );
  }

  const st = statusTagihan(data.status, data.hariTerlambat);
  const bisaBayar = data.status !== "paid";
  const saldoAkhir = data.ledger.length ? data.ledger[data.ledger.length - 1].saldo : 0;

  return (
    <>
      <PageHeader
        eyebrow={data.nomor}
        title={`${data.keluarga}${data.rincian.periode ? ` · ${data.rincian.periode}` : ""}`}
        crumbs={[{ label: "Keuangan", href: "/billing/ringkasan" }, { label: "Tagihan", href: "/billing" }]}
        actions={
          <>
            {bisaBayar && data.wa && (
              <Button asChild variant="sec" className="max-[560px]:hidden">
                <a href={data.wa} target="_blank" rel="noreferrer">
                  <MessageCircle aria-hidden />
                  Kirim pengingat
                </a>
              </Button>
            )}
            {bisaBayar && (
              <Button onClick={() => tandaiLunas.mutate()} disabled={tandaiLunas.isPending}>
                {tandaiLunas.isPending ? "Menyimpan…" : "Catat pembayaran"}
              </Button>
            )}
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
            title="Detail tagihan gagal diperbarui"
            description="Yang tampil adalah data terakhir."
            onRetry={() => refetch()}
          />
        )}

        <Stale stale={isError}>
          <div className="flex min-w-0 flex-col gap-5">
            <Panel>
              <PanelRow>
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                  <StatusDot info={st} />
                  {data.rincian.dueDate && (
                    <span className="text-[13px] text-muted-foreground">
                      jatuh tempo {formatTanggal(data.rincian.dueDate)}
                      {data.status !== "paid" && data.hariTerlambat > 0 && ` · ${data.hariTerlambat} hari lewat`}
                    </span>
                  )}
                </span>
                <span className="tabular font-display text-lg font-bold">
                  <span className="hl">{formatRupiah(data.rincian.total)}</span>
                </span>
              </PanelRow>
              {data.rincian.discount > 0 && (
                <PanelRow>
                  <span className="flex-1">Diskon</span>
                  <span className="tabular text-success">−{formatRupiah(data.rincian.discount)}</span>
                </PanelRow>
              )}
              {data.rincian.notes && (
                <PanelRow>
                  <span className="flex-1 text-[13px] text-muted-foreground">{data.rincian.notes}</span>
                </PanelRow>
              )}
              <PanelRow>
                <span className="flex min-w-0 flex-1 flex-wrap gap-x-4 gap-y-1">
                  {data.anak.map((a) => (
                    <Link key={a.id} href={`/students/${a.id}`} className="text-[13px] font-semibold text-primary hover:underline">
                      {a.name}
                      {a.kelas && <span className="font-normal text-muted-foreground"> · {a.kelas}</span>}
                    </Link>
                  ))}
                </span>
                <span className="tabular text-[13px] text-muted-foreground">
                  {formatRupiah(data.rincian.amount)}
                  {data.rincian.discount > 0 && <> − {formatRupiah(data.rincian.discount)}</>}
                </span>
              </PanelRow>
            </Panel>

            <Panel>
              <PanelHeader
                title="Ledger keluarga"
                meta={
                  data.ledger.length
                    ? `saldo: ${saldoAkhir > 0 ? formatRupiah(saldoAkhir) + " terutang" : saldoAkhir < 0 ? formatRupiah(saldoAkhir) : "lunas"}`
                    : undefined
                }
              />
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[13px] font-medium text-muted-foreground">
                      <th className="px-[18px] py-2.5">Tanggal</th>
                      <th className="px-3 py-2.5">Keterangan</th>
                      <th className="px-3 py-2.5 text-right">Tagihan</th>
                      <th className="px-3 py-2.5 text-right">Bayar</th>
                      <th className="px-[18px] py-2.5 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ledger.map((l, i) => (
                      <tr key={`${l.tanggal}-${i}`} className="border-b border-border-subtle last:border-b-0">
                        <td className="tabular whitespace-nowrap px-[18px] py-[11px]">{formatTanggal(l.tanggal)}</td>
                        <td className="px-3 py-[11px]">{l.keterangan}</td>
                        <td className="tabular px-3 py-[11px] text-right">{l.tagihan > 0 ? formatRupiah(l.tagihan) : "—"}</td>
                        <td className="tabular px-3 py-[11px] text-right">{l.bayar > 0 ? formatRupiah(l.bayar) : "—"}</td>
                        <td className="tabular px-[18px] py-[11px] text-right font-semibold">{formatRupiah(l.saldo)}</td>
                      </tr>
                    ))}
                    {data.ledger.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-[18px] py-6 text-center text-muted-foreground">
                          Belum ada catatan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <PanelRow stacked>
                <span className="text-[13px] text-muted-foreground">
                  Pembayaran sebagian belum tercatat di sistem — baris Bayar selalu nominal penuh tagihan yang Lunas. Pencatatan parsial, foto bukti, dan kuitansi tercatat di backlog.
                </span>
              </PanelRow>
            </Panel>

            {bisaBayar && (
              <InfoBox>
                <b>Catat pembayaran</b> mencatat Lunas penuh hari ini. Untuk bayar sebagian atau menyimpan bukti, gunakan catatan manual di luar aplikasi sampai fitur tersedia.
              </InfoBox>
            )}
          </div>
        </Stale>
      </PageBody>
    </>
  );
}
