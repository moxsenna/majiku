import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LessonPlanCard, LessonPlan } from "@/components/lesson/LessonPlanCard";
import { CreateLessonPlanDialog } from "@/components/lesson/CreateLessonPlanDialog";
import { Plus, Search, Calendar, BookOpen, Copy, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Demo lesson plans data
const demoLessonPlans: LessonPlan[] = [
  {
    id: "1",
    title: "Montessori - Berhitung 1-10",
    subject: "Matematika",
    className: "Kelas Bunga Matahari",
    date: "23 Des 2024",
    time: "08:00 - 10:00",
    tutor: { name: "Ibu Sarah", avatar: "" },
    status: "upcoming",
    objectives: [
      "Anak mampu mengenal angka 1-10",
      "Anak mampu menghitung benda konkrit",
      "Anak mampu menulis angka 1-5"
    ],
    activities: [
      { id: "1", title: "Circle Time - Bernyanyi Angka", duration: 10, description: "Bernyanyi lagu angka bersama", completed: false },
      { id: "2", title: "Menghitung Manik-manik", duration: 20, description: "Menghitung dan mengelompokkan manik-manik", completed: false },
      { id: "3", title: "Menulis Angka di Pasir", duration: 15, description: "Menelusuri angka di nampan pasir", completed: false },
      { id: "4", title: "Games Tebak Angka", duration: 15, description: "Permainan interaktif", completed: false },
    ],
    materials: ["Manik-manik warna", "Nampan pasir", "Kartu angka", "Speaker", "Stiker reward"],
  },
  {
    id: "2",
    title: "Sensori - Mengenal Tekstur",
    subject: "Sensori",
    className: "Kelas Pelangi",
    date: "23 Des 2024",
    time: "10:00 - 11:30",
    tutor: { name: "Ibu Dina", avatar: "" },
    status: "in-progress",
    objectives: [
      "Anak mampu membedakan tekstur kasar dan halus",
      "Anak mampu mendeskripsikan sensasi saat menyentuh"
    ],
    activities: [
      { id: "1", title: "Eksplorasi Kotak Sensori", duration: 15, description: "Meraba berbagai tekstur", completed: true },
      { id: "2", title: "Matching Game Tekstur", duration: 20, description: "Mencocokkan tekstur yang sama", completed: true },
      { id: "3", title: "Craft Kolase Tekstur", duration: 25, description: "Membuat kolase dari berbagai material", completed: false },
    ],
    materials: ["Kotak sensori", "Kertas tekstur", "Lem", "Kapas", "Amplas halus"],
  },
  {
    id: "3",
    title: "Kreativitas - Melukis Bebas",
    subject: "Seni",
    className: "Kelas Bintang",
    date: "22 Des 2024",
    time: "13:00 - 14:30",
    tutor: { name: "Pak Ahmad", avatar: "" },
    status: "completed",
    objectives: [
      "Anak mampu mengekspresikan diri melalui lukisan",
      "Anak mampu mencampur warna dasar"
    ],
    activities: [
      { id: "1", title: "Pengenalan Warna", duration: 10, description: "Mengenal warna primer dan sekunder", completed: true },
      { id: "2", title: "Eksperimen Mencampur Warna", duration: 15, description: "Mencampur warna primer", completed: true },
      { id: "3", title: "Melukis Bebas", duration: 30, description: "Melukis dengan tema bebas", completed: true },
      { id: "4", title: "Sharing & Apresiasi", duration: 10, description: "Berbagi cerita tentang lukisan", completed: true },
    ],
    materials: ["Cat air", "Kuas", "Palet", "Kertas lukis A3", "Celemek", "Lap"],
  },
];

const demoTemplates: LessonPlan[] = [
  {
    id: "t1",
    title: "Template: Montessori Berhitung Dasar",
    subject: "Matematika",
    className: "-",
    date: "-",
    time: "-",
    tutor: { name: "-" },
    status: "draft",
    isTemplate: true,
    objectives: [
      "Anak mampu mengenal konsep angka",
      "Anak mampu menghitung benda konkrit"
    ],
    activities: [
      { id: "1", title: "Circle Time", duration: 10, description: "Pembukaan dan lagu", completed: false },
      { id: "2", title: "Aktivitas Inti", duration: 30, description: "Kegiatan belajar utama", completed: false },
      { id: "3", title: "Games/Review", duration: 15, description: "Permainan edukatif", completed: false },
    ],
    materials: [],
  },
  {
    id: "t2",
    title: "Template: Sensori Eksplorasi",
    subject: "Sensori",
    className: "-",
    date: "-",
    time: "-",
    tutor: { name: "-" },
    status: "draft",
    isTemplate: true,
    objectives: ["Anak mampu mengeksplorasi panca indera"],
    activities: [
      { id: "1", title: "Warm Up", duration: 5, description: "Pemanasan", completed: false },
      { id: "2", title: "Eksplorasi Sensori", duration: 25, description: "Kegiatan sensori utama", completed: false },
      { id: "3", title: "Refleksi", duration: 10, description: "Berbagi pengalaman", completed: false },
    ],
    materials: [],
  },
];

export default function LessonPlans() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleSaveLessonPlan = (data: any) => {
    console.log("Saving lesson plan:", data);
    toast({
      title: "Lesson Plan Tersimpan",
      description: `${data.title} berhasil dibuat`,
    });
  };

  const filteredPlans = demoLessonPlans.filter(plan => 
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingPlans = filteredPlans.filter(p => p.status === "upcoming");
  const inProgressPlans = filteredPlans.filter(p => p.status === "in-progress");
  const completedPlans = filteredPlans.filter(p => p.status === "completed");

  return (
    <DashboardLayout 
      title="Lesson Plans" 
      subtitle="Kelola rencana pembelajaran dan template kegiatan"
    >
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari lesson plan..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <CreateLessonPlanDialog onSave={handleSaveLessonPlan}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Buat Lesson Plan
            </Button>
          </CreateLessonPlanDialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-info/10 border border-info/20">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-info" />
            <span className="text-sm font-medium text-info">Hari Ini</span>
          </div>
          <p className="text-2xl font-bold">{inProgressPlans.length + upcomingPlans.length}</p>
          <p className="text-xs text-muted-foreground">lesson plan</p>
        </div>
        <div className="p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">Selesai</span>
          </div>
          <p className="text-2xl font-bold">{completedPlans.length}</p>
          <p className="text-xs text-muted-foreground">bulan ini</p>
        </div>
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Copy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Template</span>
          </div>
          <p className="text-2xl font-bold">{demoTemplates.length}</p>
          <p className="text-xs text-muted-foreground">tersedia</p>
        </div>
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">Minggu Ini</span>
          </div>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-muted-foreground">dijadwalkan</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="gap-2">
            Semua
            <Badge variant="secondary" className="text-xs">{filteredPlans.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="today" className="gap-2">
            Hari Ini
            <Badge variant="secondary" className="text-xs">{inProgressPlans.length + upcomingPlans.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            Template
            <Badge variant="secondary" className="text-xs">{demoTemplates.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map(plan => (
              <LessonPlanCard 
                key={plan.id} 
                plan={plan} 
                variant="admin"
                onView={() => toast({ title: "Lihat detail", description: plan.title })}
                onEdit={() => toast({ title: "Edit", description: plan.title })}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {inProgressPlans.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Sedang Berlangsung</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressPlans.map(plan => (
                  <LessonPlanCard 
                    key={plan.id} 
                    plan={plan} 
                    variant="admin"
                    onView={() => toast({ title: "Lihat detail", description: plan.title })}
                  />
                ))}
              </div>
            </div>
          )}
          {upcomingPlans.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Akan Datang</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingPlans.map(plan => (
                  <LessonPlanCard 
                    key={plan.id} 
                    plan={plan} 
                    variant="admin"
                    onView={() => toast({ title: "Lihat detail", description: plan.title })}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoTemplates.map(template => (
              <LessonPlanCard 
                key={template.id} 
                plan={template} 
                variant="admin"
                onView={() => toast({ title: "Gunakan template", description: template.title })}
                onEdit={() => toast({ title: "Edit template", description: template.title })}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
