// src/app/pemasukan/baru/page.tsx (Corrected)
"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProductSelectorModal from "@/src/components/ProductSelectorModal";
import config from "@/src/config";
import { CoinIcon } from '@/public/icons/CoinIcon';

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

interface SelectedProductItem {
    product: ProductCardProps;
    quantity: number;
}

function formatHarga(num: number): string {
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function PemasukanBaruPage() {
    const router = useRouter();
    const { accessToken } = useAuth();
    const [selectedProducts, setSelectedProducts] = useState<SelectedProductItem[]>([]);
    const [status, setStatus] = useState<'Lunas' | 'Belum Lunas'>('Lunas');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

     const totalPemasukan = useMemo(() => {
        return selectedProducts.reduce((sum, item) => {
            return sum + item.product.harga_jual * item.quantity;
        }, 0);
    }, [selectedProducts]);

    const totalModal = useMemo(() => {
        return selectedProducts.reduce((sum, item) => {
            return sum + (item.product.harga_modal || 0) * item.quantity;
        }, 0);
    }, [selectedProducts]);

    const keuntungan = useMemo(() => {
        return totalPemasukan - totalModal;
    }, [totalPemasukan, totalModal]);

     const handleQuantityChange = (productId: number, change: number) => {
        setSelectedProducts(currentItems => {
            const updatedItems = currentItems.map(item => {
                if (item.product.id === productId) {
                     const productStock = item.product.stok;
                     const currentQuantity = item.quantity;
                     let newQuantity = currentQuantity + change;

                     if (newQuantity < 1) {
                         newQuantity = 1;
                     } else if (change > 0 && newQuantity > productStock) {
                         newQuantity = productStock;
                     }

                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
            return updatedItems;
        });
    };

    const handleRemoveItem = (productId: number) => {
        setSelectedProducts(currentItems =>
            currentItems.filter(item => item.product.id !== productId)
        );
    };

    const handleStatusChange = (newStatus: 'Lunas' | 'Belum Lunas') => {
        setStatus(newStatus);
    };

    const handleOpenProductSelector = () => {
        setIsProductSelectorOpen(true);
    };

    const handleCloseProductSelector = () => {
        setIsProductSelectorOpen(false);
    };

    const handleProductSelect = (productToAdd: ProductCardProps) => {
        const existingItem = selectedProducts.find(item => item.product.id === productToAdd.id);

        if (existingItem) {
            handleQuantityChange(productToAdd.id, 1);
        } else {
             if(productToAdd.stok > 0) {
                setSelectedProducts(prevItems => [...prevItems, { product: productToAdd, quantity: 1 }]);
             } else {
                 console.warn(`${productToAdd.nama} is out of stock.`);
                 alert(`${productToAdd.nama} sedang habis stok.`);
             }
        }
    };

    const handleSave = async () => {
        if (selectedProducts.length === 0) {
            setError("Tambahkan setidaknya satu barang.");
            return;
        }
        if (!accessToken) {
            setError("Autentikasi diperlukan.");
            return;
        }
        
        if (!config?.apiUrl) {
            setError("Konfigurasi API tidak ditemukan.");
            console.error("config or config.apiUrl is missing!");
            return;
        }

        setIsLoading(true);
        setError(null);

        const transactionData = {
            type: 'Penjualan Barang',
            items: selectedProducts.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                harga_jual_saat_transaksi: item.product.harga_jual,
                harga_modal_saat_transaksi: item.product.harga_modal,
            })),
            total_pemasukan: totalPemasukan,
            total_modal: totalModal,
            keuntungan: keuntungan,
            status: status,
        };

        try {
            const response = await fetch(`${config.apiUrl}/transaksi/pemasukan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(transactionData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Gagal menyimpan transaksi.' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            alert('Transaksi berhasil disimpan!');
            router.push('/dashboard');

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Terjadi kesalahan saat menyimpan.");
            } else {
                setError("Terjadi kesalahan yang tidak diketahui.");
            }
        } finally {
            setIsLoading(false);
        }
    };


    // --- Render ---
    return (
         <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="flex items-center mb-4">
                <button onClick={() => router.back()} className="mr-4 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h1 className="text-xl font-semibold text-center flex-grow">Pemasukan Baru</h1>
                 <div className="w-6"></div> {/* Spacer */}
            </div>

            {/* Tabs */}
            <div className="flex mb-4 bg-white rounded-full p-1 shadow-sm">
                <button className="flex-1 bg-green-100 text-green-700 rounded-full py-2 px-4 text-sm font-medium text-center flex items-center justify-center">
                    <div className="bg-primary-blue p-1.5 rounded-full mr-2">
                        <CoinIcon />
                    </div>
                    Pemasukan
                </button>
                <button className="flex-1 text-gray-500 py-2 px-4 text-sm font-medium text-center hover:bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="bg-gray-200 p-1.5 rounded-full mr-2">
                        <CoinIcon />
                    </div>
                    Pengeluaran
                </button>
            </div>

            {/* Type Selector */}
            <div className="mb-6 bg-white p-3 rounded-lg shadow-sm">
                <label htmlFor="incomeType" className="block text-sm font-medium text-gray-700 mb-1">Jenis Pemasukan</label>
                <select
                    id="incomeType"
                    name="incomeType"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 bg-gray-100"
                    defaultValue="Penjualan Barang"
                >
                    <option>Penjualan Barang</option>
                </select>
            </div>

             {/* Barang Section Header */}
             <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Barang</h2>
                <button
                    onClick={handleOpenProductSelector}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 flex items-center"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tambah Barang
                </button>
            </div>

             {/* Selected Barang List */}
             <div className="space-y-3 mb-6">
                 {selectedProducts.length === 0 ? (
                     <p className="text-center text-gray-500 py-4 bg-white rounded-lg shadow-sm">Belum ada barang ditambahkan.</p>
                 ) : (
                    selectedProducts.map(item => (
                        <div key={item.product.id} className="bg-white rounded-xl flex items-center p-3 shadow-sm relative">
                             {/* Remove Button */}
                             <button
                                onClick={() => handleRemoveItem(item.product.id)}
                                className="absolute top-1 right-1 text-red-400 hover:text-red-600 p-1 z-10"
                                aria-label="Hapus item"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                            {/* Image */}
                             <div className="w-16 h-16 relative rounded-lg overflow-hidden mr-3 flex-shrink-0 bg-gray-100">
                                {config?.apiUrl && item.product.foto ? ( // Check config.apiUrl exists before using
                                    <Image
                                        src={`${config.apiUrl}${item.product.foto.slice(4)}`}
                                        alt={item.product.nama}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                        onError={(e) => e.currentTarget.src = '/images/placeholder.svg'} // Fallback image
                                    />
                                ) : (
                                     <Image
                                        src={'/images/placeholder.svg'} // Fallback if no image or no apiUrl
                                        alt={item.product.nama}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                )}
                            </div>
                            {/* Details */}
                            <div className="flex-1 mr-2">
                                <h3 className="font-semibold text-sm">{item.product.nama}</h3>
                                <p className="font-medium text-sm text-blue-700 mt-1">
                                    Rp {formatHarga(item.product.harga_jual)}
                                </p>
                            </div>
                            {/* Quantity Control */}
                             <div className="flex items-center">
                                <button
                                    onClick={() => handleQuantityChange(item.product.id, -1)}
                                    className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center hover:bg-blue-200 disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(item.product.id, 1)}
                                    className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center hover:bg-blue-200 disabled:opacity-50"
                                    disabled={item.quantity >= item.product.stok}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))
                 )}
            </div>

             {/* Summary Section */}
              <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Pemasukan</span>
                    <span className="font-semibold">Rp{formatHarga(totalPemasukan)}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Modal</span>
                    <span className="text-gray-500">Rp{formatHarga(totalModal)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <div className="flex bg-gray-100 rounded-full p-0.5">
                        <button
                            onClick={() => handleStatusChange('Lunas')}
                            className={`px-4 py-1 rounded-full text-sm ${status === 'Lunas' ? 'bg-green-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            Lunas
                        </button>
                        <button
                            onClick={() => handleStatusChange('Belum Lunas')}
                            className={`px-4 py-1 rounded-full text-sm ${status === 'Belum Lunas' ? 'bg-yellow-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            Belum Lunas
                        </button>
                    </div>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold">Keuntungan</span>
                    <span className="font-bold text-lg text-green-600">Rp{formatHarga(keuntungan)}</span>
                </div>
            </div>


            {/* Error Message */}
             {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Save Button */}
             <button
                onClick={handleSave}
                disabled={isLoading || selectedProducts.length === 0}
                className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-[calc(theme(maxWidth.md)-2rem)] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center z-20"
            >
                {isLoading ? (
                     <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                    </>
                 ) : (
                    'Simpan'
                 )}
            </button>


            {/* --- Product Selector Modal --- */}
            <ProductSelectorModal
                isOpen={isProductSelectorOpen}
                onClose={handleCloseProductSelector}
                onProductSelect={handleProductSelect}
            />
        </div>
    );
}