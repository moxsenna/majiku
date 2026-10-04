import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target } from "lucide-react";

interface TargetProgressWidgetProps {
  totalRevenue: number;
  targetRevenue: number;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`;
  }
  return `Rp ${(amount / 1000).toFixed(0)}K`;
};

export function TargetProgressWidget({ totalRevenue, targetRevenue }: TargetProgressWidgetProps) {
  const progress = Math.round((totalRevenue / targetRevenue) * 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Target className="w-4 h-4" />
            Target Pendapatan
          </CardTitle>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <Progress value={progress} className="h-3 mb-3" />
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Tercapai</p>
            <p className="font-semibold text-foreground">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Target</p>
            <p className="font-semibold text-foreground">{formatCurrency(targetRevenue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
