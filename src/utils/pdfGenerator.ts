// src/utils/pdfGenerator.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Type definitions for the PDF report data
export interface PDFReportData {
  transactions: any[];
  startDate: string;
  endDate: string;
  utangSaya: number;
  utangPelanggan: number;
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

  // Render the report content
  reportContainer.innerHTML = `
    <div style="padding: 40px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold;">Laporan Utang Piutang</h1>
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
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; background-color: #f9fafb; font-weight: 500;">Utang Saya</td>
                <td style="padding: 12px; text-align: right; color: #dc2626; font-weight: 500;">
                  Rp ${formatCurrency(reportData.utangSaya)}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; background-color: #f9fafb; font-weight: 500;">Utang Pelanggan</td>
                <td style="padding: 12px; text-align: right; color: #16a34a; font-weight: 500;">
                  Rp ${formatCurrency(reportData.utangPelanggan)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <h2 style="font-size: 18px; font-weight: 600;">Detail Transaksi</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background-color: #f3f4f6;">
              <tr>
                <th style="padding: 12px; text-align: left;">ID Transaksi</th>
                <th style="padding: 12px; text-align: left;">Tanggal</th>
                <th style="padding: 12px; text-align: left;">Tipe</th>
                <th style="padding: 12px; text-align: right;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.transactions.map((transaction, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'}">
                  <td style="padding: 12px;">${transaction.id}</td>
                  <td style="padding: 12px;">${formatDate(transaction.created_at)}</td>
                  <td style="padding: 12px;">
                    ${transaction.transaction_type === "pemasukan" ? "Berikan" : "Terima"}
                  </td>
                  <td style="padding: 12px; text-align: right;">
                    Rp ${formatCurrency(transaction.total_amount)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #6b7280;">
        <p>© LANCAR - Sistem POS untuk UMKM</p>
        <p>Laporan dibuat pada ${new Date().toLocaleDateString("id-ID")}</p>
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

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};