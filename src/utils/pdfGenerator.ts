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
  reportType: "laba-rugi" | "utang" | "arus-kas";
}

/**
 * Generates a PDF report from the provided data with pagination
 */
export const generateDebtReportPDF = async (reportData: PDFReportData): Promise<Blob> => {
  // Create PDF document
  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Configuration for pagination
  const ROWS_PER_PAGE_FIRST = 10;  // Number of transactions to display on first page
  const ROWS_PER_PAGE = 25;        // Number of transactions to display on subsequent pages
  const FOOTER_HEIGHT = 60;        // Height reserved for footer (in points)
  
  // Determine report title and transaction title based on type
  let reportTitle = "Laporan Keuangan"; // Default
  
  // Set specific report title based on report type
  if (reportData.reportType === "utang") {
    reportTitle = "Laporan Utang Piutang";
  } else if (reportData.reportType === "arus-kas") {
    reportTitle = "Laporan Arus Kas";
  } else if (reportData.reportType === "laba-rugi") {
    reportTitle = "Laporan Laba Rugi";
  }
  
  const transactionTitle = reportData.reportType === "utang" 
    ? "Detail Transaksi Belum Lunas" 
    : "Detail Transaksi";
  
  // Helper function to add page footer and page numbers
  const addPageFooter = (currentPage: number, totalPages: number): void => {
    const footer: string = `© LANCAR - Sistem POS untuk UMKM`;
    const generatedDate: string = `Laporan dibuat pada ${formatDateWithTime(new Date().toISOString())}`;
    
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128); // #6b7280
    pdf.text(footer, pageWidth / 2, pageHeight - 30, { align: 'center' });
    pdf.text(generatedDate, pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text(`Halaman ${currentPage} dari ${totalPages}`, pageWidth - 110, pageHeight - 15);
  };
  
  // Function to create and render the header section
  const createHeaderSection = async () => {
    // Create a temporary div for the header section
    const headerContainer = document.createElement('div');
    headerContainer.style.position = 'absolute';
    headerContainer.style.left = '-9999px';
    headerContainer.style.width = '795px'; // A4 width at 96 DPI
    document.body.appendChild(headerContainer);
    
    // Render the header section
    headerContainer.innerHTML = `
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
                  <tr style="border-bottom: 1px solid #e5e7eb;">
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
      </div>
    `;
    
    try {
      // Generate canvas from the header container
      const canvas = await html2canvas(headerContainer);
      
      // Add to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Clean up
      document.body.removeChild(headerContainer);
      
      return pdfHeight; // Return the height of the header section
    } catch (error) {
      // Clean up on error
      if (document.body.contains(headerContainer)) {
        document.body.removeChild(headerContainer);
      }
      console.error('Error generating header:', error);
      throw error;
    }
  };
  
  // Function to create and render the transaction table header
  interface TableHeaderOptions {
    yPosition: number;
  }

  const createTableHeader = async ({ yPosition }: TableHeaderOptions): Promise<number> => {
    // Create a temporary div for the table header
    const tableHeaderContainer = document.createElement('div');
    tableHeaderContainer.style.position = 'absolute';
    tableHeaderContainer.style.left = '-9999px';
    tableHeaderContainer.style.width = '795px'; // A4 width at 96 DPI
    document.body.appendChild(tableHeaderContainer);
    
    // Render the table header
    tableHeaderContainer.innerHTML = `
      <div style="padding: 40px; padding-top: 0; padding-bottom: 0; font-family: Arial, sans-serif;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <h2 style="font-size: 18px; font-weight: 600;">${transactionTitle}</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px 8px 0 0; overflow: hidden;">
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
          </table>
        </div>
      </div>
    `;
    
    try {
      // Generate canvas from the table header
      const canvas = await html2canvas(tableHeaderContainer);
      
      // Add to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, yPosition, pdfWidth, pdfHeight);
      
      // Clean up
      document.body.removeChild(tableHeaderContainer);
      
      return pdfHeight; // Return the height of the table header
    } catch (error) {
      // Clean up on error
      if (document.body.contains(tableHeaderContainer)) {
        document.body.removeChild(tableHeaderContainer);
      }
      console.error('Error generating table header:', error);
      throw error;
    }
  };
  
  // Function to create and render transaction rows
  interface TransactionRowOptions {
    transactions: any[];
    yPosition: number;
    isLastPage: boolean;
    maxHeight?: number; // Maximum height available for rows on the page
  }

  const createTransactionRows = async (
    transactions: any[],
    yPosition: number,
    isLastPage: boolean,
    maxHeight?: number
  ): Promise<{height: number, renderedTransactions: number}> => {
    // No transactions to render
    if (transactions.length === 0) {
      return { height: 0, renderedTransactions: 0 };
    }
    
    let transactionsToRender = [...transactions];
    let rowsHeight = 0;
    let renderedTransactions = 0;
    
    // If we have a max height constraint, we need to determine how many transactions will fit
    if (maxHeight) {
      // First, try with all transactions
      const allTransactionsHeight = await measureTransactionRowsHeight(transactionsToRender);
      
      // If they fit, render them all
      if (allTransactionsHeight <= maxHeight) {
        rowsHeight = await renderTransactionRows(transactionsToRender, yPosition);
        renderedTransactions = transactionsToRender.length;
      } else {
        // If they don't fit, find how many will fit using binary search
        let low = 1;  // At least render one transaction
        let high = transactionsToRender.length;
        
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const subset = transactionsToRender.slice(0, mid);
          const subsetHeight = await measureTransactionRowsHeight(subset);
          
          if (subsetHeight <= maxHeight) {
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }
        
        // high is now the maximum number of transactions that will fit
        const subset = transactionsToRender.slice(0, high);
        rowsHeight = await renderTransactionRows(subset, yPosition);
        renderedTransactions = high;
      }
    } else {
      // No height constraint, render all transactions
      rowsHeight = await renderTransactionRows(transactionsToRender, yPosition);
      renderedTransactions = transactionsToRender.length;
    }
    
    return { height: rowsHeight, renderedTransactions };
  };
  
  // Helper function to measure transaction rows height without rendering to PDF
  const measureTransactionRowsHeight = async (transactions: any[]): Promise<number> => {
    // Create a temporary div for measuring
    const measuringContainer = document.createElement('div');
    measuringContainer.style.position = 'absolute';
    measuringContainer.style.left = '-9999px';
    measuringContainer.style.width = '795px'; // A4 width at 96 DPI
    document.body.appendChild(measuringContainer);
    
    // Fill with transaction row content
    measuringContainer.innerHTML = createTransactionRowsHTML(transactions);
    
    try {
      // Generate canvas to measure height
      const canvas = await html2canvas(measuringContainer);
      const imgProps = pdf.getImageProperties(canvas.toDataURL('image/png'));
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Clean up
      document.body.removeChild(measuringContainer);
      
      return pdfHeight;
    } catch (error) {
      // Clean up on error
      if (document.body.contains(measuringContainer)) {
        document.body.removeChild(measuringContainer);
      }
      console.error('Error measuring transaction rows height:', error);
      throw error;
    }
  };
  
  // Helper function to render transaction rows to PDF
  const renderTransactionRows = async (transactions: any[], yPosition: number): Promise<number> => {
    // Create a temporary div for the transaction rows
    const rowsContainer = document.createElement('div');
    rowsContainer.style.position = 'absolute';
    rowsContainer.style.left = '-9999px';
    rowsContainer.style.width = '795px'; // A4 width at 96 DPI
    document.body.appendChild(rowsContainer);
    
    // Fill with transaction row content
    rowsContainer.innerHTML = createTransactionRowsHTML(transactions);
    
    try {
      // Generate canvas from the rows container
      const canvas = await html2canvas(rowsContainer);
      
      // Add to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, yPosition, pdfWidth, pdfHeight);
      
      // Clean up
      document.body.removeChild(rowsContainer);
      
      return pdfHeight; // Return the height of the rows section
    } catch (error) {
      // Clean up on error
      if (document.body.contains(rowsContainer)) {
        document.body.removeChild(rowsContainer);
      }
      console.error('Error generating transaction rows:', error);
      throw error;
    }
  };
  
  // Helper function to create transaction rows HTML
  const createTransactionRowsHTML = (transactions: any[]): string => {
    // Determine if we're working with specific report types
    const isArusKas = reportData.reportType === "arus-kas";
    const isLabaRugi = reportData.reportType === "laba-rugi";
    
    // Create HTML for transaction rows
    return `
      <div style="padding: 40px; padding-top: 0; padding-bottom: 0; font-family: Arial, sans-serif;">
        <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; overflow: hidden; margin-top: 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${
                transactions.map((transaction: any, index: number) => {
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
    `;
  };
  
  // Generate the PDF with all pages
  const generatePDF = async () => {
    const totalTransactions = reportData.transactions.length;
    
    // First page with header
    let yPosition = 0;
    const headerHeight = await createHeaderSection();
    yPosition += headerHeight;
    
    // Add table header
    const tableHeaderHeight = await createTableHeader({ yPosition });
    yPosition += tableHeaderHeight;
    
    // Calculate available space for transaction rows on the first page
    const availableHeight = pageHeight - yPosition - FOOTER_HEIGHT;
    
    // Render as many transactions as possible on the first page
    const { renderedTransactions } = await createTransactionRows(
      reportData.transactions,
      yPosition,
      totalTransactions <= ROWS_PER_PAGE_FIRST,
      availableHeight
    );
    
    // Add footer to the first page
    let currentPage = 1;
    
    // Determine how many total pages we'll need
    let remainingTransactions = totalTransactions - renderedTransactions;
    const estimatedRemainingPages = Math.ceil(remainingTransactions / ROWS_PER_PAGE);
    const totalPages = 1 + estimatedRemainingPages;
    
    // Add footer to first page
    addPageFooter(currentPage, totalPages);
    
    // Process remaining transactions on subsequent pages
    let transactionIndex = renderedTransactions;
    
    while (transactionIndex < totalTransactions) {
      // Add a new page
      pdf.addPage();
      currentPage++;
      
      // Reset y-position for new page
      yPosition = 0;
      
      // Add table header to the new page
      const tableHeaderHeight = await createTableHeader({ yPosition });
      yPosition += tableHeaderHeight;
      
      // Calculate available space for transaction rows on this page
      const availableHeight = pageHeight - yPosition - FOOTER_HEIGHT;
      
      // Get remaining transactions
      const remainingTransactions = reportData.transactions.slice(transactionIndex);
      
      // Render as many transactions as possible on this page
      const { renderedTransactions: transactionsRendered } = await createTransactionRows(
        remainingTransactions,
        yPosition,
        transactionIndex + ROWS_PER_PAGE >= totalTransactions,
        availableHeight
      );
      
      // Update transaction index for next iteration
      transactionIndex += transactionsRendered;
      
      // Add footer to this page
      addPageFooter(currentPage, totalPages);
    }
    
    // Return the PDF as a blob
    return pdf.output('blob');
  };
  
  // Execute the PDF generation
  try {
    return await generatePDF();
  } catch (error) {
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