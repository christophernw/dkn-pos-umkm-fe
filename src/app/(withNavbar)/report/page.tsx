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
import Script from "next/script";
import { formatDate } from "@/src/utils/formatDate";
import { AccessDeniedScreen } from "@/src/components/AccessDeniedScreen";

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

export interface ArusKasTransaction {
  id: number;
  jenis: "inflow" | "outflow";
  kategori: string;
  keterangan?: string;
  nominal: string;
  tanggal_transaksi: string;
  transaksi_id: number;
}

export interface ArusKasReportResponse {
  id: number;
  month: number;
  year: number;
  total_inflow: string;
  total_outflow: string;
  balance: string;
  transactions: ArusKasTransaction[];
}

const ReportPage = () => {
  const { user, accessToken } = useAuth();
  // Check if user is BPR
  if (user?.is_bpr) {
    return <AccessDeniedScreen userType="BPR" />;
  }
  const { showModal } = useModal();
  const router = useRouter();
  const [reportType, setReportType] = useState<
    "keuangan" | "utang" | "arus-kas"
  >("utang");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Add a state to track authorization
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  // Summary data
  const [summary, setSummary] = useState<ReportSummary>({
    utangSaya: 0,
    utangPelanggan: 0,
    totalPemasukan: 0,
    totalPengeluaran: 0,
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
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] =
    useState<boolean>(false);
  const [arusKasTransactions, setArusKasTransactions] = useState<
    ArusKasTransaction[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (user) {
      setIsAuthLoading(false);

      // Set access based on role
      if (user.role === "Pemilik" || user.role === "Pengelola") {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } else if (accessToken === null) {
      setIsAuthLoading(false);
      setHasAccess(false);
    }
  }, [user, accessToken, router]);

  // Handle report type change
  const handleReportTypeChange = (type: "keuangan" | "utang" | "arus-kas") => {
    setReportType(type);
    setDropdownOpen(false);
    // Reset pagination
    setCurrentPage(1);
    // Reset dates and fetch new data
    if (dateRange !== "custom") {
      resetDateRange();
    }
  };

  // Fetch summary data - only if user has access
  // useEffect(() => {
  //   if (!accessToken || !hasAccess || reportType !== "utang") {
  //     setIsLoading(false);
  //     return;
  //   }

  //   const fetchSummary = async () => {
  //     if (!accessToken || !hasAccess || reportType === "arus-kas") {
  //       return;
  //     }

  //     setIsLoading(true);
  //     try {
  //       // Fetch debt summary (for both report types)
  //       const debtResponse = await fetch(
  //         `${config.apiUrl}/transaksi/debt-summary`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`,
  //           },
  //         }
  //       );

  //       // If we're in financial report mode, also fetch total transactions summary
  //       let totalPemasukan = 0;
  //       let totalPengeluaran = 0;

  //       if (reportType === "keuangan") {
  //         const financialResponse = await fetch(
  //           `${config.apiUrl}/transaksi/summary/monthly`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${accessToken}`,
  //             },
  //           }
  //         );

  //         if (financialResponse.ok) {
  //           const financialData = await financialResponse.json();
  //           totalPemasukan = financialData.pemasukan.amount || 0;
  //           totalPengeluaran = financialData.pengeluaran.amount || 0;
  //         }
  //       }

  //       if (debtResponse.ok) {
  //         const debtData = await debtResponse.json();
  //         setSummary({
  //           utangSaya: debtData.utang_saya || 0,
  //           utangPelanggan: debtData.utang_pelanggan || 0,
  //           totalPemasukan: totalPemasukan,
  //           totalPengeluaran: totalPengeluaran
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error fetching summary data:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchSummary();
  // }, [accessToken, reportType, hasAccess]);

  // Fetch first transaction date - only if user has access
  useEffect(() => {
    if (!accessToken || !hasAccess) {
      return;
    }

    const fetchFirstTransactionDate = async () => {
      try {
        const endpoint =
          reportType === "utang"
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
  }, [accessToken, reportType, hasAccess, customStartDate, customEndDate]);

  const resetDateRange = () => {
    // Get current date in Asia/Jakarta timezone (UTC+7)
    const now = new Date();
    // Adjust for UTC+7
    const jakartaTime = new Date(now.getTime());

    // Set time to end of day (23:59:59) in local timezone
    const endDate = new Date(jakartaTime);
    endDate.setHours(23, 59, 59, 999);

    let startDate = new Date(jakartaTime);

    if (dateRange === "this_month") {
      // Set to first day of current month - fixing the issue
      const currentYear = jakartaTime.getFullYear();
      const currentMonth = jakartaTime.getMonth();
      // Create a new date object for the 1st day of current month
      startDate = new Date(currentYear, currentMonth, 2);
      // Set time to start of day (00:00:00)
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === "all") {
      // Use first transaction date for "Semua"
      if (firstTransactionDate) {
        startDate = new Date(firstTransactionDate + "T00:00:00+07:00");
      } else {
        // Default to 1 year if first transaction date is not available
        startDate.setFullYear(startDate.getFullYear() - 1);
      }
    } else {
      // Convert dateRange to number of days and set the start date
      const days = Number.parseInt(dateRange);
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
    if (dateRange === "custom" || !hasAccess) return; // Don't update if custom is selected or no access
    resetDateRange();
  }, [dateRange, firstTransactionDate, hasAccess]);

  // Fetch transactions data with timezone handling - only if user has access
  useEffect(() => {
    if (!accessToken || !hasAccess) {
      setIsLoading(false);
      return;
    }

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

        let endpoint = "";
        if (reportType === "utang") {
          endpoint = `${config.apiUrl}/transaksi/debt-report-by-date`;
        } else if (reportType === "keuangan") {
          endpoint = `${config.apiUrl}/transaksi/financial-report-by-date`;
        } else {
          // Modified to use date range for arus-kas as well
          endpoint = `${config.apiUrl}/laporan/aruskas-report`;
        }

        // Updated to use same URL structure for all report types
        const url = `${endpoint}?start_date=${encodedStartDate}&end_date=${encodedEndDate}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          if (reportType !== "arus-kas") {
            const data = await response.json();
            const transactionsData = (data.transactions as Transaction[]) || [];
            setTransactions(transactionsData || []);
            setReportDateRange({
              startDate: data.start_date,
              endDate: data.end_date,
            });

            const totalPemasukan = transactionsData
              .filter((t) => t.transaction_type === "pemasukan")
              .reduce((sum, t) => sum + Number(t.total_amount), 0);

            const totalPengeluaran = transactionsData
              .filter((t) => t.transaction_type === "pengeluaran")
              .reduce((sum, t) => sum + Number(t.total_amount), 0);

            setSummary((prev) => ({
              ...prev,
              utangSaya: totalPemasukan,
              utangPelanggan: totalPengeluaran,
              totalPemasukan,
              totalPengeluaran,
            }));

            setArusKasTransactions([]);
          } else {
            const data: ArusKasReportResponse = await response.json();
            const transactionsData =
              (data.transactions as ArusKasTransaction[]) || [];
            setArusKasTransactions(transactionsData || []);

            const totalPemasukan = transactionsData
              .filter((t) => t.jenis === "inflow")
              .reduce((sum, t) => sum + Number(t.nominal), 0);

            const totalPengeluaran = transactionsData
              .filter((t) => t.jenis === "outflow")
              .reduce((sum, t) => sum + Number(t.nominal), 0);

            setSummary((prev) => ({
              ...prev,
              totalPemasukan,
              totalPengeluaran,
            }));
            setTransactions([]);
          }
          // Reset to first page when loading new data
          setCurrentPage(1);
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
  }, [
    dateRange,
    customStartDate,
    customEndDate,
    accessToken,
    reportType,
    hasAccess,
    selectedMonth,
  ]);

  const handleDownloadClick = () => {
    if (!hasAccess) {
      // Prevent download if no access
      return;
    }
    setIsDownloadModalOpen(true);
  };

  const handleDownload = async (format: string) => {
    if (!hasAccess) {
      // Prevent download if no access
      return;
    }

    try {
      setIsGeneratingReport(true);

      let reportData;

      if (true) {
        // Now uniform for all report types
        reportData = {
          transactions:
            reportType === "arus-kas" ? arusKasTransactions : transactions,
          startDate: reportDateRange.startDate,
          endDate: reportDateRange.endDate,
          utangSaya: summary.utangSaya,
          utangPelanggan: summary.utangPelanggan,
          totalPemasukan: summary.totalPemasukan,
          totalPengeluaran: summary.totalPengeluaran,
          reportType: reportType,
        };
      }

      // Generate report based on format
      let blob: Blob;
      let fileName: string;

      if (format === "pdf") {
        blob = await generateDebtReportPDF(reportData as PDFReportData);
        fileName = `Laporan_${
          reportType === "utang"
            ? "Utang_Piutang"
            : reportType !== "arus-kas"
            ? "Keuangan"
            : "Arus Kas"
        }_${dateRange}_Hari.pdf`;
      } else {
        blob = generateDebtReportExcel(reportData as ExcelReportData);
        fileName = `Laporan_${
          reportType === "utang"
            ? "Utang_Piutang"
            : reportType !== "arus-kas"
            ? "Keuangan"
            : "Arus Kas"
        }_${dateRange}_Hari.xlsx`;
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
    // Convert to number if it's a string, handle NaN cases
    const amountNumber =
      typeof amount === "string" ? parseFloat(amount) : amount;

    return isNaN(amountNumber)
      ? "0"
      : new Intl.NumberFormat("id-ID", {
          maximumFractionDigits: 0, // No decimal places for currency
        }).format(amountNumber);
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

  // Handle start date change with validation
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasAccess) return;

    const newStartDate = e.target.value;
    // Set to custom date range
    setDateRange("custom");

    // Validate: Start date cannot be after end date
    if (customEndDate && newStartDate > customEndDate) {
      // If invalid, set start date to end date
      setCustomStartDate(customEndDate);
    } else {
      setCustomStartDate(newStartDate);
    }
  };

  // Handle end date change with validation
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasAccess) return;

    const newEndDate = e.target.value;
    // Set to custom date range
    setDateRange("custom");

    // Validate: End date cannot be before start date
    if (customStartDate && newEndDate < customStartDate) {
      // If invalid, set end date to start date
      setCustomEndDate(customStartDate);
    } else {
      setCustomEndDate(newEndDate);
    }
  };

  // Pagination calculation
  const getActiveTransactions = () => {
    if (reportType === "arus-kas") {
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      return arusKasTransactions.slice(indexOfFirstItem, indexOfLastItem);
    } else {
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      return transactions.slice(indexOfFirstItem, indexOfLastItem);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(
    reportType === "arus-kas"
      ? arusKasTransactions.length / itemsPerPage
      : transactions.length / itemsPerPage
  );

  // Pagination controls
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtonsToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    // First page button
    if (startPage > 1) {
      buttons.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="min-w-9 rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 ml-1"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="start-ellipsis" className="px-1">
            ...
          </span>
        );
      }
    }

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`min-w-9 rounded-md ${
            currentPage === i
              ? "bg-primary-indigo text-white border border-primary-indigo"
              : "border border-slate-300 hover:bg-blue-100"
          } py-1 px-2 text-xs ml-1`}
        >
          {i}
        </button>
      );
    }

    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="end-ellipsis" className="px-1">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="min-w-9 rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 ml-1"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // Show loading state while authentication is being checked
  if (isAuthLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-sm">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Akses Ditolak
          </h1>
          <p className="mb-6">
            Karyawan tidak diperbolehkan mengakses halaman Laporan.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Get current transactions for display
  const currentTransactions = getActiveTransactions();
  const displayedTransactionsCount = currentTransactions.length;
  const totalTransactionsCount =
    reportType === "arus-kas"
      ? arusKasTransactions.length
      : transactions.length;

  return (
    <>

      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                    (function (m, a, z, e) {
                    var s, t;
                    try {
                        t = m.sessionStorage.getItem('maze-us');
                    } catch (err) {}

                    if (!t) {
                        t = new Date().getTime();
                        try {
                        m.sessionStorage.setItem('maze-us', t);
                        } catch (err) {}
                    }

                    s = a.createElement('script');
                    s.src = z + '?apiKey=' + e;
                    s.async = true;
                    a.getElementsByTagName('head')[0].appendChild(s);
                    m.mazeUniversalSnippetApiKey = e;
                    })(window, document, 'https://snippet.maze.co/maze-universal-loader.js', 'e31b53f6-c7fd-47f2-85df-d3c285f18b33');
                `,
          }}
        />
      </Head>

      <div className="p-4">
        <div className="flex justify-start items-center mb-4">
          <div className="relative">
            <div
              className="flex p-1 bg-white rounded-full items-center gap-2 w-fit cursor-pointer"
              onClick={() => hasAccess && setDropdownOpen(!dropdownOpen)}
            >
              <div className="bg-primary-indigo rounded-full p-2">
                <NotesIcon />
              </div>
              <p className="pr-1">
                {reportType === "utang"
                  ? "Laporan Utang Piutang"
                  : reportType === "keuangan"
                  ? "Laporan Laba Rugi"
                  : "Laporan Arus Kas"}
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

            {dropdownOpen && hasAccess && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg z-10 w-[220px]">
                <div
                  className={`p-3 cursor-pointer hover:bg-gray-100 ${
                    reportType === "keuangan"
                      ? "font-semibold text-primary-indigo"
                      : ""
                  }`}
                  onClick={() => handleReportTypeChange("keuangan")}
                >
                  Laporan Laba Rugi
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
                <div
                  className={`p-3 cursor-pointer hover:bg-gray-100 ${
                    reportType === "arus-kas"
                      ? "font-semibold text-primary-indigo"
                      : ""
                  }`}
                  onClick={() => handleReportTypeChange("arus-kas")}
                >
                  Laporan Arus Kas
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

                      <div className="bg-green-100 p-3 rounded-full">
                        <CoinIcon className="text-green-500" />
                      </div>
                      <p className="font-medium">Utang Pelanggan</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xl font-bold text-green-600">

                        Rp{formatCurrency(summary.utangSaya)}
                      </p>
                      <p className="text-xs text-gray-500">Belum dilunasi</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">

                      <div className="bg-red-100 p-3 rounded-full">
                        <StockIcon className="text-red-500" />
                      </div>
                      <p className="font-medium">Utang Saya</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xl font-bold text-red-600">
                        Rp{formatCurrency(summary.utangPelanggan)}
                      </p>
                      <p className="text-xs text-gray-500">Belum dilunasi</p>
                    </div>
                  </div>
                </>
              ) : reportType === "keuangan" ? (
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

                        Rp{formatCurrency(summary.totalPengeluaran)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dateRange === "custom" &&
                        customStartDate &&
                        customEndDate
                          ? `${formatDate(customStartDate)} - ${formatDate(
                              customEndDate
                            )}`
                          : `${dateRange} Hari Terakhir`}
                      </p>
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

                        Rp{formatCurrency(summary.totalPemasukan)}

                      </p>
                      <p className="text-xs text-gray-500">
                        {dateRange === "custom" &&
                        customStartDate &&
                        customEndDate
                          ? `${formatDate(customStartDate)} - ${formatDate(
                              customEndDate
                            )}`
                          : `${dateRange} Hari Terakhir`}
                      </p>
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
                      <p className="font-medium">Total Kas Masuk</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xl font-bold text-green-600">
                        Rp{formatCurrency(summary.totalPemasukan)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dateRange === "custom" &&
                        customStartDate &&
                        customEndDate
                          ? `${formatDate(customStartDate)} - ${formatDate(
                              customEndDate
                            )}`
                          : `${dateRange} Hari Terakhir`}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-red-100 p-3 rounded-full">
                        <StockIcon className="text-red-500" />
                      </div>
                      <p className="font-medium">Total Kas Keluar</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xl font-bold text-red-600">
                        Rp{formatCurrency(summary.totalPengeluaran)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dateRange === "custom" &&
                        customStartDate &&
                        customEndDate
                          ? `${formatDate(customStartDate)} - ${formatDate(
                              customEndDate
                            )}`
                          : `${dateRange} Hari Terakhir`}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Date Range Filter - Now consistent across all report types */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Tanggal Laporan
              </label>
              <select
                value={dateRange}
                onChange={(e) => hasAccess && setDateRange(e.target.value)}
                className={`w-full p-2 border border-gray-300 rounded-md mb-3 ${
                  !hasAccess ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                disabled={!hasAccess}
              >
                <option value="this_month">Bulan Ini</option>
                <option value="7">7 Hari Terakhir</option>
                <option value="30">30 Hari Terakhir</option>
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
                    onChange={handleStartDateChange}
                    max={customEndDate}
                    className={`w-full p-2 border border-gray-300 rounded-md ${
                      !hasAccess ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    disabled={!hasAccess}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={handleEndDateChange}
                    min={customStartDate}
                    className={`w-full p-2 border border-gray-300 rounded-md ${
                      !hasAccess ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    disabled={!hasAccess}
                  />
                </div>
              </div>
            </div>

            {/* Transactions List with Pagination Info */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">
                  {reportType === "utang"
                    ? "Daftar Transaksi Belum Lunas"
                    : "Daftar Transaksi"}
                </h2>
                {/* {totalTransactionsCount > 0 && (
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalTransactionsCount)} of {totalTransactionsCount}
                </p>
              )} */}
              </div>

              <div className="space-y-3">
                {totalTransactionsCount === 0 ? (
                  <p className="text-center text-gray-500 py-4 bg-white rounded-lg shadow-sm">
                    {hasAccess
                      ? reportType === "utang"
                        ? "Tidak ada data utang untuk periode ini."
                        : "Tidak ada transaksi untuk periode ini."
                      : "Tidak ada data yang dapat ditampilkan."}
                  </p>
                ) : currentTransactions.length !== 0 &&
                  reportType !== "arus-kas" ? (
                  currentTransactions.map(
                    (transaction) => (
                      console.log(transaction),
                      (
                        <div
                          key={transaction.id}
                          className={`bg-white rounded-xl p-3 shadow-sm ${
                            hasAccess ? "cursor-pointer" : "cursor-not-allowed"
                          }`}
                          onClick={() =>
                            hasAccess &&
                            router.push(`/transaksi/detail/${transaction.id}`)
                          }
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Transaksi #{transaction.id}
                            </span>
                            <span className="text-sm text-gray-500">
                              {"created_at" in transaction
                                ? formatLocalDate(transaction.created_at)
                                : ""}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                "transaction_type" in transaction &&
                                transaction.transaction_type === "pemasukan"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {"transaction_type" in transaction &&
                              transaction.transaction_type === "pemasukan"
                                ? "Berikan"
                                : "Terima"}
                            </span>
                            <span className="font-semibold">
                              Rp
                              {formatCurrency(
                                "total_amount" in transaction
                                  ? transaction.total_amount
                                  : 0
                              )}
                            </span>
                          </div>
                          {/* Status badge (shown for all transactions in financial report) */}
                          {(reportType === "keuangan" ||
                            ("status" in transaction &&
                              transaction.status === "Belum Lunas")) && (
                            <div className="flex justify-end mt-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  "status" in transaction &&
                                  transaction.status === "Lunas"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-yellow-50 text-yellow-700"
                                }`}
                              >
                                {"status" in transaction
                                  ? transaction.status
                                  : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    )
                  )
                ) : reportType === "arus-kas" &&
                  currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction) => (
                    <div
                      key={
                        "transaksi_id" in transaction
                          ? transaction.transaksi_id
                          : transaction.id
                      }
                      className={`bg-white rounded-xl p-3 shadow-sm ${
                        hasAccess ? "cursor-pointer" : "cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (hasAccess) {
                          if ("transaksi_id" in transaction) {
                            router.push(
                              `/transaksi/detail/${transaction.transaksi_id}`
                            );
                          } else {
                            router.push(`/transaksi/detail/${transaction.id}`);
                          }
                        }
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          Transaksi #
                          {"transaksi_id" in transaction
                            ? transaction.transaksi_id
                            : transaction.id}
                        </span>
                        <span className="text-sm text-gray-500">
                          {"tanggal_transaksi" in transaction
                            ? formatLocalDate(transaction.tanggal_transaksi)
                            : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            "jenis" in transaction &&
                            transaction.jenis === "inflow"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {"jenis" in transaction &&
                          transaction.jenis === "inflow"
                            ? "Kas Masuk"
                            : "Kas Keluar"}
                        </span>
                        <span className="font-semibold">
                          Rp
                          {formatCurrency(
                            "nominal" in transaction
                              ? Number(transaction.nominal)
                              : 0
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4 bg-white rounded-lg shadow-sm">
                    No transactions to display.
                  </p>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mb-6">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 disabled:opacity-50"
                >
                  Prev
                </button>

                {renderPaginationButtons()}

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 disabled:opacity-50 ml-1"
                >
                  Next
                </button>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownloadClick}
              disabled={
                isGeneratingReport ||
                (transactions.length === 0 &&
                  arusKasTransactions.length === 0) ||
                !hasAccess
              }
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
    </>
  );
};

export default ReportPage;
