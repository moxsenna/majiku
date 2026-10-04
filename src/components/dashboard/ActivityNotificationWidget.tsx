import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, BookOpen, ChevronRight, Clock, 
  Sparkles, Play, Music, Palette, Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityNotification {
  id: string;
  title: string;
  subject: string;
  time: string;
  status: "upcoming" | "in-progress" | "completed";
  description?: string;
  tutor: {
    name: string;
    avatar?: string;
  };
}

interface ActivityNotificationWidgetProps {
  activities: ActivityNotification[];
  childName: string;
  onViewDetail?: (id: string) => void;
}

const subjectIcons: Record<string, any> = {
  "Matematika": Calculator,
  "Musik": Music,
  "Seni": Palette,
  "Montessori": Sparkles,
  "default": BookOpen,
};

const statusConfig = {
  upcoming: { 
    label: "Akan Dimulai", 
    className: "bg-info/10 text-info border-info/20",
    dotColor: "bg-info"
  },
  "in-progress": { 
    label: "Sedang Berlangsung", 
    className: "bg-success/10 text-success border-success/20 animate-pulse",
    dotColor: "bg-success animate-pulse"
  },
  completed: { 
    label: "Selesai", 
    className: "bg-muted text-muted-foreground border-border",
    dotColor: "bg-muted-foreground"
  },
};

export function ActivityNotificationWidget({ 
  activities, 
  childName,
  onViewDetail 
}: ActivityNotificationWidgetProps) {
  const inProgressActivity = activities.find(a => a.status === "in-progress");
  const upcomingActivities = activities.filter(a => a.status === "upcoming");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Kegiatan {childName} Hari Ini
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {activities.length} kegiatan
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Current Activity Highlight */}
        {inProgressActivity && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <Badge variant="outline" className={statusConfig["in-progress"].className}>
                  {statusConfig["in-progress"].label}
                </Badge>
                <h4 className="font-semibold text-foreground mt-1">{inProgressActivity.title}</h4>
                <p className="text-sm text-muted-foreground">{inProgressActivity.subject}</p>
                {inProgressActivity.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {inProgressActivity.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={inProgressActivity.tutor.avatar} />
                    <AvatarFallback className="text-[10px]">
                      {inProgressActivity.tutor.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {inProgressActivity.tutor.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Activities */}
        {upcomingActivities.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Kegiatan Selanjutnya
            </p>
            {upcomingActivities.slice(0, 3).map((activity) => {
              const IconComponent = subjectIcons[activity.subject] || subjectIcons.default;
              return (
                <div 
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer"
                  onClick={() => onViewDetail?.(activity.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.subject}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline for all activities */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Jadwal Lengkap
          </p>
          <div className="relative pl-4 space-y-3">
            {/* Timeline line */}
            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-border"></div>
            
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-start gap-3">
                {/* Timeline dot */}
                <div className={cn(
                  "absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 border-background",
                  statusConfig[activity.status].dotColor
                )}></div>
                
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div>
                    <p className={cn(
                      "text-sm",
                      activity.status === "completed" 
                        ? "text-muted-foreground line-through" 
                        : "text-foreground font-medium"
                    )}>
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs ml-2", statusConfig[activity.status].className)}
                  >
                    {statusConfig[activity.status].label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button variant="ghost" className="w-full" onClick={() => onViewDetail?.("all")}>
          Lihat Detail Semua Kegiatan
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
