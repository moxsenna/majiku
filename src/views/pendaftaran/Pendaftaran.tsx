"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ClassChip,
  EmptyState,
  ErrorBanner,
  FilterChip,
  InfoBox,
  PageBody,
  PageHeader,
  Panel,
  PanelRow,
  PanelRowsSkeleton,
  RowText,
  Stale,
  StatCard,
  StatRow,
  StatRowSkeleton,
  StatusDot,
} from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { formatJam, formatPeriode, formatTanggal, formatUmur } from "@/lib/format";
import { waLink } from "@/lib/keuangan";
import { STATUS_DAFTAR_TUNGGU, statusTrial } from "@/lib/status";
import { cn } from "@/lib/utils";
import { admitTrial } from "@/server/actions/trial";
import { createWaitingListEntry, promoteWaitingListToStudent, updateWaitingListStatus } from "@/server/actions/waitingList";
import { getPendaftaran, type PendaftaranData, type TahapTrial, type TrialItem, type TungguItem } from "@/server/actions/pendaftaran";
import { DetailTrial } from "./DetailTrial";
import { JadwalTrialDialog } from "./JadwalTrialDialog";

/**
 * A4 papan trial per tahap + A5 laci detail. Daftar tunggu dan Tidak lanjut sebagai tab.
 * Disembunyikan (BARU, REDESIGN-BACKLOG A4/A5): sumber calon, alasan tidak lanjut, tahap Hadir otomatis dari check-in,
 * tautan booking per lembaga, catat calon oleh admin, ingatkan guru.
 */

const KOLOM: { tahap: TahapTrial; judul: string }[] = [
  { tahap: "diajukan", judul: "Diajukan" },
  { tahap: "terjadwal", judul: "Terjadwal" },
  { tahap: "observasi", judul: "Perlu observasi" },
  { tahap: "siap", judul: "Siap didaftarkan" },
  { tahap: "siswa", judul: "Jadi siswa" },
];

type Tab = "papan" | "tunggu" | "tidak";

function KartuTrial({
  t,
  penuh,
  bisaUbah,
  onBuka,
  onJadwalkan,
  onDaftarkan,
  onTunggu,
}: {
  t: TrialItem;
  penuh: boolean;
  bisaUbah: boolean;
  onBuka: () => void;
  onJadwalkan: () => void;
  onDaftarkan: () => void;
  onTunggu: () => void;
}) {
  const umur = t.childBirthDate ? ` (${formatUmur(t.childBirthDate)})` : "";
  let sub: string;
  if (t.tahap === "diajukan") sub = [t.parentName, t.createdAt ? formatTanggal(t.createdAt, { tanpaTahun: true }) : null].filter(Boolean).join(" · ");
  else if (t.tahap === "terjadwal" || t.tahap === "observasi")
    sub = t.trialScheduledAt
      ? `${formatTanggal(t.trialScheduledAt, { hari: true, tanpaTahun: true })} · ${formatJam(t.trialScheduledAt)}${t.tutorName ? ` · ${t.tutorName}` : ""}`
      : "—";
  else if (t.tahap === "siswa") sub = `Terdaftar ${t.admittedAt ? formatTanggal(t.admittedAt, { tanpaTahun: true }) : ""}`;
  else sub = t.status === "repeat_trial" ? `Trial ulang disarankan${t.tutorName ? ` · ${t.tutorName}` : ""}` : `Direkomendasikan${t.tutorName ? ` ${t.tutorName}` : ""}`;

  const henti = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onBuka}
      onKeyDown={(e) => e.key === "Enter" && onBuka()}
      className={cn(
        "flex cursor-pointer flex-col gap-1.5 rounded-input border bg-card p-3 text-[13px] hover:shadow-sm",
        t.terlambat ? "border-2 border-destructive" : "border-border",
        t.tahap === "siswa" && "opacity-80",
      )}
    >
      <b className="text-[15px]">
        {t.childName}
        <span className="font-normal text-muted-foreground">{umur}</span>
      </b>
      <span className="text-muted-foreground">{sub}</span>
      {t.className && <ClassChip name={t.className} id={t.classId} className="self-start" />}
      {t.tahap === "diajukan" && penuh && <span className="text-xs font-semibold text-destructive">{t.className} penuh · tawarkan daftar tunggu</span>}
      {t.tahap === "observasi" && (
        <span className={cn("text-xs", t.terlambat ? "font-semibold text-destructive" : "text-muted-foreground")}>
          {t.terlambat ? "Lewat 2 hari tanpa catatan guru" : `Menunggu catatan ${t.tutorName ?? "guru"}`}
        </span>
      )}
      {t.tahap === "siap" && t.status === "recommended" && <span className="text-xs font-semibold text-success">Cocok</span>}
      {bisaUbah && t.tahap === "diajukan" && (
        <span className="mt-1 flex flex-wrap gap-1.5">
          <Button variant="sec" size="sm" onClick={henti(onJadwalkan)}>
            Jadwalkan trial
          </Button>
          {penuh && (
            <Button variant="txt" size="sm" onClick={henti(onTunggu)}>
              Daftar tunggu
            </Button>
          )}
        </span>
      )}
      {bisaUbah && t.tahap === "siap" && t.status === "recommended" && t.recommendation === "suitable" && (
        <Button size="sm" className="mt-1 self-start" onClick={henti(onDaftarkan)}>
          Daftarkan
        </Button>
      )}
    </div>
  );
}

