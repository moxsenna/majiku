import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Users, UserCheck, UserX, Clock, Search, ChevronRight,
  GraduationCap, AlertCircle
} from "lucide-react";

interface ClassAttendance {
  id: string;
  name: string;
  tutor: string;
  tutorStatus: "hadir" | "izin" | "sakit" | "tidak_hadir";
  totalStudents: number;
  present: number;
  late: number;
  absent: number;
  students: {
    id: string;
    name: string;
    status: "hadir" | "terlambat" | "belum" | "izin" | "sakit";
    checkInTime?: string;
    avatar?: string;
  }[];
}

const demoClassesAttendance: ClassAttendance[] = [
  {
    id: "1",
    name: "Toddler A",
    tutor: "Ibu Sari",
    tutorStatus: "hadir",
    totalStudents: 12,
    present: 10,
    late: 1,
    absent: 1,
    students: [
      { id: "1", name: "Aisyah Putri", status: "hadir", checkInTime: "07:45" },
      { id: "2", name: "Budi Santoso", status: "hadir", checkInTime: "07:50" },
      { id: "3", name: "Citra Dewi", status: "terlambat", checkInTime: "08:15" },
      { id: "4", name: "Dimas Pratama", status: "belum" },
      { id: "5", name: "Elsa Rahma", status: "hadir", checkInTime: "07:55" },
      { id: "6", name: "Farhan Ali", status: "hadir", checkInTime: "08:00" },
      { id: "7", name: "Gita Sari", status: "hadir", checkInTime: "07:48" },
      { id: "8", name: "Hana Putri", status: "hadir", checkInTime: "07:52" },
      { id: "9", name: "Ivan Wijaya", status: "izin" },
      { id: "10", name: "Julia Andini", status: "hadir", checkInTime: "07:58" },
      { id: "11", name: "Kevin Pratama", status: "hadir", checkInTime: "08:02" },
      { id: "12", name: "Lina Sari", status: "hadir", checkInTime: "07:47" },
    ],
  },
  {
    id: "2",
    name: "Playgroup B",
    tutor: "Ibu Dina",
    tutorStatus: "hadir",
    totalStudents: 15,
    present: 13,
    late: 0,
    absent: 2,
    students: [
      { id: "13", name: "Maya Putri", status: "hadir", checkInTime: "07:40" },
      { id: "14", name: "Naufal Rizki", status: "hadir", checkInTime: "07:45" },
      { id: "15", name: "Olivia Sari", status: "sakit" },
      { id: "16", name: "Putra Wijaya", status: "hadir", checkInTime: "07:50" },
      { id: "17", name: "Qirana Dewi", status: "hadir", checkInTime: "07:55" },
    ],
  },
  {
    id: "3",
    name: "TK A",
    tutor: "Ibu Ratna",
    tutorStatus: "izin",
    totalStudents: 18,
    present: 15,
    late: 2,
    absent: 1,
    students: [
      { id: "18", name: "Reza Pratama", status: "hadir", checkInTime: "07:35" },
      { id: "19", name: "Sinta Dewi", status: "terlambat", checkInTime: "08:20" },
      { id: "20", name: "Taufik Ali", status: "hadir", checkInTime: "07:42" },
      { id: "21", name: "Umi Kalsum", status: "belum" },
      { id: "22", name: "Vina Sari", status: "terlambat", checkInTime: "08:10" },
    ],
  },
  {
    id: "4",
    name: "TK B",
    tutor: "Ibu Wati",
    tutorStatus: "hadir",
    totalStudents: 16,
    present: 14,
    late: 1,
    absent: 1,
    students: [
      { id: "23", name: "Wulan Sari", status: "hadir", checkInTime: "07:38" },
      { id: "24", name: "Xavier Tan", status: "hadir", checkInTime: "07:44" },
      { id: "25", name: "Yolanda Putri", status: "izin" },
      { id: "26", name: "Zaki Pratama", status: "hadir", checkInTime: "07:48" },
    ],
  },
];

const statusConfig = {
  hadir: { label: "Hadir", color: "bg-success/10 text-success border-success/20" },
  terlambat: { label: "Terlambat", color: "bg-warning/10 text-warning border-warning/20" },
  belum: { label: "Belum Hadir", color: "bg-muted text-muted-foreground border-border" },
  izin: { label: "Izin", color: "bg-info/10 text-info border-info/20" },
  sakit: { label: "Sakit", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const tutorStatusConfig = {
  hadir: { label: "Hadir", color: "text-success" },
  izin: { label: "Izin", color: "text-warning" },
  sakit: { label: "Sakit", color: "text-destructive" },
  tidak_hadir: { label: "Tidak Hadir", color: "text-destructive" },
};

interface AttendanceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttendanceDetailModal({ open, onOpenChange }: AttendanceDetailModalProps) {
  const [selectedClass, setSelectedClass] = useState<ClassAttendance | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const totalStats = demoClassesAttendance.reduce(
    (acc, cls) => ({
      total: acc.total + cls.totalStudents,
      present: acc.present + cls.present,
      late: acc.late + cls.late,
      absent: acc.absent + cls.absent,
    }),
    { total: 0, present: 0, late: 0, absent: 0 }
  );

  const absentStudents = demoClassesAttendance.flatMap((cls) =>
    cls.students
      .filter((s) => s.status === "belum" || s.status === "izin" || s.status === "sakit")
      .map((s) => ({ ...s, className: cls.name }))
  );

  const filteredAbsentStudents = absentStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                Belum Hadir
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
              <div className="space-y-3">
                {demoClassesAttendance.map((cls) => (
                  <Card
                    key={cls.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedClass(selectedClass?.id === cls.id ? null : cls)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{cls.name}</h4>
                              {cls.tutorStatus !== "hadir" && (
                                <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Tutor {tutorStatusConfig[cls.tutorStatus].label}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Tutor: {cls.tutor} •{" "}
                              <span className={tutorStatusConfig[cls.tutorStatus].color}>
                                {tutorStatusConfig[cls.tutorStatus].label}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-success">{cls.present}/{cls.totalStudents}</p>
                            <p className="text-xs text-muted-foreground">Hadir</p>
                          </div>
                          <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${
                            selectedClass?.id === cls.id ? "rotate-90" : ""
                          }`} />
                        </div>
                      </div>

                      {selectedClass?.id === cls.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-2">
                          {cls.students.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar size="sm">
                                  <AvatarImage src={student.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {student.name.slice(0, 2)}
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
                                <Badge variant="outline" className={statusConfig[student.status].color}>
                                  {statusConfig[student.status].label}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
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

              <div className="space-y-2">
                {filteredAbsentStudents.map((student) => (
                  <Card key={student.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{student.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.className}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusConfig[student.status].color}>
                        {statusConfig[student.status].label}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
