"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import HeaderProduk from '@/src/components/HeaderProduk';
import config from '@/src/config';
import { useAuth } from '@/contexts/AuthContext';

interface TopSellingProduct {
  id: number;
  name: string;
  sold: number;
  imageUrl: string | null;
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

const progressBarColors = ['bg-green-400', 'bg-blue-500', 'bg-purple-500'];

const SemuaBarangPage: React.FC = () => {
  const { accessToken } = useAuth();
  const router = useRouter();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProduct[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

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

  const maxSold = Math.max(...topSellingProducts.map(p => p.sold), 0);

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
        if (response.status === 404) {
          setTopSellingProducts([]);
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } else {
        const data: TopSellingProduct[] = await response.json();
        setTopSellingProducts(data);
      }
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      setErrors(prev => ({ ...prev, topSelling: 'Failed to load top selling products' }));
      setTopSellingProducts([]);
    } finally {
      setLoading(prev => ({ ...prev, topSelling: false }));
    }
  };

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
         if (response.status === 404) {
            setPopularProducts([]);
         } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
         }
      } else {
         const data = await response.json();
         setPopularProducts(data);
      }
    } catch (error) {
      console.error('Error fetching popular products:', error);
      setErrors(prev => ({ ...prev, popular: 'Failed to load popular products' }));
       setPopularProducts([]);
    } finally {
      setLoading(prev => ({ ...prev, popular: false }));
    }
  };

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
         if (response.status === 404) {
            setLowStockProducts([]);
         } else {
           throw new Error(`HTTP error! Status: ${response.status}`);
         }
      } else {
         const data = await response.json();
         setLowStockProducts(data);
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      setErrors(prev => ({ ...prev, lowStock: 'Failed to load low stock products' }));
       setLowStockProducts([]);
    } finally {
      setLoading(prev => ({ ...prev, lowStock: false }));
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchLowStockProducts();
      fetchPopularProducts();
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchTopSellingProducts();
    }
  }, [selectedMonth, selectedYear, accessToken]);

  const getMonthName = (monthNumber: number): string => {
     const monthNames = [
       'January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December'
     ];
    return monthNames[monthNumber - 1];
  };

  const navigateToEditProduct = (productId: number) => {
    router.push(`/editProduk/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <HeaderProduk />

      <main className="container mx-auto px-4 py-6 space-y-6">
        
        <h2 className="text-base font-semibold text-gray-800 mb-3 px-1">Produk Paling Laku per Bulan</h2>
        
        <section className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center space-x-2">
                <div className="relative">
                  <select
                    className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 pr-8 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{getMonthName(month)}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M7 7l3-3 3 3m0 6l-3 3-3-3"/>
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 pr-8 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M7 7l3-3 3 3m0 6l-3 3-3-3"/>
                    </svg>
                  </div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
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
                <p className="text-gray-500">Tidak ada data penjualan untuk periode ini.</p>
              </div>
            ) : (
              topSellingProducts.map((produk, index) => {
                const percentage = maxSold > 0 ? (produk.sold / maxSold) * 100 : 0;
                const color = progressBarColors[index % progressBarColors.length];

                return (
                  <div key={produk.id}>
                    <p className="text-sm font-medium text-gray-800 mb-1.5">
                       <span className="font-semibold">{index + 1}.</span> {produk.name}
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-8 flex items-center pl-1">
                      <div
                        className={`${color} h-full rounded-full flex items-center px-3 py-1 relative overflow-hidden`}
                        style={{ width: `${percentage}%` }}
                      >
                         <div className="flex-shrink-0 mr-2">
                           <Image
                              src={produk.imageUrl ? `${config.apiUrl}/media/${produk.imageUrl}` : `/images/placeholder.svg`}
                              alt={produk.name}
                              width={24}
                              height={24}
                              className="rounded-full object-cover border border-white"
                            />
                         </div>
                         <span className="text-xs font-medium text-white whitespace-nowrap">
                           Terjual <span className="font-semibold">&#8226;</span> {produk.sold} Porsi
                         </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

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
               <p className="text-gray-500">Tidak ada produk populer.</p>
             </div>
          ) : (
             <div className="grid grid-cols-2 gap-4">
               {popularProducts.map((produk, index) => (
                 <div key={produk.id} className="bg-white rounded-xl shadow overflow-hidden">
                   <div className="relative w-full aspect-square p-2">
                      <div className="relative w-full h-full overflow-hidden rounded-xl">
                         <Image
                           src={produk.imageUrl ? `${config.apiUrl}${produk.imageUrl.slice(4)}` : `/images/placeholder.svg`}
                           alt={produk.name}
                           fill
                           style={{ objectFit: 'cover' }}
                           sizes="(max-width: 768px) 50vw, 200px"
                           priority={index < 2}
                         />
                      </div>
                   </div>
                   <div className="p-3">
                     <h3 className="text-sm font-medium text-gray-800 truncate mb-1">{produk.name}</h3>
                     <div className="flex justify-between items-center mb-2">
                       <div className="flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                         </svg>
                         <span className="text-xs">Terjual</span>
                       </div>
                       <div className="bg-green-50 text-green-600 text-xs py-0.5 px-2 rounded-md border border-green-100">
                         {produk.sold} item
                       </div>
                     </div>
                     <button
                       className="w-full bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
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
               <p className="text-gray-500">Tidak ada produk dengan stok rendah.</p>
             </div>
          ) : (
             <div className="space-y-3">
               {lowStockProducts.map((produk) => (
                 <div key={produk.id} className="bg-white p-3 rounded-xl shadow flex items-center space-x-3">
                   <div className="flex-shrink-0 p-1">
                      <div className="overflow-hidden rounded-lg w-12 h-12">
                       <Image
                         src={produk.imageUrl ? `${config.apiUrl}${produk.imageUrl.slice(4)}` : `/images/placeholder.svg`}
                         alt={produk.name}
                         width={50}
                         height={50}
                         className="object-cover w-full h-full"
                       />
                     </div>
                   </div>
                   <div className="flex-grow min-w-0">
                     <h3 className="text-sm font-medium text-gray-800 truncate">{produk.name}</h3>
                     <div className="flex items-center mt-1 space-x-1.5">
                       <div className="flex items-center px-1.5 py-0.5 bg-red-50 text-red-500 rounded-md border border-red-100">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                         </svg>
                         <span className="text-xs">Rendah</span>
                       </div>
                       <div className="bg-gray-50 text-gray-600 text-xs py-0.5 px-1.5 rounded-md border border-gray-200">
                         {produk.stock} item
                       </div>
                     </div>
                   </div>
                   <div className="flex-shrink-0">
                     <button
                       className="bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 whitespace-nowrap transition duration-150 ease-in-out"
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