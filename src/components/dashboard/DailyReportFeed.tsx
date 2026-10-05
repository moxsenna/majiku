import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Utensils,
  Moon,
  Smile,
  AlertCircle,
  Image as ImageIcon,
  Heart,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface DailyReportItem {
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
}

const typeIcons = {
  meal: Utensils,
  nap: Moon,
  mood: Smile,
  incident: AlertCircle,
  activity: Heart,
  photo: ImageIcon,
};

const typeColors = {
  meal: "bg-success/10 text-success",
  nap: "bg-info/10 text-info",
  mood: "bg-highlight/10 text-highlight-foreground",
  incident: "bg-destructive/10 text-destructive",
  activity: "bg-primary/10 text-primary",
  photo: "bg-secondary text-secondary-foreground",
};

const typeBadges = {
  meal: "success",
  nap: "info",
  mood: "highlight",
  incident: "destructive",
  activity: "default",
  photo: "secondary",
} as const;

interface DailyReportFeedProps {
  reports: DailyReportItem[];
}

export function DailyReportFeed({ reports }: DailyReportFeedProps) {
  const { toast } = useToast();

  const handleLike = (studentName: string) => {
    toast({
      title: "Disukai! ❤️",
      description: `Anda menyukai laporan ${studentName}`,
    });
  };

  const handleComment = (studentName: string) => {
    toast({
      title: "Komentar",
      description: `Membuka komentar untuk laporan ${studentName}...`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-base">Aktivitas Hari Ini</CardTitle>
        <Link href="/daily-reports">
          <Button variant="soft" size="sm" className="text-xs sm:text-sm">
            Lihat Semua
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="relative p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-3 sm:space-y-4 feed-timeline pl-3 sm:pl-4">
          {reports.map((report) => {
            const Icon = typeIcons[report.type];
            return (
              <div key={report.id} className="relative flex gap-3 sm:gap-4 pb-3 sm:pb-4">
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute left-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center -translate-x-1/2 z-10 ring-2 sm:ring-4 ring-background",
                    typeColors[report.type]
                  )}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 ml-6 sm:ml-8 bg-muted/30 rounded-xl p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Avatar size="sm" className="shrink-0">
                        <AvatarImage src={report.studentAvatar} />
                        <AvatarFallback>
                          {report.studentName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-xs sm:text-sm truncate">
                          {report.studentName}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {report.className} • {report.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant={typeBadges[report.type]} className="shrink-0 text-[10px] sm:text-xs">{report.title}</Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/80 mb-2 sm:mb-3">
                    {report.description}
                  </p>

                  {report.imageUrl && (
                    <div className="rounded-lg overflow-hidden mb-2 sm:mb-3">
                      <img
                        src={report.imageUrl}
                        alt={report.title}
                        className="w-full h-32 sm:h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      Dicatat oleh: {report.staffName}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => handleLike(report.studentName)}
                      >
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => handleComment(report.studentName)}
                      >
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
