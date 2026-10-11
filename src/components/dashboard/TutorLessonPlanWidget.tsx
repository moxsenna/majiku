import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Clock, Package, Target, CheckCircle2, 
  Play, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { listLessonPlans, type LessonPlanRow } from "@/server/actions/lessonPlans";

interface ParsedActivity {
  id?: string;
  title: string;
  durationMinutes: number;
  description?: string;
  completed?: boolean;
}

export function TutorLessonPlanWidget() {
  const [selectedPlan, setSelectedPlan] = useState<LessonPlanRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: dbPlans = [] } = useQuery({
    queryKey: ["tutor-lesson-plans-widget"],
    queryFn: () => listLessonPlans().catch(() => []),
  });

  const openDetail = (plan: LessonPlanRow) => {
    setSelectedPlan(plan);
    setDetailOpen(true);
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 whitespace-nowrap">Hari Ini</Badge>;
      case "upcoming":
        return <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 whitespace-nowrap">Akan Datang</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground text-xs px-2 py-0.5 whitespace-nowrap">Selesai</Badge>;
      default:
        return <Badge variant="outline" className="text-xs px-2 py-0.5 whitespace-nowrap">Rencana</Badge>;
    }
  };

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Lesson Plan (RPP)
            </CardTitle>
            <Badge variant="outline" className="text-xs">{dbPlans.length} sesi</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {dbPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-foreground">Belum Ada RPP Terjadwal</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Rencana Pelaksanaan Pembelajaran dari kurikulum akan otomatis ditampilkan di sini jika sudah dibuat oleh koordinator.
              </p>
            </div>
          ) : (
            dbPlans.slice(0, 3).map((plan) => {
              const activities = Array.isArray(plan.activities) 
                ? (plan.activities as ParsedActivity[]) 
                : [];

              return (
                <div 
                  key={plan.id}
                  className={cn(
                    "p-3 sm:p-4 rounded-xl border transition-all",
                    plan.status === "in_progress" 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-muted/30"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getStatusBadge(plan.status)}
                        {plan.subject && (
                          <Badge variant="outline" className="text-xs">
                            {plan.subject}
                          </Badge>
                        )}
                        {plan.className && (
                          <Badge variant="secondary" className="text-xs">
                            {plan.className}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm sm:text-base truncate">{plan.title}</h4>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap">
                        {plan.timeRange && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {plan.timeRange}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {activities.length} aktivitas
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
                      <span>Detail RPP</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog Read-Only */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 gap-0">
          {selectedPlan && (
            <>
              <DialogHeader className="p-4 sm:p-6 pb-0">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(selectedPlan.status)}
                    {selectedPlan.subject && (
                      <Badge variant="outline" className="text-xs">{selectedPlan.subject}</Badge>
                    )}
                  </div>
                  <DialogTitle className="text-lg sm:text-xl">{selectedPlan.title}</DialogTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {selectedPlan.className || "Kelas Daycare"} • {selectedPlan.planDate} {selectedPlan.timeRange ? `• ${selectedPlan.timeRange}` : ""}
                  </p>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[calc(90vh-140px)] px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-5 mt-4">
                  {/* Objectives */}
                  {Array.isArray(selectedPlan.objectives) && (selectedPlan.objectives as string[]).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-primary" />
                        Tujuan Pembelajaran
                      </h4>
                      <ul className="space-y-2">
                        {(selectedPlan.objectives as string[]).map((obj, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Materials */}
                  {Array.isArray(selectedPlan.materials) && (selectedPlan.materials as string[]).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-primary" />
                        Alat & Material
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedPlan.materials as string[]).map((material, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activities Read-only */}
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-3">
                      <Play className="w-4 h-4 text-primary" />
                      Daftar Kegiatan & Pembelajaran
                    </h4>
                    {Array.isArray(selectedPlan.activities) && (selectedPlan.activities as ParsedActivity[]).length > 0 ? (
                      <div className="space-y-3">
                        {(selectedPlan.activities as ParsedActivity[]).map((activity, index) => (
                          <div 
                            key={activity.id || index}
                            className="p-3 sm:p-4 rounded-xl border bg-muted/30"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h5 className="font-medium text-sm">
                                    {activity.title}
                                  </h5>
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {activity.durationMinutes || 15}m
                                  </Badge>
                                  {activity.completed && (
                                    <Badge variant="secondary" className="text-xs text-green-600 bg-green-50 dark:bg-green-950/20">
                                      Selesai
                                    </Badge>
                                  )}
                                </div>
                                {activity.description && (
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Tidak ada rincian aktivitas khusus.</p>
                    )}
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
