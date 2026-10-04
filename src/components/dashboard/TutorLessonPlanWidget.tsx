import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Clock, Package, Target, CheckCircle2, 
  Play, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  title: string;
  duration: number;
  description: string;
  materials: string[];
  completed: boolean;
}

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  className: string;
  date: string;
  time: string;
  status: "upcoming" | "in-progress" | "completed";
  objectives: string[];
  activities: Activity[];
  materials: string[];
}

const todayLessonPlans: LessonPlan[] = [
  {
    id: "1",
    title: "Montessori - Berhitung 1-10",
    subject: "Matematika",
    className: "Kelas Bunga Matahari",
    date: "23 Desember 2024",
    time: "08:00 - 10:00",
    status: "in-progress",
    objectives: [
      "Anak mampu mengenal angka 1-10",
      "Anak mampu menghitung benda konkrit",
      "Anak mampu menulis angka 1-5"
    ],
    activities: [
      { 
        id: "1", 
        title: "Circle Time - Bernyanyi Angka", 
        duration: 10, 
        description: "Bernyanyi lagu angka 1-10 bersama sambil tepuk tangan.", 
        materials: ["Speaker", "Lirik lagu angka"],
        completed: true 
      },
      { 
        id: "2", 
        title: "Menghitung Manik-manik", 
        duration: 20, 
        description: "Anak menghitung manik-manik dan memasukkan ke wadah sesuai angka.", 
        materials: ["Manik-manik warna", "Wadah angka 1-10", "Kartu angka"],
        completed: true 
      },
      { 
        id: "3", 
        title: "Menulis Angka di Pasir", 
        duration: 15, 
        description: "Anak menelusuri angka di nampan pasir mengikuti kartu contoh.", 
        materials: ["Nampan pasir", "Kartu angka 1-5", "Pensil dummy"],
        completed: false 
      },
      { 
        id: "4", 
        title: "Games Tebak Angka", 
        duration: 15, 
        description: "Permainan interaktif menebak jumlah benda di kartu gambar.", 
        materials: ["Kartu gambar benda", "Stiker reward", "Papan skor"],
        completed: false 
      },
    ],
    materials: [
      "Speaker", "Manik-manik warna", "Wadah angka 1-10", 
      "Kartu angka", "Nampan pasir", "Kartu gambar", "Stiker reward"
    ],
  },
  {
    id: "2",
    title: "Sensori - Mengenal Tekstur",
    subject: "Sensori",
    className: "Kelas Bunga Matahari",
    date: "23 Desember 2024",
    time: "10:30 - 11:30",
    status: "upcoming",
    objectives: [
      "Anak mengenal berbagai tekstur",
      "Anak dapat membedakan halus dan kasar",
    ],
    activities: [
      { 
        id: "1", 
        title: "Meraba Kotak Misteri", 
        duration: 15, 
        description: "Anak meraba benda dalam kotak tanpa melihat.", 
        materials: ["Kotak misteri", "Benda tekstur berbeda"],
        completed: false 
      },
      { 
        id: "2", 
        title: "Sorting Tekstur", 
        duration: 20, 
        description: "Mengelompokkan benda berdasarkan tekstur.", 
        materials: ["Papan sorting", "Kartu tekstur"],
        completed: false 
      },
    ],
    materials: ["Kotak misteri", "Benda tekstur", "Papan sorting"],
  },
];

