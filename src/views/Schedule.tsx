import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
} from "lucide-react";

interface ScheduleEvent {
  id: string;
  title: string;
  className: string;
  time: string;
  duration: string;
  location?: string;
  type: "class" | "activity" | "event" | "holiday";
  color: string;
}

const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const fullWeekDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const scheduleData: Record<string, ScheduleEvent[]> = {
  "Sen": [
    { id: "1", title: "Circle Time", className: "Semua Kelas", time: "08:00", duration: "30 menit", type: "activity", color: "bg-primary/10 text-primary border-primary/30" },
    { id: "2", title: "Belajar Alfabet", className: "Kelas Bunga Matahari", time: "09:00", duration: "45 menit", location: "Ruang Kelas 1", type: "class", color: "bg-success/10 text-success border-success/30" },
    { id: "3", title: "Makan Siang", className: "Semua Kelas", time: "11:30", duration: "45 menit", type: "activity", color: "bg-highlight/10 text-highlight-foreground border-highlight/30" },
  ],
  "Sel": [
    { id: "4", title: "Senam Pagi", className: "Semua Kelas", time: "08:00", duration: "30 menit", location: "Lapangan", type: "activity", color: "bg-info/10 text-info border-info/30" },
    { id: "5", title: "Belajar Angka", className: "Kelas Pelangi", time: "09:00", duration: "45 menit", location: "Ruang Kelas 2", type: "class", color: "bg-success/10 text-success border-success/30" },
  ],
  "Rab": [
    { id: "6", title: "Kelas Seni", className: "Kelas Bintang", time: "09:00", duration: "60 menit", location: "Ruang Kreativitas", type: "class", color: "bg-primary/10 text-primary border-primary/30" },
    { id: "7", title: "Storytelling", className: "Semua Kelas", time: "14:00", duration: "30 menit", location: "Perpustakaan", type: "activity", color: "bg-secondary text-secondary-foreground border-secondary" },
  ],
  "Kam": [
    { id: "8", title: "Belajar Bahasa Inggris", className: "Kelas Bunga Matahari", time: "09:00", duration: "45 menit", type: "class", color: "bg-success/10 text-success border-success/30" },
  ],
  "Jum": [
    { id: "9", title: "Fun Friday", className: "Semua Kelas", time: "09:00", duration: "2 jam", location: "Playground", type: "event", color: "bg-highlight/10 text-highlight-foreground border-highlight/30" },
  ],
  "Sab": [],
};

export default function Schedule() {
  const [currentWeek, setCurrentWeek] = useState("9-14 Desember 2024");

  return (
    <DashboardLayout title="Jadwal Kelas" subtitle="Kelola jadwal kegiatan harian dan mingguan">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{currentWeek}</span>
          </div>
          <Button variant="outline" size="icon-sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Hari Ini
          </Button>
          <Button variant="hero" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Tambah Kegiatan</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        </div>
      </div>

      {/* Weekly Schedule - Desktop */}
      <div className="hidden lg:grid grid-cols-6 gap-4">
        {weekDays.map((day, index) => (
          <Card key={day} className={day === "Sen" ? "ring-2 ring-primary" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-center">
                <span className="block text-muted-foreground">{fullWeekDays[index]}</span>
                <span className="text-lg">{9 + index}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {scheduleData[day]?.length > 0 ? (
                scheduleData[day].map((event) => (
                  <div
                    key={event.id}
                    className={`p-2 rounded-lg border ${event.color} cursor-pointer hover:shadow-md transition-shadow`}
                  >
                    <p className="font-medium text-xs">{event.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                    <p className="text-xs opacity-80 mt-1">{event.className}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  Tidak ada kegiatan
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Schedule - Mobile */}
      <div className="lg:hidden space-y-4">
        {weekDays.map((day, index) => (
          <Card key={day}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {fullWeekDays[index]}, {9 + index} Des
                </CardTitle>
                {day === "Sen" && <Badge variant="default">Hari Ini</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {scheduleData[day]?.length > 0 ? (
                <div className="space-y-3">
                  {scheduleData[day].map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border ${event.color}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{event.title}</p>
                          <p className="text-xs opacity-80">{event.className}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs opacity-80">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                          <span className="text-xs opacity-70">{event.duration}</span>
                        </div>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Tidak ada kegiatan
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
