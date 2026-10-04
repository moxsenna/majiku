import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  UserMinus, 
  TrendingDown, 
  Gift, 
  Mail, 
  Phone,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Percent,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const churnedVendors = [
  { 
    id: 1, 
    name: "TK Melati Indah", 
    type: "TK/PAUD",
    reason: "Biaya terlalu mahal",
    lastActive: "10 Des 2024",
    totalSpent: 3594000,
    duration: "6 bulan",
    students: 45,
    riskScore: 85,
    contacted: false
  },
  { 
    id: 2, 
    name: "Bimbel Pintar Cerdas", 
    type: "Bimbel",
    reason: "Fitur kurang lengkap",
    lastActive: "8 Des 2024",
    totalSpent: 1794000,
    duration: "3 bulan",
    students: 30,
    riskScore: 70,
    contacted: true
  },
  { 
    id: 3, 
    name: "Daycare Little Star", 
    type: "Daycare",
    reason: "Pindah ke kompetitor",
    lastActive: "5 Des 2024",
    totalSpent: 5988000,
    duration: "10 bulan",
    students: 60,
    riskScore: 90,
    contacted: false
  },
  { 
    id: 4, 
    name: "PAUD Pelangi", 
    type: "TK/PAUD",
    reason: "Bisnis tutup",
    lastActive: "1 Des 2024",
    totalSpent: 897000,
    duration: "3 bulan",
    students: 20,
    riskScore: 40,
    contacted: true
  },
];

const atRiskVendors = [
  { id: 1, name: "Kursus Bahasa Jepang", engagement: 25, lastLogin: "5 hari lalu", plan: "Basic" },
  { id: 2, name: "TK Kartika", engagement: 35, lastLogin: "7 hari lalu", plan: "Pro" },
  { id: 3, name: "Bimbel Quantum", engagement: 40, lastLogin: "4 hari lalu", plan: "Basic" },
];

const winbackOffers = [
  { id: 1, name: "Diskon 50% - 3 Bulan", discount: 50, duration: "3 bulan", used: 12 },
  { id: 2, name: "Upgrade Gratis ke Pro", discount: 100, duration: "1 bulan", used: 8 },
  { id: 3, name: "Diskon 30% - 6 Bulan", discount: 30, duration: "6 bulan", used: 5 },
];

const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export default function ChurnManagementWidget() {
  const { toast } = useToast();
  const [selectedOffer, setSelectedOffer] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");

  const handleSendOffer = (vendorName: string) => {
    toast({
      title: "Penawaran Terkirim",
      description: `Penawaran winback telah dikirim ke ${vendorName}`,
    });
  };

  const handleCall = (vendorName: string) => {
    toast({
      title: "Menghubungi Vendor",
      description: `Memulai panggilan ke ${vendorName}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <UserMinus className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">14</p>
                <p className="text-xs text-muted-foreground">Churned Bulan Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-muted-foreground">Winback Success</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.3%</p>
                <p className="text-xs text-muted-foreground">Churn Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Churned Vendors */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-destructive" />
              Vendor yang Berhenti
            </CardTitle>
            <CardDescription>Vendor yang tidak melanjutkan langganan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {churnedVendors.map((vendor) => (
                <div key={vendor.id} className="p-4 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-destructive/10 text-destructive text-xs">
                          {vendor.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">{vendor.type} • {vendor.students} siswa</p>
                      </div>
                    </div>
                    <Badge variant={vendor.contacted ? "secondary" : "destructive"}>
                      {vendor.contacted ? "Sudah Dihubungi" : "Belum Dihubungi"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Alasan</p>
                      <p className="font-medium">{vendor.reason}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Durasi</p>
                      <p className="font-medium">{vendor.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Spent</p>
                      <p className="font-medium">{formatCurrency(vendor.totalSpent)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risk Score</p>
                      <div className="flex items-center gap-2">
                        <Progress value={vendor.riskScore} className="h-2 w-16" />
                        <span className="font-medium">{vendor.riskScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="default">
                          <Gift className="w-4 h-4 mr-1" />
                          Kirim Penawaran
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Kirim Penawaran Winback</DialogTitle>
                          <DialogDescription>
                            Pilih penawaran untuk {vendor.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Pilih Penawaran</Label>
                            <div className="space-y-2">
                              {winbackOffers.map((offer) => (
                                <div 
                                  key={offer.id}
                                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                    selectedOffer === offer.name 
                                      ? 'border-primary bg-primary/5' 
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => setSelectedOffer(offer.name)}
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm">{offer.name}</p>
                                    <Badge variant="secondary">{offer.discount}% OFF</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Durasi: {offer.duration} • Digunakan: {offer.used}x
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Pesan Tambahan</Label>
                            <Textarea 
                              placeholder="Tulis pesan personal untuk vendor..."
                              value={customMessage}
                              onChange={(e) => setCustomMessage(e.target.value)}
                            />
                          </div>
                          <Button className="w-full" onClick={() => handleSendOffer(vendor.name)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Kirim Penawaran
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline" onClick={() => handleCall(vendor.name)}>
                      <Phone className="w-4 h-4 mr-1" />
                      Hubungi
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* At Risk Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Vendor Berisiko
            </CardTitle>
            <CardDescription>Engagement rendah, perlu perhatian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atRiskVendors.map((vendor) => (
                <div key={vendor.id} className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{vendor.name}</p>
                    <Badge variant="outline">{vendor.plan}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="font-medium text-warning">{vendor.engagement}%</span>
                    </div>
                    <Progress value={vendor.engagement} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Login terakhir: {vendor.lastLogin}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    Kirim Bantuan
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
