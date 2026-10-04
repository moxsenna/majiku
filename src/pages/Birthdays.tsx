import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Cake,
  Send,
  Gift,
  Calendar,
  PartyPopper,
  MessageSquare,
} from "lucide-react";

interface BirthdayStudent {
  id: string;
  name: string;
  avatar?: string;
  className: string;
  birthDate: string;
  age: number;
  daysUntil: number;
  parentName: string;
  parentPhone: string;
}

const birthdays: BirthdayStudent[] = [
  {
    id: "1",
    name: "Aisyah Putri",
    avatar: "https://images.unsplash.com/photo-1595454223600-91d7bf17b165?w=100",
    className: "Kelas Bunga Matahari",
    birthDate: "12 Desember 2019",
    age: 5,
    daysUntil: 0,
    parentName: "Ibu Sari Putri",
    parentPhone: "+62 812-3456-7890",
  },
  {
    id: "2",
    name: "Raka Pratama",
    avatar: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=100",
    className: "Kelas Pelangi",
    birthDate: "15 Desember 2020",
    age: 4,
    daysUntil: 3,
    parentName: "Bpk. Rudi Pratama",
    parentPhone: "+62 813-4567-8901",
  },
  {
    id: "3",
    name: "Nabila Salsabila",
    avatar: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=100",
    className: "Kelas Bintang",
    birthDate: "18 Desember 2019",
    age: 5,
    daysUntil: 6,
    parentName: "Ibu Rina Salsabila",
    parentPhone: "+62 814-5678-9012",
  },
  {
    id: "4",
    name: "Keisha Azzahra",
    avatar: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=100",
    className: "Kelas Bintang",
    birthDate: "22 Desember 2019",
    age: 5,
    daysUntil: 10,
    parentName: "Ibu Dewi Azzahra",
    parentPhone: "+62 815-6789-0123",
  },
];

const getBirthdayLabel = (daysUntil: number) => {
  if (daysUntil === 0) return { label: "Hari ini! 🎉", variant: "default" as const };
  if (daysUntil === 1) return { label: "Besok", variant: "warning" as const };
  if (daysUntil <= 7) return { label: `${daysUntil} hari lagi`, variant: "info" as const };
  return { label: `${daysUntil} hari lagi`, variant: "muted" as const };
};

export default function Birthdays() {
  const todayBirthdays = birthdays.filter((b) => b.daysUntil === 0);
  const upcomingBirthdays = birthdays.filter((b) => b.daysUntil > 0);

  return (
    <DashboardLayout title="Ulang Tahun" subtitle="Kelola ucapan dan reminder ulang tahun siswa">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card variant="flat" className="bg-highlight/5 border-highlight/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-highlight/10 flex items-center justify-center">
                <PartyPopper className="h-5 w-5 text-highlight" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{todayBirthdays.length}</p>
                <p className="text-xs text-muted-foreground">Ulang Tahun Hari Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{birthdays.filter(b => b.daysUntil <= 7).length}</p>
                <p className="text-xs text-muted-foreground">Minggu Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Cake className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{birthdays.length}</p>
                <p className="text-xs text-muted-foreground">Bulan Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground">Ucapan Terkirim</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Birthdays */}
      {todayBirthdays.length > 0 && (
        <Card className="mb-6 border-highlight/30 bg-highlight/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-highlight" />
              <CardTitle>Ulang Tahun Hari Ini!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayBirthdays.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background border border-highlight/30"
                >
                  <div className="relative">
                    <Avatar size="xl">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-highlight flex items-center justify-center">
                      <Gift className="h-4 w-4 text-highlight-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.className}</p>
                    <p className="text-sm font-medium text-highlight-foreground">
                      Genap {student.age} tahun! 🎂
                    </p>
                  </div>
                  <Button variant="hero" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Ucapan
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Birthdays */}
      <Card>
        <CardHeader>
          <CardTitle>Ulang Tahun Mendatang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingBirthdays.map((student) => {
              const { label, variant } = getBirthdayLabel(student.daysUntil);
              return (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar size="lg">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.className}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.birthDate} • Usia {student.age} tahun
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:ml-auto">
                    <Badge variant={variant}>{label}</Badge>
                    <Button variant="soft" size="sm">
                      <Send className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Kirim Ucapan</span>
                      <span className="sm:hidden">Kirim</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
