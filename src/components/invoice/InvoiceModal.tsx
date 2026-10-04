import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, ExternalLink, Printer, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { downloadInvoicePDF } from "@/lib/invoiceExport";
import { toast } from "sonner";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  parentName: string;
  studentName: string;
  className: string;
  packageName?: string;
  period?: string;
  items?: { description: string; amount: number }[];
  subtotal?: number;
  discount?: number;
  total?: number;
  amount?: number;
  dueDate: string;
  status: "paid" | "unpaid" | "overdue";
  paidDate?: string;
  paymentMethod?: string;
  schoolName?: string;
  schoolAddress?: string;
  schoolPhone?: string;
}

interface InvoiceModalProps {
  invoice: InvoiceData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const statusConfig = {
  paid: { icon: CheckCircle2, label: "Lunas", variant: "success" as const },
  unpaid: { icon: Clock, label: "Belum Dibayar", variant: "warning" as const },
  overdue: { icon: AlertCircle, label: "Jatuh Tempo", variant: "destructive" as const },
};

export function InvoiceModal({ invoice, open, onOpenChange }: InvoiceModalProps) {
  if (!invoice) return null;

  const config = statusConfig[invoice.status];
  const StatusIcon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice {invoice.invoiceNumber}</span>
            <Badge variant={config.variant}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* School Info */}
          <div className="text-center pb-4 border-b border-border">
            <h3 className="font-bold text-lg text-primary">{invoice.schoolName}</h3>
            <p className="text-xs text-muted-foreground">{invoice.schoolAddress}</p>
            <p className="text-xs text-muted-foreground">{invoice.schoolPhone}</p>
          </div>

          {/* Parent & Student Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Kepada</p>
              <p className="font-medium">{invoice.parentName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Siswa</p>
              <p className="font-medium">{invoice.studentName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Kelas</p>
              <p className="font-medium">{invoice.className}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Periode</p>
              <p className="font-medium">{invoice.period}</p>
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div className="space-y-2">
            <p className="font-medium text-sm">Detail Tagihan</p>
            {invoice.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.description}</span>
                <span>{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount && invoice.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Diskon</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(invoice.total)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jatuh Tempo</span>
              <span className={invoice.status === "overdue" ? "text-destructive font-medium" : ""}>
                {invoice.dueDate}
              </span>
            </div>
            {invoice.status === "paid" && invoice.paidDate && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Bayar</span>
                  <span>{invoice.paidDate}</span>
                </div>
                {invoice.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metode</span>
                    <span>{invoice.paymentMethod}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link to={`/parent/invoice/${invoice.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Lihat Detail
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                const exportInvoice = {
                  ...invoice,
                  amount: invoice.total || invoice.amount || 0,
                };
                downloadInvoicePDF(exportInvoice);
                toast.success("Invoice siap untuk diprint/download");
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                const exportInvoice = {
                  ...invoice,
                  amount: invoice.total || invoice.amount || 0,
                };
                downloadInvoicePDF(exportInvoice);
              }}
            >
              <Printer className="w-4 h-4" />
            </Button>
          </div>

          {invoice.status !== "paid" && (
            <Link to="/parent/payment">
              <Button variant="hero" className="w-full">
                Bayar Sekarang
              </Button>
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
