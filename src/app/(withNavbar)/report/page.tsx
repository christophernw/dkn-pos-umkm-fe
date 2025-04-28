"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import config from "@/src/config";
import { useRouter } from "next/navigation";
import { generateDebtReportPDF, PDFReportData } from "@/src/utils/pdfGenerator";
import { generateDebtReportExcel, ExcelReportData } from "@/src/utils/excelGenerator";

// Define types
interface Transaction {
  id: string;
  transaction_type: "pemasukan" | "pengeluaran";
  category: string;
  total_amount: number;
  total_modal: number;
  amount: number;
  status: "Lunas" | "Belum Lunas";
  created_at: string;
  is_deleted: boolean;
}

interface ReportDateRange {
  startDate: string;
  endDate: string;
}

const ReportPage = () => {
  const { user, accessToken } = useAuth();
  const { showModal } = useModal();
  const router = useRouter();
  const [view, setView] = useState<"summary" | "detail">("summary");
  const [utangSaya, setUtangSaya] = useState<number>(0);
  const [utangPelanggan, setUtangPelanggan] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<string>("7"); // Default to last 7 days
  const [reportDateRange, setReportDateRange] = useState<ReportDateRange>({
    startDate: '',
    endDate: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  // Check user role access - only Pemilik and Pengelola can access
  useEffect(() => {
    if (user && user.role !== "Pemilik" && user.role !== "Pengelola") {
      router.push("/");
    }
  }, [user, router]);

  // Fetch summary data
  useEffect(() => {
    if (!accessToken) return;

    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${config.apiUrl}/transaksi/debt-summary`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUtangSaya(data.utang_saya || 0);
          setUtangPelanggan(data.utang_pelanggan || 0);
        }
      } catch (error) {
        console.error("Error fetching debt summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [accessToken]);

  // Fetch transactions for detailed view
  useEffect(() => {
    if (view !== "detail" || !accessToken) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${config.apiUrl}/transaksi/debt-report?days=${dateRange}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions || []);
          setReportDateRange({
            startDate: data.start_date,
            endDate: data.end_date
          });
        }
      } catch (error) {
        console.error("Error fetching debt report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [view, dateRange, accessToken]);

  const handleDownloadClick = () => {
    setIsDownloadModalOpen(true);
  };

  const handleDownload = async (format: string) => {
    try {
      setIsGeneratingReport(true);
      
      // Prepare data for report
      const reportData = {
        transactions,
        startDate: reportDateRange.startDate,
        endDate: reportDateRange.endDate,
        utangSaya,
        utangPelanggan
      };
      
      // Generate report based on format
      let blob: Blob;
      let fileName: string;
      
      if (format === 'pdf') {
        blob = await generateDebtReportPDF(reportData as PDFReportData);
        fileName = `Laporan_Utang_Piutang_${dateRange}_Hari.pdf`;
      } else {
        blob = generateDebtReportExcel(reportData as ExcelReportData);
        fileName = `Laporan_Utang_Piutang_${dateRange}_Hari.xlsx`;
      }
      
      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      showModal(
        "Laporan Diunduh",
        `Laporan dalam format ${format === "pdf" ? "PDF" : "Excel"} telah berhasil diunduh.`,
        "success"
      );
    } catch (error) {
      console.error(`Error generating ${format} report:`, error);
      showModal(
        "Gagal Mengunduh",
        `Terjadi kesalahan saat mengunduh laporan dalam format ${format === "pdf" ? "PDF" : "Excel"}.`,
        "error"
      );
    } finally {
      setIsGeneratingReport(false);
      setIsDownloadModalOpen(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("id-ID");
  };

  if (!user || (user.role !== "Pemilik" && user.role !== "Pengelola")) {
    return <div className="p-8 text-center text-red-600 font-bold">Access Denied: Only Pemilik or Pengelola can view reports</div>;
  }

  // Render summary view
  if (view === "summary") {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Laporan Utang Piutang</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h2 className="text-red-600 font-semibold">Utang Saya</h2>
                <p className="text-xl font-bold mt-2">Rp{formatCurrency(utangSaya)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h2 className="text-green-600 font-semibold">Utang Pelanggan</h2>
                <p className="text-xl font-bold mt-2">Rp{formatCurrency(utangPelanggan)}</p>
              </div>
            </div>
            
            <button
              onClick={() => setView("detail")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium"
            >
              Lihat Laporan Utang
            </button>
          </>
        )}
      </div>
    );
  }

  // Render detailed view
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={() => setView("summary")}
          className="bg-white hover:bg-gray-200 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2"
        >
          <svg
            className="w-4 h-4 transform scale-x-[-1]"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </button>
        <h1 className="text-xl font-semibold flex-1 text-center">Laporan Utang Piutang</h1>
        <div className="w-10"></div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Tanggal Laporan
        </label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="7">7 Hari Terakhir</option>
          <option value="30">Bulan Ini</option>
          <option value="90">3 Bulan Terakhir</option>
          <option value="180">6 Bulan Terakhir</option>
          <option value="365">1 Tahun Terakhir</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-4 bg-white rounded-lg shadow-sm">
                Tidak ada data utang untuk periode ini.
              </p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-xl p-3 shadow-sm cursor-pointer"
                  onClick={() => router.push(`/transaksi/detail/${transaction.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Transaksi #{transaction.id}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.transaction_type === "pemasukan"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.transaction_type === "pemasukan" ? "Berikan" : "Terima"}
                    </span>
                    <span className="font-semibold">
                      Rp{formatCurrency(transaction.total_amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleDownloadClick}
            disabled={isGeneratingReport || transactions.length === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium mb-20 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGeneratingReport ? "Memproses..." : "Unduh Laporan"}
          </button>

          {/* Download Modal */}
          {isDownloadModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
              <div className="bg-white rounded-xl p-5 w-5/6 max-w-md">
                <h3 className="text-lg font-semibold mb-4">Unduh Laporan</h3>
                <p className="text-gray-600 mb-4">Pilih format laporan yang ingin diunduh:</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => handleDownload("pdf")}
                    disabled={isGeneratingReport}
                    className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-12 w-12 text-red-500 mb-2" 
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span>PDF</span>
                  </button>
                  
                  <button
                    onClick={() => handleDownload("xlsx")}
                    disabled={isGeneratingReport}
                    className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-12 w-12 text-green-600 mb-2" 
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H5.625c-.621 0-1.125-.504-1.125-1.125v-17.25c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125v17.25c0 .621-.504 1.125-1.125 1.125z" />
                    </svg>
                    <span>Excel</span>
                  </button>
                </div>
                
                <button
                  onClick={() => setIsDownloadModalOpen(false)}
                  disabled={isGeneratingReport}
                  className="w-full py-2 bg-gray-200 rounded-lg font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportPage;