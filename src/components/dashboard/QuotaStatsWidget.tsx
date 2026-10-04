import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";

interface ClassQuota {
  id: string;
  className: string;
  studentsCount: number;
  capacity: number;
  color: string;
}

interface QuotaStatsWidgetProps {
  classQuotas: ClassQuota[];
}

export function QuotaStatsWidget({ classQuotas }: QuotaStatsWidgetProps) {
  const sortedByQuota = [...classQuotas].sort(
    (a, b) => b.studentsCount / b.capacity - a.studentsCount / a.capacity
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4 text-blue-500" />
          Kuota Terisi Terbanyak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedByQuota.slice(0, 3).map((cls) => {
          const percentage = Math.round((cls.studentsCount / cls.capacity) * 100);
          const isFull = percentage >= 100;

          return (
            <div key={cls.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="text-sm font-medium truncate">{cls.className}</span>
                  {isFull && (
                    <Badge variant="destructive" className="text-xs">
                      Penuh
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-bold text-foreground">
                  {cls.studentsCount}/{cls.capacity} ({percentage}%)
                </span>
              </div>
              <Progress 
                value={percentage} 
                className={`h-2 ${isFull ? '[&>div]:bg-red-500' : ''}`} 
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
