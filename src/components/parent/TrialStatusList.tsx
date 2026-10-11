import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar, User, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TrialApplicationRow } from "@/server/actions/trial";

interface TrialStatusListProps {
  applications: TrialApplicationRow[];
}

const programLabels: Record<string, string> = {
  toddler: "Program Toddler",
  playgroup: "Playgroup",
  kindergarten: "TK A & B",
  daycare: "Daycare Full Day",
};

const statusBadgeConfig: Record<
  string,
  { label: string; variant: "secondary" | "info" | "warning" | "default" | "success" | "destructive" }
> = {
  submitted: { label: "Calon Murid", variant: "secondary" },
  scheduled: { label: "Trial Dijadwalkan", variant: "info" },
  awaiting_review: { label: "Menunggu Review Tutor", variant: "warning" },
  recommended: { label: "Direkomendasikan", variant: "default" },
  admitted: { label: "Diterima", variant: "success" },
  repeat_trial: { label: "Perlu Trial Ulang", variant: "warning" },
  not_suitable: { label: "Tidak Lanjut", variant: "destructive" },
};

function getNextDecisionText(status: string, scheduledAt: Date | string | null): string {
  switch (status) {
    case "submitted":
      return "Menunggu dijadwalkan admin";
    case "scheduled":
      return `Trial dijadwalkan ${
        scheduledAt ? format(new Date(scheduledAt), "d MMMM yyyy, HH:mm", { locale: idLocale }) : "-"
      }`;
    case "awaiting_review":
      return "Menunggu catatan hasil observasi tutor";
    case "recommended":
      return "Direkomendasikan — menunggu keputusan admin";
    case "admitted":
      return "Diterima! Selamat bergabung";
    case "repeat_trial":
      return "Perlu trial ulang — hubungi admin";
    case "not_suitable":
      return "Belum sesuai — hubungi admin untuk tindak lanjut";
    default:
      return "-";
  }
}

export function TrialStatusList({ applications }: TrialStatusListProps) {
  if (!applications || applications.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <AlertCircle className="h-5 w-5 text-primary" />
          </div>
          <h4 className="font-semibold text-foreground text-sm">Belum Ada Pengajuan Trial</h4>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Daftarkan buah hati Anda untuk mengikuti sesi trial dan mengenal lingkungan belajar kami.
          </p>
          <Link href="/parent/registration">
            <Button size="sm" className="gap-2">
              Daftar Trial Sekarang
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const programName =
          app.className ||
          (app.programKey && !isUUID.test(app.programKey)
            ? programLabels[app.programKey] || app.programKey
            : "Program Trial");
        const badgeInfo = statusBadgeConfig[app.status] || {
          label: app.status,
          variant: "secondary" as const,
        };
        const nextDecision = getNextDecisionText(app.status, app.trialScheduledAt);
        const submissionDate = app.createdAt
          ? format(new Date(app.createdAt), "d MMMM yyyy", { locale: idLocale })
          : "-";

        return (
          <Card key={app.id} className="overflow-hidden border border-border shadow-xs">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-foreground text-base">
                    {app.childName}
                    {app.childNickname ? (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        ({app.childNickname})
                      </span>
                    ) : null}
                  </h4>
                  <p className="text-xs font-medium text-primary mt-0.5">{programName}</p>
                </div>
                <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Diajukan: {submissionDate}</span>
                </div>
                {app.className && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Kelas: {app.className}</span>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-muted/50 p-2.5 text-xs text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">{nextDecision}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default TrialStatusList;
