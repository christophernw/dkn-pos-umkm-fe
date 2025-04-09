// src/app/semuaBarang/page.tsx (or appropriate route)
"use client"; // Needed for placeholder data using useState, or future client interactions

import React from 'react';
import Image from 'next/image';
import HeaderProduk from '@/src/components/HeaderProduk';

// --- Placeholder Data (Replace with actual data fetching) ---
const produkLakuBulan = [
  { id: 1, name: 'Kue Cucur Bahagia', sold: 200, color: 'bg-green-500' },
  { id: 2, name: 'Donat Senyum', sold: 170, color: 'bg-blue-500' },
  { id: 3, name: 'Kue Apem', sold: 95, color: 'bg-purple-500' },
];
const maxSold = Math.max(...produkLakuBulan.map(p => p.sold), 0); // For progress bar width

const produkPalingLaku = [
  { id: 1, name: 'Donat Senyum', stock: 175, imageUrl: '/placeholder-donut.jpg' }, // Replace with actual image path
  { id: 2, name: 'Kue Cucur Bahagia', stock: 98, imageUrl: '/placeholder-pancake.jpg' }, // Replace with actual image path
  { id: 3, name: 'Kue Apem', stock: 52, imageUrl: '/placeholder-muffin.jpg' }, // Replace with actual image path
];

const produkStokRendah = [
 { id: 1, name: 'Roti Gandum', stock: 10, imageUrl: '/placeholder-bread1.jpg' }, // Replace with actual image path
 { id: 2, name: 'Roti Kentang', stock: 10, imageUrl: '/placeholder-bread2.jpg' }, // Replace with actual image path
];
// --- End Placeholder Data ---


// --- Helper Component for Progress Bar ---
const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
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
  // In a real app, you'd fetch data here using useEffect or Next.js data fetching methods
  // const [data, setData] = useState(null);
  // useEffect(() => { /* fetch data */ }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-20"> {/* Added padding-bottom */}
      <HeaderProduk />

      <main className="container mx-auto px-4 space-y-6">

        {/* Section: Produk Paling Laku Bulan */}
        <section className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
             <h2 className="text-base font-semibold text-gray-800">Produk Paling Laku Bulan</h2>
             {/* Date Filters - Basic structure */}
             <div className="flex items-center space-x-2">
                <button className="flex items-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded">
                  February
                  {/* Placeholder for dropdown icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                 <button className="flex items-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded">
                  2025
                   {/* Placeholder for dropdown icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
             </div>
          </div>

          <div className="space-y-3">
            {produkLakuBulan.map((produk, index) => (
              <div key={produk.id} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">{index + 1}.</span>
                <div className="flex-grow">
                   <p className="text-sm font-medium text-gray-800 mb-1">{produk.name}</p>
                   <ProgressBar value={produk.sold} max={maxSold} color={produk.color} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Produk Paling Laku (Cards) */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3 px-1">Produk Paling Laku</h2>
          <div className="grid grid-cols-2 gap-4">
            {produkPalingLaku.map((produk) => (
              <div key={produk.id} className="bg-white rounded-lg shadow overflow-hidden">
                 <div className="relative w-full h-28"> {/* Fixed height for image container */}
                     <Image
                        // Use a real placeholder service or local image
                        src={`https://placehold.co/300x200/EEE/31343C?text=${encodeURIComponent(produk.name)}`}
                        alt={produk.name}
                        fill // Use fill layout
                        style={{ objectFit: 'cover' }} // Use style prop for objectFit with fill
                        sizes="(max-width: 768px) 50vw, 200px" // Example sizes
                     />
                 </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-800 truncate mb-1">{produk.name}</h3>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>Stok</span>
                    <span className="font-medium text-gray-700">{produk.stock}</span>
                  </div>
                  <button className="w-full bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    Perbarui Stok
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Produk Stok Rendah */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3 px-1">Produk Stok Rendah</h2>
          <div className="space-y-3">
            {produkStokRendah.map((produk) => (
              <div key={produk.id} className="bg-white p-3 rounded-lg shadow flex items-center space-x-3">
                <div className="flex-shrink-0">
                     <Image
                        // Use a real placeholder service or local image
                        src={`https://placehold.co/100x100/EEE/31343C?text=${encodeURIComponent(produk.name)}`}
                        alt={produk.name}
                        width={50} // Smaller image
                        height={50}
                        className="rounded object-cover"
                    />
                </div>
                <div className="flex-grow min-w-0"> {/* Added min-w-0 for flex truncation */}
                  <h3 className="text-sm font-medium text-gray-800 truncate">{produk.name}</h3>
                  <p className="text-xs text-red-600">Stok Rendah: {produk.stock}</p>
                </div>
                <div className="flex-shrink-0">
                  <button className="bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 whitespace-nowrap">
                    Perbarui Stok
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

        {/* Optional: Placeholder for Bottom Navigation if needed within this layout */}
        {/* <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2"> */}
        {/* <nav className="flex justify-around"> */}
        {/* Add nav items here */}
        {/* </nav> */}
        {/* </footer> */}

    </div>
  );
};

export default SemuaBarangPage;