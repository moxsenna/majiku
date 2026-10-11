import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard, CheckCircle2, Clock, AlertTriangle, Search,
  Send, Wallet
} from "lucide-react";
import { getInvoices, type InvoiceRow } from "@/server/actions/billing";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const statusConfig = {
  paid: { label: "Lunas", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  pending: { label: "Belum Bayar", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  overdue: { label: "Terlambat", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  cancelled: { label: "Dibatalkan", color: "bg-muted text-muted-foreground border-border", icon: Clock },
};

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return "62" + cleaned.slice(1);
  }
  if (cleaned.startsWith("62")) {
    return cleaned;
  }
  return "62" + cleaned;
}

interface RevenueDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: InvoiceRow[];
}

export function RevenueDetailModal({ open, onOpenChange, data: initialData }: RevenueDetailModalProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices(),
    enabled: open,
    initialData,
  });

  const parsedInvoices = useMemo(() => {
    return invoices.map((inv) => {
      let mappedStatus: "paid" | "pending" | "overdue" | "cancelled" = "pending";
      if (inv.status === "paid") mappedStatus = "paid";
      else if (inv.status === "overdue") mappedStatus = "overdue";
      else if (inv.status === "cancelled") mappedStatus = "cancelled";
      else mappedStatus = "pending";

      return {
        id: inv.id,
        parentName: inv.parentName || "Orang Tua",
        studentName: inv.studentName || "Siswa",
        parentPhone: inv.parentPhone || null,
        amount: Number(inv.total ?? inv.amount ?? 0),
        dueDate: inv.dueDate || "-",
        status: mappedStatus,
      };
    });
  }, [invoices]);

  const paidPayments = useMemo(() => parsedInvoices.filter((p) => p.status === "paid"), [parsedInvoices]);
  const pendingPayments = useMemo(() => parsedInvoices.filter((p) => p.status === "pending"), [parsedInvoices]);
  const overduePayments = useMemo(() => parsedInvoices.filter((p) => p.status === "overdue"), [parsedInvoices]);

  const totalPaid = useMemo(() => paidPayments.reduce((sum, p) => sum + p.amount, 0), [paidPayments]);
  const totalPending = useMemo(() => pendingPayments.reduce((sum, p) => sum + p.amount, 0), [pendingPayments]);
  const totalOverdue = useMemo(() => overduePayments.reduce((sum, p) => sum + p.amount, 0), [overduePayments]);

  const filteredPayments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return parsedInvoices;
    return parsedInvoices.filter(
      (p) =>
        p.parentName.toLowerCase().includes(q) ||
        p.studentName.toLowerCase().includes(q)
    );
  }, [parsedInvoices, searchQuery]);

  const handleSendReminder = (payment: (typeof parsedInvoices)[number]) => {
    if (!payment.parentPhone) {
      toast({
        title: "Nomor WhatsApp Tidak Ditemukan",
        description: `Tidak ada nomor kontak tersimpan untuk ${payment.parentName}`,
        variant: "destructive",
      });
      return;
    }

    const phone = normalizePhone(payment.parentPhone);
    const message = `Halo ${payment.parentName}, mengingatkan tagihan SPP untuk ananda ${payment.studentName} sebesar ${formatCurrency(payment.amount)} dengan tanggal jatuh tempo ${payment.dueDate}. Terima kasih.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] p-0 mx-2">
        <DialogHeader className="p-3 sm:p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Rekap Pendapatan & Tagihan
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 sm:p-4 pt-3 space-y-3">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="bg-success/5 border-success/20">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Lunas</span>
                </div>
                <p className="text-sm sm:text-lg font-bold text-success">
                  {formatCurrency(totalPaid)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{paidPayments.length} tagihan</p>
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
                <p className="text-[10px] sm:text-xs text-muted-foreground">{pendingPayments.length} tagihan</p>
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
                <p className="text-[10px] sm:text-xs text-muted-foreground">{overduePayments.length} tagihan</p>
              </CardContent>
            </Card>
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
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">Tidak ada data tagihan</div>
                ) : (
                  filteredPayments.map((payment) => (
                    <PaymentCard
                      key={payment.id}
                      payment={payment}
                      onSendReminder={handleSendReminder}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="mt-0 space-y-2">
                {overduePayments.length === 0 && pendingPayments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">Tidak ada tagihan tertunggak</div>
                ) : (
                  [...overduePayments, ...pendingPayments].map((payment) => (
                    <PaymentCard
                      key={payment.id}
                      payment={payment}
                      onSendReminder={handleSendReminder}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="paid" className="mt-0 space-y-2">
                {paidPayments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">Belum ada tagihan lunas</div>
                ) : (
                  paidPayments.map((payment) => (
                    <PaymentCard
                      key={payment.id}
                      payment={payment}
                      onSendReminder={handleSendReminder}
                    />
                  ))
                )}
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
  payment: {
    id: string;
    parentName: string;
    studentName: string;
    parentPhone: string | null;
    amount: number;
    dueDate: string;
    status: "paid" | "pending" | "overdue" | "cancelled";
  };
  onSendReminder: (payment: {
    id: string;
    parentName: string;
    studentName: string;
    parentPhone: string | null;
    amount: number;
    dueDate: string;
    status: "paid" | "pending" | "overdue" | "cancelled";
  }) => void;
}) {
  const config = statusConfig[payment.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
            <AvatarFallback className="text-xs">
              {payment.parentName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
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
                className="h-8 w-8 shrink-0 text-success hover:text-success hover:bg-success/10"
                title="Kirim pengingat WhatsApp"
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
