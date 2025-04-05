"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
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

function formatHarga(num: number): string {
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

interface ProductSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductSelect: (product: ProductCardProps) => void;
}

export default function ProductSelectorModal({ isOpen, onClose, onProductSelect }: ProductSelectorModalProps) {
    const [data, setData] = useState<ProductCardProps[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { accessToken } = useAuth();

    const fetchData = useCallback(async (page = 1, query = "") => {
        if (!accessToken || !isOpen) return;
        setIsLoading(true);
        try {
            let url = `${config.apiUrl}/produk/page/${page}`;
            const params = new URLSearchParams();

            if (query) {
                params.append("q", query);
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

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const result: PaginatedResponse = await response.json();
            setData(result.items);
            setTotalPages(result.total_pages);
            setCurrentPage(result.page);

        } catch (error) {
            console.error("Error Fetching Products for Modal:", error);
            setData([]);
            setTotalPages(1);
            setCurrentPage(1);
        } finally {
            setIsLoading(false);
        }
    }, [accessToken, isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchData(currentPage, searchQuery);
        } else {
             setData([]);
             setCurrentPage(1);
             setTotalPages(1);
             setSearchQuery("");
        }
    }, [isOpen, currentPage, searchQuery, fetchData]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

     const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1);
    };

    const renderPaginationButtons = () => {
        const buttons = [];
         const maxButtonsToShow = 5;
         let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
         const endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

         if (endPage - startPage + 1 < maxButtonsToShow) {
            startPage = Math.max(1, endPage - maxButtonsToShow + 1);
        }


        if (startPage > 1) {
            buttons.push(
                <button
                    key="1"
                    className="min-w-9 rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 ml-1"
                    onClick={() => handlePageChange(1)}
                >
                    1
                </button>
            );
            if (startPage > 2) {
                 buttons.push(<span key="start-ellipsis" className="px-1">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    className={`min-w-9 rounded-md ${
                        currentPage === i
                            ? "bg-blue-600 text-white border border-blue-600"
                            : "border border-slate-300 hover:bg-blue-100"
                    } py-1 px-2 text-xs ml-1`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

         if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                 buttons.push(<span key="end-ellipsis" className="px-1">...</span>);
            }
            buttons.push(
                <button
                    key={totalPages}
                    className="min-w-9 rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 ml-1"
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        return buttons;
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-xl p-5 w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl transform transition-all duration-300 scale-100 opacity-100">
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <h3 className="text-lg font-semibold">Pilih Barang</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Cari nama barang..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex-grow overflow-y-auto space-y-3 pr-1">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <p>Loading...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Barang tidak ditemukan.</p>
                    ) : (
                        data.map((product) => (
                            <div
                                key={product.id}
                                className="bg-gray-50 rounded-lg flex items-center overflow-hidden p-3 shadow-sm border border-transparent hover:border-blue-300"
                            >
                                <div className="w-14 h-14 relative rounded-md overflow-hidden mr-3 flex-shrink-0">
                                    <Image
                                        src={product.foto ? `${config.apiUrl}${product.foto.slice(4)}` : "/images/placeholder.svg"}
                                        alt={product.nama}
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                    />
                                </div>
                                <div className="flex-1 mr-2">
                                    <h4 className="font-medium text-sm">{product.nama}</h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Rp {formatHarga(product.harga_jual)} / {product.satuan}
                                    </p>
                                     <p className="text-xs text-green-700">Stok: {product.stok}</p>
                                </div>
                                <button
                                    className="text-sm h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex-shrink-0 disabled:opacity-50"
                                    onClick={() => {
                                        onProductSelect(product);
                                        onClose();
                                    }}
                                    disabled={product.stok <= 0}
                                >
                                    Pilih
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {totalPages > 1 && !isLoading && (
                    <div className="mt-4 pt-3 border-t flex items-center justify-center space-x-1">
                         <button
                            className="rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 disabled:opacity-50"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </button>

                        {renderPaginationButtons()}

                         <button
                            className="rounded-md border border-slate-300 py-1 px-2 text-xs hover:bg-blue-100 disabled:opacity-50"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}