import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";

interface Tutor {
  id: string;
  name: string;
  avatar?: string;
  className: string;
  kpiScore: number;
  studentsCount: number;
  status: "active" | "busy" | "offline";
}

interface TutorListWidgetProps {
  tutors: Tutor[];
}

const statusConfig = {
  active: { label: "Aktif", className: "bg-green-500" },
  busy: { label: "Sibuk", className: "bg-orange-500" },
  offline: { label: "Offline", className: "bg-muted-foreground" },
};

export function TutorListWidget({ tutors }: TutorListWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Daftar Tutor
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {tutors.length} tutor
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {tutors.slice(0, 4).map((tutor) => (
          <div
            key={tutor.id}
            className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                  <AvatarImage src={tutor.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                    {tutor.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${statusConfig[tutor.status].className}`}
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm truncate">{tutor.name}</p>
                <p className="text-xs text-muted-foreground truncate">{tutor.className}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">KPI</p>
                <div className="flex items-center gap-1">
                  <Progress value={tutor.kpiScore} className="w-12 h-1.5" />
                  <span className="text-xs font-medium">{tutor.kpiScore}%</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {tutor.studentsCount} siswa
              </Badge>
            </div>
          </div>
        ))}
        <Link href="/tutors">
          <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-9">
            Lihat Semua Tutor
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
