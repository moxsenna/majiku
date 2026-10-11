import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isDemoEmail } from "@/lib/demo";
import { getInvoices } from "@/server/actions/billing";
import { getTutors } from "@/server/actions/payout";
import { 
  CreditCard, Wallet, BookOpen, Bell, Send, 
  Clock, AlertTriangle, CheckCircle2, ChevronRight
} from "lucide-react";

interface PendingPayment {
  id: string;
  parentName: string;
  studentName: string;
  parentPhone?: string | null;
  amount: number;
  dueDate: string;
  daysLeft: number;
}

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

interface TeacherSalary {
  id: string;
  name: string;
  amount: number;
  bonus: number;
  status: "pending" | "ready";
}

const demoPendingPayments: PendingPayment[] = [
  { id: "1", parentName: "Ibu Sari", studentName: "Aisyah", amount: 2500000, dueDate: "2024-01-20", daysLeft: 3 },
  { id: "2", parentName: "Ibu Maya", studentName: "Budi", amount: 3000000, dueDate: "2024-01-21", daysLeft: 4 },
  { id: "3", parentName: "Bapak Andi", studentName: "Citra", amount: 2800000, dueDate: "2024-01-22", daysLeft: 5 },
];

const demoTeacherSalaries: TeacherSalary[] = [
  { id: "1", name: "Ibu Sari", amount: 4500000, bonus: 500000, status: "ready" },
  { id: "2", name: "Ibu Dina", amount: 4500000, bonus: 300000, status: "ready" },
  { id: "3", name: "Ibu Ratna", amount: 4500000, bonus: 0, status: "pending" },
  { id: "4", name: "Ibu Wati", amount: 4500000, bonus: 200000, status: "ready" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function AdminNavbarActions() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isDemo = isDemoEmail(user?.email);

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  const { data: tutors = [] } = useQuery({
    queryKey: ["tutors"],
    queryFn: getTutors,
  });

  const pendingPayments: PendingPayment[] = isDemo
    ? demoPendingPayments
    : invoices
        .filter((inv) => inv.status !== "paid")
        .map((inv) => ({
          id: inv.id,
          parentName: inv.parentName || "Orang Tua Siswa",
          studentName: inv.studentName,
          parentPhone: inv.parentPhone || null,
          amount: Number(inv.total ?? inv.amount ?? 0),
          dueDate: inv.dueDate || "Hari ini",
          daysLeft: 3,
        }));

  const teacherSalaries: TeacherSalary[] = isDemo
    ? demoTeacherSalaries
    : tutors.map((t) => ({
        id: t.id,
        name: t.name,
        amount: 4500000,
        bonus: 0,
        status: "ready" as const,
      }));

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

  const totalSalary = teacherSalaries.reduce((sum, t) => sum + t.amount + t.bonus, 0);
  const readySalaries = teacherSalaries.filter((t) => t.status === "ready").length;

  const handleSendReminder = (payment: PendingPayment) => {
    if (!payment.parentPhone) {
      toast({
        title: "Nomor WhatsApp Tidak Ditemukan",
        description: `Tidak ada nomor kontak tersimpan untuk ${payment.parentName}.`,
        variant: "destructive",
      });
      return;
    }

    const phone = normalizePhone(payment.parentPhone);
    const message = `Halo ${payment.parentName}, mengingatkan tagihan SPP untuk ananda ${payment.studentName} sebesar ${formatCurrency(payment.amount)} dengan jatuh tempo ${payment.dueDate}. Terima kasih.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast({
      title: "Membuka WhatsApp",
      description: `Menyiapkan pengingat untuk ${payment.parentName}`,
    });
  };

  const handleSendAllReminders = () => {
    const withPhone = pendingPayments.filter((p) => Boolean(p.parentPhone));
    const withoutPhone = pendingPayments.length - withPhone.length;

    if (withPhone.length === 0) {
      toast({
        title: "Tidak Dapat Mengirim",
        description: "Tidak ada tagihan dengan nomor telepon orang tua tersimpan.",
        variant: "destructive",
      });
      return;
    }

    const first = withPhone[0];
    const phone = normalizePhone(first.parentPhone!);
    const message = `Halo ${first.parentName}, mengingatkan tagihan SPP untuk ananda ${first.studentName} sebesar ${formatCurrency(first.amount)} dengan jatuh tempo ${first.dueDate}. Terima kasih.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

    toast({
      title: "Pengingat Disiapkan",
      description: `Membuka WhatsApp untuk ${first.parentName}. (${withPhone.length} kontak terdata${withoutPhone > 0 ? `, ${withoutPhone} tanpa nomor dilewati` : ""}).`,
    });
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
      {/* Pending Payments */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap relative">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Tagihan</span>
            <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
              {pendingPayments.length}
            </Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Tagihan Akan Jatuh Tempo
              </DialogTitle>
              {pendingPayments.length > 0 && (
                <Button size="sm" variant="outline" onClick={handleSendAllReminders}>
                  <Send className="h-3 w-3 mr-1" />
                  Ingatkan Semua
                </Button>
              )}
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 pr-2">
              {pendingPayments.length === 0 ? (
                <p className="text-sm text-center py-6 text-muted-foreground">Tidak ada tagihan tertunda</p>
              ) : (
                pendingPayments.map((payment) => (
                  <Card key={payment.id} className={payment.daysLeft <= 3 ? "border-warning/30 bg-warning/5" : ""}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            <AvatarFallback>{payment.parentName.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{payment.parentName}</p>
                            <p className="text-xs text-muted-foreground">{payment.studentName}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={
                          payment.daysLeft <= 3 
                            ? "bg-warning/10 text-warning border-warning/20" 
                            : "bg-muted"
                        }>
                          <Clock className="h-3 w-3 mr-1" />
                          {payment.daysLeft} hari
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-bold">{formatCurrency(payment.amount)}</p>
                        <Button size="sm" variant="outline" onClick={() => handleSendReminder(payment)}>
                          <Send className="h-3 w-3 mr-1" />
                          Ingatkan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Teacher Salaries */}
      <Dialog open={salaryDialogOpen} onOpenChange={setSalaryDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap relative">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Gaji Guru</span>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {readySalaries}
            </Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Rekap Gaji Guru
            </DialogTitle>
          </DialogHeader>
          <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">Total Estimasi Gaji:</span>
            <span className="font-bold text-sm text-primary">{formatCurrency(totalSalary)}</span>
          </div>
          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-2 pr-2">
              {teacherSalaries.length === 0 ? (
                <p className="text-sm text-center py-6 text-muted-foreground">Belum ada guru terdaftar</p>
              ) : (
                teacherSalaries.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs">
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-muted-foreground">{formatCurrency(t.amount)}</p>
                    </div>
                    <Badge variant={t.status === "ready" ? "default" : "outline"}>
                      {t.status === "ready" ? "Siap Dibayar" : "Pending"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Lesson Plans */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Lesson Plan</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Lesson Plan Hari Ini
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-warning mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm font-medium">2 Kelas Belum Input</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  TK A dan Playgroup B belum menginput lesson plan hari ini
                </p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {[
                { class: "Toddler A", tutor: "Ibu Sari", status: "done", topic: "Mengenal Warna" },
                { class: "Toddler B", tutor: "Ibu Dina", status: "done", topic: "Bermain Sensori" },
                { class: "Playgroup A", tutor: "Ibu Wati", status: "done", topic: "Menghitung 1-10" },
                { class: "Playgroup B", tutor: "Ibu Yanti", status: "pending", topic: "-" },
                { class: "TK A", tutor: "Ibu Ratna", status: "pending", topic: "-" },
                { class: "TK B", tutor: "Ibu Lina", status: "done", topic: "Membaca Huruf" },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    item.status === "done" ? "bg-muted/30" : "bg-warning/5 border border-warning/20"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{item.class}</p>
                    <p className="text-xs text-muted-foreground">{item.tutor}</p>
                  </div>
                  <div className="text-right">
                    {item.status === "done" ? (
                      <>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 mb-1">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                        <p className="text-xs text-muted-foreground">{item.topic}</p>
                      </>
                    ) : (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
