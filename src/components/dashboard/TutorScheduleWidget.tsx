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

export function TutorScheduleWidget({ schedules }: TutorScheduleWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Jadwal Bulan Ini
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {schedules.filter(s => s.status !== "completed").length} sesi
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {schedules.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada jadwal bulan ini</p>
          </div>
        ) : (
          <>
            {schedules.slice(0, 4).map((schedule) => (
              <div
                key={schedule.id}
                className={`p-2 sm:p-3 rounded-xl border transition-colors ${
                  schedule.status === "today" 
                    ? "bg-green-50 border-green-200" 
                    : "bg-muted/50 border-transparent hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-center min-w-[40px]">
                      <p className="text-xs text-muted-foreground">{schedule.dayName}</p>
                      <p className="text-lg font-bold text-foreground">{schedule.date}</p>
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
                    className={`text-xs text-white ${statusConfig[schedule.status].className}`}
                  >
                    {statusConfig[schedule.status].label}
                  </Badge>
                </div>
              </div>
            ))}
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
