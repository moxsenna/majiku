import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvoices,
  getBillingEnrollments,
  markInvoicePaid,
  createInvoice,
  getBillingStudentOptions,
  type CreateInvoiceInput,
} from "@/server/actions/billing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search, CreditCard, Clock, AlertTriangle, CheckCircle2, Eye, Download, Calendar, Plus, Loader2,
} from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
  paid: { label: "Lunas", variant: "success", icon: CheckCircle2 },
  unpaid: { label: "Belum Bayar", variant: "warning", icon: Clock },
  overdue: { label: "Terlambat", variant: "destructive", icon: AlertTriangle },
  partial: { label: "Sebagian", variant: "info", icon: CreditCard },
};

export default function Billing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    studentId: "",
    amount: "",
    discount: "0",
    dueDate: "",
    notes: "",
    billingPeriodStart: "",
    billingPeriodEnd: "",
  });

  const { data: studentOptions = [] } = useQuery({
    queryKey: ["billing-student-options"],
    queryFn: getBillingStudentOptions,
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (input: CreateInvoiceInput) => createInvoice(input),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Invoice Diterbitkan ✓",
        description: `Invoice ${res.invoiceNumber} berhasil dibuat.`,
      });
      setIsCreateOpen(false);
      setCreateForm({
        studentId: "",
        amount: "",
        discount: "0",
        dueDate: "",
        notes: "",
        billingPeriodStart: "",
        billingPeriodEnd: "",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Gagal Membuat Invoice",
        description: err?.message || "Terjadi kesalahan.",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.studentId) {
      toast({ title: "Validasi gagal", description: "Pilih siswa terlebih dahulu", variant: "destructive" });
      return;
    }
    if (!createForm.amount || Number(createForm.amount) <= 0) {
      toast({ title: "Validasi gagal", description: "Nominal tagihan harus lebih dari 0", variant: "destructive" });
      return;
    }
    if (!createForm.dueDate) {
      toast({ title: "Validasi gagal", description: "Tanggal jatuh tempo wajib diisi", variant: "destructive" });
      return;
    }
    createInvoiceMutation.mutate({
      studentId: createForm.studentId,
      amount: Number(createForm.amount),
      discount: Number(createForm.discount || 0),
      dueDate: createForm.dueDate,
      notes: createForm.notes.trim() || undefined,
      billingPeriodStart: createForm.billingPeriodStart || undefined,
      billingPeriodEnd: createForm.billingPeriodEnd || undefined,
    });
  };

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => markInvoicePaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Invoice Lunas ✓",
        description: `Invoice ${selectedInvoice?.invoice_number || ""} berhasil ditandai lunas.`,
      });
      setSelectedInvoice(null);
    },
    onError: (err: any) => {
      toast({
        title: "Gagal Mengubah Status",
        description: err?.message || "Terjadi kesalahan saat memproses status invoice.",
        variant: "destructive",
      });
    },
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments-billing"],
    queryFn: getBillingEnrollments,
  });

  const filteredInvoices = invoices.filter((inv) => {
    const name = (inv.students as any)?.name || "";
    const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: invoices.reduce((s, i) => s + i.total, 0),
    paid: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0),
    unpaid: invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + i.total, 0),
    overdue: invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0),
  };

  return (
    <DashboardLayout title="Billing & Invoice" subtitle="Invoice otomatis berdasarkan tanggal pendaftaran masing-masing anak">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: CreditCard, label: "Total Revenue", value: formatCurrency(stats.total), color: "bg-primary/10 text-primary" },
          { icon: CheckCircle2, label: "Lunas", value: formatCurrency(stats.paid), color: "bg-success/10 text-success" },
          { icon: Clock, label: "Belum Bayar", value: formatCurrency(stats.unpaid), color: "bg-warning/10 text-warning" },
          { icon: AlertTriangle, label: "Terlambat", value: formatCurrency(stats.overdue), color: "bg-destructive/10 text-destructive" },
        ].map((s, i) => (
          <Card key={i} variant="flat">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl ${s.color.split(" ")[0]} flex items-center justify-center`}>
                  <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color.split(" ")[1]}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-sm sm:text-lg font-bold truncate">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Banner */}
      <Card variant="flat" className="mb-6 border-info/30 bg-info/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-info mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Invoice Per Anak Berdasarkan Tanggal Pendaftaran</p>
              <p className="text-xs text-muted-foreground mt-1">
                Setiap anak memiliki tanggal billing yang berbeda sesuai tanggal pendaftarannya. Contoh: anak yang mendaftar tanggal 5 akan mendapat invoice setiap tanggal 5 bulan berikutnya.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Schedule */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Jadwal Billing Per Anak</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {enrollments.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{(e.students as any)?.name}</p>
                  <p className="text-xs text-muted-foreground">{(e.classes as any)?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="info" className="text-[10px]">Tgl {e.billing_day}</Badge>
                  <p className="text-xs font-medium mt-1">{formatCurrency((e.classes as any)?.price_per_month || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters & Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari invoice..." className="pl-9" variant="filled" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[{ val: "all", label: "Semua" }, { val: "unpaid", label: "Belum Bayar" }, { val: "overdue", label: "Terlambat" }, { val: "paid", label: "Lunas" }].map((f) => (
              <Button key={f.val} variant={filterStatus === f.val ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(f.val)} className="whitespace-nowrap">
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Terbitkan Invoice
        </Button>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filteredInvoices.map((inv) => {
          const student = inv.students as any;
          const sc = statusConfig[inv.status] || statusConfig.unpaid;
          return (
            <Card key={inv.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{inv.invoice_number}</p>
                      <Badge variant={sc.variant} className="text-[10px]">
                        <sc.icon className="h-3 w-3 mr-1" />{sc.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{student?.name}</p>
                    <p className="text-xs text-muted-foreground">Parent: {student?.parent_name} • Daftar: {student?.registration_date}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatCurrency(inv.total)}</p>
                      <p className="text-xs text-muted-foreground">Jatuh tempo: {inv.due_date ? new Date(inv.due_date).toLocaleDateString("id-ID") : "-"}</p>
                    </div>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredInvoices.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Tidak ada invoice ditemukan</CardContent></Card>
        )}
      </div>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Invoice</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{selectedInvoice.invoice_number}</span>
                <Badge variant={statusConfig[selectedInvoice.status]?.variant}>{statusConfig[selectedInvoice.status]?.label}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Siswa</span><span>{(selectedInvoice.students as any)?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Orang Tua</span><span>{(selectedInvoice.students as any)?.parent_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tanggal Daftar</span><span>{(selectedInvoice.students as any)?.registration_date}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Periode</span><span>{selectedInvoice.billing_period_start} s/d {selectedInvoice.billing_period_end}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Jatuh Tempo</span><span>{selectedInvoice.due_date}</span></div>
                <hr className="border-border" />
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(selectedInvoice.amount)}</span></div>
                {selectedInvoice.discount > 0 && <div className="flex justify-between text-success"><span>Diskon</span><span>-{formatCurrency(selectedInvoice.discount)}</span></div>}
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">{formatCurrency(selectedInvoice.total)}</span></div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Tutup</Button>
            {selectedInvoice?.status !== "paid" && (
              <Button
                disabled={markPaidMutation.isPending}
                onClick={() => {
                  if (selectedInvoice?.id) {
                    markPaidMutation.mutate(selectedInvoice.id);
                  }
                }}
              >
                {markPaidMutation.isPending ? "Memproses..." : "Tandai Lunas"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terbitkan Invoice Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Terbitkan Invoice SPP Baru</DialogTitle>
              <DialogDescription>
                Buat tagihan biaya SPP, pendaftaran, atau kegiatan untuk siswa.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="inv-student">Pilih Siswa <span className="text-destructive">*</span></Label>
                <Select
                  value={createForm.studentId}
                  onValueChange={(val) => setCreateForm({ ...createForm, studentId: val })}
                >
                  <SelectTrigger id="inv-student">
                    <SelectValue placeholder="Pilih Siswa" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {studentOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="inv-amount">Nominal Tagihan (Rp) <span className="text-destructive">*</span></Label>
                  <Input
                    id="inv-amount"
                    type="number"
                    placeholder="Contoh: 1500000"
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-discount">Potongan / Diskon (Rp)</Label>
                  <Input
                    id="inv-discount"
                    type="number"
                    placeholder="Contoh: 0"
                    value={createForm.discount}
                    onChange={(e) => setCreateForm({ ...createForm, discount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inv-due-date">Tanggal Jatuh Tempo <span className="text-destructive">*</span></Label>
                <Input
                  id="inv-due-date"
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="inv-start">Periode Mulai</Label>
                  <Input
                    id="inv-start"
                    type="date"
                    value={createForm.billingPeriodStart}
                    onChange={(e) => setCreateForm({ ...createForm, billingPeriodStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-end">Periode Selesai</Label>
                  <Input
                    id="inv-end"
                    type="date"
                    value={createForm.billingPeriodEnd}
                    onChange={(e) => setCreateForm({ ...createForm, billingPeriodEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inv-notes">Catatan Tagihan</Label>
                <Textarea
                  id="inv-notes"
                  placeholder="Keterangan tagihan (misal: SPP Bulan November + Biaya Katering)..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={createInvoiceMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={createInvoiceMutation.isPending}>
                {createInvoiceMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Terbitkan Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
