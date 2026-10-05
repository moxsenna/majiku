"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  scheduleTrial,
  type TrialPipelineRow,
  type SchedulingOptions,
} from "@/server/actions/trial";
import { Calendar, Loader2 } from "lucide-react";

export interface ScheduleTrialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trial: TrialPipelineRow | null;
  options: SchedulingOptions;
}

function toDatetimeLocal(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function ScheduleTrialDialog({
  open,
  onOpenChange,
  trial,
  options,
}: ScheduleTrialDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [scheduledAt, setScheduledAt] = useState("");
  const [tutorId, setTutorId] = useState("");
  const [classId, setClassId] = useState("");

  const isReschedule = trial?.status === "scheduled";

  useEffect(() => {
    if (trial) {
      setScheduledAt(toDatetimeLocal(trial.trialScheduledAt));
      setTutorId(trial.tutorId || "");
      setClassId(trial.classId || "");
    } else {
      setScheduledAt("");
      setTutorId("");
      setClassId("");
    }
  }, [trial, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trial) return;

    if (!scheduledAt) {
      toast({
        title: "Validasi gagal",
        description: "Jadwal trial wajib diisi",
        variant: "destructive",
      });
      return;
    }
    if (!tutorId) {
      toast({
        title: "Validasi gagal",
        description: "Tutor wajib dipilih",
        variant: "destructive",
      });
      return;
    }
    if (!classId) {
      toast({
        title: "Validasi gagal",
        description: "Kelas wajib dipilih",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        await scheduleTrial(trial.id, {
          scheduledAt: new Date(scheduledAt).toISOString(),
          tutorId,
          classId,
        });

        toast({
          title: isReschedule ? "Jadwal diubah" : "Trial dijadwalkan",
          description: `Sesi trial untuk ${trial.childName} berhasil ${
            isReschedule ? "diubah" : "dijadwalkan"
          }.`,
        });

        onOpenChange(false);
        router.refresh();
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan jadwal";
        toast({
          title: isReschedule ? "Gagal mengubah jadwal" : "Gagal menjadwalkan",
          description: errorMsg,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {isReschedule ? "Ubah Jadwal Trial" : "Jadwalkan Trial"}
          </DialogTitle>
          <DialogDescription>
            {trial ? (
              <span>
                Calon murid: <strong className="text-foreground">{trial.childName}</strong>
                {trial.childNickname ? ` (${trial.childNickname})` : ""} &bull; Program:{" "}
                <span className="font-semibold uppercase">{trial.programKey}</span>
              </span>
            ) : (
              "Lengkapi data jadwal trial calon murid"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="trial-scheduled-at">Tanggal & Jam Trial</Label>
              <Input
                id="trial-scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trial-tutor">Pilih Tutor</Label>
              <Select
                value={tutorId}
                onValueChange={setTutorId}
                disabled={isPending || options.tutors.length === 0}
              >
                <SelectTrigger id="trial-tutor">
                  <SelectValue
                    placeholder={
                      options.tutors.length === 0
                        ? "Tidak ada tutor aktif"
                        : "Pilih Tutor"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {options.tutors.map((tutor) => (
                    <SelectItem key={tutor.id} value={tutor.id}>
                      {tutor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {options.tutors.length === 0 && (
                <p className="text-[11px] text-destructive">
                  Belum ada data tutor aktif. Tambahkan tutor terlebih dahulu.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trial-class">Pilih Kelas</Label>
              <Select
                value={classId}
                onValueChange={setClassId}
                disabled={isPending || options.classes.length === 0}
              >
                <SelectTrigger id="trial-class">
                  <SelectValue
                    placeholder={
                      options.classes.length === 0
                        ? "Tidak ada kelas aktif"
                        : "Pilih Kelas"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {options.classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {options.classes.length === 0 && (
                <p className="text-[11px] text-destructive">
                  Belum ada data kelas aktif. Tambahkan kelas terlebih dahulu.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                options.tutors.length === 0 ||
                options.classes.length === 0
              }
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isReschedule ? "Simpan Perubahan" : "Konfirmasi Jadwal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
