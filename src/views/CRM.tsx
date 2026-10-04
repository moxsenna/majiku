import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { AutoFollowUpWidget } from "@/components/crm/AutoFollowUpWidget";
import { ScheduledMessagesWidget } from "@/components/crm/ScheduledMessagesWidget";
import { MarketingCampaignWidget } from "@/components/crm/MarketingCampaignWidget";
import { TicketSystemWidget } from "@/components/crm/TicketSystemWidget";
import { IntegrationWidget } from "@/components/crm/IntegrationWidget";
import { LeadPipelineCard } from "@/components/crm/LeadPipelineCard";
import {
  Search, Plus, Phone, Mail, Calendar, MessageSquare,
  ChevronRight, User, Clock, Zap,
  TrendingUp, Users, Target, DollarSign, Send,
  CheckCircle2, XCircle, Megaphone, Ticket, Link2,
  LayoutGrid, List, MoreVertical, ArrowRight,
  Package, Truck, CreditCard
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  childName: string;
  childAge: number;
  source: string;
  stage: "new" | "contacted" | "trial" | "negotiation" | "won" | "lost";
  priority: "high" | "medium" | "low";
  notes: string;
  lastContact: string;
  assignedTo: string;
  avatar?: string;
  expectedValue: number;
}

const initialLeads: Lead[] = [
  {
    id: "1",
    name: "Ibu Sari Dewi",
    phone: "081234567890",
    email: "sari.dewi@email.com",
    childName: "Keisha",
    childAge: 4,
    source: "Instagram",
    stage: "new",
    priority: "high",
    notes: "Tertarik program montessori",
    lastContact: "Hari ini",
    assignedTo: "Admin",
    expectedValue: 2500000,
  },
  {
    id: "2",
    name: "Bapak Andi Pratama",
    phone: "081345678901",
    email: "andi.p@email.com",
    childName: "Raka",
    childAge: 3,
    source: "Referral",
    stage: "contacted",
    priority: "high",
    notes: "Sudah hubungi via WA, minta jadwal trial",
    lastContact: "Kemarin",
    assignedTo: "Ibu Dina",
    expectedValue: 3000000,
  },
  {
    id: "3",
    name: "Ibu Maya Santi",
    phone: "081456789012",
    email: "maya.s@email.com",
    childName: "Arjuna",
    childAge: 5,
    source: "Website",
    stage: "trial",
    priority: "medium",
    notes: "Trial dijadwalkan 25 Des",
    lastContact: "2 hari lalu",
    assignedTo: "Admin",
    expectedValue: 2800000,
  },
  {
    id: "4",
    name: "Ibu Fitri Handayani",
    phone: "081567890123",
    email: "fitri.h@email.com",
    childName: "Zahra",
    childAge: 4,
    source: "Facebook",
    stage: "negotiation",
    priority: "high",
    notes: "Minta diskon untuk 2 anak",
    lastContact: "Hari ini",
    assignedTo: "Ibu Dina",
    expectedValue: 4500000,
  },
  {
    id: "5",
    name: "Bapak Hendra Wijaya",
    phone: "081678901234",
    email: "hendra.w@email.com",
    childName: "Dimas",
    childAge: 3,
    source: "Google",
    stage: "won",
    priority: "medium",
    notes: "Sudah daftar program full day",
    lastContact: "3 hari lalu",
    assignedTo: "Admin",
    expectedValue: 3200000,
  },
  {
    id: "6",
    name: "Ibu Rina Kusuma",
    phone: "081789012345",
    email: "rina.k@email.com",
    childName: "Alya",
    childAge: 4,
    source: "Walk-in",
    stage: "lost",
    priority: "low",
    notes: "Pilih daycare lain karena lokasi",
    lastContact: "1 minggu lalu",
    assignedTo: "Admin",
    expectedValue: 2500000,
  },
];

const stages = [
  { id: "new", label: "Lead Baru", shortLabel: "Baru", color: "bg-blue-500", icon: User },
  { id: "contacted", label: "Dihubungi", shortLabel: "Kontak", color: "bg-yellow-500", icon: Phone },
  { id: "trial", label: "Trial", shortLabel: "Trial", color: "bg-purple-500", icon: Calendar },
  { id: "negotiation", label: "Negosiasi", shortLabel: "Nego", color: "bg-orange-500", icon: MessageSquare },
  { id: "won", label: "Berhasil", shortLabel: "Won", color: "bg-success", icon: CheckCircle2 },
  { id: "lost", label: "Gagal", shortLabel: "Lost", color: "bg-destructive", icon: XCircle },
];

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

