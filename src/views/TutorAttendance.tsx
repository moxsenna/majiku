"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatJam, formatTanggal } from "@/lib/format";
import { LeaveRequestDialog, type LeaveRequestData } from "@/components/leave/LeaveRequestDialog";
import { MobileGroupTitle, MobileSubHeader } from "@/components/bunayo";
import { recordTutorAttendance, getMyTutorAttendanceToday, getMyTutorAttendanceHistory } from "@/server/actions/attendance";
import { submitLeaveRequest, getMyLeaveRequests } from "@/server/actions/leave";
import { timeInWib } from "@/lib/datetime";

const LABEL_IZIN: Record<string, string> = {
  sick: "Sakit",
  personal: "Keperluan pribadi",
  annual: "Cuti tahunan",
  emergency: "Darurat",
};

const STATUS_RIWAYAT: Record<string, { label: string; cls: string }> = {
  hadir: { label: "Hadir", cls: "text-daun-ink" },
  terlambat: { label: "Terlambat", cls: "text-matahari-ink" },
  izin: { label: "Izin", cls: "text-langit-ink" },
  sakit: { label: "Sakit", cls: "text-langit-ink" },
  alpa: { label: "Alpa", cls: "text-destructive" },
  tidak_hadir: { label: "Tidak hadir", cls: "text-destructive" },
};

