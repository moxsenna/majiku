import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";

interface ScheduleItem {
  id: string;
  date: string;
  dayName: string;
  className: string;
  time: string;
  location: string;
  studentsCount: number;
  status: "upcoming" | "today" | "completed";
}

interface TutorScheduleWidgetProps {
  schedules: ScheduleItem[];
}

const statusConfig = {
  upcoming: { label: "Akan Datang", className: "bg-blue-500" },
  today: { label: "Hari Ini", className: "bg-green-500" },
  completed: { label: "Selesai", className: "bg-muted-foreground" },
};

const DAY_LABELS: Record<number, string> = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
  7: "Minggu",
};

function getScheduleDay(dayText: string) {
  const match = (dayText || "").match(/\d+/);
  if (!match) return { dayNumber: null, label: dayText || "Jadwal" };
  const num = parseInt(match[0], 10);
  return {
    dayNumber: num,
    label: DAY_LABELS[num] || `Hari ${num}`,
  };
}

export function TutorScheduleWidget({ schedules }: TutorScheduleWidgetProps) {
  // Hitung hari saat ini dalam zona WIB (1=Senin..7=Minggu)
  const now = new Date();
  const wibShort = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
  }).format(now);
  const wibDayMap: Record<string, number> = {
    Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7
  };
  const currentWibDayNumber = wibDayMap[wibShort] ?? 1;

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Jadwal Kelas
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {schedules.length} sesi
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {schedules.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada jadwal kelas</p>
          </div>
        ) : (
          <>
            {schedules.slice(0, 4).map((schedule) => {
              const { dayNumber, label: realDayName } = getScheduleDay(schedule.dayName || schedule.date);
              const isToday = dayNumber !== null && dayNumber === currentWibDayNumber;
              const statusKey: "today" | "upcoming" = isToday ? "today" : "upcoming";

              return (
                <div
                  key={schedule.id}
                  className={`p-2 sm:p-3 rounded-xl border transition-colors ${
                    isToday
                      ? "bg-green-50/70 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                      : "bg-muted/50 border-transparent hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-center min-w-[54px]">
                        <p className="text-xs font-semibold text-primary">{realDayName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {dayNumber ? `Hari ke-${dayNumber}` : schedule.date}
                        </p>
                      </div>
                      <div className="h-10 w-px bg-border" />
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{schedule.className}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{schedule.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{schedule.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs text-white ${statusConfig[statusKey].className}`}
                    >
                      {statusConfig[statusKey].label}
                    </Badge>
                  </div>
                </div>
              );
            })}
            <Link href="/tutor/schedule">
              <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-9">
                Lihat Jadwal Lengkap
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
