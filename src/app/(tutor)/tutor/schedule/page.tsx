import { CalendarDays } from "lucide-react";
import { KELAS_KRAYON, krayonDari } from "@/lib/krayon";
import { cn } from "@/lib/utils";
import { MobileGroupTitle, MobileSubHeader } from "@/components/bunayo";
import { getMyTutorSchedules } from "@/server/actions/tutorDashboard";

export const dynamic = "force-dynamic";

const HARI: Record<number, string> = { 1: "Senin", 2: "Selasa", 3: "Rabu", 4: "Kamis", 5: "Jumat", 6: "Sabtu", 7: "Minggu" };

const LABEL_JENIS: Record<string, string> = {
  class: "Kelas",
  activity: "Kegiatan",
  event: "Acara",
  holiday: "Libur",
};

export default async function TutorSchedulePage() {
  const schedules = await getMyTutorSchedules().catch(() => []);

  const perHari = new Map<number, Awaited<ReturnType<typeof getMyTutorSchedules>>>();
  for (const s of schedules) {
    const d = s.dayOfWeek;
    if (!perHari.has(d)) perHari.set(d, []);
    perHari.get(d)!.push(s);
  }
  const hariTerpakai = [...perHari.keys()].sort((a, b) => a - b);

  return (
    <>
      <MobileSubHeader title="Jadwal mingguan" backHref="/tutor" />

      <div className="flex flex-col gap-4 px-4 pb-4">
        {schedules.length === 0 ? (
          <section className="rise flex items-start gap-3 rounded-sheet bg-card p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-langit-soft text-langit-ink">
              <CalendarDays className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-[15px] font-semibold">Belum ada jadwal</p>
              <p className="text-sm text-foreground-2">
                Jadwal mingguan kelas Anda belum diatur admin. Anak dan kelas tetap terlihat di Hari Ini.
              </p>
            </div>
          </section>
        ) : (
          hariTerpakai.map((d) => (
            <section key={d} className="flex flex-col gap-2">
              <MobileGroupTitle>
                <span>{HARI[d] ?? `Hari ${d}`}</span>
              </MobileGroupTitle>
              <ul className="overflow-hidden rounded-sheet bg-card">
                {perHari.get(d)!.map((s) => {
                  const k = KELAS_KRAYON[krayonDari(s.className || s.id)];
                  return (
                    <li key={s.id} className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0">
                      <span
                        aria-hidden
                        className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-[11px] font-bold tabular field-ink", k.bg)}
                      >
                        {s.startTime}
                      </span>
                      <div className="min-w-0 flex-1">
                        <b className="block text-[15px] font-semibold">{s.title}</b>
                        <small className="block text-[13px] leading-snug text-muted-foreground">
                          {s.className && s.className !== s.title ? `${s.className} · ` : ""}
                          {s.durationMinutes} menit
                          {s.location ? ` · ${s.location}` : ""}
                          {s.type !== "class" && LABEL_JENIS[s.type] ? ` · ${LABEL_JENIS[s.type]}` : ""}
                        </small>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}
