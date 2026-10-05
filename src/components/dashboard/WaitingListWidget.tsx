import { useQuery } from "@tanstack/react-query";
import { getWaitingList } from "@/server/actions/waitingList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, AlertCircle, Bell, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export function WaitingListWidget() {
  const { data: waitingList = [] } = useQuery({
    queryKey: ["waiting-list-stats"],
    queryFn: getWaitingList,
  });

  const stats = {
    waiting: waitingList.filter((w) => w.status === "waiting").length,
    notified: waitingList.filter((w) => w.status === "notified").length,
    confirmed: waitingList.filter((w) => w.status === "confirmed").length,
    total: waitingList.length,
  };

  const conversionRate = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Waiting List</h3>
          </div>
          <Link href="/crm">
            <Button variant="ghost" size="sm" className="h-7 text-xs">Lihat</Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 rounded-lg bg-warning/10">
            <Clock className="h-3.5 w-3.5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.waiting}</p>
            <p className="text-[10px] text-muted-foreground">Menunggu</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-info/10">
            <Bell className="h-3.5 w-3.5 text-info mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.notified}</p>
            <p className="text-[10px] text-muted-foreground">Diberitahu</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-success/10">
            <CheckCircle2 className="h-3.5 w-3.5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.confirmed}</p>
            <p className="text-[10px] text-muted-foreground">Konfirmasi</p>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Konversi</span>
            <span className="text-xs font-medium">{conversionRate}%</span>
          </div>
          <Progress value={conversionRate} className="h-1.5" />
        </div>

        {stats.waiting > 5 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0" />
            <p className="text-xs text-warning">Waiting list tinggi! {stats.waiting} anak menunggu slot.</p>
          </div>
        )}

        {/* Recent waiting entries */}
        <div className="mt-3 space-y-1.5">
          {waitingList.filter((w) => w.status === "waiting").slice(0, 3).map((w) => (
            <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{w.student_name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{w.classes?.name}</p>
              </div>
              <Badge variant="warning" className="text-[10px] shrink-0">Menunggu</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
