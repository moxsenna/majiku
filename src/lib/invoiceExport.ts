// Invoice Export Utilities

export interface Invoice {
  id: string;
  invoiceNumber: string;
  parentName: string;
  studentName: string;
  className: string;
  amount: number;
  dueDate: string;
  status: "paid" | "unpaid" | "overdue";
  paidDate?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const statusLabels = {
  paid: "Lunas",
  unpaid: "Belum Dibayar",
  overdue: "Jatuh Tempo",
};

// Export to CSV
export function exportToCSV(invoices: Invoice[], filename: string = "invoices") {
  const headers = ["No Invoice", "Orang Tua", "Siswa", "Kelas", "Jumlah", "Jatuh Tempo", "Status", "Tanggal Bayar"];
  
  const rows = invoices.map(inv => [
    inv.invoiceNumber,
    inv.parentName,
    inv.studentName,
    inv.className,
    formatCurrency(inv.amount),
    inv.dueDate,
    statusLabels[inv.status],
    inv.paidDate || "-",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

// Export to Excel-compatible format (using CSV with proper encoding)
export function exportToExcel(invoices: Invoice[], filename: string = "invoices") {
  // Using TSV format for better Excel compatibility
  const headers = ["No Invoice", "Orang Tua", "Siswa", "Kelas", "Jumlah", "Jatuh Tempo", "Status", "Tanggal Bayar"];
  
  const rows = invoices.map(inv => [
    inv.invoiceNumber,
    inv.parentName,
    inv.studentName,
    inv.className,
    inv.amount, // Keep as number for Excel
    inv.dueDate,
    statusLabels[inv.status],
    inv.paidDate || "-",
  ]);

  let xlsContent = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
  xlsContent += '<head><meta charset="UTF-8"></head><body>';
  xlsContent += '<table border="1">';
  xlsContent += '<tr>' + headers.map(h => `<th style="background:#f0f0f0;font-weight:bold">${h}</th>`).join('') + '</tr>';
  rows.forEach(row => {
    xlsContent += '<tr>' + row.map((cell, i) => {
      if (i === 4) { // Amount column
        return `<td style="text-align:right">${formatCurrency(cell as number)}</td>`;
      }
      return `<td>${cell}</td>`;
    }).join('') + '</tr>';
  });
  xlsContent += '</table></body></html>';

  const blob = new Blob([xlsContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  downloadBlob(blob, `${filename}.xls`);
}

// Generate printable invoice HTML
export function generateInvoiceHTML(invoice: Invoice & { 
  items?: { description: string; amount: number }[];
  subtotal?: number;
  discount?: number;
  total?: number;
  period?: string;
  schoolName?: string;
  schoolAddress?: string;
  schoolPhone?: string;
}) {
  const items = invoice.items || [{ description: "Biaya Bulanan", amount: invoice.amount }];
  const subtotal = invoice.subtotal || invoice.amount;
  const discount = invoice.discount || 0;
  const total = invoice.total || invoice.amount;
  const schoolName = invoice.schoolName || "MAJIKU Daycare & Preschool";
  const schoolAddress = invoice.schoolAddress || "Jl. Pendidikan No. 123, Jakarta Selatan";
  const schoolPhone = invoice.schoolPhone || "(021) 1234-5678";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #f5f5f5; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { font-size: 13px; opacity: 0.9; }
    .invoice-number { text-align: right; }
    .invoice-number span { font-size: 12px; opacity: 0.8; }
    .invoice-number strong { font-size: 18px; display: block; }
    .status { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .status.paid { background: #dcfce7; color: #166534; }
    .status.unpaid { background: #fef3c7; color: #92400e; }
    .status.overdue { background: #fee2e2; color: #dc2626; }
    .content { padding: 30px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .info-section h3 { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .info-section p { margin: 4px 0; font-size: 14px; }
    .info-section strong { font-size: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f8fafc; padding: 12px; text-align: left; font-size: 11px; color: #666; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    td { padding: 15px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    td.amount { text-align: right; font-family: monospace; }
    .totals { margin-left: auto; width: 300px; }
    .totals tr td { border: none; padding: 8px 12px; }
    .totals .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #2563eb !important; }
    .totals .total-row td:last-child { color: #2563eb; }
    .footer { background: #f8fafc; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
    @media print { 
      body { padding: 0; background: white; } 
      .invoice { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1>${schoolName}</h1>
          <p>${schoolAddress}</p>
          <p>${schoolPhone}</p>
        </div>
        <div class="invoice-number">
          <span>Invoice</span>
          <strong>${invoice.invoiceNumber}</strong>
          <div class="status ${invoice.status}">${statusLabels[invoice.status]}</div>
        </div>
      </div>
    </div>
    
    <div class="content">
      <div class="info-grid">
        <div class="info-section">
          <h3>Ditagihkan kepada</h3>
          <strong>${invoice.parentName}</strong>
          <p>Orang tua dari ${invoice.studentName}</p>
        </div>
        <div class="info-section">
          <h3>Detail</h3>
          <p><strong>Siswa:</strong> ${invoice.studentName}</p>
          <p><strong>Kelas:</strong> ${invoice.className}</p>
          <p><strong>Jatuh Tempo:</strong> ${invoice.dueDate}</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Deskripsi</th>
            <th style="text-align: right;">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="amount">${formatCurrency(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <table class="totals">
        <tr>
          <td>Subtotal</td>
          <td class="amount">${formatCurrency(subtotal)}</td>
        </tr>
        ${discount > 0 ? `
        <tr style="color: #16a34a;">
          <td>Diskon</td>
          <td class="amount">-${formatCurrency(discount)}</td>
        </tr>
        ` : ''}
        <tr class="total-row">
          <td>Total</td>
          <td class="amount">${formatCurrency(total)}</td>
        </tr>
      </table>
    </div>
    
    <div class="footer">
      <p>Terima kasih telah mempercayakan pendidikan putra/putri Anda kepada ${schoolName}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Download single invoice as PDF (opens print dialog)
export function downloadInvoicePDF(invoice: Invoice & { 
  items?: { description: string; amount: number }[];
  subtotal?: number;
  discount?: number;
  total?: number;
  period?: string;
}) {
  const html = generateInvoiceHTML(invoice);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

// Helper function to download blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
