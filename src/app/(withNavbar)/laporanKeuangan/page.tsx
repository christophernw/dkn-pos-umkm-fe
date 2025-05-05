"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/src/config";
import { useRouter } from "next/navigation";
import { getFilteredFinancialData } from './dummyFinancialData';


interface FinancialSummary {
  total_income: number;
  total_expense: number;
  total_profit: number;
  transaction_count: number;
}

interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

export default function LaporanKeuanganPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: getFirstDayOfMonth(),
    end: getCurrentDate(),
  });
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [incomeByCategory, setIncomeByCategory] = useState<CategorySummary[]>([]);
  const [expenseByCategory, setExpenseByCategory] = useState<CategorySummary[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);

  const { accessToken } = useAuth();
  const router = useRouter();

  function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  function getFirstDayOfMonth() {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-01`;
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("id-ID");
  };

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use dummy data instead of API call
      const data = getFilteredFinancialData(dateRange.start, dateRange.end);
      
      setSummary(data.summary);
      setIncomeByCategory(data.income_by_category);
      setExpenseByCategory(data.expense_by_category);
      setMonthlyData(data.monthly_data);
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setError("Gagal memuat data laporan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilter = () => {
    fetchFinancialData();
  };

  useEffect(() => {
    fetchFinancialData();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat data laporan keuangan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => router.back()}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Laporan Keuangan</h1>
      
      {/* Date Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Filter Tanggal</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="start" className="block text-sm text-gray-600 mb-1">
              Dari
            </label>
            <input
              type="date"
              id="start"
              name="start"
              value={dateRange.start}
              onChange={handleDateRangeChange}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="end" className="block text-sm text-gray-600 mb-1">
              Sampai
            </label>
            <input
              type="date"
              id="end"
              name="end"
              value={dateRange.end}
              onChange={handleDateRangeChange}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
        </div>
        <button
          onClick={applyFilter}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Terapkan Filter
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Pemasukan</p>
            <p className="text-lg font-bold text-green-600">Rp{formatCurrency(summary.total_income)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Pengeluaran</p>
            <p className="text-lg font-bold text-red-600">Rp{formatCurrency(summary.total_expense)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm col-span-2">
            <p className="text-sm text-gray-500">Total Keuntungan</p>
            <p className="text-xl font-bold text-blue-600">Rp{formatCurrency(summary.total_profit)}</p>
          </div>
        </div>
      )}

      {/* Income by Category */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Pemasukan Berdasarkan Kategori</h2>
        {incomeByCategory.length > 0 ? (
          <div className="space-y-3">
            {incomeByCategory.map((item, index) => (
              <div key={`income-${index}`} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">{item.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Rp{formatCurrency(item.amount)}</p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-3">Tidak ada data pemasukan.</p>
        )}
      </div>

      {/* Expense by Category */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Pengeluaran Berdasarkan Kategori</h2>
        {expenseByCategory.length > 0 ? (
          <div className="space-y-3">
            {expenseByCategory.map((item, index) => (
              <div key={`expense-${index}`} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">{item.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Rp{formatCurrency(item.amount)}</p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-3">Tidak ada data pengeluaran.</p>
        )}
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Tren Bulanan</h2>
        {monthlyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Bulan</th>
                  <th className="text-right py-2">Pemasukan</th>
                  <th className="text-right py-2">Pengeluaran</th>
                  <th className="text-right py-2">Keuntungan</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item, index) => (
                  <tr key={`month-${index}`} className="border-b">
                    <td className="py-2">{item.month}</td>
                    <td className="text-right py-2 text-green-600">Rp{formatCurrency(item.income)}</td>
                    <td className="text-right py-2 text-red-600">Rp{formatCurrency(item.expense)}</td>
                    <td className="text-right py-2 text-blue-600">Rp{formatCurrency(item.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-3">Tidak ada data bulanan.</p>
        )}
      </div>

      {/* Export Button */}
      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md mb-6 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Ekspor Laporan
      </button>
    </div>
  );
}