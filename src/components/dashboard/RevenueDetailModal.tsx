import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard, CheckCircle2, Clock, AlertTriangle, Search,
  Send, Download, TrendingUp, Wallet, Bell, FileText
} from "lucide-react";

interface PaymentRecord {
  id: string;
  parentName: string;
  studentName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "paid" | "pending" | "overdue";
  method?: string;
  avatar?: string;
}

const demoPayments: PaymentRecord[] = [
  {
    id: "1",
    parentName: "Ibu Sari Dewi",
    studentName: "Aisyah",
    amount: 2500000,
    dueDate: "2024-01-15",
    paidDate: "2024-01-10",
    status: "paid",
    method: "Transfer Bank",
  },
  {
    id: "2",
    parentName: "Bapak Andi",
    studentName: "Budi",
    amount: 3000000,
    dueDate: "2024-01-15",
    paidDate: "2024-01-14",
    status: "paid",
    method: "QRIS",
  },
  {
    id: "3",
    parentName: "Ibu Maya",
    studentName: "Citra",
    amount: 2800000,
    dueDate: "2024-01-20",
    status: "pending",
  },
  {
    id: "4",
    parentName: "Ibu Fitri",
    studentName: "Dimas",
    amount: 3500000,
    dueDate: "2024-01-10",
    status: "overdue",
  },
  {
    id: "5",
    parentName: "Bapak Hendra",
    studentName: "Elsa",
    amount: 2500000,
    dueDate: "2024-01-25",
    status: "pending",
  },
  {
    id: "6",
    parentName: "Ibu Rina",
    studentName: "Farhan",
    amount: 3000000,
    dueDate: "2024-01-05",
    status: "overdue",
  },
  {
    id: "7",
    parentName: "Ibu Wati",
    studentName: "Gita",
    amount: 2800000,
    dueDate: "2024-01-12",
    paidDate: "2024-01-11",
    status: "paid",
    method: "Transfer Bank",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const statusConfig = {
  paid: { label: "Lunas", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  overdue: { label: "Terlambat", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
};

interface RevenueDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RevenueDetailModal({ open, onOpenChange }: RevenueDetailModalProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  const paidPayments = demoPayments.filter((p) => p.status === "paid");
  const pendingPayments = demoPayments.filter((p) => p.status === "pending");
  const overduePayments = demoPayments.filter((p) => p.status === "overdue");

  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = demoPayments.filter(
    (p) =>
      p.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendReminder = (payment: PaymentRecord) => {
    toast({
      title: "Notifikasi Terkirim",
      description: `Pengingat tagihan berhasil dikirim ke ${payment.parentName}`,
    });
  };

  const handleBulkReminder = () => {
    const unpaidPayments = [...pendingPayments, ...overduePayments];
    toast({
      title: "Notifikasi Massal Terkirim",
      description: `Pengingat tagihan dikirim ke ${unpaidPayments.length} orang tua`,
    });
  };

  const handleExportReport = () => {
    toast({
      title: "Laporan Diunduh",
      description: "Laporan pembayaran berhasil diunduh",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] p-0 mx-2">
        <DialogHeader className="p-3 sm:p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Rekap Pendapatan Bulan Ini
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 sm:p-4 pt-3 space-y-3">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="bg-success/5 border-success/20">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Sudah Bayar</span>
                </div>
                <p className="text-sm sm:text-lg font-bold text-success">
                  {formatCurrency(totalPaid)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{paidPayments.length} pembayaran</p>
              </CardContent>
            </Card>
            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Belum Bayar</span>
                </div>
                <p className="text-sm sm:text-lg font-bold text-warning">
                  {formatCurrency(totalPending)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{pendingPayments.length} pembayaran</p>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Terlambat</span>
                </div>
                <p className="text-sm sm:text-lg font-bold text-destructive">
                  {formatCurrency(totalOverdue)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{overduePayments.length} pembayaran</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleBulkReminder} className="flex-1 gap-2 text-xs sm:text-sm h-9 sm:h-10">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              Kirim Semua
            </Button>
            <Button variant="outline" onClick={handleExportReport} className="gap-2 text-xs sm:text-sm h-9 sm:h-10">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              Download
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama orang tua atau siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all">
            <TabsList className="w-full h-9">
              <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm">Semua</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1 text-xs sm:text-sm">
                Belum Bayar
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                  {pendingPayments.length + overduePayments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="paid" className="flex-1 text-xs sm:text-sm">Lunas</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[35vh] sm:h-[40vh] mt-3">
              <TabsContent value="all" className="mt-0 space-y-2">
                {filteredPayments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onSendReminder={handleSendReminder}
                  />
                ))}
              </TabsContent>

              <TabsContent value="pending" className="mt-0 space-y-2">
                {[...overduePayments, ...pendingPayments].map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onSendReminder={handleSendReminder}
                  />
                ))}
              </TabsContent>

              <TabsContent value="paid" className="mt-0 space-y-2">
                {paidPayments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onSendReminder={handleSendReminder}
                  />
                ))}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentCard({
  payment,
  onSendReminder,
}: {
  payment: PaymentRecord;
  onSendReminder: (payment: PaymentRecord) => void;
}) {
  const config = statusConfig[payment.status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
            <AvatarImage src={payment.avatar} />
            <AvatarFallback className="text-xs">{payment.parentName.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{payment.parentName}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {payment.studentName} • Jatuh tempo: {payment.dueDate}
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="text-right">
              <p className="font-bold text-xs sm:text-sm">{formatCurrency(payment.amount)}</p>
              <Badge variant="outline" className={`${config.color} text-[10px] h-5`}>
                <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                {config.label}
              </Badge>
            </div>
            {payment.status !== "paid" && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onSendReminder(payment)}
                className="h-8 w-8 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
