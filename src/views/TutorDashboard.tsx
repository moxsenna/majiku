"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ClipboardList, Eye, MapPin, MessageCircle, NotebookPen, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatJam, formatTanggal, inisial } from "@/lib/format";
import { KELAS_KRAYON, krayonDari } from "@/lib/krayon";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AvatarStack, KidAvatar, MobileGroupTitle } from "@/components/bunayo";
import {
  getTutorDashboardOverview,
  type TutorDashboardData,
  type TutorScheduleItem,
  type TutorStudentItem,
} from "@/server/actions/tutorDashboard";
import { getMyTutorAttendanceToday, recordTutorAttendance } from "@/server/actions/attendance";

interface TutorDashboardProps {
  initialData?: TutorDashboardData;
}

function salam(): string {
  const jam = Number(formatJam(new Date()).slice(0, 2));
  if (jam < 11) return "Pagi";
  if (jam < 15) return "Siang";
  if (jam < 18) return "Sore";
  return "Malam";
}

/** GV1 Hari Ini: absen diri, kelas yang diampu (bidang warna kelas), lalu tugas. */
export default function TutorDashboard({ initialData }: TutorDashboardProps) {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["tutor-dashboard-overview"],
    queryFn: getTutorDashboardOverview,
    initialData,
  });

  const isDemo = data?.isDemo ?? false;
  const isAssigned = data?.isAssigned ?? isDemo;
  const nama = (data?.tutorName || user?.name || "").trim();
  const siswa = data?.todayStudents ?? [];

  // Kelompokkan anak per kelas: satu bidang warna per kelas, warna = ID/nama kelas (sama di semua layar).
  const kelas = Object.values(
    siswa.reduce<Record<string, { nama: string; anak: TutorStudentItem[] }>>((acc, s) => {
      (acc[s.class] ??= { nama: s.class, anak: [] }).anak.push(s);
      return acc;
    }, {}),
  );
  const perluLaporan = siswa.filter((s) => s.needsReport);
  const pesan = data?.unreadMessagesCount ?? 0;

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-2">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-sm font-medium text-muted-foreground" suppressHydrationWarning>
            {formatTanggal(new Date(), { hari: true, panjang: true }).replace(/ \d{4}$/, "")}
          </span>
          <h1 className="truncate font-display text-[26px] font-bold leading-[1.1] tracking-[-0.025em]" suppressHydrationWarning>
            {salam()}, {nama.split(/\s+/).slice(0, 2).join(" ") || "Guru"}
          </h1>
        </div>
        {nama && (
          <Link href="/tutor/saya" aria-label="Saya" className="press">
            <KidAvatar name={nama} krayon="matahari" size="md" />
          </Link>
        )}
      </header>

      {isDemo && (
        <div className="flex items-center justify-between rounded-sheet bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
          <span className="flex items-center gap-2 font-medium">
            <Eye className="h-4 w-4" aria-hidden />
            <span>Mode Demo Bunayo: Eksplorasi Interaktif</span>
          </span>
          <span className="text-[11px] opacity-80">Simulasi Aman</span>
        </div>
      )}

      <AbsenSaya />

      {!isAssigned ? (
        <section className="rise field-ink flex flex-col gap-2 rounded-[28px] bg-matahari p-5">
          <h2 className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.025em]">Belum ada kelas</h2>
          <p className="field-sub text-[15px] leading-relaxed">
            Akun Anda sudah terdaftar sebagai guru, tetapi admin lembaga belum menugaskan kelas. Minta admin menautkan Anda ke kelas agar
            anak-anak muncul di sini.
          </p>
        </section>
      ) : kelas.length === 0 ? (
        <section className="rounded-sheet bg-card p-5">
          <p className="text-[15px] font-semibold">Kelas Anda belum punya anak terdaftar</p>
          <p className="mt-1 text-sm text-foreground-2">Anak yang didaftarkan admin ke kelas Anda muncul di sini.</p>
        </section>
      ) : (
        kelas.map((k, i) => (
          <KartuKelas key={k.nama} nama={k.nama} anak={k.anak} utama={i === 0} jadwal={data?.schedules.find((j) => j.className === k.nama)} />
        ))
      )}

      <section className="rise rise-3 flex flex-col gap-2" aria-labelledby="tugas-judul">
        <h2 id="tugas-judul" className="px-1 font-display text-lg font-bold tracking-tight">
          Tugas hari ini
        </h2>
        <ul className="overflow-hidden rounded-sheet bg-card">
          {perluLaporan.length > 0 && (
            <Tugas
              href="/tutor/progress"
              icon={NotebookPen}
              krayon="langit"
              title={`Laporan harian ${perluLaporan.length} anak`}
              sub={perluLaporan.slice(0, 3).map((s) => s.name.split(/\s+/)[0]).join(", ") + (perluLaporan.length > 3 ? ` +${perluLaporan.length - 3}` : "")}
            />
          )}
          {pesan > 0 && (
            <Tugas href="/tutor/chat" icon={MessageCircle} krayon="tomat" title={`${pesan} pesan orang tua`} sub="Belum dibaca" />
          )}
          <Tugas href="/tutor/trials" icon={ClipboardList} krayon="anggur" title="Observasi trial" sub="Anak trial yang perlu dinilai" />
        </ul>
        {perluLaporan.length === 0 && siswa.length > 0 && (
          <p className="px-1 text-sm text-foreground-2">Semua laporan harian sudah terkirim. Terima kasih!</p>
        )}
      </section>
    </div>
  );
}

/* ---------------- Absen diri (check-in / check-out) ---------------- */

