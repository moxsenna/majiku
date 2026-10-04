import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, BookOpen, ChevronRight, Bell, 
  Sparkles, Music, Palette, Calculator
} from "lucide-react";

interface ScheduledActivity {
  id: string;
  title: string;
  subject: string;
  time: string;
  date: string;
  isToday: boolean;
  isTomorrow: boolean;
  icon: string;
}

const scheduledActivities: ScheduledActivity[] = [
  {
    id: "1",
    title: "Montessori - Berhitung 1-10",
    subject: "Matematika",
    time: "08:00 - 10:00",
    date: "Hari Ini",
    isToday: true,
    isTomorrow: false,
    icon: "math",
  },
  {
    id: "2",
    title: "Sensori - Mengenal Tekstur",
    subject: "Sensori",
    time: "10:30 - 11:30",
    date: "Hari Ini",
    isToday: true,
    isTomorrow: false,
    icon: "sensory",
  },
  {
    id: "3",
    title: "Seni - Finger Painting",
    subject: "Seni",
    time: "08:00 - 09:00",
    date: "Besok",
    isToday: false,
    isTomorrow: true,
    icon: "art",
  },
  {
    id: "4",
    title: "Musik - Bernyanyi Bersama",
    subject: "Musik",
    time: "09:30 - 10:00",
    date: "Besok",
    isToday: false,
    isTomorrow: true,
    icon: "music",
  },
];

const getSubjectIcon = (icon: string) => {
  switch (icon) {
    case "math":
      return <Calculator className="w-4 h-4" />;
    case "sensory":
      return <Sparkles className="w-4 h-4" />;
    case "art":
      return <Palette className="w-4 h-4" />;
    case "music":
      return <Music className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

const getSubjectColor = (icon: string) => {
  switch (icon) {
    case "math":
      return "bg-blue-500/10 text-blue-600";
    case "sensory":
      return "bg-purple-500/10 text-purple-600";
    case "art":
      return "bg-pink-500/10 text-pink-600";
    case "music":
      return "bg-orange-500/10 text-orange-600";
    default:
      return "bg-primary/10 text-primary";
  }
};

export function ParentActivityWidget() {
  const todayActivities = scheduledActivities.filter(a => a.isToday);
  const tomorrowActivities = scheduledActivities.filter(a => a.isTomorrow);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Jadwal Kegiatan
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Activities */}
        {todayActivities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary text-primary-foreground">Hari Ini</Badge>
            </div>
            <div className="space-y-2">
              {todayActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="p-3 rounded-xl bg-primary/5 border border-primary/10"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSubjectColor(activity.icon)}`}>
                      {getSubjectIcon(activity.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.subject}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tomorrow's Activities */}
        {tomorrowActivities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">Besok</Badge>
            </div>
            <div className="space-y-2">
              {tomorrowActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="p-3 rounded-xl bg-muted/50 border border-border/50"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSubjectColor(activity.icon)}`}>
                      {getSubjectIcon(activity.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.subject}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center pt-2">
          Anda akan mendapat notifikasi sehari sebelum kegiatan dimulai
        </p>
      </CardContent>
    </Card>
  );
}