export function TutorLessonPlanWidget() {
  const { toast } = useToast();
  const [lessonPlans, setLessonPlans] = useState(todayLessonPlans);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const toggleActivityComplete = (planId: string, activityId: string) => {
    setLessonPlans(prev => prev.map(plan => {
      if (plan.id === planId) {
        const updatedActivities = plan.activities.map(a => 
          a.id === activityId ? { ...a, completed: !a.completed } : a
        );
        return { ...plan, activities: updatedActivities };
      }
      return plan;
    }));

    if (selectedPlan?.id === planId) {
      setSelectedPlan(prev => {
        if (!prev) return null;
        const updatedActivities = prev.activities.map(a => 
          a.id === activityId ? { ...a, completed: !a.completed } : a
        );
        return { ...prev, activities: updatedActivities };
      });
    }

    toast({
      title: "Kegiatan diperbarui",
      description: "Status kegiatan telah disimpan",
    });
  };

  const openDetail = (plan: LessonPlan) => {
    const currentPlan = lessonPlans.find(p => p.id === plan.id);
    setSelectedPlan(currentPlan || plan);
    setDetailOpen(true);
  };

  const getStatusBadge = (status: LessonPlan["status"]) => {
    switch (status) {
      case "in-progress":
        return <Badge className="bg-success text-success-foreground text-xs px-2 py-0.5 whitespace-nowrap">Hari Ini</Badge>;
      case "upcoming":
        return <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 whitespace-nowrap">Akan Datang</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground text-xs px-2 py-0.5 whitespace-nowrap">Selesai</Badge>;
    }
  };

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              Lesson Plan Hari Ini
            </CardTitle>
            <Badge variant="outline" className="text-xs">{lessonPlans.length} sesi</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {lessonPlans.map((plan) => {
            const completedCount = plan.activities.filter(a => a.completed).length;
            const progressPercent = (completedCount / plan.activities.length) * 100;
            
            return (
              <div 
                key={plan.id}
                className={cn(
                  "p-3 sm:p-4 rounded-xl border transition-all",
                  plan.status === "in-progress" 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-muted/30"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getStatusBadge(plan.status)}
                      <Badge variant="outline" className="text-xs">
                        {plan.subject}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm sm:text-base truncate">{plan.title}</h4>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {plan.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {plan.activities.length} kegiatan
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openDetail(plan)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Detail</span>
                  </Button>
                </div>
                
                {plan.status === "in-progress" && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{completedCount}/{plan.activities.length}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Detail Dialog - Responsive */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 gap-0">
          {selectedPlan && (
            <>
              <DialogHeader className="p-4 sm:p-6 pb-0">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(selectedPlan.status)}
                    <Badge variant="outline" className="text-xs">{selectedPlan.subject}</Badge>
                  </div>
                  <DialogTitle className="text-lg sm:text-xl">{selectedPlan.title}</DialogTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {selectedPlan.className} • {selectedPlan.date} • {selectedPlan.time}
                  </p>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[calc(90vh-140px)] px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-5 mt-4">
                  {/* Objectives */}
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-primary" />
                      Tujuan Pembelajaran
                    </h4>
                    <ul className="space-y-2">
                      {selectedPlan.objectives.map((obj, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Materials */}
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-primary" />
                      Alat & Material
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPlan.materials.map((material, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-3">
                      <Play className="w-4 h-4 text-primary" />
                      Daftar Kegiatan
                    </h4>
                    <div className="space-y-3">
                      {selectedPlan.activities.map((activity, index) => (
                        <div 
                          key={activity.id}
                          className={cn(
                            "p-3 sm:p-4 rounded-xl border transition-all cursor-pointer",
                            activity.completed 
                              ? "bg-success/5 border-success/20" 
                              : "bg-muted/30 hover:bg-muted/50"
                          )}
                          onClick={() => toggleActivityComplete(selectedPlan.id, activity.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              checked={activity.completed}
                              onCheckedChange={() => toggleActivityComplete(selectedPlan.id, activity.id)}
                              className="mt-0.5"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={cn(
                                  "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                                  activity.completed 
                                    ? "bg-success text-success-foreground" 
                                    : "bg-primary/10 text-primary"
                                )}>
                                  {activity.completed ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> : index + 1}
                                </span>
                                <h5 className={cn(
                                  "font-medium text-sm",
                                  activity.completed && "line-through text-muted-foreground"
                                )}>
                                  {activity.title}
                                </h5>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {activity.duration}m
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                                {activity.description}
                              </p>
                              {activity.materials.length > 0 && (
                                <div className="flex flex-wrap gap-1 items-center">
                                  <Package className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                  {activity.materials.map((material, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {material}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
