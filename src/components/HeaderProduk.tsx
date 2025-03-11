"use client"

// src/components/HeaderProduk.tsx
import React, { useState } from 'react';

interface HeaderProdukProps {
  onSearch: (query: string) => void;
  onSort: (sortOrder: string) => void;
}

const HeaderProduk: React.FC<HeaderProdukProps> = ({ onSearch, onSort }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-white p-4 shadow-md">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Semua Barang</h1>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-2/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                className="w-full p-2 border rounded-md pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute left-2 top-1/2 transform -translate-y-1/2"
              >
                🔍
              </button>
            </div>
          </form>
          
          <div className="w-full md:w-1/3 flex justify-end">
            <select 
              onChange={(e) => onSort(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="">Sort By</option>
              <option value="asc">Stock (Low to High)</option>
              <option value="desc">Stock (High to Low)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderProduk;