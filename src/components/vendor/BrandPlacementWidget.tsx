import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Megaphone, 
  Image, 
  Monitor,
  Smartphone,
  LayoutDashboard,
  Mail,
  Bell,
  Eye,
  MousePointer,
  DollarSign,
  Calendar,
  Plus,
  Settings,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const adPlacements = [
  {
    id: 1,
    name: "Dashboard Banner",
    location: "Atas dashboard vendor",
    type: "Banner",
    size: "728x90",
    icon: LayoutDashboard,
    impressions: 125000,
    clicks: 3750,
    ctr: 3.0,
    revenue: 15000000,
    status: "active",
    currentAd: {
      advertiser: "Bank BCA",
      campaign: "KPR Promo",
      endDate: "31 Des 2024"
    }
  },
  {
    id: 2,
    name: "Sidebar Widget",
    location: "Sidebar kanan semua halaman",
    type: "Widget",
    size: "300x250",
    icon: Monitor,
    impressions: 98000,
    clicks: 2450,
    ctr: 2.5,
    revenue: 12000000,
    status: "active",
    currentAd: {
      advertiser: "Prudential",
      campaign: "Asuransi Pendidikan",
      endDate: "15 Jan 2025"
    }
  },
  {
    id: 3,
    name: "Mobile Interstitial",
    location: "Halaman login mobile",
    type: "Interstitial",
    size: "320x480",
    icon: Smartphone,
    impressions: 45000,
    clicks: 2250,
    ctr: 5.0,
    revenue: 8500000,
    status: "active",
    currentAd: {
      advertiser: "Gojek",
      campaign: "GoTagihan",
      endDate: "20 Des 2024"
    }
  },
  {
    id: 4,
    name: "Email Newsletter",
    location: "Footer email newsletter",
    type: "Sponsored",
    size: "600x100",
    icon: Mail,
    impressions: 35000,
    clicks: 1400,
    ctr: 4.0,
    revenue: 5000000,
    status: "active",
    currentAd: {
      advertiser: "Ruangguru",
      campaign: "Promo Akhir Tahun",
      endDate: "25 Des 2024"
    }
  },
  {
    id: 5,
    name: "Push Notification",
    location: "Sponsored push notification",
    type: "Notification",
    size: "Text + Icon",
    icon: Bell,
    impressions: 28000,
    clicks: 1680,
    ctr: 6.0,
    revenue: 4200000,
    status: "paused",
    currentAd: null
  },
  {
    id: 6,
    name: "Featured Listing",
    location: "Halaman pencarian vendor",
    type: "Sponsored",
    size: "Card",
    icon: Image,
    impressions: 18000,
    clicks: 900,
    ctr: 5.0,
    revenue: 3500000,
    status: "available",
    currentAd: null
  },
];

const advertisers = [
  { id: 1, name: "Bank BCA", campaigns: 3, totalSpent: 45000000, status: "active" },
  { id: 2, name: "Prudential Indonesia", campaigns: 2, totalSpent: 28000000, status: "active" },
  { id: 3, name: "Gojek", campaigns: 1, totalSpent: 15000000, status: "active" },
  { id: 4, name: "Ruangguru", campaigns: 2, totalSpent: 12000000, status: "paused" },
];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}jt`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export default function BrandPlacementWidget() {
  const { toast } = useToast();
  const [placements, setPlacements] = useState(adPlacements);

  const totalRevenue = placements.reduce((sum, p) => sum + p.revenue, 0);
  const totalImpressions = placements.reduce((sum, p) => sum + p.impressions, 0);
  const totalClicks = placements.reduce((sum, p) => sum + p.clicks, 0);
  const avgCTR = (totalClicks / totalImpressions * 100).toFixed(2);

  const handleTogglePlacement = (id: number) => {
    setPlacements(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus = p.status === "active" ? "paused" : "active";
        toast({
          title: newStatus === "active" ? "Placement Diaktifkan" : "Placement Dijeda",
          description: `${p.name} telah ${newStatus === "active" ? "diaktifkan" : "dijeda"}`,
        });
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-success/10 text-success border-success/20">Aktif</Badge>;
      case "paused": return <Badge className="bg-warning/10 text-warning border-warning/20">Dijeda</Badge>;
      case "available": return <Badge className="bg-info/10 text-info border-info/20">Tersedia</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Total Ad Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(totalImpressions)}</p>
                <p className="text-xs text-muted-foreground">Total Impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(totalClicks)}</p>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgCTR}%</p>
                <p className="text-xs text-muted-foreground">Avg. CTR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ad Placements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-primary" />
                  Ad Placements
                </CardTitle>
                <CardDescription>Lokasi penempatan iklan di platform</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Tambah Slot
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {placements.map((placement) => (
                <div key={placement.id} className="p-4 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <placement.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{placement.name}</p>
                        <p className="text-xs text-muted-foreground">{placement.location}</p>
                        <p className="text-xs text-muted-foreground">{placement.type} • {placement.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(placement.status)}
                      <Switch 
                        checked={placement.status === "active"}
                        onCheckedChange={() => handleTogglePlacement(placement.id)}
                      />
                    </div>
                  </div>

                  {placement.currentAd && (
                    <div className="p-3 rounded-lg bg-muted/50 mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Iklan Aktif:</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{placement.currentAd.advertiser}</p>
                          <p className="text-xs text-muted-foreground">{placement.currentAd.campaign}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          s/d {placement.currentAd.endDate}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="font-bold text-sm">{formatNumber(placement.impressions)}</p>
                      <p className="text-xs text-muted-foreground">Impressions</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="font-bold text-sm">{formatNumber(placement.clicks)}</p>
                      <p className="text-xs text-muted-foreground">Clicks</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="font-bold text-sm">{placement.ctr}%</p>
                      <p className="text-xs text-muted-foreground">CTR</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="font-bold text-sm text-success">{formatCurrency(placement.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="w-4 h-4 mr-1" />
                      Kelola
                    </Button>
                    <Button size="sm" variant="ghost">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advertisers */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advertisers</CardTitle>
              <CardDescription>Partner iklan aktif</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {advertisers.map((advertiser) => (
                  <div key={advertiser.id} className="p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{advertiser.name}</p>
                      <Badge variant={advertiser.status === "active" ? "default" : "secondary"}>
                        {advertiser.status === "active" ? "Aktif" : "Jeda"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Campaigns</p>
                        <p className="font-medium">{advertiser.campaigns}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Spent</p>
                        <p className="font-medium text-success">{formatCurrency(advertiser.totalSpent)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Plus className="w-4 h-4 mr-1" />
                Tambah Advertiser
              </Button>
            </CardContent>
          </Card>

          {/* Ad Guidelines */}
          <Card className="gradient-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-base">Panduan Brand Placement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm opacity-90">
                <p>• <strong>Dashboard Banner:</strong> Posisi premium, terlihat pertama kali saat login</p>
                <p>• <strong>Sidebar Widget:</strong> Tampil di semua halaman, engagement tinggi</p>
                <p>• <strong>Mobile Interstitial:</strong> CTR tinggi, cocok untuk campaign besar</p>
                <p>• <strong>Email Newsletter:</strong> Jangkauan luas, 35K+ subscriber</p>
                <p>• <strong>Featured Listing:</strong> Boost visibilitas di pencarian</p>
              </div>
              <Button variant="secondary" className="w-full mt-4">
                Download Media Kit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
