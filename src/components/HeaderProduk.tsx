"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const HeaderProduk = () => {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSort = (order: "asc" | "desc") => {
    console.log(`Sorting dengan order: ${order}`);
    setIsDropdownOpen(false); 
  };

  return (
    <div className="mt-8 mb-5">
      <header className="flex flex-row justify-center my-5">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" aria-label="back">
            <button
              type="button"
              className="bg-white hover:bg-gray-200 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2"
            >
              <svg
                className="w-4 h-4 transform scale-x-[-1]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </button>
          </Link>
          <Link
            href="/daftarProduk"
            className={pathname === "/daftarProduk" ? "font-bold" : "font-medium"}
          >
            Informasi Stok
          </Link>
          <Link
            href="/semuaBarang"
            className={pathname === "/semuaBarang" ? "font-bold" : "font-medium"}
          >
            Semua Barang
          </Link>
          <div className="relative">
            <button
              type="button"
              className="bg-white hover:bg-gray-200 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center"
              onClick={toggleDropdown}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-three-dots"
                viewBox="0 0 16 16"
              >
                <path d="M3 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m4.5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m4.5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleSort("asc")}
                >
                  Stok Terendah
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleSort("desc")}
                >
                  Stok Tertinggi
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex items-center max-w-md mx-auto">
        <div className="relative flex w-full items-center bg-white rounded-full shadow-sm">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="#0D0D12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
            <span className="sr-only">Search</span>
          </div>
          <input
            type="search"
            name="search"
            id="simple-search"
            className="bg-white border border-[#EFF2F6] text-black rounded-full w-full py-3 pl-12 pr-14 focus:ring-1 focus:outline-none focus:ring-blue-600"
            placeholder="Cari Produk..."
            required
          />
          <button
            type="button"
            className="absolute right-1.5 inline-flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none"
            onClick={toggleDropdown}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderProduk;
