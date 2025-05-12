// src/app/(withNavbar)/bank-perkreditan/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, ChevronDown } from "lucide-react";

// Dummy data for shops
const dummyShops = [
  { id: 1, name: "Rifda Shop" },
  { id: 2, name: "Yhoga Shop" },
  { id: 3, name: "Nadhira Shop" },
  { id: 4, name: "Nani Shop" },
  { id: 5, name: "Christo Shop" },
  { id: 6, name: "Hilmy Shop" },
  { id: 7, name: "Nadhira Shop" }, // Duplicate name is intentional as shown in image
  { id: 8, name: "Salma Shop" },
  { id: 9, name: "Rifda Shop" },   // Duplicate name is intentional as shown in image
  { id: 10, name: "Yhoga Shop" },  // Duplicate name is intentional as shown in image
  { id: 11, name: "Nadhira Shop" }, // Duplicate name is intentional as shown in image
  { id: 12, name: "Nani Shop" },   // Duplicate name is intentional as shown in image
  { id: 13, name: "Christo Shop" }, // Duplicate name is intentional as shown in image
  { id: 14, name: "Hilmy Shop" },  // Duplicate name is intentional as shown in image
];

export default function BankPerkreditanPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [filteredShops, setFilteredShops] = useState(dummyShops);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Filter shops based on search query
    const filtered = dummyShops.filter((shop) =>
      shop.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredShops(filtered);
  };

  const handleViewReport = (shopId: number) => {
    // Just log for now since this is a dummy page
    console.log(`View report for shop ${shopId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="px-4 py-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-medium">9:41</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-black rounded-full"></div>
                <div className="w-1 h-3 bg-black rounded-full"></div>
                <div className="w-1 h-3 bg-black rounded-full"></div>
                <div className="w-1 h-3 bg-black rounded-full"></div>
              </div>
              <div className="h-4 w-5 bg-black rounded-sm"></div>
            </div>
          </div>

          {/* Title Section */}
          <div className="space-y-2 mb-6">
            <h1 className="text-lg font-normal">Halo!</h1>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Bank Perkreditan Rakyat</h2>
              <button className="flex items-center gap-1 px-4 py-1 border border-gray-300 rounded-full">
                <span>2025</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari UMKM..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredShops.map((shop) => (
            <div
              key={`${shop.id}-${shop.name}`} // Using combination to handle duplicates
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <h3 className="font-medium text-gray-800 mb-3 text-center">
                {shop.name}
              </h3>
              <button
                onClick={() => handleViewReport(shop.id)}
                className="w-full bg-blue-600 text-white py-3 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Lihat Laporan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}