export default function Pendaftaran({ initialData }: { initialData?: PendaftaranData }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: ["pendaftaran"], queryFn: getPendaftaran, initialData });
  const { data, isError, refetch } = query;
  const [tab, setTab] = useState<Tab>("papan");
  const [kelas, setKelas] = useState("semua");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [jadwal, setJadwal] = useState<TrialItem | null>(null);
  const [daftarkan, setDaftarkan] = useState<TrialItem | null>(null);
  const [promosi, setPromosi] = useState<TungguItem | null>(null);

  const segarkan = () => qc.invalidateQueries({ queryKey: ["pendaftaran"] });
  const gagal = (judul: string) => (err: Error) => toast({ title: judul, description: err.message, variant: "destructive" });

  const admit = useMutation({
    mutationFn: (t: TrialItem) => admitTrial(t.id),
    onSuccess: (res, t) => {
      toast({ title: `${t.childName} terdaftar di ${t.className ?? "kelas"}` });
      setDaftarkan(null);
      setDetailId(null);
      segarkan();
      router.push(`/students/${res.studentId}`);
    },
    onError: gagal("Gagal mendaftarkan"),
  });
  const keTunggu = useMutation({
    mutationFn: (t: TrialItem) =>
      createWaitingListEntry({
        studentName: t.childName,
        parentName: t.parentName,
        parentPhone: t.parentPhone,
        parentEmail: t.parentEmail,
        classId: t.classId,
        notes: "Dari pengajuan trial",
      }),
    onSuccess: (_r, t) => {
      toast({ title: `${t.childName} masuk daftar tunggu ${t.className ?? ""}` });
      segarkan();
    },
    onError: gagal("Gagal menambah daftar tunggu"),
  });
  const ubahTunggu = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "notified" | "cancelled" }) => updateWaitingListStatus(id, status),
    onSuccess: (_r, v) => {
      toast({ title: v.status === "notified" ? "Ditandai sudah dikabari" : "Dihapus dari daftar tunggu" });
      segarkan();
    },
    onError: gagal("Gagal memperbarui"),
  });
  const promote = useMutation({
    mutationFn: (w: TungguItem) => promoteWaitingListToStudent(w.id),
    onSuccess: (res, w) => {
      toast({ title: `${w.studentName} terdaftar sebagai siswa` });
      setPromosi(null);
      segarkan();
      router.push(`/students/${res.studentId}`);
    },
    onError: gagal("Gagal mendaftarkan"),
  });

  const judul = "Pendaftaran & Trial";
  if (!data) {
    return (
      <>
        <PageHeader eyebrow="PENDAFTARAN" title={judul} />
        <PageBody>
          {isError ? (
            <ErrorBanner title="Pendaftaran gagal dimuat" description="Tidak ada data yang berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <>
              <StatRowSkeleton />
              <div className="grid gap-4 min-[1001px]:grid-cols-5 min-[561px]:grid-cols-2">
                {KOLOM.map((k) => (
                  <Panel key={k.tahap}>
                    <PanelRowsSkeleton rows={2} />
                  </Panel>
                ))}
              </div>
            </>
          )}
        </PageBody>
      </>
    );
  }

  const bisaUbah = !data.isDemo;
  const cocokKelas = (id: string | null) => kelas === "semua" || id === kelas;
  const trial = data.trial.filter((t) => cocokKelas(t.classId));
  const aktif = trial.filter((t) => t.tahap !== "tidak");
  const tidak = trial.filter((t) => t.tahap === "tidak");
  const tunggu = data.tunggu.filter((w) => cocokKelas(w.classId));
  const kursi = new Map(data.kelas.map((k) => [k.id, k]));
  const penuh = (id: string | null) => {
    const k = id ? kursi.get(id) : undefined;
    return !!k?.capacity && k.terisi >= k.capacity;
  };
  const kelasDipakai = data.kelas.filter((k) => data.trial.some((t) => t.classId === k.id) || data.tunggu.some((w) => w.classId === k.id));
  const detail = data.trial.find((t) => t.id === detailId) ?? null;
  const { statistik: s } = data;
  const periode = formatPeriode(`${data.bulanIni}-01`);

  return (
    <>
      <PageHeader eyebrow={periode.toUpperCase()} title={judul} />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Calon siswa di layar ini adalah contoh dari desain, bukan data lembaga mana pun. Perubahan dinonaktifkan.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner title="Pendaftaran gagal diperbarui" description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`} onRetry={() => refetch()} />
        )}

        {data.trial.length === 0 && data.tunggu.length === 0 ? (
          <EmptyState
            title="Belum ada calon siswa"
            description="Orang tua yang mengajukan trial dari aplikasi Bunayo akan muncul di sini, lengkap dengan data formulir dan catatan observasi guru."
          />
        ) : (
          <Stale stale={isError}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
                  <TabsList className="gap-5">
                    <TabsTrigger value="papan">
                      Papan trial <span className="tabular text-muted-foreground">{aktif.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="tunggu">
                      Daftar tunggu <span className="tabular text-muted-foreground">{tunggu.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="tidak">
                      Tidak lanjut <span className="tabular text-muted-foreground">{tidak.length}</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                {kelasDipakai.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    <FilterChip active={kelas === "semua"} onClick={() => setKelas("semua")}>
                      Semua kelas
                    </FilterChip>
                    {kelasDipakai.map((k) => (
                      <FilterChip key={k.id} active={kelas === k.id} onClick={() => setKelas(k.id)}>
                        {k.name}
                      </FilterChip>
                    ))}
                  </div>
                )}
              </div>

              <StatRow>
                <StatCard label="Trial diajukan" periode={periode} value={s.trialBulanIni} />
                <StatCard
                  label="Jadi siswa"
                  periode={periode}
                  value={s.jadiSiswaBulanIni}
                  suffix={s.trialBulanIni ? ` · ${Math.round((s.jadiSiswaBulanIni / s.trialBulanIni) * 100)}%` : undefined}
                />
                <StatCard
                  label="Rata-rata waktu ke daftar"
                  periode="semua periode"
                  value={s.rataHariDaftar ?? "—"}
                  suffix={s.rataHariDaftar != null ? " hari" : undefined}
                />
                <StatCard label="Daftar tunggu" periode="saat ini" value={data.tunggu.length} onClick={() => setTab("tunggu")} linkLabel="Lihat" />
              </StatRow>

              {tab === "papan" && (
                <div className="grid items-start gap-4 max-[560px]:grid-cols-1 min-[561px]:grid-cols-2 min-[1001px]:grid-cols-5">
                  {KOLOM.map((k) => {
                    const isi = aktif.filter((t) => t.tahap === k.tahap);
                    const tampil = k.tahap === "siswa" ? isi.slice(0, 4) : isi;
                    const merah = k.tahap === "observasi" && isi.some((t) => t.terlambat);
                    return (
                      <section key={k.tahap} className="flex flex-col gap-2.5 rounded bg-muted p-2.5">
                        <h4 className="flex items-baseline justify-between px-1 text-sm font-semibold">
                          {k.judul}
                          <span className={cn("tabular", merah ? "text-destructive" : k.tahap === "siswa" ? "text-success" : "text-muted-foreground")}>
                            {isi.length}
                          </span>
                        </h4>
                        {tampil.length === 0 && <p className="px-1 pb-1 text-[13px] text-muted-foreground">Kosong</p>}
                        {tampil.map((t) => (
                          <KartuTrial
                            key={t.id}
                            t={t}
                            penuh={penuh(t.classId)}
                            bisaUbah={bisaUbah}
                            onBuka={() => setDetailId(t.id)}
                            onJadwalkan={() => setJadwal(t)}
                            onDaftarkan={() => setDaftarkan(t)}
                            onTunggu={() => keTunggu.mutate(t)}
                          />
                        ))}
                        {isi.length > tampil.length && <span className="px-1 text-[13px] text-muted-foreground">+ {isi.length - tampil.length} lainnya</span>}
                      </section>
                    );
                  })}
                </div>
              )}

              {tab === "tunggu" && (
                <Panel>
                  {tunggu.length === 0 ? (
                    <PanelRow>
                      <span className="text-[15px] text-muted-foreground">Tidak ada yang menunggu kursi.</span>
                    </PanelRow>
                  ) : (
                    tunggu.map((w) => {
                      const wa = waLink(w.parentPhone);
                      return (
                        <PanelRow key={w.id} className="flex-wrap">
                          <RowText
                            title={w.studentName}
                            sub={[w.parentName, w.createdAt ? `sejak ${formatTanggal(w.createdAt, { tanpaTahun: true })}` : null, w.notes].filter(Boolean).join(" · ")}
                          />
                          {w.className && <ClassChip name={w.className} id={w.classId} />}
                          <span className="w-[140px] max-[560px]:w-auto">
                            <StatusDot info={STATUS_DAFTAR_TUNGGU[w.status] ?? STATUS_DAFTAR_TUNGGU.waiting} size="sm" />
                          </span>
                          {bisaUbah && (
                            <span className="flex flex-wrap gap-1.5">
                              {wa && (
                                <Button asChild variant="txt" size="sm">
                                  <a href={wa} target="_blank" rel="noreferrer">
                                    WA
                                  </a>
                                </Button>
                              )}
                              {w.status === "waiting" && (
                                <Button variant="txt" size="sm" disabled={ubahTunggu.isPending} onClick={() => ubahTunggu.mutate({ id: w.id, status: "notified" })}>
                                  Sudah dikabari
                                </Button>
                              )}
                              <Button variant="txt" size="sm" disabled={ubahTunggu.isPending} onClick={() => ubahTunggu.mutate({ id: w.id, status: "cancelled" })}>
                                Batalkan
                              </Button>
                              <Button variant="sec" size="sm" onClick={() => setPromosi(w)}>
                                Daftarkan
                              </Button>
                            </span>
                          )}
                        </PanelRow>
                      );
                    })
                  )}
                </Panel>
              )}

              {tab === "tidak" && (
                <Panel>
                  {tidak.length === 0 ? (
                    <PanelRow>
                      <span className="text-[15px] text-muted-foreground">Belum ada calon yang tidak lanjut.</span>
                    </PanelRow>
                  ) : (
                    tidak.map((t) => (
                      <PanelRow
                        key={t.id}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setDetailId(t.id)}
                        onKeyDown={(e) => e.key === "Enter" && setDetailId(t.id)}
                      >
                        <RowText title={t.childName} sub={t.observationNotes ?? "Tanpa catatan"} />
                        {t.className && <ClassChip name={t.className} id={t.classId} className="max-[560px]:hidden" />}
                        <StatusDot info={statusTrial(t.status)} size="sm" />
                      </PanelRow>
                    ))
                  )}
                </Panel>
              )}

              <p className="text-[13px] text-muted-foreground">
                Kartu pindah ke Perlu observasi setelah jadwal trial lewat, dan ke Siap didaftarkan setelah guru menulis catatan dari aplikasinya.
                Sumber calon, alasan tidak lanjut, tautan booking, dan pencatatan calon oleh admin belum tersedia.
              </p>
            </div>
          </Stale>
        )}
      </PageBody>

      <DetailTrial
        trial={detail}
        open={!!detail}
        onOpenChange={(v) => !v && setDetailId(null)}
        bisaUbah={bisaUbah}
        onJadwalkan={(t) => {
          setDetailId(null);
          setJadwal(t);
        }}
        onDaftarkan={(t) => setDaftarkan(t)}
        mendaftarkan={admit.isPending}
      />
      {bisaUbah && (
        <>
          <JadwalTrialDialog trial={jadwal} kelas={data.kelas} guru={data.guru} open={!!jadwal} onOpenChange={(v) => !v && setJadwal(null)} />
          <AlertDialog open={!!daftarkan} onOpenChange={(v) => !v && setDaftarkan(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Daftarkan {daftarkan?.childName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Anak dibuat sebagai siswa aktif di {daftarkan?.className ?? "kelas trial"} dengan data wali dari formulir. Alergi dan catatan kesehatan
                  perlu dilengkapi di profil siswa. Tagihan diterbitkan dari Keuangan.
                  {daftarkan && penuh(daftarkan.classId) && <b className="mt-2 block text-destructive">Kelas ini sudah penuh.</b>}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={admit.isPending}>Batal</AlertDialogCancel>
                <AlertDialogAction
                  disabled={admit.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    if (daftarkan) admit.mutate(daftarkan);
                  }}
                >
                  {admit.isPending ? "Mendaftarkan…" : "Daftarkan"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={!!promosi} onOpenChange={(v) => !v && setPromosi(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Daftarkan {promosi?.studentName} dari daftar tunggu?</AlertDialogTitle>
                <AlertDialogDescription>
                  Anak dibuat sebagai siswa aktif{promosi?.className ? ` di ${promosi.className}` : ""}. Lengkapi tanggal lahir dan data kesehatan di
                  profil siswa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={promote.isPending}>Batal</AlertDialogCancel>
                <AlertDialogAction
                  disabled={promote.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    if (promosi) promote.mutate(promosi);
                  }}
                >
                  {promote.isPending ? "Mendaftarkan…" : "Daftarkan"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
}
