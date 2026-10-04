import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, CreditCard, FileText, TrendingUp, Search, Send, Download, Clock, CheckCircle2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyRevenue = [
  { month: "Jan", income: 45000000, pending: 5000000 },
  { month: "Feb", income: 52000000, pending: 3000000 },
  { month: "Mar", income: 48000000, pending: 7000000 },
  { month: "Apr", income: 61000000, pending: 4000000 },
  { month: "May", income: 55000000, pending: 6000000 },
  { month: "Jun", income: 67000000, pending: 2000000 },
];

const invoices = [
  { id: "INV-2024-001", daycare: "TK Ceria Mandiri", plan: "Pro", amount: 599000, status: "paid", dueDate: "15 Jan 2025", paidDate: "14 Jan 2025" },
  { id: "INV-2024-002", daycare: "Bimbel Prestasi", plan: "Pro", amount: 599000, status: "paid", dueDate: "15 Jan 2025", paidDate: "15 Jan 2025" },
  { id: "INV-2024-003", daycare: "Daycare Sunshine", plan: "Basic", amount: 299000, status: "overdue", dueDate: "10 Jan 2025", paidDate: null },
  { id: "INV-2024-004", daycare: "PAUD Tunas Harapan", plan: "Basic", amount: 299000, status: "pending", dueDate: "20 Jan 2025", paidDate: null },
  { id: "INV-2024-005", daycare: "Happy Kids", plan: "Enterprise", amount: 1500000, status: "paid", dueDate: "1 Jan 2025", paidDate: "30 Des 2024" },
];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  paid: { label: "Lunas", variant: "default" },
  pending: { label: "Menunggu", variant: "secondary" },
  overdue: { label: "Terlambat", variant: "destructive" },
};

export default function FinanceTab() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const totalIncome = 365505000;
  const totalPending = 27000000;
  const totalPaid = 338505000;

  const filtered = invoices.filter(inv =>
    inv.daycare.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-success" /></div><div><p className="text-xs text-muted-foreground">Total Pendapatan</p><p className="text-xl font-bold">{formatCurrency(totalIncome)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Sudah Dibayar</p><p className="text-xl font-bold">{formatCurrency(totalPaid)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="w-5 h-5 text-warning" /></div><div><p className="text-xs text-muted-foreground">Tertunda</p><p className="text-xl font-bold">{formatCurrency(totalPending)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-info" /></div><div><p className="text-xs text-muted-foreground">Pertumbuhan</p><p className="text-xl font-bold">+15%</p></div></div></CardContent></Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tren Pendapatan</CardTitle>
          <CardDescription>Pendapatan bulanan dari langganan vendor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={v => formatCurrency(v)} className="text-xs" />
                <Tooltip formatter={(v: number) => [formatCurrency(v), ""]} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="income" stroke="hsl(var(--success))" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Faktur & Invoice</CardTitle>
              <CardDescription>Kelola tagihan dari vendor</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" />Export</Button>
              <Button size="sm" className="gap-2"><FileText className="w-4 h-4" />Buat Invoice</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari invoice..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            {filtered.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{inv.id}</p>
                    <Badge variant={statusConfig[inv.status]?.variant}>{statusConfig[inv.status]?.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{inv.daycare} • {inv.plan} • Jatuh tempo: {inv.dueDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-medium text-sm">{formatCurrency(inv.amount)}</p>
                  {inv.status !== "paid" && (
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Reminder terkirim", description: `Invoice ${inv.id} reminder dikirim ke ${inv.daycare}` })}>
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
