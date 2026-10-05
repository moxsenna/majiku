import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, FileCheck, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface PendingReport {
  id: string;
  studentName: string;
  studentAvatar?: string;
  tutorName: string;
  className: string;
  submittedAt: string;
  type: "meal" | "nap" | "activity" | "mood" | "incident";
}

interface PendingReportsWidgetProps {
  reports: PendingReport[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const typeLabels = {
  meal: "Makan",
  nap: "Tidur",
  activity: "Aktivitas",
  mood: "Mood",
  incident: "Insiden",
};

export function PendingReportsWidget({ reports, onApprove, onReject }: PendingReportsWidgetProps) {
  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-orange-500" />
            Laporan Menunggu Review
          </CardTitle>
          <Badge variant="destructive" className="text-xs">
            {reports.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {reports.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Semua laporan sudah direview</p>
          </div>
        ) : (
          <>
            {reports.slice(0, 3).map((report) => (
              <div
                key={report.id}
                className="p-3 rounded-xl bg-background border border-border hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={report.studentAvatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {report.studentName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{report.studentName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        oleh {report.tutorName} • {report.className}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0 hidden sm:flex">
                    {typeLabels[report.type]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{report.submittedAt}</span>
                    </div>
                    <Badge variant="outline" className="text-xs sm:hidden">
                      {typeLabels[report.type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onReject?.(report.id)}
                    >
                      <XCircle className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onApprove?.(report.id)}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/reports/pending">
              <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-9">
                Lihat Semua ({reports.length} laporan)
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
