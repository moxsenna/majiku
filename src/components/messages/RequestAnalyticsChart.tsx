import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

interface RequestAnalyticsChartProps {
  labelCounts: Record<string, number>;
}

const COLORS: Record<string, string> = {
  "Pembayaran": "hsl(40, 80%, 50%)",
  "Ketersediaan": "hsl(210, 70%, 50%)",
  "Keluhan": "hsl(0, 70%, 55%)",
  "Info Umum": "hsl(150, 60%, 45%)",
  "Request Khusus": "hsl(270, 60%, 55%)",
  "Jadwal": "hsl(190, 70%, 45%)",
};

export function RequestAnalyticsChart({ labelCounts }: RequestAnalyticsChartProps) {
  const data = Object.entries(labelCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Analitik Request
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(value: number) => [`${value} percakapan`, "Jumlah"]}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] || "hsl(var(--primary))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
