import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Calendar, UserMinus, UserPlus, Check, X, 
  AlertCircle, Clock, DollarSign, ChevronRight 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface LeaveRequest {
  id: string;
  tutor: {
    id: string;
    name: string;
    avatar?: string;
    hourlyRate: number;
  };
  type: "cuti" | "sakit" | "izin";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  substitute?: {
    id: string;
    name: string;
    avatar?: string;
  };
  hoursTransferred?: number;
  createdAt: string;
}

interface LeaveManagementWidgetProps {
  requests: LeaveRequest[];
  availableTutors: Array<{ id: string; name: string; avatar?: string; hourlyRate: number }>;
  onApprove?: (id: string, substituteId: string) => void;
  onReject?: (id: string) => void;
}

const typeConfig = {
  cuti: { label: "Cuti", icon: Calendar, className: "bg-info/10 text-info" },
  sakit: { label: "Sakit", icon: AlertCircle, className: "bg-destructive/10 text-destructive" },
  izin: { label: "Izin", icon: Clock, className: "bg-warning/10 text-warning" },
};

const statusConfig = {
  pending: { label: "Menunggu", className: "bg-warning/10 text-warning border-warning/20" },
  approved: { label: "Disetujui", className: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Ditolak", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function LeaveManagementWidget({ 
  requests, 
  availableTutors, 
  onApprove, 
  onReject 
}: LeaveManagementWidgetProps) {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [substituteId, setSubstituteId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const pendingRequests = requests.filter(r => r.status === "pending");

  const handleApprove = () => {
    if (!selectedRequest || !substituteId) {
      toast({
        title: "Pilih tutor pengganti",
        description: "Anda harus memilih tutor pengganti sebelum menyetujui",
        variant: "destructive",
      });
      return;
    }

    const substitute = availableTutors.find(t => t.id === substituteId);
    onApprove?.(selectedRequest.id, substituteId);
    
    toast({
      title: "Pengajuan disetujui",
      description: `${substitute?.name} akan menggantikan ${selectedRequest.tutor.name}. Gaji per jam akan dialihkan.`,
    });
    
    setDialogOpen(false);
    setSelectedRequest(null);
    setSubstituteId("");
  };

  const handleReject = (request: LeaveRequest) => {
    onReject?.(request.id);
    toast({
      title: "Pengajuan ditolak",
      description: `Pengajuan ${request.type} dari ${request.tutor.name} telah ditolak`,
      variant: "destructive",
    });
  };

  const calculateWorkingDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserMinus className="w-5 h-5" />
            Pengajuan Cuti/Izin
          </CardTitle>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive">{pendingRequests.length} pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Tidak ada pengajuan cuti/izin
          </p>
        ) : (
          requests.slice(0, 5).map((request) => {
            const TypeIcon = typeConfig[request.type].icon;
            const workingDays = calculateWorkingDays(request.startDate, request.endDate);
            
            return (
              <div 
                key={request.id} 
                className={cn(
                  "p-3 rounded-lg border",
                  request.status === "pending" ? "bg-warning/5 border-warning/20" : "bg-muted/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={request.tutor.avatar} />
                    <AvatarFallback>{request.tutor.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{request.tutor.name}</span>
                      <Badge variant="outline" className={cn("text-xs", typeConfig[request.type].className)}>
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {typeConfig[request.type].label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(request.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - 
                      {new Date(request.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className="ml-2">({workingDays} hari kerja)</span>
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{request.reason}</p>
                    
                    {/* Substitute info if approved */}
                    {request.status === "approved" && request.substitute && (
                      <div className="mt-2 p-2 rounded bg-success/10 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-success" />
                        <span className="text-xs">
                          Digantikan oleh <strong>{request.substitute.name}</strong>
                        </span>
                        {request.hoursTransferred && (
                          <Badge variant="secondary" className="text-xs ml-auto">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {request.hoursTransferred} jam dialihkan
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Status / Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={cn("text-xs", statusConfig[request.status].className)}>
                      {statusConfig[request.status].label}
                    </Badge>
                    
                    {request.status === "pending" && (
                      <div className="flex gap-1">
                        <Dialog open={dialogOpen && selectedRequest?.id === request.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (open) setSelectedRequest(request);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-success hover:bg-success/10">
                              <Check className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Pilih Tutor Pengganti</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-sm font-medium mb-1">{request.tutor.name} mengajukan {request.type}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(request.startDate).toLocaleDateString('id-ID')} - 
                                  {new Date(request.endDate).toLocaleDateString('id-ID')}
                                  ({workingDays} hari kerja)
                                </p>
                              </div>

                              <div>
                                <Label>Tutor Pengganti *</Label>
                                <Select value={substituteId} onValueChange={setSubstituteId}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih tutor pengganti" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableTutors
                                      .filter(t => t.id !== request.tutor.id)
                                      .map(tutor => (
                                        <SelectItem key={tutor.id} value={tutor.id}>
                                          <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6">
                                              <AvatarImage src={tutor.avatar} />
                                              <AvatarFallback className="text-xs">{tutor.name.slice(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            {tutor.name}
                                          </div>
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="w-4 h-4 text-info" />
                                  <span className="text-sm font-medium text-info">Info Pengalihan Gaji</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Rate per jam <strong>Rp {request.tutor.hourlyRate.toLocaleString('id-ID')}</strong> akan 
                                  dialihkan ke tutor pengganti selama {workingDays} hari kerja.
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                                  Batal
                                </Button>
                                <Button className="flex-1" onClick={handleApprove}>
                                  <Check className="w-4 h-4 mr-2" />
                                  Setujui & Assign
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleReject(request)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {requests.length > 5 && (
          <Button variant="ghost" className="w-full">
            Lihat Semua ({requests.length})
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
