import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  DollarSign, 
  Link2, 
  Copy, 
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Wallet,
  Share2,
  Target,
  Gift,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const affiliateStats = {
  totalAffiliates: 248,
  activeAffiliates: 186,
  totalReferrals: 892,
  successfulConversions: 324,
  totalCommissionPaid: 156000000,
  pendingCommission: 28500000,
  averageConversionRate: 36.3,
};

const topAffiliates = [
  { 
    id: 1, 
    name: "Ahmad Fauzi", 
    email: "ahmad@example.com",
    referrals: 45,
    conversions: 28,
    earnings: 16800000,
    pendingPayout: 2400000,
    tier: "Gold",
    joinDate: "Mar 2024"
  },
  { 
    id: 2, 
    name: "Siti Nurhaliza", 
    email: "siti@example.com",
    referrals: 38,
    conversions: 22,
    earnings: 13200000,
    pendingPayout: 1800000,
    tier: "Gold",
    joinDate: "Apr 2024"
  },
  { 
    id: 3, 
    name: "Budi Santoso", 
    email: "budi@example.com",
    referrals: 32,
    conversions: 18,
    earnings: 10800000,
    pendingPayout: 1200000,
    tier: "Silver",
    joinDate: "May 2024"
  },
  { 
    id: 4, 
    name: "Dewi Lestari", 
    email: "dewi@example.com",
    referrals: 28,
    conversions: 15,
    earnings: 9000000,
    pendingPayout: 900000,
    tier: "Silver",
    joinDate: "Jun 2024"
  },
  { 
    id: 5, 
    name: "Rizky Pratama", 
    email: "rizky@example.com",
    referrals: 24,
    conversions: 12,
    earnings: 7200000,
    pendingPayout: 600000,
    tier: "Bronze",
    joinDate: "Jul 2024"
  },
];

const pendingPayouts = [
  { id: 1, name: "Ahmad Fauzi", amount: 2400000, bank: "BCA", status: "pending" },
  { id: 2, name: "Siti Nurhaliza", amount: 1800000, bank: "Mandiri", status: "pending" },
  { id: 3, name: "Budi Santoso", amount: 1200000, bank: "BNI", status: "processing" },
];

const commissionTiers = [
  { tier: "Bronze", rate: 10, minReferrals: 0, color: "bg-amber-100 text-amber-700" },
  { tier: "Silver", rate: 15, minReferrals: 10, color: "bg-slate-100 text-slate-700" },
  { tier: "Gold", rate: 20, minReferrals: 25, color: "bg-yellow-100 text-yellow-700" },
  { tier: "Platinum", rate: 25, minReferrals: 50, color: "bg-purple-100 text-purple-700" },
];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}jt`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export default function AffiliateWidget() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");

  const handleCopyLink = (affiliateId: string) => {
    navigator.clipboard.writeText(`https://majiku.id/ref/${affiliateId}`);
    toast({
      title: "Link Disalin",
      description: "Link affiliate telah disalin ke clipboard",
    });
  };

  const handleProcessPayout = (name: string) => {
    toast({
      title: "Payout Diproses",
      description: `Pembayaran untuk ${name} sedang diproses`,
    });
  };

  const getTierBadge = (tier: string) => {
    const tierData = commissionTiers.find(t => t.tier === tier);
    return <Badge className={tierData?.color || ""}>{tier}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{affiliateStats.totalAffiliates}</p>
                <p className="text-xs text-muted-foreground">Total Affiliate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{affiliateStats.successfulConversions}</p>
                <p className="text-xs text-muted-foreground">Konversi Sukses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(affiliateStats.totalCommissionPaid)}</p>
                <p className="text-xs text-muted-foreground">Total Komisi Dibayar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{affiliateStats.averageConversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Commission Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Tier Komisi
                </CardTitle>
                <CardDescription>Struktur komisi affiliate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commissionTiers.map((tier) => (
                    <div key={tier.tier} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={tier.color}>{tier.tier}</Badge>
                        <span className="text-lg font-bold text-primary">{tier.rate}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Min. {tier.minReferrals} referral berhasil
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      Top Affiliates
                    </CardTitle>
                    <CardDescription>Performa affiliate terbaik</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    Lihat Semua
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topAffiliates.slice(0, 3).map((affiliate, index) => (
                    <div key={affiliate.id} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {affiliate.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                              {index + 1}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{affiliate.name}</p>
                            <p className="text-xs text-muted-foreground">{affiliate.email}</p>
                          </div>
                        </div>
                        {getTierBadge(affiliate.tier)}
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                        <div className="p-2 rounded bg-muted/50">
                          <p className="font-bold text-sm">{affiliate.referrals}</p>
                          <p className="text-xs text-muted-foreground">Referral</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="font-bold text-sm">{affiliate.conversions}</p>
                          <p className="text-xs text-muted-foreground">Konversi</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="font-bold text-sm text-success">{formatCurrency(affiliate.earnings)}</p>
                          <p className="text-xs text-muted-foreground">Earnings</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Semua Affiliate</CardTitle>
              <CardDescription>Daftar semua affiliate aktif</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAffiliates.map((affiliate) => (
                  <div key={affiliate.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {affiliate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{affiliate.name}</p>
                          <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                          <p className="text-xs text-muted-foreground">Bergabung: {affiliate.joinDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getTierBadge(affiliate.tier)}
                        <p className="text-xs text-muted-foreground mt-1">
                          Rate: {commissionTiers.find(t => t.tier === affiliate.tier)?.rate}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="text-center p-2 rounded bg-muted/50">
                        <p className="font-bold">{affiliate.referrals}</p>
                        <p className="text-xs text-muted-foreground">Referral</p>
                      </div>
                      <div className="text-center p-2 rounded bg-muted/50">
                        <p className="font-bold">{affiliate.conversions}</p>
                        <p className="text-xs text-muted-foreground">Konversi</p>
                      </div>
                      <div className="text-center p-2 rounded bg-muted/50">
                        <p className="font-bold text-success">{formatCurrency(affiliate.earnings)}</p>
                        <p className="text-xs text-muted-foreground">Total Earned</p>
                      </div>
                      <div className="text-center p-2 rounded bg-muted/50">
                        <p className="font-bold text-warning">{formatCurrency(affiliate.pendingPayout)}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input 
                        value={`https://majiku.id/ref/${affiliate.id}`}
                        readOnly
                        className="text-xs"
                      />
                      <Button size="sm" variant="outline" onClick={() => handleCopyLink(String(affiliate.id))}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" />
                  Pending Payouts
                </CardTitle>
                <CardDescription>Pembayaran komisi yang menunggu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingPayouts.map((payout) => (
                    <div key={payout.id} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {payout.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{payout.name}</p>
                            <p className="text-xs text-muted-foreground">{payout.bank}</p>
                          </div>
                        </div>
                        <Badge variant={payout.status === "processing" ? "secondary" : "outline"}>
                          {payout.status === "processing" ? "Diproses" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-success">{formatCurrency(payout.amount)}</p>
                        <Button size="sm" onClick={() => handleProcessPayout(payout.name)}>
                          <Wallet className="w-4 h-4 mr-1" />
                          Proses
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Ringkasan Payout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-muted-foreground">Total Dibayar Bulan Ini</p>
                    <p className="text-2xl font-bold text-success">Rp 28.5jt</p>
                  </div>
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm text-muted-foreground">Pending Payout</p>
                    <p className="text-2xl font-bold text-warning">{formatCurrency(affiliateStats.pendingCommission)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Total Komisi (All Time)</p>
                    <p className="text-2xl font-bold">{formatCurrency(affiliateStats.totalCommissionPaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
