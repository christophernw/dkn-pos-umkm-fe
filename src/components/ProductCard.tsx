"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

interface ProductCardProps {
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
  items: ProductCardProps[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export default function ProductCard() {
  const [data, setData] = useState<ProductCardProps[]>([])
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8080/api/produk/page/${currentPage}`);
        const result: PaginatedResponse = await response.json();
        setData(result.items);
        setTotalPages(result.total_pages);
      } catch (error) {
        console.error("Error Fetching Data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          className={`min-w-9 rounded-md ${
            currentPage === i
              ? "bg-blue-700 text-white border border-transparent"
              : "border border-slate-300 hover:text-white hover:bg-blue-700 hover:border-blue-700"
          } py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg ml-2`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <>
      <div className={`max-w-md mx-auto space-y-4 ${data.length === 0 && !isLoading ? "flex justify-center items-center h-60" : ""}`}>
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <p>Loading...</p>
          </div>
        ) : data.length > 0 ? (
          data.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl flex overflow-hidden p-3 shadow-sm">
              <div className="w-28 h-28 relative rounded-2xl overflow-hidden mr-3">
                <Image 
                  src={product.foto || "/placeholder.jpg"} 
                  alt={product.nama} 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">{product.nama}</h3>
                <p className="text-gray-500 text-sm mt-2">Harga Jual</p>
                <p className="font-medium text-sm text-blue-700 mt-1">Rp {product.harga_jual} / {product.satuan}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded-lg">Stok : {product.stok}</span>
                  <button className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    Perbarui Stok
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-lg">Tidak ada produk tersedia</p>
        )}
      </div>

      {totalPages > 1 && (
        <section className="my-5">
          <div className="flex space-x-1 justify-center">
            <button
              className="rounded-md border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-blue-700 hover:border-blue-700 ml-2"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            
            {renderPaginationButtons()}
            
            <button
              className="rounded-md border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-blue-700 hover:border-blue-700 ml-2"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </section>
      )}
    </>
  );
}