"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";

const HeaderProduk = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isSemuaBarangPage = pathname === "/semuaBarang";

  useEffect(() => {
    const currentSearchTerm = searchParams.get("q") || "";
    setSearchTerm(currentSearchTerm);
  }, [searchParams]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSort = (order: "-stok" | "stok" | "-id") => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', order);

    router.push(`${pathname}?${params.toString()}`);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams);

    if (searchTerm.trim()) { // Use trim() to avoid empty searches
      params.set('q', searchTerm.trim());
    } else {
      params.delete('q');
    }

    // Reset dropdown state on new search/clear
    setIsDropdownOpen(false);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Close dropdown if clicking outside (optional but good UX)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the dropdown toggle button and the dropdown itself
      // You might need to add refs to the button and dropdown div for more precise detection
      if (isDropdownOpen) {
         // Basic check, improve with refs if needed
         const targetElement = event.target as Element;
         if (!targetElement.closest('.relative')) { // Assuming dropdown button is inside the 'relative' div
            setIsDropdownOpen(false);
         }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);


  return (
    // --- MODIFICATIONS START ---
    <div className="fixed top-0 left-0 w-full bg-white z-50 shadow-md py-3">
    {/* Removed mt-8 mb-5, Added fixed, top-0, left-0, w-full, z-50, shadow-md, py-3 */}
    {/* --- MODIFICATIONS END --- */}
      <header className="flex flex-row justify-center"> {/* Removed my-5 */}
        <div className="container mx-auto flex items-center justify-between px-4"> {/* Added px-4 for padding */}
          <Link href="/" aria-label="back">
            <button
              type="button"
              className="bg-white hover:bg-gray-200 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 border border-gray-200" // Added border for visibility
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
          {/* Links - consider adjusting spacing if needed */}
          <div className="flex items-center space-x-4 sm:space-x-6">
              <Link
                href="/informasi"
                className={`${pathname === "/informasi" ? "font-bold text-blue-600" : "font-medium text-gray-700"} hover:text-blue-600 transition-colors`}
              >
                Informasi
              </Link>
              <Link
                href="/semuaBarang"
                className={`${pathname === "/semuaBarang" ? "font-bold text-blue-600" : "font-medium text-gray-700"} hover:text-blue-600 transition-colors`}
              >
                Semua Barang
              </Link>
          </div>
          <div className="relative">
             {/* This three-dots button seems unused, consider removing or implementing */}
            <button
              type="button"
              className="bg-white hover:bg-gray-200 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border border-gray-200" // Added border
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
          </div>
        </div>
      </header>

      {/* Only show search form on semuaBarang page */}
      {isSemuaBarangPage && (
        // Added mt-4 for spacing between header links and search bar
        <form onSubmit={handleSearch} className="flex items-center max-w-md mx-auto mt-4 px-4">
          {/* --- MODIFICATION: Added relative positioning to the form input container --- */}
          <div className="relative flex w-full items-center bg-white rounded-full shadow-sm border border-gray-300">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500" // Adjusted color
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor" // Use currentColor
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
              // Adjusted styling for consistency
              className="bg-transparent border-none text-black rounded-full block w-full py-2.5 pl-10 pr-14 focus:ring-0 focus:outline-none text-sm"
              placeholder="Cari Produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required={false} // Explicitly false if not required
            />
            {/* --- Dropdown Trigger Button --- */}
            {/* Added relative positioning reference for dropdown */}
            <div className="absolute right-1.5 inset-y-0 flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center w-9 h-9 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={toggleDropdown}
                aria-haspopup="true" // Accessibility
                aria-expanded={isDropdownOpen} // Accessibility
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
                <span className="sr-only">Sort options</span>
              </button>
            </div>

            {/* --- Dropdown Menu --- */}
            {/* Adjusted position, use top-full for direct attachment below */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                 {/* Added z-index just in case */}
                 <ul className="py-1"> {/* Use list for semantic correctness */}
                    <li>
                        <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => handleSort("-id")}
                        role="menuitem"
                        >
                        Tanggal Terbaru
                        </button>
                    </li>
                    <li>
                        <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => handleSort("stok")}
                        role="menuitem"
                        >
                        Stok Terendah
                        </button>
                    </li>
                    <li>
                        <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => handleSort("-stok")}
                        role="menuitem"
                        >
                        Stok Tertinggi
                        </button>
                    </li>
                 </ul>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default HeaderProduk;