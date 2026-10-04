import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  UserCheck, UserX, Clock, ChevronRight, CheckCircle2, XCircle,
  AlertCircle, Calendar, Users
} from "lucide-react";

interface TutorAttendance {
  id: string;
  name: string;
  className: string;
  status: "hadir" | "izin" | "sakit" | "cuti" | "belum";
  checkInTime?: string;
  avatar?: string;
  leaveReason?: string;
  leaveDate?: string;
  needsApproval?: boolean;
}

interface BackupTutor {
  id: string;
  name: string;
  available: boolean;
}

const demoTutorAttendance: TutorAttendance[] = [
  {
    id: "1",
    name: "Ibu Sari",
    className: "Toddler A",
    status: "hadir",
    checkInTime: "07:30",
  },
  {
    id: "2",
    name: "Ibu Dina",
    className: "Playgroup B",
    status: "hadir",
    checkInTime: "07:45",
  },
  {
    id: "3",
    name: "Ibu Ratna",
    className: "TK A",
    status: "izin",
    leaveReason: "Keperluan keluarga",
    leaveDate: "1 hari",
    needsApproval: true,
  },
  {
    id: "4",
    name: "Ibu Wati",
    className: "TK B",
    status: "sakit",
    leaveReason: "Demam",
    leaveDate: "2 hari",
    needsApproval: true,
  },
  {
    id: "5",
    name: "Ibu Yanti",
    className: "Toddler B",
    status: "belum",
  },
];

const demoBackupTutors: BackupTutor[] = [
  { id: "b1", name: "Ibu Lina", available: true },
  { id: "b2", name: "Ibu Tika", available: true },
  { id: "b3", name: "Ibu Nana", available: false },
];

const statusConfig = {
  hadir: { label: "Hadir", color: "bg-success/10 text-success border-success/20", icon: UserCheck },
  izin: { label: "Izin", color: "bg-warning/10 text-warning border-warning/20", icon: Calendar },
  sakit: { label: "Sakit", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
  cuti: { label: "Cuti", color: "bg-info/10 text-info border-info/20", icon: Calendar },
  belum: { label: "Belum", color: "bg-muted text-muted-foreground border-border", icon: Clock },
};

export function TutorAttendanceWidget() {
  const { toast } = useToast();
  const [tutors, setTutors] = useState(demoTutorAttendance);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorAttendance | null>(null);
  const [selectedBackup, setSelectedBackup] = useState("");

  const presentCount = tutors.filter((t) => t.status === "hadir").length;
  const absentCount = tutors.filter((t) => t.status === "izin" || t.status === "sakit" || t.status === "cuti").length;
  const pendingApproval = tutors.filter((t) => t.needsApproval).length;

  const handleApproveLeave = () => {
    if (!selectedTutor) return;

    setTutors((prev) =>
      prev.map((t) =>
        t.id === selectedTutor.id ? { ...t, needsApproval: false } : t
      )
    );

    toast({
      title: "Izin Disetujui",
      description: `Izin ${selectedTutor.name} disetujui. ${selectedBackup ? `Backup: ${selectedBackup}` : ""}`,
    });
    setApprovalDialogOpen(false);
    setSelectedTutor(null);
    setSelectedBackup("");
  };

  const handleRejectLeave = () => {
    if (!selectedTutor) return;

    setTutors((prev) =>
      prev.map((t) =>
        t.id === selectedTutor.id ? { ...t, needsApproval: false, status: "belum" } : t
      )
    );

    toast({
      title: "Izin Ditolak",
      description: `Izin ${selectedTutor.name} ditolak`,
      variant: "destructive",
    });
    setApprovalDialogOpen(false);
    setSelectedTutor(null);
  };

  const openApprovalDialog = (tutor: TutorAttendance) => {
    setSelectedTutor(tutor);
    setApprovalDialogOpen(true);
  };

  return (
    <>
      <Card variant="interactive">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              Kehadiran Tutor
            </CardTitle>
            {pendingApproval > 0 && (
              <Badge variant="destructive" className="text-xs">
                {pendingApproval} perlu approval
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-success/5 border border-success/20 text-center">
              <p className="text-lg font-bold text-success">{presentCount}</p>
              <p className="text-[10px] text-muted-foreground">Hadir</p>
            </div>
            <div className="p-2 rounded-lg bg-warning/5 border border-warning/20 text-center">
              <p className="text-lg font-bold text-warning">{absentCount}</p>
              <p className="text-[10px] text-muted-foreground">Tidak Hadir</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50 text-center">
              <p className="text-lg font-bold">{tutors.length}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Tutor List */}
          <div className="space-y-2">
            {tutors.map((tutor) => {
              const config = statusConfig[tutor.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={tutor.id}
                  className={`p-3 rounded-lg ${
                    tutor.needsApproval ? "bg-warning/5 border border-warning/20" : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarImage src={tutor.avatar} />
                        <AvatarFallback className="text-xs">
                          {tutor.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{tutor.name}</p>
                        <p className="text-xs text-muted-foreground">{tutor.className}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tutor.checkInTime && (
                        <span className="text-xs text-muted-foreground">{tutor.checkInTime}</span>
                      )}
                      <Badge variant="outline" className={config.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </div>

                  {tutor.needsApproval && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        {tutor.leaveReason} • {tutor.leaveDate}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-success border-success/20 hover:bg-success/10"
                          onClick={() => openApprovalDialog(tutor)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() => {
                            setSelectedTutor(tutor);
                            handleRejectLeave();
                          }}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog with Backup Selection */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setujui Izin & Pilih Backup</DialogTitle>
          </DialogHeader>

          {selectedTutor && (
            <div className="space-y-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarFallback>{selectedTutor.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedTutor.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedTutor.className}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p><span className="text-muted-foreground">Alasan:</span> {selectedTutor.leaveReason}</p>
                    <p><span className="text-muted-foreground">Durasi:</span> {selectedTutor.leaveDate}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pilih Tutor Pengganti (Opsional)</label>
                <Select value={selectedBackup} onValueChange={setSelectedBackup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tutor backup..." />
                  </SelectTrigger>
                  <SelectContent>
                    {demoBackupTutors.map((backup) => (
                      <SelectItem
                        key={backup.id}
                        value={backup.name}
                        disabled={!backup.available}
                      >
                        {backup.name} {!backup.available && "(Tidak tersedia)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleApproveLeave}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Setujui Izin
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setApprovalDialogOpen(false)}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
