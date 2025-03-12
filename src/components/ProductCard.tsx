"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import config from "../config";

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
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProductCardProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const sortParam = searchParams.get("sort");
  const { accessToken } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductCardProps | null>(null);
  const [newStockValue, setNewStockValue] = useState(0);
  
  const handleEdit = (id: number) => {
    window.location.href = `/editProduk/${id}`
  }

  useEffect(() => {
    async function fetchData() {
      if (!accessToken) return;
      try {
        setIsLoading(true);

        const queryParam = searchParams.get("q") || "";
        let url = `${config.apiUrl}/produk/page/${currentPage}`;
        const params = new URLSearchParams();

        if (sortParam) {
          params.append("sort", sortParam);
        }

        if (queryParam) {
          params.append("q", queryParam);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        
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
  }, [currentPage, sortParam, accessToken, searchParams]); // Add searchParams to the dependency array

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

  async function handleDelete(id: number) {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!isConfirmed) return;
    try {
      const response = await fetch(`${config.apiUrl}/produk/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        method: "DELETE",
      });

      if (response.ok) {
        setData((prevData) => prevData.filter((product) => product.id !== id));
      } else {
        console.error("Failed deleting produk");
      }
    } catch (error) {
      console.error("Error deleting produk:", error);
    }
  }

  // Open stock update modal
  const handleOpenStockModal = (product: ProductCardProps) => {
    setSelectedProduct(product);
    setNewStockValue(product.stok);
    setIsModalOpen(true);
  };

  // Close stock update modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Handle stock update
  const handleUpdateStock = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(
        `${config.apiUrl}/produk/update/${selectedProduct.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ stok: newStockValue }),
        }
      );

      if (response.ok) {
        // Update local data
        setData((prevData) =>
          prevData.map((product) =>
            product.id === selectedProduct.id
              ? { ...product, stok: newStockValue }
              : product
          )
        );
        handleCloseModal();
      } else {
        console.error("Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-60">
          <p>Loading...</p>
        </div>
      );
    }

    if (data.length === 0) {
      return <p className="text-center">No data available</p>;
    }

    return data.map((product) => (
      <div
        key={product.id}
        className="bg-white rounded-3xl flex overflow-hidden p-3 shadow-sm"
      >
        <div className="w-28 h-28 relative rounded-2xl overflow-hidden mr-3">
          <Image
            src={
              product.foto
                ? `${config.apiUrl}${product.foto}`
                : "/images/placeholder.svg"
            }
            alt={product.nama}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-base">{product.nama}</h3>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDelete(product.id)}
              aria-label="Delete product"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-trash-2"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-2">Harga Jual</p>
          <p className="font-medium text-sm text-blue-700 mt-1">
            Rp {product.harga_jual} / {product.satuan}
          </p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded-lg">
              Stok : {product.stok}
            </span>
            <button
              className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              onClick={() => handleOpenStockModal(product)}
            >
              Perbarui Stok
            </button>
            <button 
                className="text-xs h-8 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                onClick={() => handleEdit(product.id)}
              >
                Edit Produk
            </button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      <div
        className={`max-w-md mx-auto space-y-4 ${
          data.length === 0 && !isLoading
            ? "flex justify-center items-center h-60"
            : ""
        }`}
      >
        {renderContent()}
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
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </section>
      )}

      {/* Stock Update Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-medium text-center mb-4">
              Edit Jumlah Stok
            </h3>

            <div className="flex items-center justify-between my-4">
              <button
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-xl font-bold flex items-center justify-center"
                onClick={() =>
                  setNewStockValue((prev) => Math.max(0, prev - 1))
                }
              >
                -
              </button>

              <div className="text-2xl font-bold text-gray-800">
                {newStockValue}
              </div>

              <button
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-xl font-bold flex items-center justify-center"
                onClick={() => setNewStockValue((prev) => prev + 1)}
              >
                +
              </button>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                onClick={handleCloseModal}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={handleUpdateStock}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
