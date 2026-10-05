import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, BookOpen, Play, FileText, CheckCircle2,
  Clock, Star, ChevronRight, Search, Filter,
  Video, Download, Award, Bookmark
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "Semua" },
  { id: "onboarding", label: "Onboarding" },
  { id: "teaching", label: "Mengajar" },
  { id: "communication", label: "Komunikasi" },
  { id: "safety", label: "Keselamatan" },
];

const guides = [
  {
    id: 1,
    title: "Panduan Orientasi Tutor Baru",
    description: "Pelajari dasar-dasar menjadi tutor di MAJIKU",
    category: "onboarding",
    type: "video",
    duration: "15 menit",
    completed: true,
    required: true,
  },
  {
    id: 2,
    title: "Cara Menggunakan Aplikasi MAJIKU",
    description: "Tutorial lengkap fitur aplikasi untuk tutor",
    category: "onboarding",
    type: "video",
    duration: "20 menit",
    completed: true,
    required: true,
  },
  {
    id: 3,
    title: "Teknik Mengajar Anak Usia Dini",
    description: "Metode pembelajaran efektif untuk anak 2-6 tahun",
    category: "teaching",
    type: "document",
    duration: "10 menit baca",
    completed: false,
    required: false,
  },
  {
    id: 4,
    title: "Komunikasi Efektif dengan Orang Tua",
    description: "Tips berkomunikasi profesional dengan orang tua siswa",
    category: "communication",
    type: "video",
    duration: "12 menit",
    completed: false,
    required: true,
  },
  {
    id: 5,
    title: "Prosedur Keselamatan dan Darurat",
    description: "Protokol penanganan situasi darurat di daycare",
    category: "safety",
    type: "document",
    duration: "15 menit baca",
    completed: true,
    required: true,
  },
  {
    id: 6,
    title: "Membuat Laporan Harian yang Baik",
    description: "Panduan menulis laporan yang informatif",
    category: "communication",
    type: "video",
    duration: "8 menit",
    completed: false,
    required: false,
  },
  {
    id: 7,
    title: "Aktivitas Kreatif untuk Anak",
    description: "Ide kegiatan seni dan kreativitas",
    category: "teaching",
    type: "document",
    duration: "12 menit baca",
    completed: false,
    required: false,
  },
  {
    id: 8,
    title: "Pertolongan Pertama pada Anak",
    description: "Langkah-langkah P3K untuk tutor",
    category: "safety",
    type: "video",
    duration: "18 menit",
    completed: false,
    required: true,
  },
];

const learningPath = {
  total: 8,
  completed: 3,
  required: 5,
  requiredCompleted: 3,
};

export default function TutorGuides() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const progressPercentage = (learningPath.completed / learningPath.total) * 100;

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Link href="/tutor">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Panduan & Pelatihan</h1>
            <p className="text-xs text-muted-foreground">Tingkatkan kemampuan Anda</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Learning Progress */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Progress Pembelajaran</h2>
                <p className="text-primary-foreground/80 text-sm">
                  {learningPath.completed} dari {learningPath.total} materi selesai
                </p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-white/20" />
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-primary-foreground/80">
                Wajib: {learningPath.requiredCompleted}/{learningPath.required}
              </span>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {progressPercentage.toFixed(0)}% Selesai
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari panduan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="whitespace-nowrap"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Guides List */}
        <div className="space-y-3">
          {filteredGuides.map((guide) => (
            <Card 
              key={guide.id} 
              className={cn(
                "cursor-pointer hover:shadow-md transition-shadow",
                guide.completed && "bg-muted/30"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    guide.type === "video" 
                      ? "bg-red-500/10 text-red-500" 
                      : "bg-blue-500/10 text-blue-500"
                  )}>
                    {guide.type === "video" ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm line-clamp-2">{guide.title}</h3>
                      {guide.completed && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {guide.duration}
                      </Badge>
                      {guide.required && (
                        <Badge variant="destructive" className="text-xs">
                          Wajib
                        </Badge>
                      )}
                      {guide.type === "video" && (
                        <Badge variant="outline" className="text-xs">
                          <Play className="w-3 h-3 mr-1" />
                          Video
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Tidak Ada Hasil</h3>
              <p className="text-sm text-muted-foreground">
                Coba ubah kata kunci atau kategori pencarian
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Download Semua Materi (PDF)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Bookmark className="w-4 h-4 mr-2" />
              Materi yang Disimpan
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Star className="w-4 h-4 mr-2" />
              Sertifikat Pelatihan
            </Button>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Butuh Bantuan?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Hubungi tim pelatihan jika ada pertanyaan tentang materi pembelajaran.
                </p>
                <Button size="sm" variant="outline">
                  Hubungi Tim Pelatihan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
