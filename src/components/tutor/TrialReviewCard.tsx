"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  ClipboardCheck,
  Send,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { markTrialAwaitingReview, type TrialQueueRow } from "@/server/actions/trial";
import { submitTrialReview } from "@/server/actions/trialProcedures";

interface TrialReviewCardProps {
  trial: TrialQueueRow;
}

const programLabels: Record<string, string> = {
  toddler: "Toddler",
  playgroup: "Playgroup",
  kindergarten: "TK A & B",
  daycare: "Daycare Full Day",
};

const statusBadgeConfig: Record<
  string,
  { label: string; variant: "info" | "warning" | "destructive" | "default" }
> = {
  scheduled: { label: "Trial Dijadwalkan", variant: "info" },
  awaiting_review: { label: "Menunggu Review Tutor", variant: "warning" },
  repeat_trial: { label: "Trial Ulang", variant: "destructive" },
};

function calculateAge(birthDate?: string | null): string {
  if (!birthDate) return "-";
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return "-";
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years <= 0) {
    return `${Math.max(0, months)} bulan`;
  }
  if (months === 0) {
    return `${years} tahun`;
  }
  return `${years} th ${months} bln`;
}

type RecommendationValue = "suitable" | "repeat_trial" | "not_suitable";

const RECOMMENDATION_OPTIONS: {
  value: RecommendationValue;
  label: string;
  description: string;
}[] = [
  {
    value: "suitable",
    label: "Cocok — Rekomendasikan",
    description: "Anak dapat beradaptasi dengan baik dan siap bergabung dengan kelas.",
  },
  {
    value: "repeat_trial",
    label: "Perlu Trial Ulang",
    description: "Perlu 1 sesi tambahan untuk evaluasi kenyamanan dan adaptasi anak.",
  },
  {
    value: "not_suitable",
    label: "Belum Cocok",
    description: "Kebutuhan anak saat ini belum sesuai dengan program yang dipilih.",
  },
];

