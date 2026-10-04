import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, Wallet, BookOpen, Bell, Send, 
  Clock, AlertTriangle, CheckCircle2, ChevronRight
} from "lucide-react";

interface PendingPayment {
  id: string;
  parentName: string;
  studentName: string;
  amount: number;
  dueDate: string;
  daysLeft: number;
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
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

  const totalSalary = demoTeacherSalaries.reduce((sum, t) => sum + t.amount + t.bonus, 0);
  const readySalaries = demoTeacherSalaries.filter((t) => t.status === "ready").length;

  const handleSendReminder = (payment: PendingPayment) => {
    toast({
      title: "Reminder Terkirim",
      description: `Pengingat pembayaran dikirim ke ${payment.parentName}`,
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
              {demoPendingPayments.length}
            </Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Tagihan Akan Jatuh Tempo
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 pr-2">
              {demoPendingPayments.map((payment) => (
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
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Teacher Salary */}
      <Dialog open={salaryDialogOpen} onOpenChange={setSalaryDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Gaji</span>
            <span className="text-xs font-normal hidden md:inline text-muted-foreground">
              {formatCurrency(totalSalary).replace("Rp", "").trim()}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Akumulasi Gaji Guru
            </DialogTitle>
          </DialogHeader>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Gaji Bulan Ini</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalSalary)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {readySalaries}/{demoTeacherSalaries.length} siap dibayar
              </p>
            </CardContent>
          </Card>

          <ScrollArea className="max-h-[40vh]">
            <div className="space-y-2 pr-2">
              {demoTeacherSalaries.map((teacher) => (
                <Card key={teacher.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{teacher.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Gaji: {formatCurrency(teacher.amount)}
                          {teacher.bonus > 0 && ` + Bonus ${formatCurrency(teacher.bonus)}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      teacher.status === "ready" 
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-warning/10 text-warning border-warning/20"
                    }>
                      {teacher.status === "ready" ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" />Ready</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" />Pending</>
                      )}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
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
