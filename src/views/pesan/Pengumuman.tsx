"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  EmptyState,
  ErrorBanner,
  InfoBox,
  PageBody,
  PageHeader,
  Panel,
  PanelHeader,
  PanelRow,
  PanelRowsSkeleton,
  Stale,
} from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { formatJam, formatPeriode, formatTanggal } from "@/lib/format";
import { createAnnouncement, deleteAnnouncement } from "@/server/actions/announcements";
import { getPengumuman, type PengumumanData, type PengumumanItem } from "@/server/actions/pesan";

/**
 * O11 Pengumuman: tulis (kiri) + terkirim (kanan). Kirim/hapus memakai action lama.
 * Disembunyikan (BARU, REDESIGN-BACKLOG O11): audiens per kelas/keluarga, jadwal kirim, kanal WhatsApp,
 * simpan draf, konfirmasi "sudah membaca" + bilah tingkat baca + "Ingatkan yang belum baca".
 */

const JUDUL_MIN = 3;
const ISI_MIN = 10;

export default function Pengumuman({ initialData }: { initialData?: PengumumanData }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: ["pengumuman"], queryFn: getPengumuman, initialData });
  const { data, isError, refetch } = query;
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [hapus, setHapus] = useState<PengumumanItem | null>(null);

  const kirim = useMutation({
    mutationFn: () => createAnnouncement({ title: judul, body: isi }),
    onSuccess: (res) => {
      toast({ title: "Pengumuman terkirim", description: `Tampil di aplikasi ${res.recipientCount} keluarga.` });
      setJudul("");
      setIsi("");
      setKonfirmasi(false);
      qc.invalidateQueries({ queryKey: ["pengumuman"] });
    },
    onError: (err: Error) => toast({ title: "Gagal mengirim", description: err.message, variant: "destructive" }),
  });
  const hapusM = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      toast({ title: "Pengumuman dihapus dari portal orang tua" });
      setHapus(null);
      qc.invalidateQueries({ queryKey: ["pengumuman"] });
    },
    onError: (err: Error) => toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" }),
  });

  const judulPage = "Pengumuman";
  const aksiKotak = (
    // Sub-menu Pesan hanya tampil di sidebar ≥1001; di rail & nav bawah, tautan ini satu-satunya jalan ke Kotak masuk.
    <Button asChild variant="txt" className="min-[1001px]:hidden">
      <Link href="/messages/kotak-masuk">
        <Inbox aria-hidden />
        Kotak masuk
      </Link>
    </Button>
  );

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="PESAN" title={judulPage} actions={aksiKotak} />
        <PageBody>
          {isError ? (
            <ErrorBanner title="Pengumuman gagal dimuat" description="Tidak ada yang terkirim atau berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <div className="grid gap-5 min-[1001px]:grid-cols-[minmax(0,1fr)_380px]">
              <Panel>
                <PanelRowsSkeleton rows={4} />
              </Panel>
              <Panel>
                <PanelRowsSkeleton rows={3} />
              </Panel>
            </div>
          )}
        </PageBody>
      </>
    );
  }

  const bisaKirim = !data.isDemo;
  const valid = judul.trim().length >= JUDUL_MIN && isi.trim().length >= ISI_MIN;
  const periode = formatPeriode(new Date());

  return (
    <>
      <PageHeader eyebrow="PESAN" title={judulPage} actions={aksiKotak} />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Pengumuman di layar ini adalah contoh, bukan data lembaga mana pun. Pengiriman dinonaktifkan.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner
            title="Pengumuman gagal diperbarui"
            description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`}
            onRetry={() => refetch()}
          />
        )}
        <Stale stale={isError}>
          <div className="grid items-start gap-5 min-[1001px]:grid-cols-[minmax(0,1fr)_380px]">
            <Panel>
              <PanelHeader title="Tulis pengumuman" />
              <form
                className="flex flex-col gap-4 px-[18px] py-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (valid) setKonfirmasi(true);
                }}
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-judul">Judul</Label>
                  <Input id="p-judul" value={judul} onChange={(e) => setJudul(e.target.value)} maxLength={120} disabled={!bisaKirim} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-isi">Isi</Label>
                  <Textarea id="p-isi" rows={7} value={isi} onChange={(e) => setIsi(e.target.value)} maxLength={2000} disabled={!bisaKirim} />
                  <span className="flex justify-between gap-3 text-[13px] text-muted-foreground">
                    <span>Minimal {ISI_MIN} karakter. Tulis tanggal, jam, dan biaya bila ada.</span>
                    <span className="tabular shrink-0">{isi.length}/2000</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">Kepada</span>
                  <span className="text-[15px]">
                    Semua keluarga dengan akun aktif · <b className="tabular">{data.penerimaSaatIni}</b> keluarga
                  </span>
                  {data.keluargaTanpaAkun > 0 && (
                    <span className="text-[13px] text-muted-foreground">
                      {data.keluargaTanpaAkun} keluarga belum punya akun aplikasi dan tidak menerima.{" "}
                      <Link href="/students?filter=wali" className="font-semibold text-primary hover:underline">
                        Lihat wali belum tertaut
                      </Link>
                    </span>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={!bisaKirim || !valid || kirim.isPending}>
                    {kirim.isPending ? "Mengirim…" : `Kirim ke ${data.penerimaSaatIni} keluarga`}
                  </Button>
                </div>
              </form>
            </Panel>

            <Panel>
              <PanelHeader title="Terkirim" meta={data.daftar.length ? `${data.daftar.length} total` : undefined} />
              {data.daftar.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    compact
                    title="Belum ada pengumuman"
                    description="Pengumuman tampil di beranda aplikasi orang tua, misalnya jadwal libur atau kegiatan."
                  />
                </div>
              ) : (
                data.daftar.map((a, i) => {
                  const bulanBaru = i === 0 || formatPeriode(a.createdAt) !== formatPeriode(data.daftar[i - 1].createdAt);
                  return (
                    <div key={a.id}>
                      {bulanBaru && (
                        <div className="border-b border-border-subtle bg-muted px-[18px] py-1.5 text-xs font-semibold text-muted-foreground">
                          {formatPeriode(a.createdAt) === periode ? `${periode} · bulan ini` : formatPeriode(a.createdAt)}
                        </div>
                      )}
                      <PanelRow className="items-start">
                        <span className="min-w-0 flex-1">
                          <b className="block text-sm">{a.title}</b>
                          <span className="mt-0.5 line-clamp-2 block whitespace-pre-wrap text-[13px] text-foreground-2">{a.body}</span>
                          <span className="tabular mt-1 block text-xs text-muted-foreground">
                            {formatTanggal(a.createdAt, { tanpaTahun: true })} {formatJam(a.createdAt)} · {a.recipientCount} keluarga
                            {a.pengirim ? ` · ${a.pengirim}` : ""}
                          </span>
                        </span>
                        {bisaKirim && (
                          <Button variant="txt" size="icon-sm" aria-label={`Hapus ${a.title}`} onClick={() => setHapus(a)}>
                            <Trash2 aria-hidden />
                          </Button>
                        )}
                      </PanelRow>
                    </div>
                  );
                })
              )}
              <p className="border-t border-border-subtle px-[18px] py-3 text-[13px] text-muted-foreground">
                Penerima dihitung saat dikirim. Tingkat baca, audiens per kelas, dan jadwal kirim belum tersedia.
              </p>
            </Panel>
          </div>
        </Stale>
      </PageBody>

      <AlertDialog open={konfirmasi} onOpenChange={setKonfirmasi}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kirim ke {data.penerimaSaatIni} keluarga?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{judul.trim()}&rdquo; langsung tampil di aplikasi orang tua. Pengumuman bisa dihapus nanti, tetapi mungkin sudah dibaca.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={kirim.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                kirim.mutate();
              }}
              disabled={kirim.isPending}
            >
              {kirim.isPending ? "Mengirim…" : "Kirim sekarang"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!hapus} onOpenChange={(o) => !o && setHapus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengumuman?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{hapus?.title}&rdquo; hilang dari portal orang tua. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={hapusM.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="border-destructive bg-card text-destructive hover:bg-destructive-soft"
              onClick={(e) => {
                e.preventDefault();
                if (hapus) hapusM.mutate(hapus.id);
              }}
              disabled={hapusM.isPending}
            >
              {hapusM.isPending ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
