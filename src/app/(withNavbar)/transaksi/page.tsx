"use client";

import { DotIcon } from "@/public/icons/DotIcon";
import React, { useState, useEffect } from "react";
import { TransactionHeader } from "./module-elements/TransactionHeader";
import { TransactionSummary } from "./module-elements/TransactionSummary";
import { PlusIcon } from "@/public/icons/PlusIcon";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/src/config";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilter, setActiveFilter] = useState<"all" | "paid" | "unpaid">(
    "all"
  );
  const { accessToken } = useAuth();

  const fetchTransactions = async (
    pageNum: number,
    status?: string
  ) => {
    if (!accessToken) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url = `${config.apiUrl}/transaksi?page=${pageNum}&per_page=10`;
      if (status) {
        url += `&status=${status}`;
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
  }, [page, accessToken, activeFilter]);

  const handleFilterChange = (filter: "all" | "paid" | "unpaid") => {
    setActiveFilter(filter);
    setPage(1); // Reset to first page when changing filters
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

  return (
    <div className="mt-8 flex flex-col gap-4">
      <TransactionHeader />
      <TransactionSummary />

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
            <p>No transactions found.</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white py-3 px-5 rounded-xl flex flex-col gap-1"
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
      <button
        className="bg-primary-indigo rounded-full w-fit fixed bottom-4 right-4 sm:right-[calc(50%-(420px/2)+1rem)] p-4 mb-24"
        onClick={() => setModalOpen(!modalOpen)}
      >
        <PlusIcon />
      </button>

      {/* Modal popup */}
      {modalOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setModalOpen(false)}
          />

          {/* Modal popup */}
          <div className="fixed bottom-24 right-4 sm:right-[calc(50%-(420px/2)+1rem)] z-50 flex flex-col gap-3 bg-white p-4 rounded-xl shadow-lg">
            <Link
              href="/tambahPemasukan"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg text-primary-indigo font-medium"
            >
              <span className="p-1 bg-green-100 rounded-full text-green-500 w-6 h-6 flex items-center justify-center font-semibold">
                +
              </span>
              <span>Tambah Pemasukan</span>
            </Link>
            <Link
              href="/tambahPengeluaran"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg text-primary-indigo font-medium"
            >
              <span className="p-1 bg-red-100 rounded-full text-red-500 w-6 h-6 flex items-center justify-center font-semibold">
                -
              </span>
              <span>Tambah Pengeluaran</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}