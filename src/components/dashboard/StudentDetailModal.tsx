import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Users, UserPlus, Search, GraduationCap, Calendar,
  CheckCircle2, Clock, AlertCircle, ChevronRight
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  className: string;
  type: "regular" | "harian" | "trial";
  registrationDate: string;
  status: "aktif" | "pending" | "trial";
  avatar?: string;
  parentName: string;
  parentPhone: string;
}

interface ClassQuota {
  id: string;
  name: string;
  tutor: string;
  capacity: number;
  filled: number;
  available: number;
}

const demoTodayStudents: Student[] = [
  {
    id: "1",
    name: "Aisyah Putri",
    className: "Toddler A",
    type: "regular",
    registrationDate: "2024-01-01",
    status: "aktif",
    parentName: "Ibu Sari",
    parentPhone: "081234567890",
  },
  {
    id: "2",
    name: "Budi Santoso",
    className: "Playgroup B",
    type: "harian",
    registrationDate: "2024-01-15",
    status: "pending",
    parentName: "Ibu Maya",
    parentPhone: "081345678901",
  },
  {
    id: "3",
    name: "Citra Dewi",
    className: "TK A",
    type: "trial",
    registrationDate: "2024-01-20",
    status: "trial",
    parentName: "Ibu Fitri",
    parentPhone: "081456789012",
  },
];

const demoNewRegistrations: Student[] = [
  {
    id: "4",
    name: "Dimas Pratama",
    className: "Belum ditentukan",
    type: "regular",
    registrationDate: "2024-01-25",
    status: "pending",
    parentName: "Bapak Andi",
    parentPhone: "081567890123",
  },
  {
    id: "5",
    name: "Elsa Rahma",
    className: "Belum ditentukan",
    type: "harian",
    registrationDate: "2024-01-24",
    status: "pending",
    parentName: "Ibu Rina",
    parentPhone: "081678901234",
  },
];

const demoClassQuotas: ClassQuota[] = [
  { id: "1", name: "Toddler A", tutor: "Ibu Sari", capacity: 12, filled: 10, available: 2 },
  { id: "2", name: "Toddler B", tutor: "Ibu Dina", capacity: 12, filled: 12, available: 0 },
  { id: "3", name: "Playgroup A", tutor: "Ibu Ratna", capacity: 15, filled: 13, available: 2 },
  { id: "4", name: "Playgroup B", tutor: "Ibu Wati", capacity: 15, filled: 14, available: 1 },
  { id: "5", name: "TK A", tutor: "Ibu Yanti", capacity: 18, filled: 15, available: 3 },
  { id: "6", name: "TK B", tutor: "Ibu Lina", capacity: 18, filled: 17, available: 1 },
];

const typeConfig = {
  regular: { label: "Reguler", color: "bg-primary/10 text-primary border-primary/20" },
  harian: { label: "Harian", color: "bg-info/10 text-info border-info/20" },
  trial: { label: "Trial", color: "bg-warning/10 text-warning border-warning/20" },
};

const statusConfig = {
  aktif: { label: "Aktif", color: "bg-success/10 text-success border-success/20" },
  pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20" },
  trial: { label: "Trial", color: "bg-info/10 text-info border-info/20" },
};

interface StudentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailModal({ open, onOpenChange }: StudentDetailModalProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState("");

  const availableClasses = demoClassQuotas.filter((c) => c.available > 0);

  const handleAssignStudent = () => {
    if (!selectedStudent || !selectedClass) return;

    toast({
      title: "Siswa Berhasil Ditugaskan",
      description: `${selectedStudent.name} telah ditugaskan ke ${selectedClass}`,
    });
    setAssignDialogOpen(false);
    setSelectedStudent(null);
    setSelectedClass("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Data Siswa Hari Ini
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="today" className="flex-1">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="today" className="flex-1 text-xs sm:text-sm">Hari Ini</TabsTrigger>
              <TabsTrigger value="new" className="flex-1 text-xs sm:text-sm">
                Baru
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] h-5 px-1.5">
                  {demoNewRegistrations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="quota" className="flex-1 text-xs sm:text-sm">Kuota</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[65vh] p-4 pt-3">
            <TabsContent value="today" className="mt-0 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg sm:text-xl font-bold">
                      {demoTodayStudents.filter((s) => s.type === "regular").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Reguler</p>
                  </CardContent>
                </Card>
                <Card className="bg-info/5 border-info/20">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg sm:text-xl font-bold">
                      {demoTodayStudents.filter((s) => s.type === "harian").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Harian</p>
                  </CardContent>
                </Card>
                <Card className="bg-warning/5 border-warning/20">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg sm:text-xl font-bold">
                      {demoTodayStudents.filter((s) => s.type === "trial").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Trial</p>
                  </CardContent>
                </Card>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Student List */}
              <div className="space-y-2">
                {demoTodayStudents.map((student) => (
                  <Card key={student.id}>
                    <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>{student.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.className} • {student.parentName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={typeConfig[student.type].color}>
                          {typeConfig[student.type].label}
                        </Badge>
                        <Badge variant="outline" className={statusConfig[student.status].color}>
                          {statusConfig[student.status].label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="new" className="mt-0 space-y-4">
              <Card className="bg-warning/5 border-warning/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">Perlu Penugasan Kelas</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {demoNewRegistrations.length} siswa baru menunggu untuk ditugaskan ke kelas
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {demoNewRegistrations.map((student) => (
                  <Card key={student.id}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>{student.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Daftar: {student.registrationDate} • {student.parentName}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={typeConfig[student.type].color}>
                          {typeConfig[student.type].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedStudent?.id === student.id ? selectedClass : ""}
                          onValueChange={(value) => {
                            setSelectedStudent(student);
                            setSelectedClass(value);
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Pilih kelas..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableClasses.map((cls) => (
                              <SelectItem key={cls.id} value={cls.name}>
                                {cls.name} - {cls.tutor} ({cls.available} slot tersedia)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => {
                            setSelectedStudent(student);
                            handleAssignStudent();
                          }}
                          disabled={!selectedClass || selectedStudent?.id !== student.id}
                        >
                          Tugaskan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="quota" className="mt-0 space-y-4">
              <div className="grid gap-3">
                {demoClassQuotas.map((cls) => (
                  <Card
                    key={cls.id}
                    className={cls.available === 0 ? "border-destructive/30 bg-destructive/5" : ""}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{cls.name}</p>
                            <p className="text-xs text-muted-foreground">Tutor: {cls.tutor}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {cls.filled}/{cls.capacity}
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              cls.available === 0
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : cls.available <= 2
                                ? "bg-warning/10 text-warning border-warning/20"
                                : "bg-success/10 text-success border-success/20"
                            }
                          >
                            {cls.available === 0
                              ? "Penuh"
                              : `${cls.available} slot tersedia`}
                          </Badge>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            cls.available === 0
                              ? "bg-destructive"
                              : cls.available <= 2
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{ width: `${(cls.filled / cls.capacity) * 100}%` }}
                        />
                      </div>
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
