import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp } from "lucide-react";

interface ClassRevenue {
  id: string;
  className: string;
  revenue: number;
  color: string;
}

interface TopRevenueWidgetProps {
  classRevenues: ClassRevenue[];
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`;
  }
  return `Rp ${(amount / 1000).toFixed(0)}K`;
};

export function TopRevenueWidget({ classRevenues }: TopRevenueWidgetProps) {
  const sortedByRevenue = [...classRevenues].sort((a, b) => b.revenue - a.revenue);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Award className="w-4 h-4 text-amber-500" />
          Pendapatan Terbanyak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedByRevenue.slice(0, 3).map((cls, index) => (
          <div
            key={cls.id}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cls.color }}
              />
              <span className="text-sm font-medium truncate">{cls.className}</span>
              {index === 0 && (
                <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                  #1
                </Badge>
              )}
            </div>
            <span className="text-sm font-bold text-foreground">{formatCurrency(cls.revenue)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
