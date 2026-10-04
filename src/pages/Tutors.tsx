import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Phone,
  Mail,
  GraduationCap,
  TrendingUp,
  Star,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TutorData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  className: string;
  classId: string;
  studentsCount: number;
  kpiScore: number;
  status: "active" | "busy" | "offline" | "leave";
  joinDate: string;
  specialization: string;
  leaveInfo?: {
    startDate: string;
    endDate: string;
    substituteName: string;
  };
}

const initialTutors: TutorData[] = [
  {
    id: "1",
    name: "Ibu Sarah Wijaya",
    email: "sarah@majiku.com",
    phone: "081234567890",
    avatar: "",
    className: "Kelas Bunga Matahari",
    classId: "1",
    studentsCount: 15,
    kpiScore: 95,
    status: "active",
    joinDate: "Jan 2023",
    specialization: "Pengembangan Motorik",
  },
  {
    id: "2",
    name: "Ibu Maya Sari",
    email: "maya@majiku.com",
    phone: "081234567891",
    avatar: "",
    className: "Kelas Pelangi",
    classId: "2",
    studentsCount: 12,
    kpiScore: 88,
    status: "active",
    joinDate: "Mar 2023",
    specialization: "Seni & Kreativitas",
  },
  {
    id: "3",
    name: "Ibu Dina Permata",
    email: "dina@majiku.com",
    phone: "081234567892",
    avatar: "",
    className: "Kelas Bintang",
    classId: "3",
    studentsCount: 10,
    kpiScore: 92,
    status: "leave",
    joinDate: "Jun 2023",
    specialization: "Persiapan SD",
    leaveInfo: {
      startDate: "16 Des 2024",
      endDate: "20 Des 2024",
      substituteName: "Admin",
    },
  },
  {
    id: "4",
    name: "Pak Ahmad Rizki",
    email: "ahmad@majiku.com",
    phone: "081234567893",
    avatar: "",
    className: "Kelas Mentari",
    classId: "4",
    studentsCount: 14,
    kpiScore: 85,
    status: "active",
    joinDate: "Sep 2023",
    specialization: "Playgroup",
  },
];

const classOptions = [
  { id: "1", name: "Kelas Bunga Matahari" },
  { id: "2", name: "Kelas Pelangi" },
  { id: "3", name: "Kelas Bintang" },
  { id: "4", name: "Kelas Mentari" },
  { id: "5", name: "Kelas Ceria" },
];

const statusConfig = {
  active: { label: "Aktif", className: "bg-green-500" },
  busy: { label: "Sibuk", className: "bg-orange-500" },
  offline: { label: "Offline", className: "bg-muted-foreground" },
  leave: { label: "Cuti", className: "bg-blue-500" },
};

export default function Tutors() {
  const [tutors, setTutors] = useState<TutorData[]>(initialTutors);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTutor, setNewTutor] = useState({
    name: "",
    email: "",
    phone: "",
    classId: "",
    specialization: "",
  });

  const filteredTutors = tutors.filter(
    (tutor) =>
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgKPI = Math.round(
    tutors.reduce((acc, t) => acc + t.kpiScore, 0) / tutors.length
  );

  const handleAddTutor = () => {
    const selectedClass = classOptions.find((c) => c.id === newTutor.classId);
    const newTutorData: TutorData = {
      id: String(tutors.length + 1),
      name: newTutor.name,
      email: newTutor.email,
      phone: newTutor.phone,
      className: selectedClass?.name || "",
      classId: newTutor.classId,
      studentsCount: 0,
      kpiScore: 0,
      status: "active",
      joinDate: new Date().toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      }),
      specialization: newTutor.specialization,
    };
    setTutors([...tutors, newTutorData]);
    setIsAddDialogOpen(false);
    setNewTutor({
      name: "",
      email: "",
      phone: "",
      classId: "",
      specialization: "",
    });
  };

  const handleDeleteTutor = (id: string) => {
    setTutors(tutors.filter((t) => t.id !== id));
  };

  const getKPIColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <DashboardLayout
      title="Kelola Tutor"
      subtitle="Manajemen tutor dan monitoring KPI"
    >
      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tutors.length}</p>
                <p className="text-xs text-muted-foreground">Total Tutor</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {tutors.filter((t) => t.status === "active").length}
                </p>
                <p className="text-xs text-muted-foreground">Tutor Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgKPI}%</p>
                <p className="text-xs text-muted-foreground">Rata-rata KPI</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {tutors.reduce((acc, t) => acc + t.studentsCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Siswa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari tutor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Tutor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Tutor Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input
                  placeholder="Contoh: Ibu Sarah Wijaya"
                  value={newTutor.name}
                  onChange={(e) =>
                    setNewTutor({ ...newTutor, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@majiku.com"
                    value={newTutor.email}
                    onChange={(e) =>
                      setNewTutor({ ...newTutor, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>No. Telepon</Label>
                  <Input
                    placeholder="08xxxxxxxxxx"
                    value={newTutor.phone}
                    onChange={(e) =>
                      setNewTutor({ ...newTutor, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assign ke Kelas</Label>
                <Select
                  value={newTutor.classId}
                  onValueChange={(value) =>
                    setNewTutor({ ...newTutor, classId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {classOptions.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Spesialisasi</Label>
                <Input
                  placeholder="Contoh: Pengembangan Motorik"
                  value={newTutor.specialization}
                  onChange={(e) =>
                    setNewTutor({ ...newTutor, specialization: e.target.value })
                  }
                />
              </div>
              <Button className="w-full" onClick={handleAddTutor}>
                Simpan Tutor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTutors.map((tutor) => (
          <Card
            key={tutor.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={tutor.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {tutor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${statusConfig[tutor.status].className}`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tutor.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {tutor.specialization}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                    <DropdownMenuItem className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Tutor
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Calendar className="w-4 h-4" />
                      Atur Jadwal
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 text-destructive"
                      onClick={() => handleDeleteTutor(tutor.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus Tutor
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Class Badge */}
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <Badge variant="secondary">{tutor.className}</Badge>
                <span className="text-xs text-muted-foreground">
                  {tutor.studentsCount} siswa
                </span>
              </div>

              {/* KPI Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Skor KPI
                  </span>
                  <span className={`font-bold ${getKPIColor(tutor.kpiScore)}`}>
                    {tutor.kpiScore}%
                  </span>
                </div>
                <Progress value={tutor.kpiScore} className="h-2" />
              </div>

              {/* Contact Info */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{tutor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{tutor.phone}</span>
                </div>
              </div>

              {/* Leave Info (if on leave) */}
              {tutor.status === "leave" && tutor.leaveInfo && (
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs font-medium text-blue-600">🏖️ Sedang Cuti</p>
                  <p className="text-xs text-muted-foreground">
                    {tutor.leaveInfo.startDate} - {tutor.leaveInfo.endDate}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chat dialihkan ke: <span className="font-medium">{tutor.leaveInfo.substituteName}</span>
                  </p>
                </div>
              )}

              {/* Join Date */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Bergabung {tutor.joinDate}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    tutor.status === "active"
                      ? "border-green-500 text-green-600"
                      : tutor.status === "busy"
                      ? "border-orange-500 text-orange-600"
                      : tutor.status === "leave"
                      ? "border-blue-500 text-blue-600"
                      : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  {statusConfig[tutor.status].label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTutors.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            Tidak ada tutor ditemukan
          </h3>
          <p className="text-sm text-muted-foreground">
            Coba ubah kata kunci pencarian atau tambah tutor baru
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
