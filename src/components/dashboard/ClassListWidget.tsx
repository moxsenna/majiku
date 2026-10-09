import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, GraduationCap, Users } from "lucide-react";
import Link from "next/link";

interface ClassItem {
  id: string;
  name: string;
  tutorName: string;
  studentsCount: number;
  capacity: number;
  color: string;
}

interface ClassListWidgetProps {
  classes: ClassItem[];
}

export function ClassListWidget({ classes }: ClassListWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Daftar Kelas
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {classes.length} kelas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {classes.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
            Belum ada kelas terdaftar.
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${cls.color}20` }}
                >
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: cls.color }} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{cls.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{cls.tutorName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">
                    {cls.studentsCount}/{cls.capacity}
                  </span>
                </div>
                {cls.studentsCount >= cls.capacity && (
                  <Badge variant="destructive" className="text-xs">Penuh</Badge>
                )}
              </div>
            </div>
          ))
        )}
        <Link href="/classes">
          <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-9">
            Kelola Kelas
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
