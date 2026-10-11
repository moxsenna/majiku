"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ScheduleTrialDialog } from "@/components/crm/ScheduleTrialDialog";
import { admitTrial } from "@/server/actions/trialProcedures";
import type {
  TrialPipelineRow,
  SchedulingOptions,
} from "@/server/actions/trial";
import {
  Search,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  ChevronRight,
  Clock,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  GraduationCap,
  UserCheck,
  Loader2,
  User,
  AlertTriangle,
  Heart,
} from "lucide-react";

interface PipelineStage {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  matchStatuses: string[];
  icon: typeof Users;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "submitted",
    label: "Calon Murid",
    shortLabel: "Calon",
    color: "bg-blue-500",
    matchStatuses: ["submitted"],
    icon: Users,
  },
  {
    id: "scheduled",
    label: "Trial Dijadwalkan",
    shortLabel: "Jadwal",
    color: "bg-purple-500",
    matchStatuses: ["scheduled"],
    icon: Calendar,
  },
  {
    id: "awaiting_review",
    label: "Menunggu Review Tutor",
    shortLabel: "Review",
    color: "bg-amber-500",
    matchStatuses: ["awaiting_review"],
    icon: Clock,
  },
  {
    id: "recommended",
    label: "Direkomendasikan",
    shortLabel: "Cocok",
    color: "bg-emerald-500",
    matchStatuses: ["recommended"],
    icon: CheckCircle2,
  },
  {
    id: "admitted",
    label: "Diterima",
    shortLabel: "Diterima",
    color: "bg-green-600",
    matchStatuses: ["admitted"],
    icon: GraduationCap,
  },
  {
    id: "not_continued",
    label: "Tidak Lanjut",
    shortLabel: "Tdk Lanjut",
    color: "bg-rose-500",
    matchStatuses: ["repeat_trial", "not_suitable"],
    icon: XCircle,
  },
];

