"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  LogIn, 
  LogOut, 
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AttendanceEntry {
  id: string;
  studentName: string;
  studentAvatar?: string;
  className: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: "present" | "absent" | "late" | "pending";
}

interface AttendanceWidgetProps {
  entries: AttendanceEntry[];
  totalStudents: number;
  presentCount: number;
}

export function AttendanceWidget({ entries, totalStudents, presentCount }: AttendanceWidgetProps) {
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  const { toast } = useToast();
  const router = useRouter();

  const handleScanQR = () => {
    toast({
      title: "QR Scanner",
      description: "Membuka QR Scanner untuk absensi siswa...",
    });
    router.push("/attendance");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-6">
        <div>
          <CardTitle className="text-sm sm:text-base">Kehadiran Hari Ini</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {presentCount} dari {totalStudents} siswa hadir
          </p>
        </div>
        <Button variant="soft" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 shrink-0" onClick={handleScanQR}>
          <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Scan</span> QR
        </Button>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        {/* Progress bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between text-xs sm:text-sm mb-2">
            <span className="text-muted-foreground">Tingkat Kehadiran</span>
            <span className="font-semibold text-foreground">{attendanceRate}%</span>
          </div>
          <div className="h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>

        {/* Recent check-ins */}
        {entries.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg">
            Belum ada catatan absensi hari ini.
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {entries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-start sm:items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-2"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Avatar size="sm" className="shrink-0">
                    <AvatarImage src={entry.studentAvatar} />
                    <AvatarFallback>
                      {entry.studentName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-foreground truncate">
                      {entry.studentName}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{entry.className}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0 flex-wrap justify-end">
                  {entry.checkInTime && (
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-success">
                      <LogIn className="h-3 w-3" />
                      {entry.checkInTime}
                    </div>
                  )}
                  {entry.checkOutTime && (
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                      <LogOut className="h-3 w-3" />
                      {entry.checkOutTime}
                    </div>
                  )}
                  <Badge variant={entry.status} className="text-[10px] sm:text-xs">{entry.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/attendance">
          <Button variant="outline" className="w-full mt-3 sm:mt-4 text-xs sm:text-sm">
            Lihat Semua Kehadiran
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
