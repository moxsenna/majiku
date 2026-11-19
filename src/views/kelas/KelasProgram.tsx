"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MoreVertical, Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  EmptyState,
  ErrorBanner,
  FilterChip,
  InfoBox,
  PageBody,
  PageHeader,
  Panel,
  PanelRowsSkeleton,
  ProgressBar,
  Stale,
} from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { formatJam, formatRupiah } from "@/lib/format";
import { ringkasJadwal } from "@/lib/jadwal";
import { KELAS_KRAYON, krayonDari } from "@/lib/krayon";
import { cn } from "@/lib/utils";
import { toggleClassActive } from "@/server/actions/classesCrud";
import { getKelasProgram, type KelasProgram as Kelas, type KelasProgramData } from "@/server/actions/kelasJadwal";
import { KelasDialog } from "./KelasDialog";

/**
 * O1 Kelas & program. Satu kartu per kelas dengan warna krayon tetap; kapasitas ≥ 90% merah status.
 * Jadwal dari class_schedules (satu sumber, N21). Disembunyikan (BARU): batas usia terstruktur
 * (ditulis di keterangan), paket per kelas (Full day/Half day) — lihat REDESIGN-BACKLOG.
 */

function infoKursi(k: Kelas): { teks: string; merah: boolean } {
  const bagian: string[] = [];
  let merah = false;
  if (k.capacity) {
    const sisa = k.capacity - k.terisi;
    merah = k.terisi / k.capacity >= 0.9;
    bagian.push(sisa <= 0 ? "Penuh" : merah ? `Hampir penuh · ${sisa} kursi` : `${sisa} kursi kosong`);
  }
  bagian.push(`daftar tunggu ${k.daftarTunggu}`);
  if (k.trialMendatang > 0) bagian.push(`${k.trialMendatang} trial terjadwal`);
  return { teks: bagian.join(" · "), merah };
}

