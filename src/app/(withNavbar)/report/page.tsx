"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import config from "@/src/config";
import { useRouter } from "next/navigation";
import { generateDebtReportPDF, PDFReportData } from "@/src/utils/pdfGenerator";
import {
  generateDebtReportExcel,
  ExcelReportData,
} from "@/src/utils/excelGenerator";
import { CoinIcon } from "@/public/icons/CoinIcon";
import { StockIcon } from "@/public/icons/StockIcon";
import { NotesIcon } from "@/public/icons/notesIcon";

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

interface ReportSummary {
  utangSaya: number;
  utangPelanggan: number;
  totalPemasukan: number;
  totalPengeluaran: number;
}

const ReportPage = () => {
  const { user, accessToken } = useAuth();
  const { showModal } = useModal();
  const router = useRouter();
  const [reportType, setReportType] = useState<"keuangan" | "utang">("utang");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Summary data
  const [summary, setSummary] = useState<ReportSummary>({
    utangSaya: 0,
    utangPelanggan: 0,
    totalPemasukan: 0,
    totalPengeluaran: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<string>("7"); // Default to last 7 days
  const [reportDateRange, setReportDateRange] = useState<ReportDateRange>({
    startDate: "",
    endDate: "",
  });
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [firstTransactionDate, setFirstTransactionDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  // Check user role access - only Pemilik and Pengelola can access
  useEffect(() => {
    if (user && user.role !== "Pemilik" && user.role !== "Pengelola") {
      router.push("/");
    }
  }, [user, router]);

  // Handle report type change
  const handleReportTypeChange = (type: "keuangan" | "utang") => {
    setReportType(type);
    setDropdownOpen(false);
    // Clear current transactions
    setTransactions([]);
    // Reset dates and fetch new data
    if (dateRange !== "custom") {
      resetDateRange();
    }
  };

  // Fetch summary data
  useEffect(() => {
    if (!accessToken) return;

    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        // Fetch debt summary (for both report types)
        const debtResponse = await fetch(
          `${config.apiUrl}/transaksi/debt-summary`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // If we're in financial report mode, also fetch total transactions summary
        let totalPemasukan = 0;
        let totalPengeluaran = 0;
        
        if (reportType === "keuangan") {
          const financialResponse = await fetch(
            `${config.apiUrl}/transaksi/summary/monthly`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          
          if (financialResponse.ok) {
            const financialData = await financialResponse.json();
            totalPemasukan = financialData.pemasukan.amount || 0;
            totalPengeluaran = financialData.pengeluaran.amount || 0;
          }
        }

        if (debtResponse.ok) {
          const debtData = await debtResponse.json();
          setSummary({
            utangSaya: debtData.utang_saya || 0,
            utangPelanggan: debtData.utang_pelanggan || 0,
            totalPemasukan: totalPemasukan,
            totalPengeluaran: totalPengeluaran
          });
        }
      } catch (error) {
        console.error("Error fetching summary data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [accessToken, reportType]);

  // Fetch first transaction date
  useEffect(() => {
    if (!accessToken) return;

    const fetchFirstTransactionDate = async () => {
      try {
        const endpoint = reportType === "utang" 
          ? `${config.apiUrl}/transaksi/first-debt-date`
          : `${config.apiUrl}/transaksi/first-transaction-date`;
          
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFirstTransactionDate(data.first_date || "");

          // Initialize custom dates if they haven't been set
          if (!customStartDate) {
            setCustomStartDate(data.first_date || "");
          }
          if (!customEndDate) {
            const today = new Date().toISOString().split("T")[0];
            setCustomEndDate(today);
          }
        }
      } catch (error) {
        console.error("Error fetching first transaction date:", error);
      }
    };

    fetchFirstTransactionDate();
  }, [accessToken, reportType]);

  const resetDateRange = () => {
    // Get current date in Asia/Jakarta timezone (UTC+7)
    const now = new Date();
    // Adjust for UTC+7
    const jakartaTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    // Set time to end of day (23:59:59) in local timezone
    const endDate = new Date(jakartaTime);
    endDate.setHours(23, 59, 59, 999);

    let startDate = new Date(jakartaTime);

    if (dateRange === "all") {
      // Use first transaction date for "Semua"
      if (firstTransactionDate) {
        startDate = new Date(firstTransactionDate + "T00:00:00+07:00");
      } else {
        // Default to 1 year if first transaction date is not available
        startDate.setFullYear(startDate.getFullYear() - 1);
      }
    } else {
      // Convert dateRange to number of days and set the start date
      const days = parseInt(dateRange);
      startDate.setDate(startDate.getDate() - days);
      // Set time to start of day (00:00:00) in local timezone
      startDate.setHours(0, 0, 0, 0);
    }

    // Format dates as YYYY-MM-DD
    setCustomStartDate(startDate.toISOString().split("T")[0]);
    setCustomEndDate(endDate.toISOString().split("T")[0]);
  };

  // Update custom dates when date range changes
  useEffect(() => {
    if (dateRange === "custom") return; // Don't update if custom is selected
    resetDateRange();
  }, [dateRange, firstTransactionDate]);

  // Fetch transactions data with timezone handling
  useEffect(() => {
    if (!accessToken) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // Add timezone offset to make it clear these are in UTC+7
        // Even though we're only passing the date part, this helps ensure
        // the backend knows these dates are in local time
        const startDateWithTz = customStartDate
          ? `${customStartDate}T00:00:00+07:00`
          : "";
        const endDateWithTz = customEndDate
          ? `${customEndDate}T23:59:59+07:00`
          : "";

        // URL encode the date strings with timezone info
        const encodedStartDate = encodeURIComponent(startDateWithTz);
        const encodedEndDate = encodeURIComponent(endDateWithTz);

        // Choose the endpoint based on the report type
        const endpoint = reportType === "utang"
          ? `${config.apiUrl}/transaksi/debt-report-by-date`
          : `${config.apiUrl}/transaksi/financial-report-by-date`;

        const url = `${endpoint}?start_date=${encodedStartDate}&end_date=${encodedEndDate}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions || []);
          setReportDateRange({
            startDate: data.start_date,
            endDate: data.end_date,
          });
        }
      } catch (error) {
        console.error(`Error fetching ${reportType} report:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have valid dates
    if (
      (dateRange === "custom" || dateRange === "all") &&
      (!customStartDate || !customEndDate)
    ) {
      return;
    }

    fetchTransactions();
  }, [dateRange, customStartDate, customEndDate, accessToken, reportType]);

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
        utangSaya: summary.utangSaya,
        utangPelanggan: summary.utangPelanggan,
        totalPemasukan: summary.totalPemasukan,
        totalPengeluaran: summary.totalPengeluaran,
        reportType: reportType
      };

      // Generate report based on format
      let blob: Blob;
      let fileName: string;

      if (format === "pdf") {
        blob = await generateDebtReportPDF(reportData as PDFReportData);
        fileName = `Laporan_${reportType === "utang" ? "Utang_Piutang" : "Keuangan"}_${dateRange}_Hari.pdf`;
      } else {
        blob = generateDebtReportExcel(reportData as ExcelReportData);
        fileName = `Laporan_${reportType === "utang" ? "Utang_Piutang" : "Keuangan"}_${dateRange}_Hari.xlsx`;
      }

      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      showModal(
        "Laporan Diunduh",
        `Laporan dalam format ${
          format === "pdf" ? "PDF" : "Excel"
        } telah berhasil diunduh.`,
        "success"
      );
    } catch (error) {
      console.error(`Error generating ${format} report:`, error);
      showModal(
        "Gagal Mengunduh",
        `Terjadi kesalahan saat mengunduh laporan dalam format ${
          format === "pdf" ? "PDF" : "Excel"
        }.`,
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

  // Format date in Indonesia locale (UTC+7)
  const formatLocalDate = (dateString: string): string => {
    const date = new Date(dateString);

    // Format using Indonesian locale
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta", // Explicitly use Jakarta timezone
    });
  };

  if (!user || (user.role !== "Pemilik" && user.role !== "Pengelola")) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Access Denied: Only Pemilik or Pengelola can view reports
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">
          {reportType === "utang" ? "Laporan Utang Piutang" : "Laporan Keuangan"}
        </h1>
        
        <div className="relative">
          <div
            className="flex p-1 bg-white rounded-full items-center gap-2 w-fit cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="bg-primary-indigo rounded-full p-2">
              <NotesIcon />
            </div>
            <p className="pr-1">
              {reportType === "utang" ? "Laporan Utang Piutang" : "Laporan Keuangan"}
            </p>
            <div className="pr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg z-10 w-[220px]">
              <div
                className={`p-3 cursor-pointer hover:bg-gray-100 ${
                  reportType === "keuangan"
                    ? "font-semibold text-primary-indigo"
                    : ""
                }`}
                onClick={() => handleReportTypeChange("keuangan")}
              >
                Laporan Keuangan
              </div>
              <div
                className={`p-3 cursor-pointer hover:bg-gray-100 ${
                  reportType === "utang"
                    ? "font-semibold text-primary-indigo"
                    : ""
                }`}
                onClick={() => handleReportTypeChange("utang")}
              >
                Laporan Utang Piutang
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards - Styled similarly to other pages */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {reportType === "utang" ? (
              <>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-red-100 p-3 rounded-full">
                      <StockIcon className="text-red-500" />
                    </div>
                    <p className="font-medium">Utang Saya</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xl font-bold text-red-600">
                      Rp{formatCurrency(summary.utangSaya)}
                    </p>
                    <p className="text-xs text-gray-500">Belum dilunasi</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CoinIcon className="text-green-500" />
                    </div>
                    <p className="font-medium">Utang Pelanggan</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xl font-bold text-green-600">
                      Rp{formatCurrency(summary.utangPelanggan)}
                    </p>
                    <p className="text-xs text-gray-500">Belum dilunasi</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CoinIcon className="text-green-500" />
                    </div>
                    <p className="font-medium">Total Pemasukan</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xl font-bold text-green-600">
                      Rp{formatCurrency(summary.totalPemasukan)}
                    </p>
                    <p className="text-xs text-gray-500">Bulan ini</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-red-100 p-3 rounded-full">
                      <StockIcon className="text-red-500" />
                    </div>
                    <p className="font-medium">Total Pengeluaran</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xl font-bold text-red-600">
                      Rp{formatCurrency(summary.totalPengeluaran)}
                    </p>
                    <p className="text-xs text-gray-500">Bulan ini</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Tanggal Laporan
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">Bulan Ini</option>
              <option value="90">3 Bulan Terakhir</option>
              <option value="180">6 Bulan Terakhir</option>
              <option value="365">1 Tahun Terakhir</option>
              <option value="all">Semua</option>
              <option value="custom">Kustom</option>
            </select>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setDateRange("custom");
                    setCustomStartDate(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setDateRange("custom");
                    setCustomEndDate(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">
              {reportType === "utang" 
                ? "Daftar Transaksi Belum Lunas" 
                : "Daftar Transaksi"}
            </h2>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-4 bg-white rounded-lg shadow-sm">
                  {reportType === "utang"
                    ? "Tidak ada data utang untuk periode ini."
                    : "Tidak ada transaksi untuk periode ini."}
                </p>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white rounded-xl p-3 shadow-sm cursor-pointer"
                    onClick={() =>
                      router.push(`/transaksi/detail/${transaction.id}`)
                    }
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Transaksi #{transaction.id}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatLocalDate(transaction.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.transaction_type === "pemasukan"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.transaction_type === "pemasukan"
                          ? "Berikan"
                          : "Terima"}
                      </span>
                      <span className="font-semibold">
                        Rp{formatCurrency(transaction.total_amount)}
                      </span>
                    </div>
                    {/* Status badge (shown for all transactions in financial report) */}
                    {(reportType === "keuangan" || transaction.status === "Belum Lunas") && (
                      <div className="flex justify-end mt-1">
                        <span 
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            transaction.status === "Lunas"
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadClick}
            disabled={isGeneratingReport || transactions.length === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium mb-20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center z-20"
          >
            {isGeneratingReport ? "Memproses..." : "Unduh Laporan"}
          </button>

          {/* Download Modal - Fixed Excel Icon */}
          {isDownloadModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
              <div className="bg-white rounded-xl p-5 w-5/6 max-w-md">
                <h3 className="text-lg font-semibold mb-4">Unduh Laporan</h3>
                <p className="text-gray-600 mb-4">
                  Pilih format laporan yang ingin diunduh:
                </p>

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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => handleDownload("xlsx")}
                    disabled={isGeneratingReport}
                    className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {/* Updated Excel Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-green-600 mb-2"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2V8H20"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 13H16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 17H16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 9H8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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