function calculateAge(birthDate?: string | null): string {
  if (!birthDate) return "-";
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${Math.max(0, age)} th`;
}

function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export interface CRMProps {
  pipeline: TrialPipelineRow[];
  schedulingOptions: SchedulingOptions;
}

export default function CRM({ pipeline = [], schedulingOptions }: CRMProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");

  // Dialog states
  const [selectedTrial, setSelectedTrial] = useState<TrialPipelineRow | null>(null);
  const [schedulingTrial, setSchedulingTrial] = useState<TrialPipelineRow | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [admittingTrial, setAdmittingTrial] = useState<TrialPipelineRow | null>(null);
  const [admitAlertOpen, setAdmitAlertOpen] = useState(false);
  const [isAdmitting, setIsAdmitting] = useState(false);

  // Client-side filter
  const filteredTrials = pipeline.filter((trial) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      trial.childName.toLowerCase().includes(q) ||
      (trial.childNickname && trial.childNickname.toLowerCase().includes(q)) ||
      (trial.parentName && trial.parentName.toLowerCase().includes(q)) ||
      (trial.parentPhone && trial.parentPhone.includes(q)) ||
      (trial.programKey && trial.programKey.toLowerCase().includes(q)) ||
      (trial.className && trial.className.toLowerCase().includes(q)) ||
      (trial.tutorName && trial.tutorName.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (selectedStageFilter === "all") return true;

    const currentStage = PIPELINE_STAGES.find((s) => s.id === selectedStageFilter);
    if (!currentStage) return true;
    return currentStage.matchStatuses.includes(trial.status);
  });

  const getTrialsByStage = (stageId: string) => {
    const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
    if (!stage) return [];
    return filteredTrials.filter((trial) => stage.matchStatuses.includes(trial.status));
  };

  // Stats
  const stats = {
    total: pipeline.length,
    submitted: pipeline.filter((t) => t.status === "submitted").length,
    activeTrial: pipeline.filter(
      (t) => t.status === "scheduled" || t.status === "awaiting_review"
    ).length,
    recommended: pipeline.filter((t) => t.status === "recommended").length,
    admitted: pipeline.filter((t) => t.status === "admitted").length,
  };

  const handleAdmitConfirm = async () => {
    if (!admittingTrial) return;
    setIsAdmitting(true);
    try {
      await admitTrial(admittingTrial.id);
      toast({
        title: "Calon murid diterima!",
        description: `${admittingTrial.childName} berhasil diterima dan didaftarkan ke kelas ${
          admittingTrial.className || "pilihan"
        }.`,
      });
      setAdmitAlertOpen(false);
      setSelectedTrial(null);
      router.refresh();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menerima calon murid";
      toast({
        title: "Gagal menerima calon murid",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsAdmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
              CRM & Pipeline Trial
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Kelola alur pendaftaran trial anak, seleksi observasi tutor & admisi kelas
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          <Card>
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    Total Pendaftaran
                  </p>
                  <p className="text-base sm:text-lg font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    Calon Murid
                  </p>
                  <p className="text-base sm:text-lg font-bold">{stats.submitted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10 shrink-0">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    Trial Berjalan
                  </p>
                  <p className="text-base sm:text-lg font-bold">{stats.activeTrial}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    Direkomendasikan
                  </p>
                  <p className="text-base sm:text-lg font-bold">{stats.recommended}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-green-600/10 shrink-0">
                  <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    Diterima
                  </p>
                  <p className="text-base sm:text-lg font-bold">{stats.admitted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama anak, program, ortu, telepon, tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Toggle and Filter for Pipeline */}
          <div className="flex items-center justify-between gap-2">
            <Select value={selectedStageFilter} onValueChange={setSelectedStageFilter}>
              <SelectTrigger className="w-[140px] sm:w-[160px] h-8 text-xs">
                <SelectValue placeholder="Semua Tahap" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahap</SelectItem>
                {PIPELINE_STAGES.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === "pipeline" ? "default" : "outline"}
                size="icon"
                className="w-8 h-8"
                onClick={() => setViewMode("pipeline")}
                title="Tampilan Kanban"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                className="w-8 h-8"
                onClick={() => setViewMode("list")}
                title="Tampilan Daftar"
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Pipeline Content */}
        <div className="mt-0">
            {viewMode === "pipeline" ? (
              <>
                {/* Mobile: Vertical Accordion Cards View */}
                <div className="block lg:hidden space-y-3">
                  {PIPELINE_STAGES.map((stage) => {
                    const stageTrials = getTrialsByStage(stage.id);
                    if (selectedStageFilter !== "all" && stage.id !== selectedStageFilter) {
                      return null;
                    }

                    return (
                      <Card key={stage.id}>
                        <CardHeader className="pb-2 px-3 pt-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                              <CardTitle className="text-sm font-medium">
                                {stage.label}
                              </CardTitle>
                              <Badge variant="secondary" className="text-[10px]">
                                {stageTrials.length}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="px-3 pb-3 space-y-2">
                          {stageTrials.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              Tidak ada pengajuan trial
                            </p>
                          ) : (
                            stageTrials.map((trial) => (
                              <div
                                key={trial.id}
                                className="p-2.5 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors space-y-2"
                                onClick={() => setSelectedTrial(trial)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Avatar className="w-8 h-8 shrink-0">
                                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                        {trial.childName.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {trial.childName}
                                        {trial.childNickname && (
                                          <span className="text-muted-foreground text-xs font-normal ml-1">
                                            ({trial.childNickname})
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {calculateAge(trial.childBirthDate)} &bull; Ortu:{" "}
                                        {trial.parentName || "-"}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] uppercase font-bold shrink-0 bg-primary/5 text-primary border-primary/20"
                                  >
                                    {trial.programKey}
                                  </Badge>
                                </div>

                                {(trial.className || trial.tutorName) && (
                                  <div className="bg-muted/40 rounded p-1.5 text-[11px] space-y-0.5">
                                    {trial.className && (
                                      <p className="text-muted-foreground truncate">
                                        Kelas:{" "}
                                        <strong className="text-foreground">
                                          {trial.className}
                                        </strong>
                                      </p>
                                    )}
                                    {trial.tutorName && (
                                      <p className="text-muted-foreground truncate">
                                        Tutor:{" "}
                                        <strong className="text-foreground">
                                          {trial.tutorName}
                                        </strong>
                                      </p>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                                  <span>
                                    {trial.trialScheduledAt
                                      ? `Jadwal: ${formatDateTime(trial.trialScheduledAt)}`
                                      : `Diajukan: ${formatDate(trial.createdAt)}`}
                                  </span>
                                  {trial.parentPhone && (
                                    <span className="text-[10px]">{trial.parentPhone}</span>
                                  )}
                                </div>

                                {stage.id === "scheduled" && (
                                  <p className="text-[10px] italic text-purple-600 dark:text-purple-300">
                                    Menunggu tutor menandai selesai
                                  </p>
                                )}
                                {stage.id === "awaiting_review" && (
                                  <p className="text-[10px] italic text-amber-600 dark:text-amber-300">
                                    Menunggu catatan review tutor
                                  </p>
                                )}
                                {stage.id === "not_continued" && (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                      trial.status === "repeat_trial"
                                        ? "bg-amber-500/10 text-amber-700 border-amber-300"
                                        : "bg-rose-500/10 text-rose-700 border-rose-300"
                                    }`}
                                  >
                                    {trial.status === "repeat_trial"
                                      ? "Perlu Trial Ulang"
                                      : "Belum Sesuai"}
                                  </Badge>
                                )}

                                {/* Action Buttons Mobile */}
                                {stage.id === "submitted" && (
                                  <Button
                                    size="sm"
                                    className="w-full h-7 text-xs gap-1 mt-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSchedulingTrial(trial);
                                      setScheduleDialogOpen(true);
                                    }}
                                  >
                                    <Calendar className="w-3 h-3" />
                                    Jadwalkan
                                  </Button>
                                )}

                                {stage.id === "scheduled" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full h-7 text-xs gap-1 mt-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSchedulingTrial(trial);
                                      setScheduleDialogOpen(true);
                                    }}
                                  >
                                    <Clock className="w-3 h-3" />
                                    Ubah Jadwal
                                  </Button>
                                )}

                                {stage.id === "recommended" && (
                                  <Button
                                    size="sm"
                                    className="w-full h-7 text-xs gap-1 mt-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAdmittingTrial(trial);
                                      setAdmitAlertOpen(true);
                                    }}
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Terima
                                  </Button>
                                )}
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Desktop: Kanban View */}
                <div className="hidden lg:block overflow-x-auto pb-4">
                  <div className="flex gap-3 min-w-max">
                    {PIPELINE_STAGES.map((stage) => {
                      const stageTrials = getTrialsByStage(stage.id);
                      const IconComponent = stage.icon;
                      return (
                        <div key={stage.id} className="w-[260px] shrink-0">
                          <div className="flex items-center gap-2 mb-2 px-1">
                            <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                            <span className="font-semibold text-sm">{stage.label}</span>
                            <Badge variant="secondary" className="text-[10px] ml-auto">
                              {stageTrials.length}
                            </Badge>
                          </div>

                          <div className="space-y-2.5 min-h-[460px] bg-muted/20 border border-border/50 rounded-xl p-2.5">
                            {stageTrials.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/60 text-xs">
                                <IconComponent className="w-6 h-6 mb-1.5 opacity-40" />
                                <span>Tidak ada trial</span>
                              </div>
                            ) : (
                              stageTrials.map((trial) => (
                                <Card
                                  key={trial.id}
                                  className="border border-border/80 hover:shadow-md transition-all hover:border-primary/40 bg-card cursor-pointer"
                                  onClick={() => setSelectedTrial(trial)}
                                >
                                  <CardContent className="p-3 space-y-2.5">
                                    {/* Header: Nama Anak + Usia + Program */}
                                    <div className="flex items-start justify-between gap-1.5">
                                      <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate text-foreground">
                                          {trial.childName}
                                          {trial.childNickname && (
                                            <span className="text-muted-foreground font-normal text-xs ml-1">
                                              ({trial.childNickname})
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                          {calculateAge(trial.childBirthDate)} &bull;{" "}
                                          {trial.parentName || "Ortu"}
                                        </p>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] uppercase font-bold shrink-0 bg-primary/5 text-primary border-primary/20"
                                      >
                                        {trial.programKey}
                                      </Badge>
                                    </div>

                                    {/* Tutor & Kelas (bila ada) */}
                                    {(trial.className || trial.tutorName) && (
                                      <div className="bg-muted/40 rounded-md p-1.5 text-[11px] space-y-0.5">
                                        {trial.className && (
                                          <div className="flex items-center gap-1 text-muted-foreground truncate">
                                            <GraduationCap className="w-3 h-3 text-primary shrink-0" />
                                            <span className="font-medium text-foreground truncate">
                                              {trial.className}
                                            </span>
                                          </div>
                                        )}
                                        {trial.tutorName && (
                                          <div className="flex items-center gap-1 text-muted-foreground truncate">
                                            <UserCheck className="w-3 h-3 text-primary shrink-0" />
                                            <span className="truncate">
                                              Tutor: {trial.tutorName}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Tanggal / Jadwal */}
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/50">
                                      <div className="flex items-center gap-1 truncate">
                                        <Calendar className="w-3 h-3 shrink-0" />
                                        <span className="truncate">
                                          {trial.trialScheduledAt
                                            ? formatDateTime(trial.trialScheduledAt)
                                            : `Daftar: ${formatDate(trial.createdAt)}`}
                                        </span>
                                      </div>
                                      {trial.parentPhone && (
                                        <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                                          {trial.parentPhone}
                                        </span>
                                      )}
                                    </div>

                                    {/* Catatan Khusus per Tahap */}
                                    {stage.id === "scheduled" && (
                                      <p className="text-[10px] italic bg-purple-500/10 text-purple-700 dark:text-purple-300 p-1.5 rounded text-center">
                                        Menunggu tutor menandai selesai
                                      </p>
                                    )}
                                    {stage.id === "awaiting_review" && (
                                      <p className="text-[10px] italic bg-amber-500/10 text-amber-700 dark:text-amber-300 p-1.5 rounded text-center">
                                        Menunggu catatan review tutor
                                      </p>
                                    )}
                                    {stage.id === "not_continued" && (
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] w-full justify-center ${
                                          trial.status === "repeat_trial"
                                            ? "bg-amber-500/10 text-amber-700 border-amber-300"
                                            : "bg-rose-500/10 text-rose-700 border-rose-300"
                                        }`}
                                      >
                                        {trial.status === "repeat_trial"
                                          ? "Perlu Trial Ulang"
                                          : "Belum Sesuai"}
                                      </Badge>
                                    )}

                                    {/* Tombol Aksi per Kolom */}
                                    {stage.id === "submitted" && (
                                      <Button
                                        size="sm"
                                        className="w-full h-7 text-xs gap-1 mt-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSchedulingTrial(trial);
                                          setScheduleDialogOpen(true);
                                        }}
                                      >
                                        <Calendar className="w-3 h-3" />
                                        Jadwalkan
                                      </Button>
                                    )}

                                    {stage.id === "scheduled" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full h-7 text-xs gap-1 mt-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSchedulingTrial(trial);
                                          setScheduleDialogOpen(true);
                                        }}
                                      >
                                        <Clock className="w-3 h-3" />
                                        Ubah Jadwal
                                      </Button>
                                    )}

                                    {stage.id === "recommended" && (
                                      <Button
                                        size="sm"
                                        className="w-full h-7 text-xs gap-1 mt-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAdmittingTrial(trial);
                                          setAdmitAlertOpen(true);
                                        }}
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                        Terima
                                      </Button>
                                    )}
                                  </CardContent>
                                </Card>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* List View */
              <Card>
                <CardContent className="p-0">
                  {/* Mobile List */}
                  <div className="block sm:hidden divide-y">
                    {filteredTrials.map((trial) => {
                      const stage = PIPELINE_STAGES.find((s) =>
                        s.matchStatuses.includes(trial.status)
                      );
                      return (
                        <div
                          key={trial.id}
                          className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedTrial(trial)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar className="w-9 h-9 shrink-0">
                                <AvatarFallback className="text-xs">
                                  {trial.childName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {trial.childName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {calculateAge(trial.childBirthDate)} &bull; {trial.programKey}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge className={`${stage?.color} text-white text-[10px]`}>
                                {stage?.shortLabel}
                              </Badge>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Calon Murid</th>
                          <th className="text-left p-3 font-medium">Program</th>
                          <th className="text-left p-3 font-medium">Tahap</th>
                          <th className="text-left p-3 font-medium">Jadwal / Pengajuan</th>
                          <th className="text-left p-3 font-medium">Kelas / Tutor</th>
                          <th className="text-left p-3 font-medium">Orang Tua</th>
                          <th className="text-right p-3 font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTrials.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                              Tidak ada data pendaftaran trial yang cocok
                            </td>
                          </tr>
                        ) : (
                          filteredTrials.map((trial) => {
                            const stage = PIPELINE_STAGES.find((s) =>
                              s.matchStatuses.includes(trial.status)
                            );
                            return (
                              <tr key={trial.id} className="border-t hover:bg-muted/30">
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {trial.childName.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {trial.childName}
                                        {trial.childNickname && (
                                          <span className="text-muted-foreground text-xs ml-1">
                                            ({trial.childNickname})
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {calculateAge(trial.childBirthDate)}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-sm">
                                  <Badge
                                    variant="outline"
                                    className="uppercase font-semibold text-xs"
                                  >
                                    {trial.programKey}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <Badge className={`${stage?.color} text-white text-xs`}>
                                    {stage?.label}
                                  </Badge>
                                </td>
                                <td className="p-3 text-xs text-muted-foreground">
                                  {trial.trialScheduledAt
                                    ? formatDateTime(trial.trialScheduledAt)
                                    : formatDate(trial.createdAt)}
                                </td>
                                <td className="p-3 text-xs">
                                  {trial.className ? (
                                    <span className="font-medium text-foreground">
                                      {trial.className}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                  {trial.tutorName && (
                                    <span className="block text-muted-foreground text-[11px]">
                                      {trial.tutorName}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-xs">
                                  <p className="font-medium">{trial.parentName || "-"}</p>
                                  <p className="text-muted-foreground">{trial.parentPhone || "-"}</p>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {trial.status === "submitted" && (
                                      <Button
                                        size="sm"
                                        variant="default"
                                        className="h-7 text-xs gap-1"
                                        onClick={() => {
                                          setSchedulingTrial(trial);
                                          setScheduleDialogOpen(true);
                                        }}
                                      >
                                        <Calendar className="w-3 h-3" />
                                        Jadwalkan
                                      </Button>
                                    )}
                                    {trial.status === "scheduled" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs gap-1"
                                        onClick={() => {
                                          setSchedulingTrial(trial);
                                          setScheduleDialogOpen(true);
                                        }}
                                      >
                                        <Clock className="w-3 h-3" />
                                        Ubah
                                      </Button>
                                    )}
                                    {trial.status === "recommended" && (
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => {
                                          setAdmittingTrial(trial);
                                          setAdmitAlertOpen(true);
                                        }}
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                        Terima
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-7 h-7"
                                      onClick={() => setSelectedTrial(trial)}
                                      title="Detail"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

        </div>

        {/* Trial Detail Dialog */}
        <Dialog open={!!selectedTrial} onOpenChange={() => setSelectedTrial(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            {selectedTrial && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {selectedTrial.childName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-base sm:text-lg">
                        {selectedTrial.childName}
                        {selectedTrial.childNickname && (
                          <span className="text-muted-foreground font-normal text-sm ml-1.5">
                            ({selectedTrial.childNickname})
                          </span>
                        )}
                      </p>
                      <p className="text-xs font-normal text-muted-foreground">
                        Usia: {calculateAge(selectedTrial.childBirthDate)} &bull; Program:{" "}
                        <span className="font-semibold uppercase text-primary">
                          {selectedTrial.programKey}
                        </span>
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-3">
                  {/* Contact Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTrial.parentPhone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start gap-2 h-auto py-2 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                        asChild
                      >
                        <a
                          href={`https://wa.me/${selectedTrial.parentPhone.replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate text-xs">WhatsApp Ortu</span>
                        </a>
                      </Button>
                    )}
                    {selectedTrial.parentPhone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start gap-2 h-auto py-2"
                        asChild
                      >
                        <a href={`tel:${selectedTrial.parentPhone}`}>
                          <Phone className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate text-xs">{selectedTrial.parentPhone}</span>
                        </a>
                      </Button>
                    )}
                    {selectedTrial.parentEmail && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start gap-2 h-auto py-2 sm:col-span-2"
                        asChild
                      >
                        <a href={`mailto:${selectedTrial.parentEmail}`}>
                          <Mail className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate text-xs">{selectedTrial.parentEmail}</span>
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Informational Sections */}
                  <div className="space-y-3 text-xs">
                    {/* Data Anak & Medis */}
                    <div className="p-3 rounded-lg bg-muted/40 space-y-2">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                        Data Calon Murid
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Tgl Lahir:</span>
                          <span className="font-medium">{formatDate(selectedTrial.childBirthDate)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Jenis Kelamin:</span>
                          <span className="font-medium capitalize">{selectedTrial.childGender || "-"}</span>
                        </div>
                      </div>
                      {(selectedTrial.allergies || selectedTrial.medicalNotes) && (
                        <div className="pt-2 border-t border-border/50 space-y-1">
                          {selectedTrial.allergies && (
                            <p className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>Alergi: {selectedTrial.allergies}</span>
                            </p>
                          )}
                          {selectedTrial.medicalNotes && (
                            <p className="text-muted-foreground">
                              Catatan medis: {selectedTrial.medicalNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Data Orang Tua & Kontak Darurat */}
                    <div className="p-3 rounded-lg bg-muted/40 space-y-2">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-primary" />
                        Orang Tua & Kontak Darurat
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Nama Orang Tua:</span>
                          <span className="font-medium">{selectedTrial.parentName || "-"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Telepon:</span>
                          <span className="font-medium">{selectedTrial.parentPhone || "-"}</span>
                        </div>
                        {selectedTrial.emergencyContact && (
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Kontak Darurat:</span>
                            <span className="font-medium">{selectedTrial.emergencyContact}</span>
                          </div>
                        )}
                        {selectedTrial.emergencyPhone && (
                          <div>
                            <span className="text-muted-foreground block text-[11px]">No. Darurat:</span>
                            <span className="font-medium">{selectedTrial.emergencyPhone}</span>
                          </div>
                        )}
                      </div>
                      {selectedTrial.address && (
                        <div className="pt-1">
                          <span className="text-muted-foreground block text-[11px]">Alamat:</span>
                          <span className="font-medium">{selectedTrial.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Sesi Trial & Kelas */}
                    <div className="p-3 rounded-lg bg-muted/40 space-y-2">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Status Sesi Trial
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Status Saat Ini:</span>
                          <Badge
                            className={`mt-0.5 text-[10px] text-white ${
                              PIPELINE_STAGES.find((s) =>
                                s.matchStatuses.includes(selectedTrial.status)
                              )?.color || "bg-muted"
                            }`}
                          >
                            {
                              PIPELINE_STAGES.find((s) =>
                                s.matchStatuses.includes(selectedTrial.status)
                              )?.label
                            }
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Jadwal Trial:</span>
                          <span className="font-medium">
                            {formatDateTime(selectedTrial.trialScheduledAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Tutor Penilai:</span>
                          <span className="font-medium">{selectedTrial.tutorName || "Belum dipilih"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Kelas Tujuan:</span>
                          <span className="font-medium">{selectedTrial.className || "Belum dipilih"}</span>
                        </div>
                      </div>
                      {selectedTrial.parentNotes && (
                        <div className="pt-2 border-t border-border/50">
                          <span className="text-muted-foreground block text-[11px]">Catatan Pendaftaran:</span>
                          <p className="mt-0.5 italic">{selectedTrial.parentNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Catatan Observasi Tutor (bila sudah ada review) */}
                    {(selectedTrial.observationNotes || selectedTrial.recommendation) && (
                      <div className="p-3 rounded-lg border bg-card space-y-2">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Hasil Review & Observasi Tutor
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Rekomendasi:</span>
                            <Badge
                              variant="outline"
                              className={`mt-0.5 text-[10px] ${
                                selectedTrial.recommendation === "suitable"
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-300"
                                  : selectedTrial.recommendation === "repeat_trial"
                                  ? "bg-amber-500/10 text-amber-700 border-amber-300"
                                  : "bg-rose-500/10 text-rose-700 border-rose-300"
                              }`}
                            >
                              {selectedTrial.recommendation === "suitable"
                                ? "Cocok / Direkomendasikan"
                                : selectedTrial.recommendation === "repeat_trial"
                                ? "Perlu Trial Ulang"
                                : "Belum Sesuai"}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Tgl Direview:</span>
                            <span className="font-medium">
                              {formatDate(selectedTrial.reviewedAt)}
                            </span>
                          </div>
                        </div>
                        {selectedTrial.observationNotes && (
                          <div className="pt-1">
                            <span className="text-muted-foreground block text-[11px]">Catatan Observasi:</span>
                            <p className="p-2 rounded bg-muted/60 mt-1 whitespace-pre-wrap">
                              {selectedTrial.observationNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer inside dialog */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedTrial(null)}
                    >
                      Tutup
                    </Button>

                    {selectedTrial.status === "submitted" && (
                      <Button
                        className="flex-1 gap-1.5"
                        onClick={() => {
                          setSchedulingTrial(selectedTrial);
                          setScheduleDialogOpen(true);
                        }}
                      >
                        <Calendar className="w-4 h-4" />
                        Jadwalkan Trial
                      </Button>
                    )}

                    {selectedTrial.status === "scheduled" && (
                      <Button
                        variant="secondary"
                        className="flex-1 gap-1.5"
                        onClick={() => {
                          setSchedulingTrial(selectedTrial);
                          setScheduleDialogOpen(true);
                        }}
                      >
                        <Clock className="w-4 h-4" />
                        Ubah Jadwal
                      </Button>
                    )}

                    {selectedTrial.status === "recommended" && (
                      <Button
                        className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          setAdmittingTrial(selectedTrial);
                          setAdmitAlertOpen(true);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Terima Calon Murid
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Schedule / Reschedule Dialog */}
        <ScheduleTrialDialog
          open={scheduleDialogOpen}
          onOpenChange={(open) => {
            setScheduleDialogOpen(open);
            if (!open) setSchedulingTrial(null);
          }}
          trial={schedulingTrial}
          options={schedulingOptions}
        />

        {/* Confirm Admit Alert Dialog */}
        <AlertDialog open={admitAlertOpen} onOpenChange={setAdmitAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Terima Calon Murid</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menerima{" "}
                <strong className="text-foreground">{admittingTrial?.childName}</strong> ke kelas{" "}
                <strong className="text-foreground">
                  {admittingTrial?.className || "tujuan"}
                </strong>
                ? Calon murid akan didaftarkan sebagai murid aktif dan dimasukkan ke kelas
                terkait secara otomatis.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isAdmitting}>Batal</AlertDialogCancel>
              <AlertDialogAction
                disabled={isAdmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={(e) => {
                  e.preventDefault();
                  handleAdmitConfirm();
                }}
              >
                {isAdmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Konfirmasi Terima
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