function KartuKelas({
  k,
  bisaUbah,
  onUbah,
  onToggle,
}: {
  k: Kelas;
  bisaUbah: boolean;
  onUbah: () => void;
  onToggle: () => void;
}) {
  const krayon = KELAS_KRAYON[krayonDari(k.id)];
  const kursi = infoKursi(k);
  const jadwal = ringkasJadwal(k.jadwal);
  return (
    <Panel className={cn(!k.isActive && "opacity-70")}>
      <header className={cn("flex items-center justify-between gap-3 border-b-2 px-[18px] py-3", krayon.border)}>
        <h3 className="flex min-w-0 items-center gap-2.5 font-display text-[19px] font-bold tracking-tight">
          <span aria-hidden className={cn("h-5 w-1.5 shrink-0 rounded-full", krayon.bg)} />
          <span className="truncate">{k.name}</span>
          {!k.isActive && <span className="text-[13px] font-normal text-muted-foreground">nonaktif</span>}
        </h3>
        <span className="flex items-center gap-1">
          {k.description && <span className="hidden max-w-[180px] truncate text-[13px] text-muted-foreground min-[561px]:inline">{k.description}</span>}
          {bisaUbah && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="txt" size="icon-sm" aria-label={`Opsi ${k.name}`}>
                  <MoreVertical aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onUbah}>Ubah kelas</DropdownMenuItem>
                <DropdownMenuItem onClick={onToggle}>{k.isActive ? "Nonaktifkan" : "Aktifkan"}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </span>
      </header>
      <div className="flex flex-col gap-3 px-[18px] py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-[13px] text-muted-foreground">
            {k.guru.length ? k.guru.map((g) => g.name).join(", ") : "Belum ada guru"}
            {k.location && ` · ${k.location}`}
          </span>
          <span className={cn("tabular shrink-0", kursi.merah && "text-destructive")}>
            {k.terisi}
            {k.capacity ? `/${k.capacity}` : " anak"}
          </span>
        </div>
        {k.capacity ? (
          <ProgressBar value={k.terisi} max={k.capacity} tone={kursi.merah ? "red" : "ink"} label={`Terisi ${k.name}`} />
        ) : null}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
          <span className="flex items-center gap-1.5">
            <CalendarDays aria-hidden className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {jadwal ?? <span className="text-muted-foreground">Belum ada jadwal</span>}
          </span>
          {k.pricePerMonth && Number(k.pricePerMonth) > 0 && (
            <span className="flex items-center gap-1.5">
              <Receipt aria-hidden className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="tabular">{formatRupiah(k.pricePerMonth)}</span>/bulan
              {k.sessionsPerMonth ? <span className="text-muted-foreground"> · {k.sessionsPerMonth} sesi</span> : null}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("grow text-[13px]", kursi.merah ? "font-semibold text-destructive" : "text-muted-foreground")}>{kursi.teks}</span>
          <Link href={`/students?kelas=${k.id}`} className="shrink-0 text-[13px] font-semibold text-primary hover:underline">
            Lihat anak
          </Link>
        </div>
      </div>
    </Panel>
  );
}

export default function KelasProgram({ initialData }: { initialData?: KelasProgramData }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const query = useQuery({ queryKey: ["kelas-program"], queryFn: getKelasProgram, initialData });
  const { data, isError, refetch } = query;
  const [dialog, setDialog] = useState<{ open: boolean; kelas: Kelas | null }>({ open: false, kelas: null });
  const [tampil, setTampil] = useState<"aktif" | "nonaktif">("aktif");

  const bisaUbah = !!data && !data.isDemo;
  const judul = "Kelas & program";
  const aksi = bisaUbah ? (
    <Button onClick={() => setDialog({ open: true, kelas: null })}>
      <Plus aria-hidden />
      Kelas baru
    </Button>
  ) : undefined;

  const toggle = (k: Kelas) =>
    startTransition(async () => {
      try {
        await toggleClassActive(k.id, !k.isActive);
        toast({ title: k.isActive ? "Kelas dinonaktifkan" : "Kelas diaktifkan", description: k.name });
        qc.invalidateQueries({ queryKey: ["kelas-program"] });
      } catch (err) {
        toast({ title: "Gagal mengubah status", description: err instanceof Error ? err.message : "Coba lagi.", variant: "destructive" });
      }
    });

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="KELAS & JADWAL" title={judul} />
        <PageBody>
          {isError ? (
            <ErrorBanner title="Daftar kelas gagal dimuat" description="Tidak ada data yang berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <div className="grid gap-5 min-[1001px]:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
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

  const aktif = data.kelas.filter((k) => k.isActive);
  const nonaktif = data.kelas.filter((k) => !k.isActive);
  const daftar = tampil === "aktif" ? aktif : nonaktif;

  return (
    <>
      <PageHeader eyebrow="KELAS & JADWAL" title={judul} actions={aksi} />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Kelas di layar ini adalah contoh dari desain, bukan data lembaga mana pun. Perubahan dinonaktifkan.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner
            title="Daftar kelas gagal diperbarui"
            description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`}
            onRetry={() => refetch()}
          />
        )}
        {data.kelas.length === 0 ? (
          <EmptyState
            title="Belum ada kelas"
            description="Buat kelas pertama dulu (nama, usia, kapasitas). Setelah itu atur jamnya di Kalender Sesi dan masukkan anak."
            action={bisaUbah ? <Button onClick={() => setDialog({ open: true, kelas: null })}>Buat kelas</Button> : undefined}
          />
        ) : (
          <Stale stale={isError}>
            <div className="flex flex-col gap-5">
              {nonaktif.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <FilterChip active={tampil === "aktif"} count={aktif.length} onClick={() => setTampil("aktif")}>
                    Aktif
                  </FilterChip>
                  <FilterChip active={tampil === "nonaktif"} count={nonaktif.length} onClick={() => setTampil("nonaktif")}>
                    Nonaktif
                  </FilterChip>
                </div>
              )}
              {daftar.length === 0 ? (
                <EmptyState
                  compact
                  title="Tidak ada kelas aktif"
                  description="Semua kelas sedang nonaktif. Aktifkan kembali dari tab Nonaktif atau buat kelas baru."
                />
              ) : (
                <div className="grid items-start gap-5 min-[1001px]:grid-cols-2">
                  {daftar.map((k) => (
                    <KartuKelas
                      key={k.id}
                      k={k}
                      bisaUbah={bisaUbah}
                      onUbah={() => setDialog({ open: true, kelas: k })}
                      onToggle={() => toggle(k)}
                    />
                  ))}
                </div>
              )}
              <p className="text-[13px] text-muted-foreground">
                Jadwal tiap kelas diambil dari{" "}
                <Link href="/schedule" className="font-semibold text-primary hover:underline">
                  Kalender Sesi
                </Link>
                . Kapasitas 90% ke atas ditandai merah.
              </p>
            </div>
          </Stale>
        )}
      </PageBody>
      {bisaUbah && (
        <KelasDialog
          kelas={dialog.kelas}
          guruPilihan={data.guruPilihan}
          open={dialog.open}
          onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        />
      )}
    </>
  );
}
