// src/utils/excelGenerator.ts
import * as XLSX from 'xlsx';

// Type definitions for the Excel report data
export interface ExcelReportData {
  transactions: any[];
  startDate: string;
  endDate: string;
  utangSaya: number;
  utangPelanggan: number;
}

/**
 * Generates an Excel report from the provided data
 */
export const generateDebtReportExcel = (reportData: ExcelReportData): Blob => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create summary worksheet
  const summaryData = [
    ['Laporan Utang Piutang'],
    [`Periode: ${formatDate(reportData.startDate)} - ${formatDate(reportData.endDate)}`],
    [],
    ['Ringkasan'],
    ['Kategori', 'Jumlah'],
    ['Utang Saya', `Rp ${formatCurrency(reportData.utangSaya)}`],
    ['Utang Pelanggan', `Rp ${formatCurrency(reportData.utangPelanggan)}`],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
  
  // Create details worksheet
  const detailsHeaders = [
    ['ID Transaksi', 'Tanggal', 'Tipe', 'Jumlah']
  ];
  
  const detailsData = reportData.transactions.map(transaction => [
    transaction.id,
    formatDate(transaction.created_at),
    transaction.transaction_type === 'pemasukan' ? 'Berikan' : 'Terima',
    `Rp ${formatCurrency(transaction.total_amount)}`
  ]);
  
  const detailsSheet = XLSX.utils.aoa_to_sheet([...detailsHeaders, ...detailsData]);
  XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Detail Transaksi');
  
  // Apply some basic styling (column widths)
  const summaryColWidths = [{ wch: 20 }, { wch: 20 }];
  const detailsColWidths = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];
  
  summarySheet['!cols'] = summaryColWidths;
  detailsSheet['!cols'] = detailsColWidths;
  
  // Generate the Excel file as a blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Helper functions
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("id-ID");
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};