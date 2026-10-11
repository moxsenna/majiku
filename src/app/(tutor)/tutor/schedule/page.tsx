import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listSchedules, type ScheduleRow } from "@/server/actions/schedules";

export const dynamic = "force-dynamic";

const DAY_NAMES: Record<number, string> = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
  7: "Minggu",
};

export default async function TutorSchedulePage() {
  const schedules: ScheduleRow[] = await listSchedules().catch(() => []);

  // Kelompokkan jadwal per hari (1..7)
  const grouped: Record<number, ScheduleRow[]> = {};
  for (let day = 1; day <= 7; day++) {
    grouped[day] = [];
  }

  for (const s of schedules) {
    if (s.dayOfWeek && grouped[s.dayOfWeek]) {
      grouped[s.dayOfWeek].push(s);
    }
  }

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tutor">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Jadwal Kelas & Kegiatan</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Daftar jadwal mengajar dan aktivitas mingguan di daycare
          </p>
        </div>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <h3 className="font-semibold text-foreground text-base">Belum Ada Jadwal</h3>
            <p className="text-sm mt-1 max-w-sm mx-auto">
              Jadwal mingguan pengajar belum dikonfigurasi atau belum tersedia untuk akun ini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dayNumStr, items]) => {
            const dayNum = Number(dayNumStr);
            const dayName = DAY_NAMES[dayNum] || `Hari ${dayNum}`;
            if (items.length === 0) return null;

            return (
              <Card key={dayNum}>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {dayName}
                    </CardTitle>
                    <Badge variant="secondary">{items.length} sesi</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {items.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-3 sm:p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm sm:text-base">{schedule.title}</p>
                          {schedule.className && (
                            <Badge variant="outline" className="text-xs">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {schedule.className}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs capitalize">
                            {schedule.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {schedule.startTime} ({schedule.durationMinutes} menit)
                          </span>
                          {schedule.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {schedule.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
