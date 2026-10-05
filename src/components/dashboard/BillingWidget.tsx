import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BillingItem {
  id: string;
  parentName: string;
  studentName: string;
  amount: number;
  dueDate: string;
  status: "paid" | "unpaid" | "overdue";
}

interface BillingWidgetProps {
  items: BillingItem[];
  totalRevenue: number;
  pendingAmount: number;
}

export function BillingWidget({ items, totalRevenue, pendingAmount }: BillingWidgetProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base">Billing & Pembayaran</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">Bulan ini</p>
          </div>
        </div>
        <Link href="/billing">
          <Button variant="soft" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 shrink-0">
            Lihat Semua
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 rounded-xl bg-success/5 border border-success/20">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Diterima</p>
            <p className="text-sm sm:text-xl font-bold text-success break-all">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-warning/5 border border-warning/20">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Belum Dibayar</p>
            <p className="text-sm sm:text-xl font-bold text-warning-foreground break-all">{formatCurrency(pendingAmount)}</p>
          </div>
        </div>

        {/* Recent invoices */}
        <div className="space-y-2 sm:space-y-3">
          {items.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start sm:items-center justify-between p-2 sm:p-3 rounded-lg gap-2",
                item.status === "paid"
                  ? "bg-success/5"
                  : item.status === "overdue"
                  ? "bg-destructive/5"
                  : "bg-muted/30"
              )}
            >
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {item.status === "paid" ? (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success shrink-0 mt-0.5 sm:mt-0" />
                ) : (
                  <AlertCircle
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 sm:mt-0",
                      item.status === "overdue" ? "text-destructive" : "text-warning"
                    )}
                  />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm text-foreground truncate">{item.parentName}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {item.studentName} • {item.dueDate}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-semibold text-xs sm:text-sm text-foreground whitespace-nowrap">{formatCurrency(item.amount)}</p>
                <Badge variant={item.status} className="text-[10px] sm:text-xs">{item.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
