import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingUp, Award, Calendar } from "lucide-react";

interface TutorEarningsWidgetProps {
  baseSalary: number;
  sessionEarnings: number;
  sessionsCompleted: number;
  kpiScore: number;
  kpiBonus: number;
  totalEarnings: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function TutorEarningsWidget({
  baseSalary,
  sessionEarnings,
  sessionsCompleted,
  kpiScore,
  kpiBonus,
  totalEarnings,
}: TutorEarningsWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Penghasilan Bulan Ini
          </CardTitle>
          <Badge variant="secondary">Desember 2024</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Earnings Highlight */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <p className="text-sm text-primary-foreground/80 mb-1">Total Penghasilan</p>
          <p className="text-3xl font-bold">{formatCurrency(totalEarnings)}</p>
        </div>

        {/* Earnings Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Gaji Pokok</p>
                <p className="text-xs text-muted-foreground">Bulanan</p>
              </div>
            </div>
            <p className="font-semibold">{formatCurrency(baseSalary)}</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Pendapatan Sesi</p>
                <p className="text-xs text-muted-foreground">{sessionsCompleted} sesi selesai</p>
              </div>
            </div>
            <p className="font-semibold">{formatCurrency(sessionEarnings)}</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Bonus KPI</p>
                <div className="flex items-center gap-2">
                  <Progress value={kpiScore} className="w-16 h-1.5" />
                  <span className="text-xs text-muted-foreground">{kpiScore}%</span>
                </div>
              </div>
            </div>
            <p className="font-semibold text-green-600">+{formatCurrency(kpiBonus)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
