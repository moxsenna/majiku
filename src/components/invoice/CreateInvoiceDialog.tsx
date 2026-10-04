import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface InvoiceItem {
  description: string;
  amount: number;
}

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (invoice: any) => void;
}

const students = [
  { id: "1", name: "Arjuna Wijaya", className: "Kelas Bunga Matahari", parentName: "Bpk. Ahmad Wijaya" },
  { id: "2", name: "Aisyah Putri", className: "Kelas Bunga Matahari", parentName: "Ibu Sari Putri" },
  { id: "3", name: "Raka Pratama", className: "Kelas Pelangi", parentName: "Bpk. Rudi Pratama" },
  { id: "4", name: "Keisha Azzahra", className: "Kelas Bintang", parentName: "Ibu Dewi Azzahra" },
];

export function CreateInvoiceDialog({ open, onOpenChange, onSubmit }: CreateInvoiceDialogProps) {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [period, setPeriod] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "SPP Bulanan", amount: 2000000 },
  ]);
  const [discount, setDiscount] = useState(0);

  const student = students.find(s => s.id === selectedStudent);

  const addItem = () => {
    setItems([...items, { description: "", amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    if (field === "amount") {
      newItems[index][field] = Number(value) || 0;
    } else {
      newItems[index][field] = value as string;
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal - discount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !period || !dueDate || items.length === 0) {
      toast.error("Mohon lengkapi semua data invoice");
      return;
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const newInvoice = {
      id: String(Date.now()),
      invoiceNumber,
      parentName: student?.parentName || "",
      studentName: student?.name || "",
      className: student?.className || "",
      period,
      items,
      subtotal,
      discount,
      total,
      amount: total,
      dueDate: new Date(dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      status: "unpaid" as const,
    };

    onSubmit(newInvoice);
    toast.success("Invoice berhasil dibuat!");
    onOpenChange(false);
    
    // Reset form
    setSelectedStudent("");
    setPeriod("");
    setDueDate("");
    setItems([{ description: "SPP Bulanan", amount: 2000000 }]);
    setDiscount(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Invoice Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label>Siswa</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih siswa" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} - {s.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {student && (
              <p className="text-xs text-muted-foreground">Orang tua: {student.parentName}</p>
            )}
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label>Periode</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Januari 2025">Januari 2025</SelectItem>
                <SelectItem value="Februari 2025">Februari 2025</SelectItem>
                <SelectItem value="Maret 2025">Maret 2025</SelectItem>
                <SelectItem value="April 2025">April 2025</SelectItem>
                <SelectItem value="Mei 2025">Mei 2025</SelectItem>
                <SelectItem value="Juni 2025">Juni 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Jatuh Tempo</Label>
            <Input 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Invoice Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Item Tagihan</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Tambah Item
              </Button>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Deskripsi"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                  />
                </div>
                <div className="w-36">
                  <Input
                    type="number"
                    placeholder="Jumlah"
                    value={item.amount || ""}
                    onChange={(e) => updateItem(index, "amount", e.target.value)}
                  />
                </div>
                {items.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label>Diskon (opsional)</Label>
            <Input
              type="number"
              placeholder="0"
              value={discount || ""}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            />
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Diskon</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" variant="hero" className="flex-1">
              Buat Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