function AbsenSaya({ disabled }: { disabled?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: absen, isLoading } = useQuery({
    queryKey: ["tutor-absen-hari-ini"],
    queryFn: getMyTutorAttendanceToday,
    enabled: !disabled,
  });
  const catat = useMutation({
    mutationFn: (type: "check-in" | "check-out") => recordTutorAttendance({ type, method: "manual" }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["tutor-absen-hari-ini"] });
      toast({ title: r.type === "check-in" ? `Check-in ${formatJam(r.time)}` : `Check-out ${formatJam(r.time)}` });
    },
    onError: (err: any) =>
      toast({
        title: "Mode Simulasi Demo",
        description: err?.message || "Perubahan data simulasi dinonaktifkan untuk menjaga integritas demo.",
      }),
  });

  const masuk = absen?.checkInTime;
  const pulang = absen?.checkOutTime;

  return (
    <section className="rise flex min-h-[60px] items-center gap-3 rounded-full bg-card py-2 pl-4 pr-2 shadow-soft">
      <MapPin className={cn("h-5 w-5 shrink-0", masuk ? "text-success" : "text-muted-foreground")} aria-hidden />
      <span className="min-w-0 flex-1 text-[15px]">
        {isLoading && !disabled ? (
          <span className="sk block h-4 w-40" />
        ) : pulang ? (
          <>
            <b className="tabular text-success">Pulang {formatJam(pulang)}</b>
            <span className="text-muted-foreground"> · masuk {formatJam(masuk)}</span>
          </>
        ) : masuk ? (
          <b className="tabular text-success">Check-in {formatJam(masuk)}</b>
        ) : (
          <b>Belum check-in</b>
        )}
      </span>
      {!pulang && (
        <button
          type="button"
          disabled={disabled || isLoading || catat.isPending}
          onClick={() => catat.mutate(masuk ? "check-out" : "check-in")}
          className={cn(
            "press h-11 shrink-0 rounded-full px-4 text-[15px] font-semibold disabled:opacity-50",
            masuk ? "bg-muted text-foreground" : "bg-foreground text-background",
          )}
        >
          {catat.isPending ? "Mencatat…" : masuk ? "Check-out" : "Check-in"}
        </button>
      )}
    </section>
  );
}

/* ---------------- Kartu kelas: bidang warna kelas ---------------- */

function KartuKelas({
  nama,
  anak,
  utama,
  jadwal,
}: {
  nama: string;
  anak: TutorStudentItem[];
  utama: boolean;
  jadwal?: TutorScheduleItem;
}) {
  // time dari server: "08:00 (60m)"
  const jam = jadwal?.time.match(/^(\d{1,2}[:.]\d{2})/)?.[1];
  const k = KELAS_KRAYON[krayonDari(nama)];
  const hadir = anak.filter((a) => a.status === "hadir");
  const izin = anak.filter((a) => a.status === "izin");
  const belumLapor = anak.filter((a) => a.needsReport).length;

  if (!utama) {
    return (
      <Link href="/tutor/schedule" className="press flex items-center gap-3 rounded-sheet bg-card p-4">
        <span aria-hidden className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-[15px] font-bold field-ink", k.bg)}>
          {inisial(nama)}
        </span>
        <span className="min-w-0 flex-1">
          <b className="block truncate font-display text-lg font-bold">{nama}</b>
          <span className="tabular block text-[13px] text-muted-foreground">
            {hadir.length} dari {anak.length} sudah tiba
          </span>
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden />
      </Link>
    );
  }

  return (
    <section className={cn("rise rise-2 field-ink flex flex-col gap-4 rounded-[28px] p-5", k.bg)} aria-label={`Kelas ${nama}`}>
      <div>
        <h2 className="font-display text-[28px] font-extrabold leading-[1.05] tracking-[-0.03em] [text-wrap:balance]">{nama}</h2>
        {jadwal && (
          <span className="field-sub tabular mt-1 block text-sm">
            {jam ? `${formatJam(jam)} · ` : ""}
            {jadwal.location}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {hadir.length > 0 && <AvatarStack people={hadir.map((a) => ({ id: a.id, name: a.name, photoUrl: a.avatar }))} size="sm" />}
        <span className="text-[15px]">
          <b className="tabular">
            {hadir.length} dari {anak.length}
          </b>{" "}
          sudah tiba{izin.length > 0 && <span className="field-sub"> · {izin.length} izin</span>}
        </span>
      </div>
      {belumLapor > 0 && (
        <p className="flex items-start gap-2.5 rounded-[16px] bg-[hsl(0_0%_100%/.5)] px-3.5 py-3 text-[15px]">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <span>
            <b>{belumLapor} anak</b> belum ada laporan harian
          </span>
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/tutor/attendance"
          className="press grid h-btn-lg place-items-center rounded-full bg-[hsl(249_26%_14%)] text-base font-semibold text-[hsl(40_60%_96%)]"
        >
          Absen anak
        </Link>
        <Link href="/tutor/progress" className="press grid h-btn-lg place-items-center rounded-full bg-[hsl(0_0%_100%/.6)] text-base font-semibold">
          Kirim kabar
        </Link>
      </div>
    </section>
  );
}

function Tugas({
  href,
  icon: Icon,
  krayon,
  title,
  sub,
}: {
  href: string;
  icon: LucideIcon;
  krayon: keyof typeof KELAS_KRAYON;
  title: string;
  sub?: string;
}) {
  const k = KELAS_KRAYON[krayon];
  return (
    <li className="border-b border-border-subtle last:border-b-0">
      <Link href={href} className="flex min-h-[64px] items-center gap-3 px-4 py-3 hover:bg-muted">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-[10px]", k.soft, k.ink)}>
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block truncate text-base font-semibold">{title}</b>
          {sub && <span className="block truncate text-[13px] text-muted-foreground">{sub}</span>}
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
}
