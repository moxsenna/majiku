import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, Users, BookOpen, Package, ChevronRight, 
  CheckCircle2, Calendar, Play
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface LessonPlanActivity {
  id: string;
  title: string;
  duration: number; // in minutes
  description: string;
  materials?: string[];
  completed?: boolean;
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  className: string;
  date: string;
  time: string;
  tutor: {
    name: string;
    avatar?: string;
  };
  activities: LessonPlanActivity[];
  materials: string[];
  objectives: string[];
  status: "upcoming" | "in-progress" | "completed" | "draft";
  isTemplate?: boolean;
}

interface LessonPlanCardProps {
  plan: LessonPlan;
  variant?: "admin" | "tutor" | "parent";
  onView?: () => void;
  onEdit?: () => void;
  onStart?: () => void;
}

const statusConfig = {
  upcoming: { label: "Akan Datang", className: "bg-info/10 text-info border-info/20" },
  "in-progress": { label: "Berlangsung", className: "bg-success/10 text-success border-success/20" },
  completed: { label: "Selesai", className: "bg-muted text-muted-foreground border-border" },
  draft: { label: "Draft", className: "bg-warning/10 text-warning border-warning/20" },
};

export function LessonPlanCard({ plan, variant = "admin", onView, onEdit, onStart }: LessonPlanCardProps) {
  const totalDuration = plan.activities.reduce((acc, act) => acc + act.duration, 0);
  const completedActivities = plan.activities.filter(a => a.completed).length;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("text-xs", statusConfig[plan.status].className)}>
                {statusConfig[plan.status].label}
              </Badge>
              {plan.isTemplate && (
                <Badge variant="secondary" className="text-xs">Template</Badge>
              )}
            </div>
            <CardTitle className="text-base line-clamp-1">{plan.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{plan.subject}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-medium">{plan.date}</p>
            <p className="text-xs text-muted-foreground">{plan.time}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Class & Tutor Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{plan.className}</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={plan.tutor.avatar} />
              <AvatarFallback className="text-xs">{plan.tutor.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{plan.tutor.name}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Durasi</p>
              <p className="text-sm font-medium">{totalDuration} menit</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <BookOpen className="w-4 h-4 text-info" />
            <div>
              <p className="text-xs text-muted-foreground">Aktivitas</p>
              <p className="text-sm font-medium">
                {variant === "tutor" && plan.status === "in-progress" 
                  ? `${completedActivities}/${plan.activities.length}` 
                  : plan.activities.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Package className="w-4 h-4 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Alat</p>
              <p className="text-sm font-medium">{plan.materials.length}</p>
            </div>
          </div>
        </div>

        {/* Activities Preview - Only for tutor variant */}
        {variant === "tutor" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Kegiatan Hari Ini</p>
            <div className="space-y-1.5">
              {plan.activities.slice(0, 3).map((activity, index) => (
                <div 
                  key={activity.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg text-sm",
                    activity.completed 
                      ? "bg-success/10 text-success line-through" 
                      : "bg-muted/50"
                  )}
                >
                  {activity.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                  )}
                  <span className="flex-1 truncate">{activity.title}</span>
                  <span className="text-xs text-muted-foreground">{activity.duration}m</span>
                </div>
              ))}
              {plan.activities.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{plan.activities.length - 3} kegiatan lainnya
                </p>
              )}
            </div>
          </div>
        )}

        {/* Parent variant - simplified view */}
        {variant === "parent" && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Kegiatan Hari Ini</span>
            </div>
            <p className="text-sm text-muted-foreground">{plan.title}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {variant === "admin" && (
            <>
              <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
                Edit
              </Button>
              <Button size="sm" className="flex-1" onClick={onView}>
                Lihat Detail
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}
          {variant === "tutor" && plan.status === "upcoming" && (
            <Button size="sm" className="w-full" onClick={onStart}>
              <Play className="w-4 h-4 mr-2" />
              Mulai Kelas
            </Button>
          )}
          {variant === "tutor" && plan.status === "in-progress" && (
            <Button size="sm" className="w-full" onClick={onView}>
              Lanjutkan
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {variant === "parent" && (
            <Button variant="ghost" size="sm" className="w-full" onClick={onView}>
              Lihat Detail Kegiatan
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
