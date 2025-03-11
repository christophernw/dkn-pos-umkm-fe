'use client'

import HeaderProduk from "@/src/components/HeaderProduk";
import ProductCard from "@/src/components/ProductCard";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Define interfaces based on your backend schema
interface Product {
  id: number;
  nama: string;
  foto: string;
  harga_modal: number;
  harga_jual: number;
  stok: number;
  satuan: string;
  kategori: string;
}

interface PaginatedResponse {
  items: Product[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

const SemuaBarang = () => {
  const { user, accessToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  // Function to fetch products with pagination
  const fetchProducts = async (page: number) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (sortOrder) queryParams.append('sort', sortOrder);
      
      const url = searchQuery 
        ? `http://localhost:8000/api/produk/search?q=${encodeURIComponent(searchQuery)}` 
        : `http://localhost:8000/api/produk/page/${page}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (searchQuery) {
        setProducts(data);
        setTotalPages(1); // Search results don't have pagination in this API
      } else {
        setProducts(data.items);
        setCurrentPage(data.page);
        setTotalPages(data.total_pages);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, sortOrder, searchQuery]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (order: "asc" | "desc") => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  return (
    <div className="relative min-h-screen">
      <HeaderProduk 
        onSearch={handleSearch} 
        onSort={(order) => handleSort(order as "asc" | "desc")} 
      />
      
      {/* Display username */}
      {user && (
        <div className="bg-blue-100 p-4 m-4 rounded-md">
          <p className="text-blue-800 font-medium">Welcome, {user.name}!</p>
        </div>
      )}
      
      {/* Loading and error states */}
      {loading && <div className="text-center py-4">Loading products...</div>}
      {error && <div className="text-center py-4 text-red-500">{error}</div>}
      
      {/* Product cards */}
      <main>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onDelete={() => {
                  // Handle delete
                  if (confirm(`Are you sure you want to delete ${product.nama}?`)) {
                    fetch(`http://localhost:8000/api/produk/delete/${product.id}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${accessToken}`,
                      }
                    })
                    .then(response => {
                      if (response.ok) {
                        // Refresh products after deletion
                        fetchProducts(currentPage);
                      } else {
                        throw new Error('Failed to delete product');
                      }
                    })
                    .catch(err => {
                      console.error("Error deleting product:", err);
                      setError("Failed to delete product");
                    });
                  }
                }} 
              />
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-8">No products found</div>
        )}
      </main>
      
      {/* Pagination */}
      <section className="my-5">
        <div className="flex space-x-1 justify-center">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-md border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-blue-700 hover:border-blue-700 focus:text-white focus:bg-blue-700 focus:border-blue-700 active:border-blue-600 active:text-white active:bg-blue-600 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2"
          >
            Prev
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`min-w-9 rounded-md ${
                currentPage === i + 1
                  ? "bg-blue-700 text-white"
                  : "border border-slate-300"
              } py-2 px-3 border text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-blue-700 hover:border-blue-700 focus:text-white focus:bg-blue-700 focus:border-blue-700 active:border-blue-600 active:text-white active:bg-blue-600 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-md border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-blue-700 hover:border-blue-700 focus:text-white focus:bg-blue-700 focus:border-blue-700 active:border-blue-600 active:text-white active:bg-blue-600 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2"
          >
            Next
          </button>
        </div>
      </section>
      
      {/* Add new product button */}
      <div className="fixed bottom-4 right-4 flex justify-end px-4">
        <button 
          onClick={() => {
            // Navigate to create product page
            window.location.href = '/produk/create';
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-4xl just flex items-center justify-center h-14 w-14 font-medium rounded-full shadow-md"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default SemuaBarang;