"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClassChip, EmptyState, ErrorBanner, FilterChip, InfoBox, PageBody, PageHeader, Stale } from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { formatJam, formatTanggal } from "@/lib/format";
import { deleteGalleryPhoto, uploadGalleryPhotos } from "@/server/actions/gallery";
import { getFotoKegiatan, type FotoData, type FotoItem } from "@/server/actions/laporanHarian";

/**
 * O7 tab Foto (pengganti Galeri). Unggah/hapus memakai action lama gallery.ts.
 * Disembunyikan (BARU): izin publikasi foto per anak (COM-11), tautan foto ke feed kegiatan.
 */

const MAKS = 6;
const TIPE = ["image/jpeg", "image/png", "image/webp"];

function UnggahDialog({ open, onOpenChange, data }: { open: boolean; onOpenChange: (v: boolean) => void; data: FotoData }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [keys, setKeys] = useState<string[]>([]);
  const [unggah, setUnggah] = useState(false);
  const [simpan, setSimpan] = useState(false);
  const [kelas, setKelas] = useState("none");
  const [anak, setAnak] = useState<string[]>([]);
  const [caption, setCaption] = useState("");

  const reset = () => {
    setKeys([]);
    setKelas("none");
    setAnak([]);
    setCaption("");
  };

  const pilihFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    if (keys.length + files.length > MAKS) {
      toast({ title: `Maksimal ${MAKS} foto sekali unggah`, variant: "destructive" });
      return;
    }
    const salah = files.find((f) => !TIPE.includes(f.type) || f.size > 5 * 1024 * 1024);
    if (salah) {
      toast({ title: "Foto tidak bisa dipakai", description: `${salah.name}: harus JPG/PNG/WebP maks. 5 MB.`, variant: "destructive" });
      return;
    }
    setUnggah(true);
    try {
      const fd = new FormData();
      fd.append("prefix", "gallery");
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/photos", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal mengunggah foto");
      if (Array.isArray(d.keys)) setKeys((p) => [...p, ...d.keys]);
    } catch (err) {
      toast({ title: "Gagal mengunggah", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
    } finally {
      setUnggah(false);
    }
  };

  const kirim = async () => {
    setSimpan(true);
    try {
      const res = await uploadGalleryPhotos({
        photoKeys: keys,
        studentIds: anak.length ? anak : undefined,
        classId: kelas !== "none" ? kelas : undefined,
        caption: caption.trim() || undefined,
      });
      toast({ title: `${res.created} foto tersimpan` });
      reset();
      onOpenChange(false);
      qc.invalidateQueries({ queryKey: ["foto-kegiatan"] });
    } catch (err) {
      toast({ title: "Gagal menyimpan foto", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
    } finally {
      setSimpan(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Unggah foto</DialogTitle>
          <DialogDescription>Maksimal {MAKS} foto sekali unggah, JPG/PNG/WebP hingga 5 MB.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded border-[1.5px] border-dashed border-input bg-card p-5 text-center hover:border-foreground">
            {unggah ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Upload className="h-5 w-5" aria-hidden />}
            <span className="text-sm font-semibold">{unggah ? "Mengunggah…" : "Pilih foto"}</span>
            <span className="text-[13px] text-muted-foreground">{keys.length}/{MAKS} siap</span>
            <input type="file" multiple accept={TIPE.join(",")} className="hidden" onChange={pilihFile} disabled={unggah || simpan || keys.length >= MAKS} />
          </label>
          {keys.length > 0 && (
            <div className="grid grid-cols-6 gap-2 max-[560px]:grid-cols-3">
              {keys.map((k, i) => (
                <span key={k} className="relative aspect-square overflow-hidden rounded-input bg-muted">
                  <img src={`/api/photos/${k}`} alt={`Pratinjau ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Buang foto"
                    onClick={() => setKeys((p) => p.filter((x) => x !== k))}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-foreground/80 text-background"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-kelas">Kelas</Label>
            <Select value={kelas} onValueChange={setKelas}>
              <SelectTrigger id="f-kelas">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa kelas</SelectItem>
                {data.kelas.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Tandai anak · {anak.length} dipilih</span>
            <div className="grid max-h-36 grid-cols-2 gap-1 overflow-y-auto rounded border border-border p-2 max-[560px]:grid-cols-1">
              {data.anak.map((a) => (
                <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted">
                  <Checkbox checked={anak.includes(a.id)} onCheckedChange={() => setAnak((p) => (p.includes(a.id) ? p.filter((x) => x !== a.id) : [...p, a.id]))} />
                  <span className="truncate">{a.name}</span>
                </label>
              ))}
            </div>
            <span className="text-[13px] text-muted-foreground">Foto yang ditandai tampil untuk orang tua anak itu.</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-caption">Keterangan</Label>
            <Textarea id="f-caption" rows={2} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="sec" onClick={() => onOpenChange(false)} disabled={simpan}>
            Batal
          </Button>
          <Button onClick={kirim} disabled={!keys.length || unggah || simpan}>
            {simpan ? "Menyimpan…" : `Simpan ${keys.length || ""} foto`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FotoKegiatan({ initialData }: { initialData?: FotoData }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: ["foto-kegiatan"], queryFn: getFotoKegiatan, initialData });
  const { data, isError, refetch } = query;
  const [kelas, setKelas] = useState("semua");
  const [unggahOpen, setUnggahOpen] = useState(false);
  const [hapus, setHapus] = useState<FotoItem | null>(null);
  const [menghapus, setMenghapus] = useState(false);

  const tampil = useMemo(() => (data?.foto ?? []).filter((f) => kelas === "semua" || f.classId === kelas), [data, kelas]);
  const judul = "Foto kegiatan";
  const kembali = (
    <Button asChild variant="sec">
      <Link href="/daily-reports">Laporan harian</Link>
    </Button>
  );

  if (!data) {
    return (
      <>
        <PageHeader title={judul} actions={kembali} />
        <PageBody>
          {isError ? (
            <ErrorBanner title="Foto gagal dimuat" description="Tidak ada data yang berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <div className="grid grid-cols-4 gap-3 max-[1000px]:grid-cols-3 max-[560px]:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="sk aspect-square" />
              ))}
            </div>
          )}
        </PageBody>
      </>
    );
  }

  const bisaUbah = !data.isDemo;

  const hapusFoto = async () => {
    if (!hapus) return;
    setMenghapus(true);
    try {
      await deleteGalleryPhoto(hapus.id);
      toast({ title: "Foto dihapus" });
      setHapus(null);
      qc.invalidateQueries({ queryKey: ["foto-kegiatan"] });
    } catch (err) {
      toast({ title: "Gagal menghapus", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
    } finally {
      setMenghapus(false);
    }
  };

  return (
    <>
      <PageHeader
        title={judul}
        actions={
          <>
            {kembali}
            {bisaUbah && (
              <Button onClick={() => setUnggahOpen(true)}>
                <Upload aria-hidden />
                Unggah foto
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Foto anak tidak ditampilkan pada akun demo. Unggah dinonaktifkan.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner title="Foto gagal diperbarui" description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`} onRetry={() => refetch()} />
        )}
        {data.foto.length === 0 ? (
          <EmptyState
            title="Belum ada foto"
            description="Foto kegiatan yang diunggah guru atau admin tampil di sini dan di aplikasi orang tua anak yang ditandai."
            action={bisaUbah ? <Button onClick={() => setUnggahOpen(true)}>Unggah foto pertama</Button> : undefined}
          />
        ) : (
          <Stale stale={isError}>
            <div className="flex flex-col gap-5">
              {data.kelas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <FilterChip active={kelas === "semua"} count={data.foto.length} onClick={() => setKelas("semua")}>
                    Semua
                  </FilterChip>
                  {data.kelas.map((k) => (
                    <FilterChip key={k.id} active={kelas === k.id} count={data.foto.filter((f) => f.classId === k.id).length} onClick={() => setKelas(k.id)}>
                      {k.name}
                    </FilterChip>
                  ))}
                </div>
              )}
              {tampil.length === 0 ? (
                <EmptyState compact title="Tidak ada foto di kelas ini" description="Pilih kelas lain atau unggah foto untuk kelas ini." />
              ) : (
                <div className="grid grid-cols-4 gap-3 max-[1000px]:grid-cols-3 max-[560px]:grid-cols-2">
                  {tampil.map((f) => (
                    <figure key={f.id} className="group relative overflow-hidden rounded border border-border bg-card">
                      <img src={`/api/photos/${f.photoKey}`} alt={f.caption || "Foto kegiatan"} className="aspect-square w-full bg-muted object-cover" loading="lazy" />
                      <figcaption className="flex flex-col gap-1 px-3 py-2.5">
                        {f.caption && <span className="line-clamp-2 text-[13px]">{f.caption}</span>}
                        <span className="flex flex-wrap items-center gap-1.5">
                          {f.className && <ClassChip name={f.className} id={f.classId} className="h-6 text-xs" />}
                          {f.studentName && <span className="truncate text-xs font-semibold">{f.studentName}</span>}
                        </span>
                        <span className="tabular text-xs text-muted-foreground">
                          {formatTanggal(f.diunggah, { tanpaTahun: true })} {formatJam(f.diunggah)} · {f.pengunggah ?? "staf"}
                        </span>
                      </figcaption>
                      {bisaUbah && (
                        <Button
                          variant="sec"
                          size="icon-sm"
                          aria-label="Hapus foto"
                          className="absolute right-2 top-2 opacity-0 focus-visible:opacity-100 group-hover:opacity-100 max-[1000px]:opacity-100"
                          onClick={() => setHapus(f)}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      )}
                    </figure>
                  ))}
                </div>
              )}
              <p className="text-[13px] text-muted-foreground">Izin publikasi foto per anak belum tersedia; pastikan foto sudah disetujui keluarga sebelum ditandai.</p>
            </div>
          </Stale>
        )}
      </PageBody>
      {bisaUbah && <UnggahDialog open={unggahOpen} onOpenChange={setUnggahOpen} data={data} />}
      <AlertDialog open={!!hapus} onOpenChange={(o) => !o && setHapus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus foto?</AlertDialogTitle>
            <AlertDialogDescription>Foto hilang dari galeri dan aplikasi orang tua. Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={menghapus}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="border-destructive bg-card text-destructive hover:bg-destructive-soft"
              onClick={(e) => {
                e.preventDefault();
                hapusFoto();
              }}
              disabled={menghapus}
            >
              {menghapus ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
