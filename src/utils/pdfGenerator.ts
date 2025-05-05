// src/utils/pdfGenerator.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Type definitions for the PDF report data
export interface PDFReportData {
  transactions: any[];
  startDate: string;
  endDate: string;
  utangSaya?: number;
  utangPelanggan?: number;
  totalPemasukan?: number;
  totalPengeluaran?: number;
  reportType: "keuangan" | "utang" | "arus-kas";
}

/**
 * Generates a PDF report from the provided data
 */
export const generateDebtReportPDF = async (reportData: PDFReportData): Promise<Blob> => {
  // Create a temporary div to render the report
  const reportContainer = document.createElement('div');
  reportContainer.style.position = 'absolute';
  reportContainer.style.left = '-9999px';
  reportContainer.style.top = '-9999px';
  reportContainer.style.width = '795px'; // A4 width at 96 DPI
  document.body.appendChild(reportContainer);

  // Determine report title based on type
  const reportTitle = reportData.reportType === "utang" 
    ? "Laporan Utang Piutang"
    : "Laporan Keuangan";

  // Render the report content
  reportContainer.innerHTML = `
    <div style="padding: 40px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold;">${reportTitle}</h1>
        <p style="color: #666;">
          Periode: ${formatDate(reportData.startDate)} - ${formatDate(reportData.endDate)}
        </p>
      </div>

      <div style="margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <h2 style="font-size: 18px; font-weight: 600;">Ringkasan</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${reportData.reportType === "utang" ? `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; background-color: #f9fafb; font-weight: 500;">Utang Saya</td>
                  <td style="padding: 12px; text-align: right; color: #dc2626; font-weight: 500;">
                    Rp ${formatCurrency(reportData.utangSaya || 0)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; font-weight: 500;">Utang Pelanggan</td>
                  <td style="padding: 12px; text-align: right; color: #16a34a; font-weight: 500;">
                    Rp ${formatCurrency(reportData.utangPelanggan || 0)}
                  </td>
                </tr>
              ` : `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; background-color: #f9fafb; font-weight: 500;">Total Pemasukan</td>
                  <td style="padding: 12px; text-align: right; color: #16a34a; font-weight: 500;">
                    Rp ${formatCurrency(reportData.totalPemasukan || 0)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; font-weight: 500;">Total Pengeluaran</td>
                  <td style="padding: 12px; text-align: right; color: #dc2626; font-weight: 500;">
                    Rp ${formatCurrency(reportData.totalPengeluaran || 0)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; font-weight: 500;">Saldo</td>
                  <td style="padding: 12px; text-align: right; font-weight: 700; ${(reportData.totalPemasukan || 0) >= (reportData.totalPengeluaran || 0) ? 'color: #16a34a' : 'color: #dc2626'}">
                    Rp ${formatCurrency(Math.abs((reportData.totalPemasukan || 0) - (reportData.totalPengeluaran || 0)))}
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <h2 style="font-size: 18px; font-weight: 600;">
            ${reportData.reportType === "utang" ? "Detail Transaksi Belum Lunas" : "Detail Transaksi"}
          </h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background-color: #f3f4f6;">
              <tr>
                <th style="padding: 12px; text-align: left; font-size: 14px;">ID Transaksi</th>
                <th style="padding: 12px; text-align: left; font-size: 14px;">Tanggal</th>
                <th style="padding: 12px; text-align: left; font-size: 14px;">Tipe</th>
                <th style="padding: 12px; text-align: left; font-size: 14px;">Kategori</th>
                <th style="padding: 12px; text-align: left; font-size: 14px;">Keterangan</th>
                <th style="padding: 12px; text-align: right; font-size: 14px;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${
                reportData.transactions.map((transaction, index) => {
                  const isArusKas = reportData.reportType === "arus-kas";
                  const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';

                  const id = isArusKas ? transaction.transaksi_id : transaction.id;
                  const tanggal = isArusKas
                    ? formatDateWithTime(transaction.tanggal_transaksi)
                    : formatDateWithTime(transaction.created_at);
                  const tipe = isArusKas
                    ? (transaction.jenis === "inflow" ? "Kas Masuk" : "Kas Keluar")
                    : (transaction.transaction_type === "pemasukan" ? "Berikan" : "Terima");
                  const kategori = transaction.kategori || transaction.category;
                  const keterangan = transaction.keterangan || transaction.status;
                  const nominal = isArusKas ? transaction.nominal : transaction.total_amount;

                  return `
                    <tr style="background-color: ${bgColor};">
                      <td style="padding: 12px; font-size: 13px;">${id}</td>
                      <td style="padding: 12px; font-size: 13px;">${tanggal}</td>
                      <td style="padding: 12px; font-size: 13px;">${tipe}</td>
                      <td style="padding: 12px; font-size: 13px;">${kategori}</td>
                      <td style="padding: 12px; font-size: 13px;">${keterangan}</td>
                      <td style="padding: 12px; text-align: right; font-size: 13px;">
                        Rp ${formatCurrency(nominal)}
                      </td>
                    </tr>
                  `;
                }).join("")
              }
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #6b7280;">
        <p>© LANCAR - Sistem POS untuk UMKM</p>
        <p>Laporan dibuat pada ${formatDateWithTime(new Date().toISOString())}</p>
      </div>
    </div>
  `;

  try {
    // Generate canvas from the report container
    const canvas = await html2canvas(reportContainer);
    
    // Create PDF document
    const pdf = new jsPDF('p', 'pt', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Clean up the temporary container
    document.body.removeChild(reportContainer);
    
    // Return the PDF as a blob
    return pdf.output('blob');
  } catch (error) {
    // Clean up on error
    if (document.body.contains(reportContainer)) {
      document.body.removeChild(reportContainer);
    }
    console.error('Error generating PDF:', error);
    throw error;
  }
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