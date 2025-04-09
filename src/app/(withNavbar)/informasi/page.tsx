"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Add this import
import HeaderProduk from '@/src/components/HeaderProduk';
import config from '@/src/config';
import { useAuth } from '@/contexts/AuthContext';

// Types for API responses
interface TopSellingProduct {
  id: number;
  name: string;
  sold: number;
}

interface PopularProduct {
  id: number;
  name: string;
  sold: number;
  imageUrl: string | null;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  imageUrl: string | null;
}

// Fixed colors for progress bars
const progressBarColors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500'];

// Helper Component for Progress Bar
const ProgressBar = ({ value, max, index }: { value: number; max: number; index: number }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const color = progressBarColors[index % progressBarColors.length];
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden relative">
      <div
        className={`${color} h-5 rounded-full`}
        style={{ width: `${percentage}%` }}
      ></div>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-lighten px-2">
         Terjual: {value} Porsi
      </span>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-black mix-blend-plus-lighter px-2">
         Terjual: {value} Porsi
      </span>
    </div>
  );
};

const SemuaBarangPage: React.FC = () => {
  const { accessToken } = useAuth();
  const router = useRouter(); // Add router
  
  // State for date selection
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  
  // State for API data
  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProduct[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    topSelling: false, 
    popular: false, 
    lowStock: false
  });
  const [errors, setErrors] = useState<{
    topSelling: string | null; 
    popular: string | null; 
    lowStock: string | null;
  }>({
    topSelling: null, 
    popular: null, 
    lowStock: null
  });

  // Calculate max sold for progress bar
  const maxSold = Math.max(...topSellingProducts.map(p => p.sold), 0);

  // Fetch top selling products by month
  const fetchTopSellingProducts = async () => {
    setLoading(prev => ({ ...prev, topSelling: true }));
    setErrors(prev => ({ ...prev, topSelling: null }));
    
    try {
      const response = await fetch(`${config.apiUrl}/produk/top-selling/${selectedYear}/${selectedMonth}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setTopSellingProducts(data);
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      setErrors(prev => ({ ...prev, topSelling: 'Failed to load top selling products' }));
    } finally {
      setLoading(prev => ({ ...prev, topSelling: false }));
    }
  };

  // Fetch most popular products
  const fetchPopularProducts = async () => {
    setLoading(prev => ({ ...prev, popular: true }));
    setErrors(prev => ({ ...prev, popular: null }));
    
    try {
      const response = await fetch(`${config.apiUrl}/produk/most-popular`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setPopularProducts(data);
    } catch (error) {
      console.error('Error fetching popular products:', error);
      setErrors(prev => ({ ...prev, popular: 'Failed to load popular products' }));
    } finally {
      setLoading(prev => ({ ...prev, popular: false }));
    }
  };

  // Fetch low stock products
  const fetchLowStockProducts = async () => {
    setLoading(prev => ({ ...prev, lowStock: true }));
    setErrors(prev => ({ ...prev, lowStock: null }));
    
    try {
      const response = await fetch(`${config.apiUrl}/produk/low-stock`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setLowStockProducts(data);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      setErrors(prev => ({ ...prev, lowStock: 'Failed to load low stock products' }));
    } finally {
      setLoading(prev => ({ ...prev, lowStock: false }));
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (accessToken) {
      fetchLowStockProducts();
      fetchPopularProducts();
    }
  }, [accessToken]);

  // Fetch top selling products when month/year changes
  useEffect(() => {
    if (accessToken) {
      fetchTopSellingProducts();
    }
  }, [selectedMonth, selectedYear, accessToken]);

  // Get month name from number
  const getMonthName = (monthNumber: number): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNumber - 1];
  };

  // Function to handle edit product navigation
  const navigateToEditProduct = (productId: number) => {
    router.push(`/editProduk/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <HeaderProduk />

      <main className="container mx-auto px-4 space-y-6">
        {/* Rest of the component remains the same */}
        {/* Section: Produk Paling Laku Bulan */}
        <section className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
             <h2 className="text-base font-semibold text-gray-800">Produk Paling Laku Bulan</h2>
             <div className="flex items-center space-x-2">
                <select 
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{getMonthName(month)}</option>
                  ))}
                </select>
                <select 
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="space-y-3">
            {loading.topSelling ? (
              <div className="flex justify-center p-4">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : errors.topSelling ? (
              <div className="flex justify-center p-4">
                <p className="text-red-500">{errors.topSelling}</p>
              </div>
            ) : topSellingProducts.length === 0 ? (
              <div className="flex justify-center p-4">
                <p className="text-gray-500">Tidak ada data untuk periode ini</p>
              </div>
            ) : (
              topSellingProducts.map((produk, index) => (
                <div key={produk.id} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">{index + 1}.</span>
                  <div className="flex-grow">
                     <p className="text-sm font-medium text-gray-800 mb-1">{produk.name}</p>
                     <ProgressBar value={produk.sold} max={maxSold} index={index} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Produk Paling Laku (Cards) */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3 px-1">Produk Paling Laku</h2>
          {loading.popular ? (
            <div className="flex justify-center p-4 bg-white rounded-xl shadow">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : errors.popular ? (
            <div className="flex justify-center p-4 bg-white rounded-xl shadow">
              <p className="text-red-500">{errors.popular}</p>
            </div>
          ) : popularProducts.length === 0 ? (
            <div className="flex justify-center p-4 bg-white rounded-xl shadow">
              <p className="text-gray-500">Tidak ada produk populer</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {popularProducts.map((produk) => (
                <div key={produk.id} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="relative w-full aspect-square p-2">
                    <div className="relative w-full h-full overflow-hidden rounded-xl">
                      <Image
                        src={produk.imageUrl ? `${config.apiUrl}${produk.imageUrl.slice(4)}` : `/images/placeholder.svg`}
                        alt={produk.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 truncate mb-1">{produk.name}</h3>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                      <span>Terjual</span>
                      <span className="font-medium text-gray-700">{produk.sold}</span>
                    </div>
                    <button 
                      className="w-full bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      onClick={() => navigateToEditProduct(produk.id)}
                    >
                      Perbarui Produk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: Produk Stok Rendah */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3 px-1">Produk Stok Rendah</h2>
          {loading.lowStock ? (
            <div className="flex justify-center p-4 bg-white rounded-xl shadow">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : errors.lowStock ? (
            <div className="flex justify-center p-4 bg-white rounded-xl shadow">
              <p className="text-red-500">{errors.lowStock}</p>
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="flex justify-center p-4 bg-white rounded-xl shadow">
              <p className="text-gray-500">Tidak ada produk dengan stok rendah</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((produk) => (
                <div key={produk.id} className="bg-white p-3 rounded-xl shadow flex items-center space-x-3">
                  <div className="flex-shrink-0 p-1">
                    <div className="overflow-hidden rounded-xl">
                      <Image
                        src={produk.imageUrl ? `${config.apiUrl}${produk.imageUrl.slice(4)}` : `/images/placeholder.svg`}
                        alt={produk.name}
                        width={50}
                        height={50}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 truncate">{produk.name}</h3>
                    <p className="text-xs text-red-600">Stok Rendah: {produk.stock}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <button 
                      className="bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 whitespace-nowrap"
                      onClick={() => navigateToEditProduct(produk.id)}
                    >
                      Perbarui Produk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SemuaBarangPage;