export function TrialReviewCard({ trial }: TrialReviewCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isFormOpen, setIsFormOpen] = useState(
    trial.status === "awaiting_review" || trial.status === "repeat_trial"
  );
  const [recommendation, setRecommendation] = useState<RecommendationValue>(
    (trial.recommendation as RecommendationValue) || "suitable"
  );
  const [notes, setNotes] = useState(trial.observationNotes || "");
  const [notesError, setNotesError] = useState("");

  const programName =
    (trial.programKey && programLabels[trial.programKey]) ||
    trial.programKey?.toUpperCase() ||
    "Program Trial";

  const badgeInfo = statusBadgeConfig[trial.status] || {
    label: trial.status,
    variant: "default" as const,
  };

  const formattedSchedule = trial.trialScheduledAt
    ? format(new Date(trial.trialScheduledAt), "EEEE, d MMMM yyyy 'pukul' HH:mm", {
        locale: idLocale,
      })
    : "Belum dijadwalkan";

  const handleMarkCompleted = () => {
    startTransition(async () => {
      try {
        await markTrialAwaitingReview(trial.id);
        toast({
          title: "Sesi trial selesai",
          description: "Status berhasil diubah ke Menunggu Review.",
        });
        router.refresh();
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memperbarui status";
        toast({
          title: "Gagal menandai sesi",
          description: errorMsg,
          variant: "destructive",
        });
      }
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setNotesError("Catatan observasi wajib diisi");
      toast({
        title: "Validasi gagal",
        description: "Catatan observasi wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setNotesError("");
    startTransition(async () => {
      try {
        await submitTrialReview(trial.id, recommendation, notes.trim());
        toast({
          title: "Rekomendasi terkirim",
          description: `Rekomendasi observasi untuk ${trial.childName} berhasil disimpan.`,
        });
        router.refresh();
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengirim rekomendasi";
        toast({
          title: "Gagal mengirim rekomendasi",
          description: errorMsg,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="overflow-hidden border border-border shadow-xs hover:border-primary/40 transition-colors">
      <CardContent className="p-5 space-y-4">
        {/* Header row: Child info + Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-foreground">
                {trial.childName}
              </h3>
              {trial.childNickname && (
                <span className="text-sm font-medium text-muted-foreground">
                  ({trial.childNickname})
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                {calculateAge(trial.childBirthDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-primary mt-1">
              <span>{programName}</span>
              {trial.className && (
                <>
                  <span className="text-muted-foreground">&bull;</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {trial.className}
                  </span>
                </>
              )}
            </div>
          </div>
          <Badge variant={badgeInfo.variant} className="self-start">
            {badgeInfo.label}
          </Badge>
        </div>

        {/* Schedule & Parent info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-muted/40 p-3 rounded-lg border border-border/40">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              Jadwal:{" "}
              <strong className="text-foreground font-medium">
                {formattedSchedule}
              </strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {trial.parentName && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  Ortu:{" "}
                  <strong className="text-foreground font-medium">
                    {trial.parentName}
                  </strong>
                </span>
              </div>
            )}
            {trial.parentPhone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <a
                  href={`tel:${trial.parentPhone}`}
                  className="font-medium text-primary hover:underline"
                >
                  {trial.parentPhone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Highlight Allergy & Medical Notes */}
        {(trial.allergies || trial.medicalNotes) && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/25 p-3 text-destructive space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <span>Perhatian Khusus / Catatan Medis</span>
            </div>
            {trial.allergies && (
              <div className="text-xs pl-6 text-destructive/90">
                <span className="font-semibold">Alergi:</span> {trial.allergies}
              </div>
            )}
            {trial.medicalNotes && (
              <div className="text-xs pl-6 text-destructive/90">
                <span className="font-semibold">Catatan Kesehatan:</span>{" "}
                {trial.medicalNotes}
              </div>
            )}
          </div>
        )}

        {/* Action button for scheduled */}
        {trial.status === "scheduled" && (
          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              onClick={handleMarkCompleted}
              disabled={isPending}
              className="gap-2 w-full sm:w-auto"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Tandai Sesi Selesai
            </Button>
          </div>
        )}

        {/* Action button & form for awaiting_review or repeat_trial */}
        {(trial.status === "awaiting_review" ||
          trial.status === "repeat_trial") && (
          <div className="pt-2 space-y-3 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {trial.status === "repeat_trial"
                  ? "Sesi trial ulang memerlukan observasi baru."
                  : "Sesi selesai. Lengkapi catatan dan rekomendasi."}
              </div>
              <Button
                type="button"
                variant={isFormOpen ? "outline" : "default"}
                size="sm"
                onClick={() => setIsFormOpen((prev) => !prev)}
                className="gap-1.5"
              >
                <ClipboardCheck className="h-4 w-4" />
                {isFormOpen ? "Tutup Form" : "Isi Hasil Observasi"}
                {isFormOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>

            {isFormOpen && (
              <form
                onSubmit={handleSubmitReview}
                className="space-y-4 pt-2 bg-muted/20 p-4 rounded-lg border border-border"
              >
                {/* Recommendation Radio Group */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Rekomendasi Tutor <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={recommendation}
                    onValueChange={(val) =>
                      setRecommendation(val as RecommendationValue)
                    }
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                  >
                    {RECOMMENDATION_OPTIONS.map((opt) => {
                      const isSelected = recommendation === opt.value;
                      return (
                        <label
                          key={opt.value}
                          htmlFor={`rec-${trial.id}-${opt.value}`}
                          className={`flex flex-col gap-1 p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/5 border-primary shadow-xs"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem
                              value={opt.value}
                              id={`rec-${trial.id}-${opt.value}`}
                            />
                            <span className="text-xs font-bold text-foreground">
                              {opt.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground pl-6">
                            {opt.description}
                          </span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Observation notes */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor={`notes-${trial.id}`}
                      className="text-xs font-semibold text-foreground"
                    >
                      Catatan Observasi <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      Wajib diisi
                    </span>
                  </div>
                  <Textarea
                    id={`notes-${trial.id}`}
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      if (notesError && e.target.value.trim()) {
                        setNotesError("");
                      }
                    }}
                    placeholder="Tuliskan hasil observasi perilaku anak, respon instruksi, kemampuan sosialisasi, dan kemandirian selama sesi trial..."
                    rows={4}
                    disabled={isPending}
                    className={notesError ? "border-destructive" : ""}
                  />
                  {notesError && (
                    <p className="text-xs font-medium text-destructive">
                      {notesError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setIsFormOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="gap-2"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Kirim Rekomendasi
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TrialReviewCard;
