"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ClassChip,
  DataTableSkeleton,
  EmptyState,
  ErrorBanner,
  FilterChip,
  InfoBox,
  PageBody,
  PageHeader,
  Panel,
  PanelRow,
  RowText,
  Stale,
} from "@/components/bunayo";
import { formatJam, formatRentangJam, formatTanggal } from "@/lib/format";
import { HARI_JADWAL, LABEL_JENIS_JADWAL, jamSelesai, menitDari } from "@/lib/jadwal";
import { KELAS_KRAYON, krayonDari } from "@/lib/krayon";
import { cn } from "@/lib/utils";
import { getKalenderSesi, type KalenderData, type SlotJadwal } from "@/server/actions/kelasJadwal";
import { SlotDialog } from "./SlotDialog";

/**
 * O2 Kalender sesi — minggu berjalan dari jadwal mingguan berulang (class_schedules, satu sumber).
 * Disembunyikan (BARU, REDESIGN-BACKLOG O2/O4): sesi konkret per tanggal, navigasi minggu lain (jadwal sama tiap minggu),
 * "Tanpa guru" + pilih pengganti, libur bertanggal yang membatalkan sesi & mengembalikan kuota.
 */

const PX_PER_MENIT = 1; // satu jam = 60 px (kit .cal .cell)

function tanggalKe(senin: string, offset: number) {
  const [y, m, d] = senin.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + offset)).toISOString().slice(0, 10);
}

/** Bagi sesi yang tumpang-tindih dalam satu hari ke lajur berdampingan. */
function aturLajur(slot: SlotJadwal[]): Map<string, { lajur: number; total: number }> {
  const urut = [...slot].sort((a, b) => menitDari(a.startTime) - menitDari(b.startTime));
  const hasil = new Map<string, { lajur: number; total: number }>();
  let grup: SlotJadwal[] = [];
  let akhirGrup = -1;
  let akhirLajur: number[] = [];
  const tutup = () => grup.forEach((s) => hasil.set(s.id, { ...hasil.get(s.id)!, total: akhirLajur.length }));
  for (const s of urut) {
    const mulai = menitDari(s.startTime);
    if (mulai >= akhirGrup) {
      tutup();
      grup = [];
      akhirLajur = [];
    }
    let lajur = akhirLajur.findIndex((akhir) => akhir <= mulai);
    if (lajur === -1) lajur = akhirLajur.length;
    akhirLajur[lajur] = mulai + s.durationMinutes;
    hasil.set(s.id, { lajur, total: 1 });
    grup.push(s);
    akhirGrup = Math.max(akhirGrup, mulai + s.durationMinutes);
  }
  tutup();
  return hasil;
}

function kelasEv(s: SlotJadwal) {
  if (s.type === "holiday") return "border-input text-foreground-2 [background:repeating-linear-gradient(135deg,hsl(var(--card))_0_6px,hsl(var(--muted))_6px_12px)]";
  const k = KELAS_KRAYON[s.type === "class" ? krayonDari(s.classId) : "anggur"];
  return cn(k.soft, k.ink, k.border);
}

