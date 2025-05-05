// src/utils/excelGenerator.ts
import { report } from 'process';
import * as XLSX from 'xlsx';

// Type definitions for the Excel report data
export interface ExcelReportData {
  transactions: any[];
  startDate: string;
  endDate: string;
  utangSaya: number;
  utangPelanggan: number;
  totalPemasukan?: number;
  totalPengeluaran?: number;
  reportType: "keuangan" | "utang" | "arus-kas";
}

/**
 * Generates an Excel report from the provided data - all in a single sheet
 */
export const generateDebtReportExcel = (reportData: ExcelReportData): Blob => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create a single comprehensive sheet with all data
  const data: any[][] = [];
  
  // Determine report title based on type
  const reportTitle = reportData.reportType === "utang" 
    ? "Laporan Utang Piutang"
    : reportData.reportType !== "arus-kas" ? 
    "Laporan Keuangan" : "Laporan Arus Kas";
  
  // Title and period
  data.push([reportTitle]);
  data.push([`Periode: ${formatDate(reportData.startDate)} - ${formatDate(reportData.endDate)}`]);
  data.push([]);
  
  // Summary section
  data.push(['RINGKASAN']);
  data.push(['Kategori', 'Jumlah']);
  
  if (reportData.reportType === "utang") {
    // Debt/receivables summary
    data.push(['Utang Saya', `Rp ${formatCurrency(reportData.utangSaya)}`]);
    data.push(['Utang Pelanggan', `Rp ${formatCurrency(reportData.utangPelanggan)}`]);
  } else {
    // Financial summary
    data.push(['Total Pemasukan', `Rp ${formatCurrency(reportData.totalPemasukan || 0)}`]);
    data.push(['Total Pengeluaran', `Rp ${formatCurrency(reportData.totalPengeluaran || 0)}`]);
    
    const saldo = (reportData.totalPemasukan || 0) - (reportData.totalPengeluaran || 0);
    data.push(['Saldo', `Rp ${formatCurrency(Math.abs(saldo))}`]);
  }
  
  data.push([]);
  
  // Transaction details section
  data.push([reportData.reportType === "utang" ? 'DETAIL TRANSAKSI BELUM LUNAS' : 'DETAIL TRANSAKSI']);
  data.push(['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Jumlah']);
  
  // Add all transactions
  reportData.transactions.forEach((transaction) => {
    const isArusKas = reportData.reportType === "arus-kas";

    data.push([
      isArusKas ? transaction.transaksi_id : transaction.id,
      formatDateWithTime(isArusKas ? transaction.tanggal_transaksi : transaction.created_at),
      isArusKas
        ? (transaction.jenis === "inflow" ? "Kas Masuk" : "Kas Keluar")
        : (transaction.transaction_type === "pemasukan" ? "Berikan" : "Terima"),
      transaction.kategori || transaction.category,
      transaction.keterangan || transaction.status,
      `Rp ${formatCurrency(isArusKas ? transaction.nominal : transaction.total_amount)}`
    ]);

    // If transaction has items, add them directly below the transaction
    if (transaction.items && transaction.items.length > 0) {
      // Item header
      data.push(["", "Detail Produk:", "Nama", "Jumlah", "Harga Satuan", "Subtotal"]);

      transaction.items.forEach((item: any) => {
        const unitPrice = transaction.transaction_type === "pemasukan"
          ? item.harga_jual_saat_transaksi
          : item.harga_modal_saat_transaksi;

        data.push([
          "",
          "",
          item.product_name,
          item.quantity,
          `Rp ${formatCurrency(unitPrice)}`,
          `Rp ${formatCurrency(item.quantity * unitPrice)}`
        ]);
      });

      data.push([]); // Blank row for readability
    }
  });
  
  // Add footer with generation timestamp
  data.push([]);
  data.push(['Laporan dibuat pada', formatDateWithTime(new Date().toISOString())]);
  
  // Create the sheet
  const sheet = XLSX.utils.aoa_to_sheet(data);
  
  // Apply column widths for better readability
  const colWidths = [
    { wch: 15 },  // A: ID/Category
    { wch: 25 },  // B: Date/Detail
    { wch: 20 },  // C: Type/Product
    { wch: 15 },  // D: Category/Quantity
    { wch: 15 },  // E: Status/Unit Price
    { wch: 15 },  // F: Amount/Subtotal
  ];
  
  sheet['!cols'] = colWidths;
  
  // Add the sheet to the workbook
  XLSX.utils.book_append_sheet(workbook, sheet, reportTitle);
  
  // Generate the Excel file as a blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Helper functions
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("id-ID");
};

// Format date in Indonesia locale with Jakarta timezone (UTC+7)
const formatDate = (dateString: string): string => {
  // Create a date object
  const date = new Date(dateString);
  
  // Format using Indonesian locale with Jakarta timezone
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta" // Explicitly use Jakarta timezone (UTC+7)
  });
};

// Format date with time in Indonesia locale with Jakarta timezone (UTC+7)
const formatDateWithTime = (dateString: string): string => {
  // Create a date object
  const date = new Date(dateString);
  
  // Format date and time using Indonesian locale with Jakarta timezone
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta" // Explicitly use Jakarta timezone (UTC+7)
  });
};