"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import HeaderProduk from '@/src/components/HeaderProduk';
import config from '@/src/config';
import { useAuth } from '@/contexts/AuthContext';

// Types for API responses
interface TopSellingProduct {
  id: number;
  name: string;
  sold: number;
  imageUrl: string | null; // Added imageUrl to match the design
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

// Fixed colors for progress bars (matching the image)
const progressBarColors = ['bg-green-400', 'bg-blue-500', 'bg-purple-500'];

// ----- Removed the old ProgressBar Component -----

const SemuaBarangPage: React.FC = () => {
  const { accessToken } = useAuth();
  const router = useRouter();

  // State for date selection
  const currentDate = new Date();
  // Set default month to February and year to 2025 as per the image for demonstration
  // In a real app, you might still want currentDate.getMonth() + 1 and currentDate.getFullYear()
  const [selectedMonth, setSelectedMonth] = useState<number>(2); // February
  const [selectedYear, setSelectedYear] = useState<number>(2025); // 2025

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

  // Calculate max sold for progress bar normalization
  const maxSold = Math.max(...topSellingProducts.map(p => p.sold), 0);

  // Fetch top selling products by month
  const fetchTopSellingProducts = async () => {
    setLoading(prev => ({ ...prev, topSelling: true }));
    setErrors(prev => ({ ...prev, topSelling: null }));

    try {
      // --- MOCK DATA TO MATCH IMAGE ---
      // In a real scenario, you would fetch this data from the API
      // Ensure your API at `${config.apiUrl}/produk/top-selling/${selectedYear}/${selectedMonth}`
      // returns data including an 'imageUrl' field.
      if (false) {
         // Example data structure matching the image (replace with actual API call)
         const mockData: TopSellingProduct[] = [
            { id: 1, name: 'Kue Cucur Bahagia', sold: 200, imageUrl: '/images/kue_cucur.jpg' }, // Replace with actual image URL path
            { id: 2, name: 'Donat Senyum', sold: 170, imageUrl: '/images/donat.jpg' }, // Replace with actual image URL path
            { id: 3, name: 'Kue Apem', sold: 95, imageUrl: '/images/kue_apem.jpg' } // Replace with actual image URL path
         ];
         // Simulate API delay
         await new Promise(resolve => setTimeout(resolve, 500));
         setTopSellingProducts(mockData);
      } else {
         // Original fetch logic for other dates (assuming API returns imageUrl)
         const response = await fetch(`${config.apiUrl}/produk/top-selling/${selectedYear}/${selectedMonth}`, {
           method: 'GET',
           headers: {
             'Authorization': `Bearer ${accessToken}`,
             'Content-Type': 'application/json'
           }
         });

         if (!response.ok) {
           // If the API fails for non-mocked dates, show an error.
           // If the API responds with 404 or similar for no data, handle it gracefully.
           if (response.status === 404) {
                setTopSellingProducts([]); // Set to empty array if no data found
           } else {
               throw new Error(`HTTP error! Status: ${response.status}`);
           }
         } else {
             const data: TopSellingProduct[] = await response.json(); // Assume API returns imageUrl now
             setTopSellingProducts(data);
         }
      }


    } catch (error) {
      console.error('Error fetching top selling products:', error);
      setErrors(prev => ({ ...prev, topSelling: 'Failed to load top selling products' }));
      setTopSellingProducts([]); // Clear data on error
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

  // Fetch data on component mount
  useEffect(() => {
    if (accessToken) {
      fetchLowStockProducts();
      fetchPopularProducts();
      // Top selling is fetched based on month/year change effect
    }
  }, [accessToken]);

  // Fetch top selling products when month/year changes
  useEffect(() => {
    if (accessToken) {
      fetchTopSellingProducts();
    }
  }, [selectedMonth, selectedYear, accessToken]); // Rerun when date or token changes

  // Get month name from number
  const getMonthName = (monthNumber: number): string => {
    // Using Indonesian month names for consistency if needed, otherwise stick to English
     const monthNames = [
       'January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December'
     ];
    // const monthNames = [
    //   'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    //   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    // ];
    return monthNames[monthNumber - 1];
  };

  // Function to handle edit product navigation
  const navigateToEditProduct = (productId: number) => {
    router.push(`/editProduk/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <HeaderProduk />

      <main className="container mx-auto px-4 py-6 space-y-6"> {/* Added py-6 */}

        {/* ================================================== */}
        {/* Section: Produk Paling Laku Bulan (MODIFIED)       */}
        {/* ================================================== */}
        <section className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4"> {/* Increased mb */}
             <h2 className="text-base font-semibold text-gray-800">Produk Paling Laku Bulan</h2>
             <div className="flex items-center space-x-2">
                {/* Updated select styling to match image */}
                <select
                  className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  style={{ paddingRight: '2rem' }} // Add space for the dropdown icon
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{getMonthName(month)}</option>
                  ))}
                </select>
                 {/* Select arrow icon (optional, for better styling) */}
                 {/* You might need to position this absolutely relative to the select */}
                 {/* <svg className="w-4 h-4 pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" ...>...</svg> */}

                <select
                  className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                   style={{ paddingRight: '2rem' }} // Add space for the dropdown icon
                >
                  {/* Adjust year range if needed */}
                  {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {/* Select arrow icon (optional) */}
             </div>
          </div>

          <div className="space-y-4"> {/* Increased spacing */}
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
              // Map over products to render the new layout
              topSellingProducts.map((produk, index) => {
                const percentage = maxSold > 0 ? (produk.sold / maxSold) * 100 : 0;
                const color = progressBarColors[index % progressBarColors.length]; // Get color based on index

                return (
                  <div key={produk.id}>
                    {/* Product Rank and Name */}
                    <p className="text-sm font-medium text-gray-800 mb-1.5">
                       <span className="font-semibold">{index + 1}.</span> {produk.name}
                    </p>
                    {/* Background container for the bar */}
                    <div className="w-full bg-gray-100 rounded-full h-8 flex items-center pl-1"> {/* Added pl-1 for image padding */}
                       {/* Colored progress bar part */}
                      <div
                        className={`${color} h-full rounded-full flex items-center px-3 py-1 relative overflow-hidden`} // Added relative and overflow-hidden
                        style={{ width: `${percentage}%` }}
                      >
                         {/* Product Image */}
                         <div className="flex-shrink-0 mr-2"> {/* Added margin */}
                           <Image
                             // Use API URL or placeholder
                              src={produk.imageUrl ? `${config.apiUrl}/media/${produk.imageUrl}` : `/images/placeholder.svg`}
                              // --- FOR MOCK DATA USE: ---
                              // src={produk.imageUrl || '/images/placeholder.svg'}
                              alt={produk.name}
                              width={24} // Adjust size as needed
                              height={24} // Adjust size as needed
                              className="rounded-full object-cover border border-white" // Circular and border
                            />
                         </div>
                         {/* Sales Text */}
                         <span className="text-xs font-medium text-white whitespace-nowrap">
                           Terjual <span className="font-semibold">&#8226;</span> {produk.sold} Porsi {/* Use bullet point */}
                         </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
        {/* ================================================== */}
        {/* End of Modified Section                           */}
        {/* ================================================== */}


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
               <p className="text-gray-500">Tidak ada produk populer.</p>
             </div>
          ) : (
             <div className="grid grid-cols-2 gap-4">
               {popularProducts.map((produk, index) => (
                 <div key={produk.id} className="bg-white rounded-xl shadow overflow-hidden">
                   {/* Image container */}
                   <div className="relative w-full aspect-square p-2"> {/* Padding inside */}
                      <div className="relative w-full h-full overflow-hidden rounded-xl"> {/* Rounded image container */}
                         <Image
                           src={produk.imageUrl ? `${config.apiUrl}${produk.imageUrl.slice(4)}` : `/images/placeholder.svg`}
                           alt={produk.name}
                           fill
                           style={{ objectFit: 'cover' }}
                           sizes="(max-width: 768px) 50vw, 200px" // Responsive image sizes
                           priority={index < 2} // Prioritize loading for above-the-fold images if needed
                         />
                      </div>
                   </div>
                   {/* Content below image */}
                   <div className="p-3">
                     <h3 className="text-sm font-medium text-gray-800 truncate mb-1">{produk.name}</h3>
                     <div className="flex justify-between items-center mb-2">
                       {/* "Terjual" Tag */}
                       <div className="flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                         </svg>
                         <span className="text-xs">Terjual</span>
                       </div>
                       {/* Quantity Tag */}
                       <div className="bg-green-50 text-green-600 text-xs py-0.5 px-2 rounded-md border border-green-100">
                         {produk.sold} item
                       </div>
                     </div>
                     {/* Button */}
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
               <p className="text-gray-500">Tidak ada produk dengan stok rendah.</p>
             </div>
          ) : (
             <div className="space-y-3">
               {lowStockProducts.map((produk) => (
                 <div key={produk.id} className="bg-white p-3 rounded-xl shadow flex items-center space-x-3">
                   {/* Image container */}
                   <div className="flex-shrink-0 p-1"> {/* Optional padding around image */}
                      <div className="overflow-hidden rounded-lg w-12 h-12"> {/* Control size and rounding */}
                       <Image
                         src={produk.imageUrl ? `${config.apiUrl}${produk.imageUrl.slice(4)}` : `/images/placeholder.svg`}
                         alt={produk.name}
                         width={50} // Matched to container size
                         height={50} // Matched to container size
                         className="object-cover w-full h-full" // Ensure image fills container
                       />
                     </div>
                   </div>
                   {/* Product Info */}
                   <div className="flex-grow min-w-0"> {/* Allow text to truncate */}
                     <h3 className="text-sm font-medium text-gray-800 truncate">{produk.name}</h3>
                     <div className="flex items-center mt-1 space-x-1.5"> {/* Added space between tags */}
                       {/* "Rendah" Tag */}
                       <div className="flex items-center px-1.5 py-0.5 bg-red-50 text-red-500 rounded-md border border-red-100">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                         </svg>
                         <span className="text-xs">Rendah</span>
                       </div>
                       {/* Stock Quantity Tag */}
                       <div className="bg-gray-50 text-gray-600 text-xs py-0.5 px-1.5 rounded-md border border-gray-200">
                         {produk.stock} item
                       </div>
                     </div>
                   </div>
                   {/* Button */}
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