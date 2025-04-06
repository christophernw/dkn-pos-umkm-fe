"use client"

import { DotIcon } from '@/public/icons/DotIcon'
import React, { useState, useEffect } from 'react'
import { TransactionHeader } from './module-elements/TransactionHeader'
import { TransactionSummary } from './module-elements/TransactionSummary'
import { PlusIcon } from '@/public/icons/PlusIcon'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import config from '@/src/config'

interface TransactionItem {
  id: string;
  transaction_type: 'pemasukan' | 'pengeluaran';
  category: string;
  total_amount: number;
  status: 'Lunas' | 'Belum Lunas';
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
  const [searchQuery, setSearchQuery] = useState('');
  const { accessToken } = useAuth();

  const fetchTransactions = async (pageNum: number, query: string = '') => {
    if (!accessToken) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${config.apiUrl}/transaksi?page=${pageNum}&q=${query}&per_page=10`, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: PaginatedResponse = await response.json();
      
      setTransactions(data.items);
      setTotalItems(data.total);
      setTotalPages(data.total_pages);
      setPage(data.page);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page, searchQuery);
  }, [page, accessToken]); // Fetch when page changes or when accessToken is available

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchTransactions(1, searchQuery);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('id-ID');
  };

  return (
    <div className="mt-8 flex flex-col gap-4">
      <TransactionHeader />
      <TransactionSummary />
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input 
          type="text" 
          placeholder="Search transactions..." 
          className="flex-grow p-2 border rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          type="submit" 
          className="bg-primary-indigo text-white px-4 py-2 rounded-lg"
        >
          Search
        </button>
      </form>
      
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
            <div key={transaction.id} className="bg-white py-3 px-5 rounded-xl flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm text-primary-indigo">Transaksi #{transaction.id}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-primary-gray">{formatDate(transaction.created_at)}</p>
                  <DotIcon />
                  <p className="text-xs text-primary-gray">{formatTime(transaction.created_at)}</p>
                </div>
              </div>
              <div className="justify-between flex">                
                <p className={`rounded-full px-2 py-1 font-medium text-white w-fit text-xs ${
                  transaction.transaction_type === 'pemasukan' 
                    ? 'bg-primary-green' 
                    : 'bg-red-500'
                }`}>
                  {transaction.transaction_type === 'pemasukan' ? '+ ' : '- '}
                  Rp{formatCurrency(transaction.total_amount)}
                </p>
                <p className={`rounded-full px-2 py-1 font-medium w-fit text-xs ${
                  transaction.status === 'Lunas'
                    ? 'bg-secondary-green text-primary-green'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {transaction.status}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination Controls */}
      {!loading && transactions.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          
          <div className="text-sm">
            Page {page} of {totalPages}
          </div>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      
      {/* Add Button */}
      <button className="bg-primary-indigo rounded-full w-fit fixed bottom-4 right-4 sm:right-[calc(50%-(420px/2)+1rem)] p-4 mb-24" onClick={() => setModalOpen(!modalOpen)}>
        <PlusIcon/>
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
              <span className="p-1 bg-green-100 rounded-full text-green-500 w-6 h-6 flex items-center justify-center font-semibold">+</span>
              <span>Tambah Pemasukan</span>
            </Link>
            <Link 
              href="/tambahPengeluaran" 
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg text-primary-indigo font-medium"
            >
              <span className="p-1 bg-red-100 rounded-full text-red-500 w-6 h-6 flex items-center justify-center font-semibold">-</span>
              <span>Tambah Pengeluaran</span>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}