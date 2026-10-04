import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Ticket, Plus, Clock, MessageSquare, AlertCircle,
  CheckCircle2, User, ChevronRight, Filter
} from "lucide-react";

interface SupportTicket {
  id: string;
  ticketNo: string;
  customerName: string;
  subject: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  lastUpdate: string;
  assignedTo?: string;
  messages: number;
}

const demoTickets: SupportTicket[] = [
  {
    id: "1",
    ticketNo: "TKT-001",
    customerName: "Ibu Sari",
    subject: "Pertanyaan tentang jadwal trial",
    category: "Informasi",
    priority: "medium",
    status: "open",
    createdAt: "2024-01-17",
    lastUpdate: "1 jam lalu",
    messages: 2,
  },
  {
    id: "2",
    ticketNo: "TKT-002",
    customerName: "Bapak Andi",
    subject: "Komplain kebersihan ruangan",
    category: "Komplain",
    priority: "high",
    status: "in_progress",
    createdAt: "2024-01-16",
    lastUpdate: "30 menit lalu",
    assignedTo: "Admin",
    messages: 5,
  },
  {
    id: "3",
    ticketNo: "TKT-003",
    customerName: "Ibu Maya",
    subject: "Request perubahan jadwal",
    category: "Request",
    priority: "low",
    status: "resolved",
    createdAt: "2024-01-15",
    lastUpdate: "Kemarin",
    assignedTo: "Ibu Dina",
    messages: 4,
  },
  {
    id: "4",
    ticketNo: "TKT-004",
    customerName: "Ibu Fitri",
    subject: "Pertanyaan billing",
    category: "Billing",
    priority: "medium",
    status: "open",
    createdAt: "2024-01-17",
    lastUpdate: "2 jam lalu",
    messages: 1,
  },
];

const priorityConfig = {
  high: { label: "Urgent", color: "bg-destructive/10 text-destructive border-destructive/20" },
  medium: { label: "Normal", color: "bg-warning/10 text-warning border-warning/20" },
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
};

const statusConfig = {
  open: { label: "Open", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: AlertCircle },
  in_progress: { label: "In Progress", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  resolved: { label: "Resolved", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

export function TicketSystemWidget() {
  const { toast } = useToast();
  const [tickets] = useState(demoTickets);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredTickets = filter === "all" 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Ticket className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">Support Tickets</span>
              {openCount > 0 && (
                <Badge variant="destructive" className="text-[9px] sm:text-[10px]">{openCount}</Badge>
              )}
            </CardTitle>
            <div className="flex gap-1 shrink-0">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[80px] sm:w-24 h-8 text-[10px] sm:text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1 h-8 px-2">
                    <Plus className="w-3 h-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Buat Tiket Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Nama Customer</Label>
                      <Input placeholder="Nama customer..." />
                    </div>
                    <div>
                      <Label>Subjek</Label>
                      <Input placeholder="Subjek tiket..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Kategori</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">Informasi</SelectItem>
                            <SelectItem value="complaint">Komplain</SelectItem>
                            <SelectItem value="request">Request</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="other">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Prioritas</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">🔴 Urgent</SelectItem>
                            <SelectItem value="medium">🟡 Normal</SelectItem>
                            <SelectItem value="low">🟢 Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Deskripsi</Label>
                      <Textarea 
                        placeholder="Detail masalah..."
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setAddDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button className="flex-1" onClick={() => {
                        toast({ title: "Tiket dibuat!" });
                        setAddDialogOpen(false);
                      }}>
                        Buat Tiket
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 px-3 sm:px-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 bg-destructive/5 rounded-lg text-center">
              <p className="text-base sm:text-lg font-bold text-destructive">{openCount}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Open</p>
            </div>
            <div className="p-2 bg-warning/5 rounded-lg text-center">
              <p className="text-base sm:text-lg font-bold text-warning">{inProgressCount}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">In Progress</p>
            </div>
          </div>

          {/* Ticket List */}
          <ScrollArea className="h-[240px] sm:h-[280px]">
            <div className="space-y-2 pr-2">
              {filteredTickets.map((ticket) => {
                const StatusIcon = statusConfig[ticket.status].icon;
                return (
                  <div 
                    key={ticket.id} 
                    className="p-2.5 sm:p-3 rounded-lg border bg-card cursor-pointer hover:bg-muted/30 transition-colors touch-manipulation"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="w-6 h-6 sm:w-7 sm:h-7 shrink-0">
                          <AvatarFallback className="text-[9px] sm:text-[10px]">
                            {ticket.customerName.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">{ticket.customerName}</p>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground">{ticket.ticketNo}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[9px] sm:text-[10px] shrink-0 ${priorityConfig[ticket.priority].color}`}>
                        {priorityConfig[ticket.priority].label}
                      </Badge>
                    </div>
                    <p className="text-[10px] sm:text-xs mb-1.5 line-clamp-1">{ticket.subject}</p>
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className={`text-[9px] ${statusConfig[ticket.status].color}`}>
                          <StatusIcon className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
                          {statusConfig[ticket.status].label}
                        </Badge>
                        <span className="flex items-center gap-0.5">
                          <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {ticket.messages}
                        </span>
                      </div>
                      <span className="truncate ml-1">{ticket.lastUpdate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <span>{selectedTicket.ticketNo}</span>
                  <Badge variant="outline" className={`text-xs ${statusConfig[selectedTicket.status].color}`}>
                    {statusConfig[selectedTicket.status].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="shrink-0">
                    <AvatarFallback>{selectedTicket.customerName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{selectedTicket.customerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedTicket.category}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Subjek</Label>
                  <p className="text-sm mt-1">{selectedTicket.subject}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Update Status</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(["open", "in_progress", "resolved", "closed"] as const).map((status) => (
                      <Button
                        key={status}
                        variant={selectedTicket.status === status ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          toast({ title: `Status diubah ke ${statusConfig[status].label}` });
                        }}
                      >
                        {statusConfig[status].label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Balas</Label>
                  <Textarea placeholder="Tulis balasan..." className="mt-2" />
                </div>
                <Button className="w-full">Kirim Balasan</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