export default function KalenderSesi({ initialData }: { initialData?: KalenderData }) {
  const query = useQuery({ queryKey: ["kalender-sesi"], queryFn: getKalenderSesi, initialData });
  const { data, isError, refetch } = query;
  const [filterKelas, setFilterKelas] = useState("semua");
  const [mode, setMode] = useState<"minggu" | "agenda">("minggu");
  const [dialog, setDialog] = useState<{ open: boolean; slot: SlotJadwal | null; awal?: { dayOfWeek?: number; classId?: string } }>({
    open: false,
    slot: null,
  });

  const turunan = useMemo(() => {
    if (!data) return null;
    const kelasAktif = data.kelas.filter((k) => k.isActive);
    const idAktif = new Set(kelasAktif.map((k) => k.id));
    const semua = data.slot.filter((s) => s.classId && idAktif.has(s.classId));
    const tampil = semua.filter((s) => s.isActive && (filterKelas === "semua" || s.classId === filterKelas));
    const dijeda = semua.filter((s) => !s.isActive);
    const pakaiSabtu = tampil.some((s) => s.dayOfWeek === 6);
    const hari = HARI_JADWAL.filter((h) => h.dow <= (pakaiSabtu ? 6 : 5));
    const awalMenit = tampil.length ? Math.floor(Math.min(...tampil.map((s) => menitDari(s.startTime))) / 60) * 60 : 7 * 60;
    const akhirMenit = tampil.length
      ? Math.ceil(Math.max(...tampil.map((s) => menitDari(s.startTime) + s.durationMinutes)) / 60) * 60
      : 13 * 60;
    const jam: number[] = [];
    for (let m = awalMenit; m < Math.max(akhirMenit, awalMenit + 60); m += 60) jam.push(m);
    return { kelasAktif, tampil, dijeda, hari, awalMenit, jam };
  }, [data, filterKelas]);

  const bisaUbah = !!data && !data.isDemo;
  const tambah = (awal?: { dayOfWeek?: number; classId?: string }) => setDialog({ open: true, slot: null, awal });
  const buka = (s: SlotJadwal) => bisaUbah && setDialog({ open: true, slot: s });

  if (!data || !turunan) {
    return (
      <>
        <PageHeader eyebrow="KELAS & JADWAL" title="Kalender sesi" />
        <PageBody>
          {isError ? (
            <ErrorBanner title="Kalender gagal dimuat" description="Tidak ada data yang berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <DataTableSkeleton rows={6} cols={6} />
          )}
        </PageBody>
      </>
    );
  }

  const { kelasAktif, tampil, dijeda, hari, awalMenit, jam } = turunan;
  const jumat = tanggalKe(data.senin, hari.length - 1);
  const judul =
    data.senin.slice(0, 7) === jumat.slice(0, 7)
      ? `${Number(data.senin.slice(8))}–${formatTanggal(jumat, { panjang: true })}`
      : `${formatTanggal(data.senin, { tanpaTahun: true })}–${formatTanggal(jumat)}`;
  const guruKelas = (id: string | null) => data.kelas.find((k) => k.id === id)?.guru.map((g) => g.name).join(", ") ?? "";
  const namaKelas = (id: string | null) => data.kelas.find((k) => k.id === id)?.name ?? "";

  const agenda = (
    <div className="flex flex-col gap-5">
      {hari.map((h, i) => {
        const tgl = tanggalKe(data.senin, i);
        const slot = tampil.filter((s) => s.dayOfWeek === h.dow).sort((a, b) => a.startTime.localeCompare(b.startTime));
        return (
          <Panel key={h.dow}>
            <header className="flex items-baseline justify-between gap-3 border-b border-foreground px-[18px] py-3">
              <h3 className="font-display text-[17px] font-bold tracking-tight">
                <span className={cn(tgl === data.hariIni && "hl")}>{formatTanggal(tgl, { hari: true, tanpaTahun: true })}</span>
              </h3>
              {bisaUbah && (
                <Button variant="txt" size="sm" onClick={() => tambah({ dayOfWeek: h.dow })}>
                  <Plus aria-hidden />
                  Sesi
                </Button>
              )}
            </header>
            {slot.length === 0 ? (
              <PanelRow>
                <span className="text-[13px] text-muted-foreground">Tidak ada sesi</span>
              </PanelRow>
            ) : (
              slot.map((s) => (
                <PanelRow
                  key={s.id}
                  className={cn(bisaUbah && "cursor-pointer hover:bg-muted")}
                  onClick={() => buka(s)}
                  role={bisaUbah ? "button" : undefined}
                  tabIndex={bisaUbah ? 0 : undefined}
                  onKeyDown={(e) => e.key === "Enter" && buka(s)}
                >
                  <span className="tabular w-[92px] shrink-0 text-[13px]">{formatRentangJam(s.startTime, jamSelesai(s.startTime, s.durationMinutes))}</span>
                  <RowText
                    title={s.title}
                    sub={[s.type !== "class" ? LABEL_JENIS_JADWAL[s.type] : null, guruKelas(s.classId), s.location].filter(Boolean).join(" · ") || undefined}
                  />
                  <ClassChip name={namaKelas(s.classId)} id={s.classId} className="max-[560px]:hidden" />
                </PanelRow>
              ))
            )}
          </Panel>
        );
      })}
    </div>
  );

  const grid = (
    <div className="overflow-x-auto rounded border border-border bg-card">
      <div className="grid min-w-[720px] text-[13px]" style={{ gridTemplateColumns: `64px repeat(${hari.length}, minmax(0, 1fr))` }}>
        <div className="border-b border-foreground" />
        {hari.map((h, i) => {
          const tgl = tanggalKe(data.senin, i);
          return (
            <div key={h.dow} className={cn("border-b border-foreground p-2.5 text-sm font-semibold", tgl === data.hariIni && "bg-highlight")}>
              {h.pendek}
              <small className="tabular block text-xs font-normal text-muted-foreground">{formatTanggal(tgl, { tanpaTahun: true })}</small>
            </div>
          );
        })}
        {/* Kolom jam */}
        <div>
          {jam.map((m) => (
            <div key={m} className="tabular h-[60px] border-t border-border-subtle px-2 py-1.5 text-xs text-muted-foreground">
              {formatJam(`${String(m / 60).padStart(2, "0")}:00`)}
            </div>
          ))}
        </div>
        {hari.map((h) => {
          const slotHari = tampil.filter((s) => s.dayOfWeek === h.dow);
          const lajur = aturLajur(slotHari);
          return (
          <div key={h.dow} className="relative border-l border-border-subtle" style={{ height: jam.length * 60 }}>
            {jam.map((m) => (
              <div key={m} className="h-[60px] border-t border-border-subtle" />
            ))}
            {slotHari.map((s) => {
                const { lajur: l, total } = lajur.get(s.id) ?? { lajur: 0, total: 1 };
                const top = (menitDari(s.startTime) - awalMenit) * PX_PER_MENIT + 3;
                const tinggi = Math.max(s.durationMinutes * PX_PER_MENIT - 6, 24);
                const guru = guruKelas(s.classId);
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!bisaUbah}
                    onClick={() => buka(s)}
                    title={`${s.title} · ${formatRentangJam(s.startTime, jamSelesai(s.startTime, s.durationMinutes))}${guru ? ` · ${guru}` : ""}`}
                    className={cn(
                      "absolute z-[1] overflow-hidden rounded-input border-l-4 px-2 py-1.5 text-left text-xs leading-tight disabled:cursor-default",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft",
                      kelasEv(s),
                    )}
                    style={{
                      top,
                      height: tinggi,
                      left: `calc(${(l / total) * 100}% + 3px)`,
                      width: `calc(${100 / total}% - 6px)`,
                    }}
                  >
                    <b className="block truncate text-[13px]">{s.title}</b>
                    <span className="block truncate">{s.type === "holiday" ? "Libur" : guru || formatJam(s.startTime)}</span>
                  </button>
                );
              })}
          </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow="KELAS & JADWAL"
        title={judul}
        actions={
          <>
            <div className="flex overflow-hidden rounded border-[1.5px] border-border max-[560px]:hidden" role="group" aria-label="Tampilan">
              {(["minggu", "agenda"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={cn("h-btn px-4 text-sm font-semibold", mode === m ? "bg-foreground text-background" : "bg-card text-foreground-2 hover:text-foreground")}
                >
                  {m === "minggu" ? "Minggu" : "Agenda"}
                </button>
              ))}
            </div>
            {bisaUbah && kelasAktif.length > 0 && (
              <Button onClick={() => tambah()}>
                <Plus aria-hidden />
                Sesi
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Jadwal di layar ini adalah contoh dari desain, bukan data lembaga mana pun. Perubahan dinonaktifkan.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner
            title="Kalender gagal diperbarui"
            description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`}
            onRetry={() => refetch()}
          />
        )}
        {kelasAktif.length === 0 ? (
          <EmptyState
            title="Belum ada kelas aktif"
            description="Sesi di kalender selalu milik sebuah kelas. Buat kelas dulu, lalu kembali ke sini untuk mengatur jamnya."
            action={
              <Button asChild>
                <Link href="/classes">Buka Kelas & Program</Link>
              </Button>
            }
          />
        ) : (
          <Stale stale={isError}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-2">
                <FilterChip active={filterKelas === "semua"} onClick={() => setFilterKelas("semua")}>
                  Semua kelas
                </FilterChip>
                {kelasAktif.map((k) => (
                  <FilterChip key={k.id} active={filterKelas === k.id} onClick={() => setFilterKelas(k.id)}>
                    <span aria-hidden className={cn("h-[7px] w-[7px] rounded-full", KELAS_KRAYON[krayonDari(k.id)].bg)} />
                    {k.name}
                  </FilterChip>
                ))}
              </div>
              {tampil.length === 0 ? (
                <EmptyState
                  compact
                  title="Belum ada sesi"
                  description="Tambahkan jam kelas, misalnya Senin–Jumat 08.00. Sesi berulang setiap minggu dan dipakai untuk jadwal guru serta kehadiran."
                  action={bisaUbah ? <Button onClick={() => tambah(filterKelas !== "semua" ? { classId: filterKelas } : undefined)}>Tambah sesi</Button> : undefined}
                />
              ) : (
                <>
                  <div className={cn(mode === "agenda" ? "hidden" : "max-[560px]:hidden")}>{grid}</div>
                  <div className={cn(mode === "agenda" ? "" : "min-[561px]:hidden")}>{agenda}</div>
                </>
              )}
              {dijeda.length > 0 && (
                <InfoBox>
                  <b>{dijeda.length} sesi dijeda</b> dan tidak tampil di kalender:{" "}
                  {dijeda.map((s, i) => (
                    <span key={s.id}>
                      {i > 0 && ", "}
                      {bisaUbah ? (
                        <button type="button" className="font-semibold text-primary hover:underline" onClick={() => buka(s)}>
                          {s.title} ({HARI_JADWAL.find((h) => h.dow === s.dayOfWeek)?.pendek} {formatJam(s.startTime)})
                        </button>
                      ) : (
                        `${s.title} (${HARI_JADWAL.find((h) => h.dow === s.dayOfWeek)?.pendek} ${formatJam(s.startTime)})`
                      )}
                    </span>
                  ))}
                  .
                </InfoBox>
              )}
              <p className="text-[13px] text-muted-foreground">
                Kalender menampilkan jadwal mingguan yang berulang, jadi setiap minggu sama. Sesi per tanggal, penanda kelas tanpa guru, dan
                libur yang otomatis membatalkan sesi belum tersedia.
              </p>
            </div>
          </Stale>
        )}
      </PageBody>
      {bisaUbah && (
        <SlotDialog
          slot={dialog.slot}
          awal={dialog.awal}
          kelas={kelasAktif.map((k) => ({ id: k.id, name: k.name }))}
          open={dialog.open}
          onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        />
      )}
    </>
  );
}
