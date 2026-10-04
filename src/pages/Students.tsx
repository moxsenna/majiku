import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  Filter,
  Download,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  MoreVertical,
  Cake,
  Users,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  avatar?: string;
  className: string;
  birthDate: string;
  age: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  allergies: string[];
  status: "active" | "inactive" | "alumni";
  enrollmentDate: string;
}

const sampleStudents: Student[] = [
  {
    id: "1",
    name: "Aisyah Putri",
    avatar: "https://images.unsplash.com/photo-1595454223600-91d7bf17b165?w=100",
    className: "Kelas Bunga Matahari",
    birthDate: "15 Desember 2019",
    age: 5,
    parentName: "Ibu Sari Putri",
    parentPhone: "+62 812-3456-7890",
    parentEmail: "sari.putri@email.com",
    allergies: ["Kacang", "Seafood"],
    status: "active",
    enrollmentDate: "10 Jan 2023",
  },
  {
    id: "2",
    name: "Raka Pratama",
    avatar: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=100",
    className: "Kelas Pelangi",
    birthDate: "18 Desember 2020",
    age: 4,
    parentName: "Bpk. Rudi Pratama",
    parentPhone: "+62 813-4567-8901",
    parentEmail: "rudi.pratama@email.com",
    allergies: [],
    status: "active",
    enrollmentDate: "15 Mar 2023",
  },
  {
    id: "3",
    name: "Keisha Azzahra",
    avatar: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=100",
    className: "Kelas Bintang",
    birthDate: "22 Maret 2019",
    age: 5,
    parentName: "Ibu Dewi Azzahra",
    parentPhone: "+62 814-5678-9012",
    parentEmail: "dewi.azzahra@email.com",
    allergies: ["Susu"],
    status: "active",
    enrollmentDate: "5 Feb 2023",
  },
  {
    id: "4",
    name: "Arjuna Wijaya",
    avatar: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=100",
    className: "Kelas Bunga Matahari",
    birthDate: "8 Juli 2020",
    age: 4,
    parentName: "Bpk. Ahmad Wijaya",
    parentPhone: "+62 815-6789-0123",
    parentEmail: "ahmad.wijaya@email.com",
    allergies: [],
    status: "active",
    enrollmentDate: "20 Jan 2024",
  },
  {
    id: "5",
    name: "Nabila Salsabila",
    avatar: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=100",
    className: "Kelas Pelangi",
    birthDate: "5 September 2019",
    age: 5,
    parentName: "Ibu Rina Salsabila",
    parentPhone: "+62 816-7890-1234",
    parentEmail: "rina.salsabila@email.com",
    allergies: ["Telur"],
    status: "active",
    enrollmentDate: "1 Aug 2023",
  },
];

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  const filteredStudents = sampleStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "all" || student.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  const classes = [...new Set(sampleStudents.map((s) => s.className))];

  return (
    <DashboardLayout
      title="Siswa & CRM"
      subtitle="Kelola data lengkap siswa dan hubungan dengan orang tua"
    >
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              variant="filled"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="hero" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{sampleStudents.length}</p>
                <p className="text-xs text-muted-foreground">Total Siswa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {sampleStudents.filter((s) => s.status === "active").length}
                </p>
                <p className="text-xs text-muted-foreground">Siswa Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {sampleStudents.filter((s) => s.allergies.length > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Dengan Alergi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-highlight/10 flex items-center justify-center">
                <Cake className="h-5 w-5 text-highlight" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-xs text-muted-foreground">Ulang Tahun Minggu Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} variant="interactive">
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar size="xl">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-foreground">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.className}</p>
                    <Badge variant={student.status === "active" ? "success" : "muted"} className="mt-1">
                      {student.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Cake className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{student.birthDate}</span>
                  <Badge variant="highlight" className="ml-auto">
                    {student.age} tahun
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Bergabung: {student.enrollmentDate}</span>
                </div>
              </div>

              {/* Allergies */}
              {student.allergies.length > 0 && (
                <div className="mb-4 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span className="font-medium">Alergi:</span>
                    <span>{student.allergies.join(", ")}</span>
                  </div>
                </div>
              )}

              {/* Parent Info */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Orang Tua / Wali</p>
                <p className="font-medium text-sm text-foreground mb-2">{student.parentName}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="h-3 w-3 mr-1" />
                    Telepon
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