export default function CRM() {
  const { toast } = useToast();
  const [leads, setLeads] = useState(initialLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");
  const [activeTab, setActiveTab] = useState("pipeline");
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("all");

  const filteredLeads = leads.filter(
    (lead) =>
      (lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery)) &&
      (selectedStageFilter === "all" || lead.stage === selectedStageFilter)
  );

  const getLeadsByStage = (stage: string) =>
    filteredLeads.filter((lead) => lead.stage === stage);

  const moveLeadToStage = (leadId: string, newStage: Lead["stage"]) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, stage: newStage } : lead
      )
    );
    toast({
      title: "Lead dipindahkan",
      description: `Lead berhasil dipindahkan ke tahap ${stages.find(s => s.id === newStage)?.label}`,
    });
    setSelectedLead(null);
  };

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter((l) => l.stage === "new").length,
    conversionRate: Math.round(
      (leads.filter((l) => l.stage === "won").length / leads.length) * 100
    ),
    totalValue: leads
      .filter((l) => l.stage === "won")
      .reduce((sum, l) => sum + l.expectedValue, 0),
    pipelineValue: leads
      .filter((l) => !["won", "lost"].includes(l.stage))
      .reduce((sum, l) => sum + l.expectedValue, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">CRM Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Kelola leads, automasi & marketing
            </p>
          </div>
          <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Tambah Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Lead Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <Label>Nama Orang Tua</Label>
                    <Input placeholder="Nama lengkap" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>No. Telepon</Label>
                      <Input placeholder="08xxx" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input placeholder="email@..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Nama Anak</Label>
                      <Input placeholder="Nama anak" />
                    </div>
                    <div>
                      <Label>Usia</Label>
                      <Input type="number" placeholder="Usia" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Sumber</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="walk-in">Walk-in</SelectItem>
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
                          <SelectItem value="high">🔴 Tinggi</SelectItem>
                          <SelectItem value="medium">🟡 Sedang</SelectItem>
                          <SelectItem value="low">🟢 Rendah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Catatan</Label>
                    <Textarea placeholder="Catatan tentang lead..." />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setAddLeadOpen(false)}>
                    Batal
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    toast({ title: "Lead ditambahkan!" });
                    setAddLeadOpen(false);
                  }}>
                    Simpan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards - Fully Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          <Card>
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total Leads</p>
                  <p className="text-base sm:text-lg font-bold">{stats.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Lead Baru</p>
                  <p className="text-base sm:text-lg font-bold">{stats.newLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-success/10 shrink-0">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Konversi</p>
                  <p className="text-base sm:text-lg font-bold">{stats.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-warning/10 shrink-0">
                  <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Pipeline</p>
                  <p className="text-sm sm:text-base font-bold">Rp{(stats.pipelineValue / 1000000).toFixed(1)}jt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-success/10 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total Won</p>
                  <p className="text-sm sm:text-base font-bold">Rp{(stats.totalValue / 1000000).toFixed(1)}jt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          {/* Search and Tabs Row */}
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari lead..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabs - Horizontal Scroll on Mobile */}
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-max min-w-full sm:w-auto bg-muted/50 p-1">
                <TabsTrigger value="pipeline" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Pipeline</span>
                </TabsTrigger>
                <TabsTrigger value="automation" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Auto</span>
                </TabsTrigger>
                <TabsTrigger value="marketing" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Marketing</span>
                </TabsTrigger>
                <TabsTrigger value="tickets" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                  <Ticket className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Tickets</span>
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                  <Link2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Integrasi</span>
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* View Toggle and Filter for Pipeline */}
            {activeTab === "pipeline" && (
              <div className="flex items-center justify-between gap-2">
                <Select value={selectedStageFilter} onValueChange={setSelectedStageFilter}>
                  <SelectTrigger className="w-[120px] sm:w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Semua Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Stage</SelectItem>
                    {stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "pipeline" ? "default" : "outline"}
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setViewMode("pipeline")}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="mt-0">
            {viewMode === "pipeline" ? (
              <>
                {/* Mobile: Vertical Cards View */}
                <div className="block lg:hidden space-y-3">
                  {stages.map((stage) => {
                    const stageLeads = getLeadsByStage(stage.id);
                    if (selectedStageFilter !== "all" && stage.id !== selectedStageFilter) return null;
                    
                    return (
                      <Card key={stage.id}>
                        <CardHeader className="pb-2 px-3 pt-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                              <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
                              <Badge variant="secondary" className="text-[10px]">
                                {stageLeads.length}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="px-3 pb-3 space-y-2">
                          {stageLeads.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              Tidak ada lead
                            </p>
                          ) : (
                            stageLeads.map((lead) => (
                              <div
                                key={lead.id}
                                className="p-2.5 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => setSelectedLead(lead)}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Avatar className="w-8 h-8 shrink-0">
                                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                        {lead.name.slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm truncate">{lead.name}</p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {lead.childName} ({lead.childAge} th)
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] ${priorityColors[lead.priority]}`}
                                    >
                                      {lead.priority === "high" ? "🔴" : lead.priority === "medium" ? "🟡" : "🟢"}
                                    </Badge>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                </div>
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
                    {stages.map((stage) => {
                      const stageLeads = getLeadsByStage(stage.id);
                      return (
                        <div key={stage.id} className="w-[220px] shrink-0">
                          <div className="flex items-center gap-2 mb-2 px-1">
                            <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                            <span className="font-medium text-sm">{stage.label}</span>
                            <Badge variant="secondary" className="text-[10px] ml-auto">
                              {stageLeads.length}
                            </Badge>
                          </div>
                          <div className="space-y-2 min-h-[400px] bg-muted/30 rounded-xl p-2">
                            {stageLeads.map((lead) => (
                              <LeadPipelineCard
                                key={lead.id}
                                lead={lead}
                                onClick={() => setSelectedLead(lead)}
                              />
                            ))}
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
                    {filteredLeads.map((lead) => {
                      const stage = stages.find((s) => s.id === lead.stage);
                      return (
                        <div
                          key={lead.id}
                          className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar className="w-9 h-9 shrink-0">
                                <AvatarFallback className="text-xs">
                                  {lead.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{lead.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {lead.childName} • {lead.source}
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
                          <th className="text-left p-3 font-medium">Lead</th>
                          <th className="text-left p-3 font-medium">Anak</th>
                          <th className="text-left p-3 font-medium hidden md:table-cell">Sumber</th>
                          <th className="text-left p-3 font-medium">Stage</th>
                          <th className="text-left p-3 font-medium hidden lg:table-cell">Value</th>
                          <th className="text-left p-3 font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.map((lead) => {
                          const stage = stages.find((s) => s.id === lead.stage);
                          return (
                            <tr key={lead.id} className="border-t hover:bg-muted/30">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-xs">
                                      {lead.name.slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{lead.name}</p>
                                    <p className="text-xs text-muted-foreground">{lead.phone}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-sm">
                                {lead.childName} ({lead.childAge}th)
                              </td>
                              <td className="p-3 hidden md:table-cell">
                                <Badge variant="outline" className="text-xs">
                                  {lead.source}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <Badge className={`${stage?.color} text-white text-xs`}>
                                  {stage?.label}
                                </Badge>
                              </td>
                              <td className="p-3 hidden lg:table-cell text-sm">
                                Rp {lead.expectedValue.toLocaleString()}
                              </td>
                              <td className="p-3">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8"
                                  onClick={() => setSelectedLead(lead)}
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="mt-0 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AutoFollowUpWidget />
              <ScheduledMessagesWidget />
            </div>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="mt-0 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <MarketingCampaignWidget />
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Send className="w-4 h-4 text-primary" />
                    Personalisasi Marketing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-pink-500/10 shrink-0">
                        <span className="text-lg">🎂</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">Birthday Greetings</p>
                        <p className="text-xs text-muted-foreground">Kirim ucapan otomatis</p>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px] shrink-0">
                        Aktif
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      12 ucapan terkirim bulan ini
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                        <span className="text-lg">📍</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">Geo-Targeting</p>
                        <p className="text-xs text-muted-foreground">Campaign berdasarkan lokasi</p>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px] shrink-0">
                        Aktif
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      5 area: Jaksel, Jakbar, Jakpus, Tangerang, Depok
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
                        <span className="text-lg">🛒</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">Transaction History</p>
                        <p className="text-xs text-muted-foreground">Segmentasi berdasarkan histori</p>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px] shrink-0">
                        Aktif
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      3 segmen: New, Returning, VIP
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="mt-0 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TicketSystemWidget />
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Analisis Komplain
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 sm:p-3 bg-muted/30 rounded-lg">
                      <p className="text-xl sm:text-2xl font-bold text-primary">24</p>
                      <p className="text-[10px] text-muted-foreground">Total</p>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-muted/30 rounded-lg">
                      <p className="text-xl sm:text-2xl font-bold text-success">2.5h</p>
                      <p className="text-[10px] text-muted-foreground">Avg Resp</p>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-muted/30 rounded-lg">
                      <p className="text-xl sm:text-2xl font-bold">92%</p>
                      <p className="text-[10px] text-muted-foreground">Resolved</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">TOP KATEGORI</p>
                    {[
                      { category: "Billing", count: 8, percent: 33 },
                      { category: "Informasi", count: 6, percent: 25 },
                      { category: "Komplain", count: 5, percent: 21 },
                      { category: "Request", count: 5, percent: 21 },
                    ].map((item) => (
                      <div key={item.category} className="flex items-center gap-2">
                        <span className="text-xs w-16 sm:w-20 truncate">{item.category}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-6">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="mt-0 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <IntegrationWidget />
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    WhatsApp Multi-Sender
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                    <p className="text-xs text-muted-foreground mb-2">Sender Aktif</p>
                    <div className="space-y-2">
                      {[
                        { name: "Admin Utama", number: "08123xxxx890", status: "online" },
                        { name: "CS Marketing", number: "08234xxxx901", status: "online" },
                        { name: "Backup Sender", number: "08345xxxx012", status: "offline" },
                      ].map((sender, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-card rounded-lg gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{sender.name}</p>
                            <p className="text-xs text-muted-foreground">{sender.number}</p>
                          </div>
                          <Badge variant="outline" className={`text-[10px] shrink-0 ${sender.status === "online"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-muted text-muted-foreground"
                            }`}>
                            {sender.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Tambah Sender
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    💡 Kirim pesan tanpa batas dengan multiple sender
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Integration Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Truck className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Tracking Ekspedisi</p>
                      <p className="text-xs text-muted-foreground">Auto update status</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px]">JNE</Badge>
                    <Badge variant="outline" className="text-[10px]">J&T</Badge>
                    <Badge variant="outline" className="text-[10px]">SiCepat</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CreditCard className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Payment Gateway</p>
                      <p className="text-xs text-muted-foreground">Terima pembayaran</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full">Connect</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Package className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Marketplace</p>
                      <p className="text-xs text-muted-foreground">Sync order</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px]">Tokopedia</Badge>
                    <Badge variant="outline" className="text-[10px]">Shopee</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Lead Detail Dialog */}
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            {selectedLead && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedLead.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate">{selectedLead.name}</p>
                      <p className="text-sm font-normal text-muted-foreground">
                        {selectedLead.childName} ({selectedLead.childAge} tahun)
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" className="justify-start gap-2 h-auto py-2" asChild>
                      <a href={`tel:${selectedLead.phone}`}>
                        <Phone className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{selectedLead.phone}</span>
                      </a>
                    </Button>
                    <Button variant="outline" className="justify-start gap-2 h-auto py-2" asChild>
                      <a href={`mailto:${selectedLead.email}`}>
                        <Mail className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{selectedLead.email}</span>
                      </a>
                    </Button>
                    <Button variant="outline" className="justify-start gap-2 h-auto py-2 bg-success/5 border-success/20 hover:bg-success/10" asChild>
                      <a href={`https://wa.me/${selectedLead.phone.replace(/^0/, '62')}`} target="_blank" rel="noreferrer">
                        <MessageSquare className="w-4 h-4 text-success shrink-0" />
                        <span>Kirim WhatsApp</span>
                      </a>
                    </Button>
                  </div>

                  {/* Lead Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Sumber</Label>
                      <p className="font-medium">{selectedLead.source}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Expected Value</Label>
                      <p className="font-medium">Rp {selectedLead.expectedValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Assigned To</Label>
                      <p className="font-medium">{selectedLead.assignedTo}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Last Contact</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedLead.lastContact}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Catatan</Label>
                    <p className="text-sm mt-1 p-2 bg-muted/50 rounded-lg">{selectedLead.notes}</p>
                  </div>

                  {/* Stage Change */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Pindah ke Stage</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {stages.map((stage) => (
                        <Button
                          key={stage.id}
                          variant={selectedLead.stage === stage.id ? "default" : "outline"}
                          size="sm"
                          className="text-[10px] sm:text-xs h-8 px-2"
                          onClick={() => moveLeadToStage(selectedLead.id, stage.id as Lead["stage"])}
                          disabled={selectedLead.stage === stage.id}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${stage.color} mr-1`} />
                          {stage.shortLabel}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setSelectedLead(null)}>
                      Tutup
                    </Button>
                    <Button className="flex-1 gap-1">
                      <Calendar className="w-4 h-4" />
                      Jadwal Trial
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
