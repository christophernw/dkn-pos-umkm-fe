"use client";

import { DotIcon } from "@/public/icons/DotIcon";
import React, { useState, useEffect } from "react";
import { TransactionSummary } from "./module-elements/TransactionSummary";
import { PlusIcon } from "@/public/icons/PlusIcon";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/src/config";
import { useRouter } from "next/navigation";
import { NotesIcon } from "@/public/icons/notesIcon";

interface TransactionItem {
  id: string;
  transaction_type: "pemasukan" | "pengeluaran";
  category: string;
  total_amount: number;
  status: "Lunas" | "Belum Lunas";
  created_at: string;
}

interface PaginatedResponse {
  items: TransactionItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export default function TransactionMainPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilter, setActiveFilter] = useState<"all" | "paid" | "unpaid">("all");
  const { accessToken } = useAuth();
  const [viewMode, setViewMode] = useState<"transaksi" | "pembatalan">("transaksi");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12 for Jan-Dec
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const fetchTransactions = async (pageNum: number, status?: string) => {
    if (!accessToken) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url = `${config.apiUrl}/transaksi?page=${pageNum}&per_page=10`;
      
      // Add month and year filters - this is the key change
      url += `&month=${selectedMonth}&year=${selectedYear}`;
      
      if (status) {
        url += `&status=${status}`;
      }

      if (viewMode === "pembatalan") {
        url += `&show_deleted=true`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: PaginatedResponse = await response.json();

      setTransactions(data.items);
      setTotalItems(data.total);
      setTotalPages(data.total_pages);
      setPage(data.page);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const status =
      activeFilter === "all"
        ? ""
        : activeFilter === "paid"
        ? "Lunas"
        : "Belum Lunas";
    fetchTransactions(page, status);
  }, [page, accessToken, activeFilter, viewMode, selectedMonth, selectedYear]);

  const handleFilterChange = (filter: "all" | "paid" | "unpaid") => {
    setActiveFilter(filter);
    setPage(1); // Reset to first page when changing filters
  };

  const handleViewModeChange = (mode: "transaksi" | "pembatalan") => {
    setViewMode(mode);
    setPage(1); // Reset to first page when changing view mode
    setDropdownOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("id-ID");
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtonsToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxButtonsToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key="1"
          className="min-w-9 rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 ml-1"
          onClick={() => setPage(1)}
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

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`min-w-9 rounded-md ${
            page === i
              ? "bg-primary-indigo text-white border border-primary-indigo"
              : "border border-slate-300 hover:bg-blue-100"
          } py-1 px-2 text-xs ml-1`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }

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
          className="min-w-9 rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 ml-1"
          onClick={() => setPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const handleTransactionClick = (transactionId: string) => {
    router.push(`/transaksi/detail/${transactionId}`);
  };

  // Month names in Indonesian
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Get list of years (current year and 4 years back)
  const currentYear = new Date().getFullYear();
  const yearList = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="justify-between flex">
        <div className="relative">
          <div
            className="flex p-1 bg-white rounded-full items-center gap-2 w-fit cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="bg-primary-indigo rounded-full p-2">
              <NotesIcon />
            </div>
            <p className="pr-1">
              {viewMode === "transaksi" ? "Transaksi" : "Pembatalan Transaksi"}
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
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg z-10 w-[220px]">
              <div
                className={`p-3 cursor-pointer hover:bg-gray-100 ${
                  viewMode === "transaksi"
                    ? "font-semibold text-primary-indigo"
                    : ""
                }`}
                onClick={() => handleViewModeChange("transaksi")}
              >
                Transaksi
              </div>
              <div
                className={`p-3 cursor-pointer hover:bg-gray-100 ${
                  viewMode === "pembatalan"
                    ? "font-semibold text-primary-indigo"
                    : ""
                }`}
                onClick={() => handleViewModeChange("pembatalan")}
              >
                Pembatalan Transaksi
              </div>
            </div>
          )}
        </div>
        
        {/* Month and Year Filter */}
        <div className="flex gap-2">
          {/* Month Dropdown */}
          <div className="relative">
            <div
              className="flex p-2 bg-white rounded-lg items-center gap-2 cursor-pointer border border-gray-200"
              onClick={() => {
                setMonthDropdownOpen(!monthDropdownOpen);
                setYearDropdownOpen(false);
              }}
            >
              <span className="text-sm font-medium">{monthNames[selectedMonth - 1]}</span>
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

            {monthDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg z-10 w-[160px] max-h-56 overflow-y-auto">
                {monthNames.map((month, index) => (
                  <div
                    key={index}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${
                      selectedMonth === index + 1
                        ? "font-semibold text-primary-indigo bg-indigo-50"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedMonth(index + 1);
                      setMonthDropdownOpen(false);
                      setPage(1);
                    }}
                  >
                    {month}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <div
              className="flex p-2 bg-white rounded-lg items-center gap-2 cursor-pointer border border-gray-200"
              onClick={() => {
                setYearDropdownOpen(!yearDropdownOpen);
                setMonthDropdownOpen(false);
              }}
            >
              <span className="text-sm font-medium">{selectedYear}</span>
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

            {yearDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg z-10 w-[100px]">
                {yearList.map((year) => (
                  <div
                    key={year}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${
                      selectedYear === year
                        ? "font-semibold text-primary-indigo bg-indigo-50"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedYear(year);
                      setYearDropdownOpen(false);
                      setPage(1);
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {viewMode === "transaksi" && (
        <TransactionSummary 
          selectedMonth={selectedMonth} 
          selectedYear={selectedYear}
        />
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleFilterChange("all")}
          className={`flex-1 p-2 rounded-lg font-medium ${
            activeFilter === "all"
              ? "bg-primary-indigo text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => handleFilterChange("paid")}
          className={`flex-1 p-2 rounded-lg font-medium ${
            activeFilter === "paid"
              ? "bg-primary-indigo text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Lunas
        </button>
        <button
          onClick={() => handleFilterChange("unpaid")}
          className={`flex-1 p-2 rounded-lg font-medium ${
            activeFilter === "unpaid"
              ? "bg-primary-indigo text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Belum Lunas
        </button>
      </div>

      {/* Results count */}
      <div>
        <p className="font-medium">{totalItems} Results</p>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="py-10 text-center">
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-10 text-center">
            <p>Tidak ada transaksi ditemukan</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white py-3 px-5 rounded-xl flex flex-col gap-1 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTransactionClick(transaction.id)}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm text-primary-indigo">
                  Transaksi #{transaction.id}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-primary-gray">
                    {formatDate(transaction.created_at)}
                  </p>
                  <DotIcon />
                  <p className="text-xs text-primary-gray">
                    {formatTime(transaction.created_at)}
                  </p>
                </div>
              </div>
              <div className="justify-between flex">
                <p
                  className={`rounded-full px-2 py-1 font-medium text-white w-fit text-xs ${
                    transaction.transaction_type === "pemasukan"
                      ? "bg-primary-green"
                      : "bg-red-500"
                  }`}
                >
                  {transaction.transaction_type === "pemasukan" ? "+ " : "- "}
                  Rp{formatCurrency(transaction.total_amount)}
                </p>
                <p
                  className={`rounded-full px-2 py-1 font-medium w-fit text-xs ${
                    transaction.status === "Lunas"
                      ? "bg-secondary-green text-primary-green"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {transaction.status}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Updated Pagination Controls */}
      {!loading && transactions.length > 0 && (
        <div className="flex justify-center items-center mt-4 mb-24 gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 disabled:opacity-50"
          >
            Prev
          </button>

          {renderPaginationButtons()}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Button */}
      <Link 
        href="/tambahTransaksi"
        className="bg-primary-indigo rounded-full w-fit fixed bottom-4 right-4 sm:right-[calc(50%-(420px/2)+1rem)] p-4 mb-24"
      >
        <PlusIcon />
      </Link>

      {/* Modal popup */}
      {modalOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
