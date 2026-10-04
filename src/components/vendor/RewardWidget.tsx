import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  Star, 
  Trophy, 
  Medal,
  Crown,
  TrendingUp,
  Users,
  CheckCircle2,
  Sparkles,
  Gift
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const accreditationLevels = [
  { 
    id: 1, 
    name: "Bronze", 
    icon: Medal, 
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    requirements: "6+ bulan aktif, 50+ siswa",
    benefits: ["Badge di profil", "Prioritas support"],
    count: 180
  },
  { 
    id: 2, 
    name: "Silver", 
    icon: Award, 
    color: "text-slate-400",
    bgColor: "bg-slate-100",
    requirements: "12+ bulan aktif, 100+ siswa, rating 4.5+",
    benefits: ["Badge di profil", "Diskon 10%", "Akses fitur beta"],
    count: 95
  },
  { 
    id: 3, 
    name: "Gold", 
    icon: Trophy, 
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    requirements: "18+ bulan aktif, 200+ siswa, rating 4.8+",
    benefits: ["Badge premium", "Diskon 20%", "Account manager", "Featured listing"],
    count: 42
  },
  { 
    id: 4, 
    name: "Platinum", 
    icon: Crown, 
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    requirements: "24+ bulan aktif, 500+ siswa, rating 4.9+",
    benefits: ["Badge elite", "Diskon 30%", "Dedicated support", "Co-marketing", "Early access"],
    count: 12
  },
];

const topPerformers = [
  { 
    id: 1, 
    name: "Bimbel Ganesha", 
    type: "Bimbel",
    level: "Platinum",
    students: 850,
    rating: 4.95,
    revenue: 125000000,
    growth: 45,
    tenure: "36 bulan"
  },
  { 
    id: 2, 
    name: "Daycare Sunshine Academy", 
    type: "Daycare",
    level: "Gold",
    students: 320,
    rating: 4.88,
    revenue: 85000000,
    growth: 38,
    tenure: "24 bulan"
  },
  { 
    id: 3, 
    name: "TK Islam Terpadu Nur Hikmah", 
    type: "TK/PAUD",
    level: "Gold",
    students: 280,
    rating: 4.85,
    revenue: 72000000,
    growth: 32,
    tenure: "20 bulan"
  },
  { 
    id: 4, 
    name: "English First Kids", 
    type: "Kursus",
    level: "Silver",
    students: 180,
    rating: 4.75,
    revenue: 48000000,
    growth: 28,
    tenure: "14 bulan"
  },
  { 
    id: 5, 
    name: "PAUD Cendekia Bangsa", 
    type: "TK/PAUD",
    level: "Silver",
    students: 150,
    rating: 4.72,
    revenue: 38000000,
    growth: 25,
    tenure: "12 bulan"
  },
];

const pendingUpgrades = [
  { id: 1, name: "Bimbel Quantum", currentLevel: "Silver", nextLevel: "Gold", progress: 85 },
  { id: 2, name: "Daycare Happy Hearts", currentLevel: "Bronze", nextLevel: "Silver", progress: 92 },
  { id: 3, name: "TK Permata Bunda", currentLevel: "Silver", nextLevel: "Gold", progress: 78 },
];

const getLevelBadge = (level: string) => {
  switch (level) {
    case "Bronze": return <Badge className="bg-amber-100 text-amber-700 border-amber-300">🥉 Bronze</Badge>;
    case "Silver": return <Badge className="bg-slate-100 text-slate-700 border-slate-300">🥈 Silver</Badge>;
    case "Gold": return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">🏆 Gold</Badge>;
    case "Platinum": return <Badge className="bg-purple-100 text-purple-700 border-purple-300">👑 Platinum</Badge>;
    default: return <Badge variant="outline">{level}</Badge>;
  }
};

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(0)}jt`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export default function RewardWidget() {
  const { toast } = useToast();

  const handleGrantReward = (vendorName: string, level: string) => {
    toast({
      title: "Akreditasi Diberikan!",
      description: `${vendorName} telah menerima akreditasi ${level} MAJIKU`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Accreditation Levels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {accreditationLevels.map((level) => (
          <Card key={level.id} className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 ${level.bgColor} rounded-bl-full opacity-50`} />
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl ${level.bgColor} flex items-center justify-center`}>
                  <level.icon className={`w-6 h-6 ${level.color}`} />
                </div>
                <div>
                  <p className="font-bold">{level.name}</p>
                  <p className="text-2xl font-bold">{level.count}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{level.requirements}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>Vendor dengan performa terbaik bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((vendor, index) => (
                <div key={vendor.id} className="p-4 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {vendor.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-white">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">{vendor.type} • {vendor.tenure}</p>
                      </div>
                    </div>
                    {getLevelBadge(vendor.level)}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-primary">
                        <Users className="w-4 h-4" />
                        <span className="font-bold">{vendor.students}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Siswa</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">{vendor.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-success">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-bold">+{vendor.growth}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Growth</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="font-bold text-sm">{formatCurrency(vendor.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Gift className="w-4 h-4 mr-1" />
                      Kirim Reward
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Feature
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Upgrades */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Menuju Upgrade
              </CardTitle>
              <CardDescription>Vendor yang hampir naik level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingUpgrades.map((vendor) => (
                  <div key={vendor.id} className="p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{vendor.name}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      {getLevelBadge(vendor.currentLevel)}
                      <span className="text-muted-foreground">→</span>
                      {getLevelBadge(vendor.nextLevel)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{vendor.progress}%</span>
                      </div>
                      <Progress value={vendor.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accreditation Benefits */}
          <Card className="gradient-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5" />
                Akreditasi MAJIKU
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90 mb-4">
                Program penghargaan untuk vendor setia dan berprestasi. Vendor dengan akreditasi mendapat berbagai benefit eksklusif.
              </p>
              <div className="space-y-2">
                {["Badge eksklusif di profil", "Diskon langganan", "Prioritas support", "Featured listing", "Co-marketing opportunity"].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
