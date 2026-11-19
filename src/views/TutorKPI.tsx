"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, MessageCircle, NotebookPen, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileSubHeader } from "@/components/bunayo";
import { getMyTutorAttendanceHistory } from "@/server/actions/attendance";
import { getTutorDashboardOverview } from "@/server/actions/tutorDashboard";

interface Metrik {
  id: string;
  label: string;
  nilai: number;
  target: number;
  icon: LucideIcon;
  soft: string;
  ink: string;
  detail: string;
}

/** G10 (KPI): skor dari data nyata — absen diri, laporan harian, pesan belum dibaca. */
export default function TutorKPI() {
  const { data: dbHistory = [] } = useQuery({
    queryKey: ["tutor-attendance-history-kpi"],
    queryFn: () => getMyTutorAttendanceHistory(30),
  });
  const { data: overview } = useQuery({
    queryKey: ["tutor-dashboard-overview-kpi"],
    queryFn: getTutorDashboardOverview,
  });

  const totalHari = dbHistory.length;
  const hariHadir = dbHistory.filter((h) => h.status === "hadir").length;
  const tingkatHadir = totalHari > 0 ? Math.round((hariHadir / totalHari) * 100) : 0;

  const siswa = overview?.todayStudents ?? [];
  const laporanSelesai = siswa.filter((s) => !s.needsReport).length;
  const tingkatLaporan =
    siswa.length > 0 ? Math.round((laporanSelesai / siswa.length) * 100) : overview?.pendingReportsCount === 0 ? 100 : 0;

  const belumBaca = overview?.unreadMessagesCount ?? 0;
  const tingkatRespon = belumBaca === 0 ? 100 : Math.max(50, 100 - belumBaca * 10);

  const skor =
    totalHari > 0 || siswa.length > 0
      ? Math.round(tingkatHadir * 0.4 + tingkatLaporan * 0.4 + tingkatRespon * 0.2)
      : 0;

  const periode = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date());

  const metrik: Metrik[] = [
    {
      id: "hadir",
      label: "Kehadiran",
      nilai: tingkatHadir,
      target: 95,
      icon: CalendarCheck,
      soft: "bg-daun-soft",
      ink: "text-daun-ink",
      detail: `${hariHadir} dari ${totalHari} hari tercatat`,
    },
    {
      id: "laporan",
      label: "Kabar harian",
      nilai: tingkatLaporan,
      target: 90,
      icon: NotebookPen,
      soft: "bg-langit-soft",
      ink: "text-langit-ink",
      detail: siswa.length > 0 ? `${laporanSelesai} dari ${siswa.length} anak sudah ada kabar` : "Tidak ada anak aktif hari ini",
    },
    {
      id: "respon",
      label: "Pesan orang tua",
      nilai: tingkatRespon,
      target: 85,
      icon: MessageCircle,
      soft: "bg-anggur-soft",
      ink: "text-anggur-ink",
      detail: `${belumBaca} pesan belum dibaca`,
    },
  ];

  return (
    <>
      <MobileSubHeader title="Kinerja" eyebrow={periode} backHref="/tutor/saya" />

      <div className="flex flex-col gap-4 px-4 pb-4">
        {totalHari === 0 && siswa.length === 0 ? (
          <section className="rise flex items-start gap-3 rounded-sheet bg-card p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-matahari-soft text-matahari-ink">
              <Sparkles className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-[15px] font-semibold">Kinerja belum terbentuk</p>
              <p className="text-sm text-foreground-2">
                Mulai check-in dan kirim kabar harian. Skor di layar ini dihitung dari data nyata, bukan angka karangan.
              </p>
            </div>
          </section>
        ) : (
          <section className="rise field-ink flex flex-col items-center gap-1 rounded-[28px] bg-langit px-5 py-6 text-center">
            <span className="field-sub text-sm font-semibold">Skor bulan ini</span>
            <p className="tabular font-display text-[64px] font-extrabold leading-none tracking-[-0.03em]">{skor}</p>
            <span className="field-sub text-sm">dari 100 · dihitung dari absen, kabar, dan pesan</span>
          </section>
        )}

        <section className="flex flex-col gap-2">
          {metrik.map((m) => {
            const tercapai = m.nilai >= m.target;
            return (
              <div key={m.id} className="rounded-sheet bg-card p-4">
                <div className="flex items-center gap-3">
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", m.soft, m.ink)}>
                    <m.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <b className="min-w-0 flex-1 truncate text-[15px] font-semibold">{m.label}</b>
                  <b className={cn("tabular text-[15px]", tercapai ? "text-daun-ink" : "text-foreground")}>{m.nilai}%</b>
                </div>
                <div aria-hidden className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full transition-[width] duration-500", tercapai ? "bg-daun" : "bg-matahari")} style={{ width: `${m.nilai}%` }} />
                </div>
                <p className="mt-1.5 text-[13px] text-muted-foreground">
                  {m.detail} · target {m.target}%
                </p>
              </div>
            );
          })}
        </section>

        <p className="px-1 text-[13px] leading-relaxed text-muted-foreground">
          Skor dihitung langsung dari presensi harian, kabar harian sebelum pukul 16.00 WIB, dan pesan orang tua yang terbaca.
        </p>
      </div>
    </>
  );
}
