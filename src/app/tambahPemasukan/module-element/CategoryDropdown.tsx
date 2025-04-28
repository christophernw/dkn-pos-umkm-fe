"use client"
import React, { useState } from 'react';
import { CoinIcon } from '@/public/icons/CoinIcon';

interface CategoryDropdownProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryDropdown = ({ selectedCategory, onCategoryChange }: CategoryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    'Penjualan Barang'
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (category: string) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div 
        className="bg-white p-3 rounded-full flex flex-col gap-3 w-full cursor-pointer"
        onClick={toggleDropdown}
      >
        <div className="flex items-center gap-2">
          <div className="bg-primary-blue p-3 rounded-full">
            <CoinIcon />
          </div>
          <p>{selectedCategory}</p>
          <div className="ml-auto">
            <svg 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200">
          {categories.map((category) => (
            <div
              key={category}
              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                selectedCategory === category ? 'bg-primary-blue/10' : ''
              }`}
              onClick={() => handleSelect(category)}
            >
              {category}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;