import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Users, UserCheck, UserX, Clock, Search, ChevronRight,
  GraduationCap
} from "lucide-react";
import { getTodayAttendance, type AttendanceRow } from "@/server/actions/attendance";

interface ClassGroup {
  id: string;
  name: string;
  totalStudents: number;
  present: number;
  late: number;
  absent: number;
  students: {
    id: string;
    name: string;
    status: string;
    checkInTime?: string | null;
  }[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  hadir: { label: "Hadir", color: "bg-success/10 text-success border-success/20" },
  terlambat: { label: "Terlambat", color: "bg-warning/10 text-warning border-warning/20" },
  izin: { label: "Izin", color: "bg-info/10 text-info border-info/20" },
  sakit: { label: "Sakit", color: "bg-destructive/10 text-destructive border-destructive/20" },
  alpha: { label: "Alpha", color: "bg-muted text-muted-foreground border-border" },
};

interface AttendanceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: AttendanceRow[];
}

export function AttendanceDetailModal({ open, onOpenChange, data: initialData }: AttendanceDetailModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: attendanceList = [] } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: () => getTodayAttendance(),
    enabled: open,
    initialData,
  });

  const { totalStats, classesAttendance, absentStudents } = useMemo(() => {
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    const classMap = new Map<string, ClassGroup>();

    for (const item of attendanceList) {
      const clsName = item.className || "Tanpa Kelas";
      let grp = classMap.get(clsName);
      if (!grp) {
        grp = {
          id: clsName,
          name: clsName,
          totalStudents: 0,
          present: 0,
          late: 0,
          absent: 0,
          students: [],
        };
        classMap.set(clsName, grp);
      }

      grp.totalStudents += 1;
      const isLate = item.status === "terlambat";
      const isPresent = item.status === "hadir";
      const isAbsent = !isPresent && !isLate;

      if (isPresent) {
        presentCount += 1;
        grp.present += 1;
      } else if (isLate) {
        lateCount += 1;
        grp.late += 1;
      } else {
        absentCount += 1;
        grp.absent += 1;
      }

      grp.students.push({
        id: item.id,
        name: item.studentName,
        status: item.status,
        checkInTime: item.checkInTime,
      });
    }

    const absents = attendanceList
      .filter((s) => s.status !== "hadir")
      .map((s) => ({
        id: s.id,
        name: s.studentName,
        className: s.className || "Tanpa Kelas",
        status: s.status,
        checkInTime: s.checkInTime,
      }));

    return {
      totalStats: {
        total: attendanceList.length,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
      },
      classesAttendance: Array.from(classMap.values()),
      absentStudents: absents,
    };
  }, [attendanceList]);

  const filteredAbsentStudents = useMemo(() => {
    return absentStudents.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [absentStudents, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Kehadiran Hari Ini
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="classes" className="flex-1">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="classes" className="flex-1 text-xs sm:text-sm">Per Kelas</TabsTrigger>
              <TabsTrigger value="absent" className="flex-1 text-xs sm:text-sm">
                Belum / Tidak Hadir
                <Badge variant="destructive" className="ml-1 sm:ml-2 text-[10px] h-5 px-1.5">
                  {absentStudents.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[65vh] p-4 pt-3">
            <TabsContent value="classes" className="mt-0 space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                <Card className="bg-muted/30">
                  <CardContent className="p-3 text-center">
                    <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-lg sm:text-xl font-bold">{totalStats.total}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
                <Card className="bg-success/5 border-success/20">
                  <CardContent className="p-3 text-center">
                    <UserCheck className="h-5 w-5 mx-auto text-success mb-1" />
                    <p className="text-lg sm:text-xl font-bold text-success">{totalStats.present}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Hadir</p>
                  </CardContent>
                </Card>
                <Card className="bg-warning/5 border-warning/20">
                  <CardContent className="p-3 text-center">
                    <Clock className="h-5 w-5 mx-auto text-warning mb-1" />
                    <p className="text-lg sm:text-xl font-bold text-warning">{totalStats.late}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Terlambat</p>
                  </CardContent>
                </Card>
                <Card className="bg-destructive/5 border-destructive/20">
                  <CardContent className="p-3 text-center">
                    <UserX className="h-5 w-5 mx-auto text-destructive mb-1" />
                    <p className="text-lg sm:text-xl font-bold text-destructive">{totalStats.absent}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Tidak Hadir</p>
                  </CardContent>
                </Card>
              </div>

              {/* Class List */}
              {classesAttendance.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  Belum ada catatan kehadiran hari ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {classesAttendance.map((cls) => (
                    <Card
                      key={cls.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedClassId(selectedClassId === cls.id ? null : cls.id)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{cls.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                Terdata: {cls.totalStudents} siswa
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-success">{cls.present}/{cls.totalStudents}</p>
                              <p className="text-xs text-muted-foreground">Hadir</p>
                            </div>
                            <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${
                              selectedClassId === cls.id ? "rotate-90" : ""
                            }`} />
                          </div>
                        </div>

                        {selectedClassId === cls.id && (
                          <div className="mt-4 pt-4 border-t border-border space-y-2">
                            {cls.students.map((student) => {
                              const cfg = statusConfig[student.status] || {
                                label: student.status,
                                color: "bg-muted text-muted-foreground border-border",
                              };
                              return (
                                <div
                                  key={student.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="text-xs">
                                        {student.name.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{student.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {student.checkInTime && (
                                      <span className="text-xs text-muted-foreground">
                                        {student.checkInTime}
                                      </span>
                                    )}
                                    <Badge variant="outline" className={cfg.color}>
                                      {cfg.label}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="absent" className="mt-0 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {filteredAbsentStudents.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  Semua siswa hadir atau tidak ada data yang cocok.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAbsentStudents.map((student) => {
                    const cfg = statusConfig[student.status] || {
                      label: student.status,
                      color: "bg-muted text-muted-foreground border-border",
                    };
                    return (
                      <Card key={student.id}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.className}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={cfg.color}>
                            {cfg.label}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
