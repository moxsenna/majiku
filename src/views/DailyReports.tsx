import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Filter,
  Utensils,
  Moon,
  Smile,
  AlertCircle,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  MoreVertical,
} from "lucide-react";

interface DailyReport {
  id: string;
  studentName: string;
  studentAvatar?: string;
  className: string;
  time: string;
  type: "meal" | "nap" | "mood" | "incident" | "activity" | "photo";
  title: string;
  description: string;
  imageUrl?: string;
  staffName: string;
  likes: number;
  comments: number;
}

const typeConfig = {
  meal: { icon: Utensils, color: "bg-success/10 text-success", label: "Makan" },
  nap: { icon: Moon, color: "bg-info/10 text-info", label: "Tidur" },
  mood: { icon: Smile, color: "bg-highlight/10 text-highlight", label: "Mood" },
  incident: { icon: AlertCircle, color: "bg-destructive/10 text-destructive", label: "Insiden" },
  activity: { icon: Heart, color: "bg-primary/10 text-primary", label: "Aktivitas" },
  photo: { icon: ImageIcon, color: "bg-secondary text-secondary-foreground", label: "Foto" },
};

const reports: DailyReport[] = [
  {
    id: "1",
    studentName: "Aisyah Putri",
    studentAvatar: "https://images.unsplash.com/photo-1595454223600-91d7bf17b165?w=100",
    className: "Kelas Bunga Matahari",
    time: "10:30",
    type: "meal",
    title: "Makan Siang",
    description: "Aisyah makan dengan lahap hari ini! Dia menghabiskan nasi, sayur bayam, dan ayam goreng. 🍚",
    staffName: "Ibu Sarah",
    likes: 5,
    comments: 2,
  },
  {
    id: "2",
    studentName: "Raka Pratama",
    studentAvatar: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=100",
    className: "Kelas Pelangi",
    time: "12:15",
    type: "nap",
    title: "Tidur Siang",
    description: "Raka tidur selama 1.5 jam dengan nyenyak. Bangun dengan ceria! 😴",
    staffName: "Ibu Maya",
    likes: 3,
    comments: 1,
  },
  {
    id: "3",
    studentName: "Keisha Azzahra",
    studentAvatar: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=100",
    className: "Kelas Bintang",
    time: "14:00",
    type: "activity",
    title: "Aktivitas Seni",
    description: "Keisha sangat antusias saat melukis dengan cat air. Hasil karyanya sangat bagus!",
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400",
    staffName: "Ibu Dina",
    likes: 12,
    comments: 4,
  },
  {
    id: "4",
    studentName: "Arjuna Wijaya",
    studentAvatar: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=100",
    className: "Kelas Bunga Matahari",
    time: "09:45",
    type: "mood",
    title: "Mood Ceria",
    description: "Arjuna datang dengan mood yang sangat baik hari ini. Sangat aktif bermain dengan teman-teman! 😊",
    staffName: "Pak Ahmad",
    likes: 8,
    comments: 3,
  },
];

export default function DailyReports() {
  const [selectedType, setSelectedType] = useState("all");

  const filteredReports = selectedType === "all" 
    ? reports 
    : reports.filter(r => r.type === selectedType);

  return (
    <DashboardLayout title="Laporan Harian" subtitle="Timeline aktivitas dan perkembangan anak">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("all")}
          >
            Semua
          </Button>
          {Object.entries(typeConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedType === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(key)}
            >
              <config.icon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{config.label}</span>
            </Button>
          ))}
        </div>

        <Button variant="hero" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Tambah Laporan</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4 max-w-3xl">
        {filteredReports.map((report) => {
          const config = typeConfig[report.type];
          const Icon = config.icon;
          
          return (
            <Card key={report.id} variant="interactive">
              <CardContent className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      <AvatarImage src={report.studentAvatar} />
                      <AvatarFallback>{report.studentName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{report.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.className} • {report.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={config.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {report.title}
                    </Badge>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-foreground/80 mb-4">{report.description}</p>

                {/* Image */}
                {report.imageUrl && (
                  <div className="rounded-xl overflow-hidden mb-4">
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-full h-48 sm:h-64 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Dicatat oleh: {report.staffName}
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{report.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>{report.comments}</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
