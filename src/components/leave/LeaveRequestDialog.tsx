import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Send } from "lucide-react";
import { toast } from "sonner";
import { getAvailableReplacementTutors } from "@/server/actions/leave";

interface LeaveRequestDialogProps {
  children: React.ReactNode;
  onSubmit?: (data: LeaveRequestData) => void;
}

export interface LeaveRequestData {
  type: "sick" | "personal" | "annual" | "emergency";
  startDate: string;
  endDate: string;
  reason: string;
  substituteId?: string;
}

const leaveTypes = [
  { value: "sick", label: "Sakit" },
  { value: "personal", label: "Keperluan Pribadi" },
  { value: "annual", label: "Cuti Tahunan" },
  { value: "emergency", label: "Darurat" },
];

export function LeaveRequestDialog({ children, onSubmit }: LeaveRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<LeaveRequestData>({
    type: "sick",
    startDate: "",
    endDate: "",
    reason: "",
    substituteId: "admin",
  });

  const { data: replacementTutors = [] } = useQuery({
    queryKey: ["tutor-available-replacements"],
    queryFn: getAvailableReplacementTutors,
  });

  const handleSubmit = () => {
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    if (formData.startDate > formData.endDate) {
      toast.error("Tanggal mulai tidak boleh lebih besar dari tanggal selesai");
      return;
    }

    onSubmit?.(formData);
    setOpen(false);
    setFormData({
      type: "sick",
      startDate: "",
      endDate: "",
      reason: "",
      substituteId: "admin",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Ajukan Izin / Cuti
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Jenis Cuti</Label>
            <Select
              value={formData.type}
              onValueChange={(value: LeaveRequestData["type"]) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis cuti" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {leaveTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Selesai</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alasan</Label>
            <Textarea
              placeholder="Jelaskan alasan pengajuan cuti..."
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Pengalihan Chat & Tugas</Label>
            <Select
              value={formData.substituteId}
              onValueChange={(value) =>
                setFormData({ ...formData, substituteId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih pengganti" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="admin">Dialihkan ke Admin</SelectItem>
                {replacementTutors.map((tutor) => (
                  <SelectItem key={tutor.id} value={tutor.id}>
                    {tutor.name} (Pengganti)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Saat cuti disetujui, chat dari orang tua akan otomatis dialihkan ke pengganti
            </p>
          </div>

          <Button className="w-full gap-2" onClick={handleSubmit}>
            <Send className="w-4 h-4" />
            Kirim Pengajuan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
