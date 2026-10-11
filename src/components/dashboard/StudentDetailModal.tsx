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
  Users, Search, GraduationCap, AlertCircle
} from "lucide-react";
import {
  listStudentsWithEnrollments,
  type StudentWithEnrollments
} from "@/server/actions/studentsCrud";
import {
  listClassesWithTutor,
  type ClassWithTutorRecord
} from "@/server/actions/classesCrud";

interface StudentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: StudentWithEnrollments[];
}

export function StudentDetailModal({ open, onOpenChange, data: initialData }: StudentDetailModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: studentsWithEnrollments = [] } = useQuery({
    queryKey: ["students-with-enrollments"],
    queryFn: () => listStudentsWithEnrollments(),
    enabled: open,
    initialData,
  });

  const { data: classesWithTutors = [] } = useQuery<ClassWithTutorRecord[]>({
    queryKey: ["classes-with-tutors"],
    queryFn: () => listClassesWithTutor(),
    enabled: open,
  });

  // Siswa tanpa enrollment aktif
  const unenrolledStudents = useMemo(() => {
    return studentsWithEnrollments.filter((s) => s.enrollments.length === 0);
  }, [studentsWithEnrollments]);

  // Siswa aktif
  const activeStudents = useMemo(() => {
    return studentsWithEnrollments.filter((s) => s.student.isActive);
  }, [studentsWithEnrollments]);

  // Hitung kuota kelas riil
  const classQuotas = useMemo(() => {
    const enrollmentCounts: Record<string, number> = {};
    for (const item of studentsWithEnrollments) {
      for (const e of item.enrollments) {
        enrollmentCounts[e.classId] = (enrollmentCounts[e.classId] || 0) + 1;
      }
    }

    return classesWithTutors.map((cls) => {
      const capacity = Number(cls.capacity ?? 0);
      const filled = enrollmentCounts[cls.id] || 0;
      const available = Math.max(0, capacity - filled);
      return {
        id: cls.id,
        name: cls.name,
        tutor: cls.tutorName || "Belum ditugaskan",
        capacity,
        filled,
        available,
      };
    });
  }, [studentsWithEnrollments, classesWithTutors]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return activeStudents;
    return activeStudents.filter((item) =>
      item.student.name.toLowerCase().includes(q) ||
      (item.student.parentName ?? "").toLowerCase().includes(q) ||
      item.enrollments.some((e) => (e.className ?? "").toLowerCase().includes(q))
    );
  }, [activeStudents, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Data Siswa Lembaga
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="flex-1">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm">
                Siswa Aktif ({activeStudents.length})
              </TabsTrigger>
              <TabsTrigger value="unenrolled" className="flex-1 text-xs sm:text-sm">
                Belum Ada Kelas
                <Badge variant={unenrolledStudents.length > 0 ? "destructive" : "secondary"} className="ml-1 sm:ml-2 text-[10px] h-5 px-1.5">
                  {unenrolledStudents.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="quota" className="flex-1 text-xs sm:text-sm">
                Kapasitas Kelas ({classQuotas.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[65vh] p-4 pt-3">
            <TabsContent value="all" className="mt-0 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama siswa, orang tua, atau kelas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Student List */}
              {filteredStudents.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  Tidak ada data siswa ditemukan.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map(({ student, enrollments }) => {
                    const classNames = enrollments.map((e) => e.className).filter(Boolean).join(", ");
                    return (
                      <Card key={student.id}>
                        <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {student.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {classNames || "Belum ada kelas"} • Ortu: {student.parentName || "-"}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                            Aktif
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unenrolled" className="mt-0 space-y-4">
              <Card className="bg-warning/5 border-warning/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">Siswa Belum Terdaftar di Kelas</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {unenrolledStudents.length} siswa belum memiliki pendaftaran kelas aktif. Penugasan kelas dapat dikelola di menu Manajemen Siswa.
                  </p>
                </CardContent>
              </Card>

              {unenrolledStudents.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Semua siswa telah terdaftar dalam ruang kelas.
                </div>
              ) : (
                <div className="space-y-2">
                  {unenrolledStudents.map(({ student }) => (
                    <Card key={student.id}>
                      <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {student.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Daftar: {student.registrationDate || "-"} • Kontak: {student.parentPhone || student.parentEmail || "-"}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                          Belum Ada Kelas
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="quota" className="mt-0 space-y-4">
              {classQuotas.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Belum ada kelas terdaftar.
                </div>
              ) : (
                <div className="grid gap-3">
                  {classQuotas.map((cls) => {
                    const pct = cls.capacity > 0 ? Math.min(100, Math.round((cls.filled / cls.capacity) * 100)) : 0;
                    const isFull = cls.capacity > 0 && cls.filled >= cls.capacity;
                    return (
                      <Card
                        key={cls.id}
                        className={isFull ? "border-destructive/30 bg-destructive/5" : ""}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{cls.name}</p>
                                <p className="text-xs text-muted-foreground">Tutor: {cls.tutor}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">
                                {cls.filled}/{cls.capacity || "∞"}
                              </p>
                              <Badge
                                variant="outline"
                                className={
                                  isFull
                                    ? "bg-destructive/10 text-destructive border-destructive/20 text-[10px]"
                                    : cls.available <= 2 && cls.capacity > 0
                                    ? "bg-warning/10 text-warning border-warning/20 text-[10px]"
                                    : "bg-success/10 text-success border-success/20 text-[10px]"
                                }
                              >
                                {cls.capacity === 0
                                  ? `${cls.filled} terisi`
                                  : isFull
                                  ? "Penuh"
                                  : `${cls.available} slot tersedia`}
                              </Badge>
                            </div>
                          </div>
                          {cls.capacity > 0 && (
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  isFull
                                    ? "bg-destructive"
                                    : cls.available <= 2
                                    ? "bg-warning"
                                    : "bg-success"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
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
