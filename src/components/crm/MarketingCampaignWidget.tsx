import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Megaphone, Target, Users, TrendingUp, Plus,
  Cake, MapPin, Calendar, Tag, BarChart3
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: "birthday" | "seasonal" | "targeted" | "reactivation";
  segment: string;
  sent: number;
  opened: number;
  converted: number;
  status: "active" | "completed" | "draft";
}

const demoCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Birthday Wishes Januari",
    type: "birthday",
    segment: "Ulang Tahun Januari",
    sent: 12,
    opened: 10,
    converted: 3,
    status: "active",
  },
  {
    id: "2",
    name: "Promo Tahun Baru",
    type: "seasonal",
    segment: "Semua Lead",
    sent: 250,
    opened: 180,
    converted: 25,
    status: "completed",
  },
  {
    id: "3",
    name: "Re-engage Lost Leads",
    type: "reactivation",
    segment: "Lead Lost > 30 hari",
    sent: 45,
    opened: 28,
    converted: 5,
    status: "active",
  },
  {
    id: "4",
    name: "Promo Jakarta Selatan",
    type: "targeted",
    segment: "Domisili: Jaksel",
    sent: 80,
    opened: 55,
    converted: 12,
    status: "completed",
  },
];

const typeIcons = {
  birthday: Cake,
  seasonal: Calendar,
  targeted: MapPin,
  reactivation: TrendingUp,
};

const typeLabels = {
  birthday: "Ulang Tahun",
  seasonal: "Seasonal",
  targeted: "Targeted",
  reactivation: "Re-aktivasi",
};

export function MarketingCampaignWidget() {
  const { toast } = useToast();
  const [campaigns] = useState(demoCampaigns);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalConverted = campaigns.reduce((sum, c) => sum + c.converted, 0);
  const avgConversion = totalSent > 0 ? Math.round((totalConverted / totalSent) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="w-4 h-4 text-primary" />
            Marketing Campaign
          </CardTitle>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">Campaign</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Buat Campaign Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Nama Campaign</Label>
                  <Input placeholder="Nama campaign..." />
                </div>
                <div>
                  <Label>Tipe Campaign</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birthday">🎂 Ulang Tahun</SelectItem>
                      <SelectItem value="seasonal">📅 Seasonal/Event</SelectItem>
                      <SelectItem value="targeted">📍 Targeted (Lokasi/Demografi)</SelectItem>
                      <SelectItem value="reactivation">📈 Re-aktivasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Segmentasi Target</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih segmen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kontak</SelectItem>
                      <SelectItem value="birthday_month">Ulang Tahun Bulan Ini</SelectItem>
                      <SelectItem value="jakarta_selatan">Domisili: Jakarta Selatan</SelectItem>
                      <SelectItem value="jakarta_barat">Domisili: Jakarta Barat</SelectItem>
                      <SelectItem value="high_value">High Value Leads</SelectItem>
                      <SelectItem value="lost_30">Lead Lost &gt; 30 Hari</SelectItem>
                      <SelectItem value="toddler">Program: Toddler</SelectItem>
                      <SelectItem value="playgroup">Program: Playgroup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pesan</Label>
                  <Textarea 
                    placeholder="Tulis pesan campaign..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={() => {
                    toast({ title: "Campaign dibuat!" });
                    setAddDialogOpen(false);
                  }}>
                    Buat Campaign
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{totalSent}</p>
            <p className="text-[10px] text-muted-foreground">Total Sent</p>
          </div>
          <div className="text-center border-x">
            <p className="text-lg font-bold text-success">{totalConverted}</p>
            <p className="text-[10px] text-muted-foreground">Converted</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{avgConversion}%</p>
            <p className="text-[10px] text-muted-foreground">Conv. Rate</p>
          </div>
        </div>

        {/* Campaign List */}
        {campaigns.map((campaign) => {
          const TypeIcon = typeIcons[campaign.type];
          const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
          const convRate = campaign.sent > 0 ? Math.round((campaign.converted / campaign.sent) * 100) : 0;

          return (
            <div key={campaign.id} className="p-3 rounded-lg border bg-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <TypeIcon className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">{campaign.segment}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] ${
                  campaign.status === "active" 
                    ? "bg-success/10 text-success border-success/20"
                    : campaign.status === "completed"
                    ? "bg-muted"
                    : "bg-warning/10 text-warning border-warning/20"
                }`}>
                  {campaign.status === "active" ? "Aktif" : campaign.status === "completed" ? "Selesai" : "Draft"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Open Rate</span>
                  <span className="font-medium">{openRate}%</span>
                </div>
                <Progress value={openRate} className="h-1.5" />
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-muted-foreground">
                    {campaign.sent} sent • {campaign.opened} opened • {campaign.converted} converted
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {convRate}% conv
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