/** G2/G3: absen diri guru — satu bidang, satu tombol. */
export default function TutorAttendance() {
  const queryClient = useQueryClient();
  const [historyLimit, setHistoryLimit] = useState(10);
  const [currentTime, setCurrentTime] = useState(() => timeInWib());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(timeInWib()), 15000);
    return () => clearInterval(timer);
  }, []);

  const { data: todayAttendance, isLoading } = useQuery({
    queryKey: ["tutor-attendance-today"],
    queryFn: getMyTutorAttendanceToday,
  });

  const { data: dbHistory = [] } = useQuery({
    queryKey: ["tutor-attendance-history", historyLimit],
    queryFn: () => getMyTutorAttendanceHistory(historyLimit),
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ["tutor-leave-requests"],
    queryFn: getMyLeaveRequests,
  });

  const masuk = todayAttendance?.checkInTime ?? null;
  const pulang = todayAttendance?.checkOutTime ?? null;

  const checkMutation = useMutation({
    mutationFn: (input: { type: "check-in" | "check-out"; time: string; method: string }) => recordTutorAttendance(input),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tutor-attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["tutor-attendance-history"] });
      toast.success(res.type === "check-in" ? `Check-in tercatat ${res.time} WIB` : `Check-out tercatat ${res.time} WIB`);
    },
    onError: (err: any) => toast.error(err?.message || "Gagal mencatat absensi"),
  });

  const leaveMutation = useMutation({
    mutationFn: (data: LeaveRequestData) =>
      submitLeaveRequest({
        leaveType: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        replacementTutorId: data.substituteId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutor-leave-requests"] });
      toast.success("Pengajuan izin terkirim", { description: "Menunggu peninjauan admin lembaga." });
    },
    onError: (err: any) => toast.error(err?.message || "Gagal mengirim pengajuan izin"),
  });

  // Satu baris per tanggal: check-in/check-out bisa menghasilkan dua record untuk hari yang sama.
  const riwayatPerHari = Array.from(
    dbHistory.reduce((acc, r) => {
      const tgl = String(r.date);
      const cur = acc.get(tgl);
      if (!cur) {
        acc.set(tgl, { date: tgl, status: r.status, checkInTime: r.checkInTime, checkOutTime: r.checkOutTime });
      } else {
        cur.checkInTime = cur.checkInTime || r.checkInTime;
        cur.checkOutTime = cur.checkOutTime || r.checkOutTime;
        if (r.status === "hadir") cur.status = "hadir";
      }
      return acc;
    }, new Map<string, { date: string; status: string; checkInTime: string | null; checkOutTime: string | null }>()),
  ).map(([, v]) => v);

  const hariHadir = riwayatPerHari.filter((r) => r.status === "hadir").length;
  const total = riwayatPerHari.length;
  const persen = total > 0 ? Math.round((hariHadir / total) * 100) : 0;

  return (
    <>
      <MobileSubHeader title="Absen saya" eyebrow={formatTanggal(new Date(), { hari: true, panjang: true })} backHref="/tutor" />

      <div className="flex flex-col gap-4 px-4 pb-4">
        {/* Jam + aksi */}
        <section className="rise field-ink flex flex-col gap-4 rounded-[28px] bg-daun p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="field-sub text-sm font-semibold">Waktu sekarang · WIB</span>
            <span className="tabular rounded-full bg-[hsl(0_0%_100%/.55)] px-3 py-1 text-[15px] font-bold">{currentTime}</span>
          </div>
          {isLoading ? (
            <span className="sk block h-10 w-56" />
          ) : pulang ? (
            <p className="flex items-center gap-2 text-lg font-semibold">
              <LogOut className="h-5 w-5" aria-hidden /> Pulang <b className="tabular">{formatJam(pulang)}</b>
              <span className="field-sub text-sm">· masuk {formatJam(masuk)}</span>
            </p>
          ) : masuk ? (
            <p className="flex items-center gap-2 text-lg font-semibold">
              <LogIn className="h-5 w-5" aria-hidden /> Sudah masuk <b className="tabular">{formatJam(masuk)}</b>
            </p>
          ) : (
            <p className="text-[15px]">Belum check-in hari ini. Catat sekarang agar kehadiran Anda terhitung.</p>
          )}
          {!pulang && (
            <button
              type="button"
              onClick={() => checkMutation.mutate({ type: masuk ? "check-out" : "check-in", time: currentTime, method: "manual" })}
              disabled={checkMutation.isPending}
              className={cn(
                "press grid h-btn-lg place-items-center rounded-full text-base font-semibold disabled:opacity-60",
                masuk ? "bg-[hsl(0_0%_100%/.65)] text-[hsl(249_26%_14%)]" : "bg-[hsl(249_26%_14%)] text-[hsl(40_60%_96%)]",
              )}
            >
              {checkMutation.isPending ? "Mencatat…" : masuk ? "Check-out" : "Check-in sekarang"}
            </button>
          )}
        </section>

        {/* Rekap riwayat */}
        {total > 0 && (
          <section className="rounded-sheet bg-card p-4">
            <div className="flex items-baseline justify-between">
              <b className="tabular font-display text-[26px] font-bold">{persen}%</b>
              <span className="text-[13px] text-muted-foreground">
                {hariHadir} hari hadir dari {total} hari tercatat
              </span>
            </div>
            <div aria-hidden className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-daun transition-[width] duration-500" style={{ width: `${persen}%` }} />
            </div>
          </section>
        )}

        {/* Riwayat */}
        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between px-1">
            <MobileGroupTitle>Riwayat absensi</MobileGroupTitle>
            {dbHistory.length > 0 && (
              <button type="button" onClick={() => setHistoryLimit((p) => (p === 10 ? 50 : 10))} className="text-sm font-semibold text-primary">
                {historyLimit === 10 ? "Lihat semua" : "Perkecil"}
              </button>
            )}
          </div>
          {dbHistory.length === 0 ? (
            <p className="rounded-sheet bg-card p-5 text-sm text-foreground-2">
              Riwayat muncul di sini setelah Anda check-in pertama kali.
            </p>
          ) : (
            <ul className="overflow-hidden rounded-sheet bg-card">
              {riwayatPerHari.map((r, i) => {
                const st = STATUS_RIWAYAT[r.status] ?? STATUS_RIWAYAT.izin;
                return (
                  <li key={r.date || i} className="flex min-h-14 items-center gap-3 border-b border-border-subtle px-4 py-2.5 last:border-b-0">
                    <span className="tabular w-10 shrink-0 text-[13px] font-semibold">{String(r.date).slice(8, 10)}/{String(r.date).slice(5, 7)}</span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-[15px]">{st.label}</b>
                      {r.status === "hadir" || r.status === "terlambat" ? (
                        <small className="tabular block text-[13px] text-muted-foreground">
                          {r.checkInTime ? formatJam(r.checkInTime) : "—"} – {r.checkOutTime ? formatJam(r.checkOutTime) : "belum pulang"}
                        </small>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Izin */}
        <section className="flex flex-col gap-2">
          <MobileGroupTitle>Izin & cuti</MobileGroupTitle>
          <div className="overflow-hidden rounded-sheet bg-card">
            <LeaveRequestDialog onSubmit={(d) => leaveMutation.mutate(d)}>
              <button
                type="button"
                disabled={leaveMutation.isPending}
                className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted disabled:opacity-60"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-matahari-soft text-matahari-ink">
                  <CalendarPlus className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span className="flex-1 text-[15px] font-semibold">
                  {leaveMutation.isPending ? "Mengirim pengajuan…" : "Ajukan izin / cuti"}
                </span>
              </button>
            </LeaveRequestDialog>
            {leaveRequests.length > 0 && (
              <ul className="border-t border-border-subtle">
                {leaveRequests.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex min-h-12 items-center gap-3 border-b border-border-subtle px-4 py-2.5 last:border-b-0">
                    <span className="min-w-0 flex-1">
                      <b className="block text-sm font-semibold">{LABEL_IZIN[r.leaveType] || r.leaveType}</b>
                      <small className="tabular block text-[13px] text-muted-foreground">
                        {r.startDate} – {r.endDate}
                      </small>
                    </span>
                    <small
                      className={cn(
                        "shrink-0 text-[13px] font-semibold",
                        r.status === "approved" ? "text-daun-ink" : r.status === "rejected" ? "text-destructive" : "text-matahari-ink",
                      )}
                    >
                      {r.status === "approved" ? "Disetujui" : r.status === "rejected" ? "Ditolak" : "Menunggu"}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="px-1 text-[13px] text-muted-foreground">Saat izin disetujui, pesan orang tua otomatis dialihkan ke pengganti/admin.</p>
        </section>
      </div>
    </>
  );

}
