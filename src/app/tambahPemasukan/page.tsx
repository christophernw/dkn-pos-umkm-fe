"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProductSelectorModal from "@/src/components/ProductSelectorModal";
import config from "@/src/config";
import { CoinIcon } from "@/public/icons/CoinIcon";
import { StockIcon } from "@/public/icons/StockIcon";
import { BellIcon } from "@/public/icons/BellIcon";

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
  const [selectedProducts, setSelectedProducts] = useState<
    SelectedProductItem[]
  >([]);
  const [status, setStatus] = useState<"Lunas" | "Belum Lunas">("Lunas");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualTotalPemasukan, setManualTotalPemasukan] = useState<string>("");
  const [manualTotalModal, setManualTotalModal] = useState<string>("");
  const [incomeType, setIncomeType] = useState<string>("Penjualan Barang");

  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  const calculatedTotalPemasukan = useMemo(() => {
    return selectedProducts.reduce((sum, item) => {
      return sum + item.product.harga_jual * item.quantity;
    }, 0);
  }, [selectedProducts]);

  const calculatedTotalModal = useMemo(() => {
    return 0;
  }, []);

  const effectiveTotalPemasukan = manualTotalPemasukan
    ? parseInt(manualTotalPemasukan.replace(/\./g, ""), 10) || 0
    : calculatedTotalPemasukan;

  const effectiveTotalModal = manualTotalModal
    ? parseInt(manualTotalModal.replace(/\./g, ""), 10) || 0
    : calculatedTotalModal;

  const keuntungan = useMemo(() => {
    return effectiveTotalPemasukan - effectiveTotalModal;
  }, [effectiveTotalPemasukan, effectiveTotalModal]);

  const handleQuantityChange = (productId: number, change: number) => {
    setSelectedProducts((currentItems) => {
      const updatedItems = currentItems.map((item) => {
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

  const handleDirectQuantityChange = (productId: number, value: string) => {
    const numericValue = parseInt(value, 10);

    setSelectedProducts((currentItems) => {
      return currentItems.map((item) => {
        if (item.product.id === productId) {
          // Ensure quantity is between 1 and available stock
          let newQuantity = numericValue;
          if (isNaN(newQuantity) || newQuantity < 1) {
            newQuantity = 1;
          } else if (newQuantity > item.product.stok) {
            newQuantity = item.product.stok;
          }

          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const handleRemoveItem = (productId: number) => {
    setSelectedProducts((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId)
    );
  };

  const handleStatusChange = (newStatus: "Lunas" | "Belum Lunas") => {
    setStatus(newStatus);
  };

  const handleOpenProductSelector = () => {
    setIsProductSelectorOpen(true);
  };

  const handleCloseProductSelector = () => {
    setIsProductSelectorOpen(false);
  };

  const handleProductSelect = (productToAdd: ProductCardProps) => {
    const existingItem = selectedProducts.find(
      (item) => item.product.id === productToAdd.id
    );

    if (existingItem) {
      handleQuantityChange(productToAdd.id, 1);
    } else {
      if (productToAdd.stok > 0) {
        setSelectedProducts((prevItems) => [
          ...prevItems,
          { product: productToAdd, quantity: 1 },
        ]);
      } else {
        console.warn(`${productToAdd.nama} is out of stock.`);
        alert(`${productToAdd.nama} sedang habis stok.`);
      }
    }
  };

  const handleTotalPemasukanChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    const formattedValue = numericValue
      ? formatHarga(parseInt(numericValue, 10))
      : "";
    setManualTotalPemasukan(formattedValue);
  };

  const handleTotalModalChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    const formattedValue = numericValue
      ? formatHarga(parseInt(numericValue, 10))
      : "";
    setManualTotalModal(formattedValue);
  };

  const handleIncomeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIncomeType(e.target.value);
  };

  const handleSave = async () => {
    if (incomeType === "Penjualan Barang" && selectedProducts.length === 0) {
      setError("Tambahkan setidaknya satu barang.");
      return;
    }
    if (!accessToken) {
      setError("Autentikasi diperlukan.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const transactionData = {
      transaction_type: "pemasukan",
      category: incomeType,
      total_amount: effectiveTotalPemasukan,
      total_modal: incomeType === "Penjualan Barang" ? effectiveTotalModal : 0,
      amount:
        incomeType === "Penjualan Barang"
          ? keuntungan
          : effectiveTotalPemasukan,

      items:
        incomeType === "Penjualan Barang"
          ? selectedProducts.map((item) => ({
              product_id: item.product.id,
              quantity: item.quantity,
              harga_jual_saat_transaksi: item.product.harga_jual,
              harga_modal_saat_transaksi: item.product.harga_modal,
            }))
          : [],

      status: status,
    };

    try {
      const response = await fetch(`${config.apiUrl}/transaksi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Gagal menyimpan transaksi." }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      alert("Transaksi berhasil disimpan!");
      router.push("/transaksi");
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

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button onClick={() => router.back()} className="mr-4 p-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-center flex-grow">
          Pemasukan Baru
        </h1>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button className="bg-green-50 shadow-sm rounded-3xl py-3 px-4 text-sm font-medium text-center flex items-center justify-center bg-green-100 text-green-700">
          <div className="bg-primary-blue p-1.5 rounded-full mr-2">
            <CoinIcon />
          </div>
          Pemasukan
        </button>
        <button className="bg-white shadow-sm rounded-3xl py-3 px-4 text-sm font-medium text-center flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <div className="bg-gray-200 p-1.5 rounded-full mr-2">
            <StockIcon />
          </div>
          Pengeluaran
        </button>
      </div>

      {/* Type Selector */}
      <div className="relative mb-6">
        <select
          id="incomeType"
          name="incomeType"
          className="w-full bg-white shadow-sm rounded-3xl py-3 px-4 text-sm font-medium text-gray-500 appearance-none flex items-center justify-center"
          value={incomeType}
          onChange={handleIncomeTypeChange}
          style={{ paddingLeft: "56px", paddingRight: "40px" }}
        >
          <option>Penjualan Barang</option>
          <option>Penambahan Modal</option>
          <option>Pendapatan Di Luar Usaha</option>
          <option>Pendapatan Lain-Lain</option>
          <option>Pendapatan Jasa/Komisi</option>
          <option>Terima Pinjaman</option>
          <option>Penagihan Utang/Cicilan</option>
        </select>
        {/* Bell Icon (left) */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="bg-gray-200 p-1.5 rounded-full">
            <BellIcon />
          </div>
        </div>
        {/* Dropdown V indicator (right) */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>

      {/* Barang Section - Only show for Penjualan Barang */}
      {incomeType === "Penjualan Barang" && (
        <>
          {/* Barang Section Header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Barang</h2>
            <button
              onClick={handleOpenProductSelector}
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Tambah Barang
            </button>
          </div>

          {/* Selected Barang List */}
          <div className="space-y-3 mb-6">
            {selectedProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-4 bg-white rounded-lg shadow-sm">
                Belum ada barang ditambahkan.
              </p>
            ) : (
              selectedProducts.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-xl flex items-center p-3 shadow-sm relative"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="absolute top-1 right-1 text-red-400 hover:text-red-600 p-1 z-10"
                    aria-label="Hapus item"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
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
                        onError={(e) =>
                          (e.currentTarget.src = "/images/placeholder.svg")
                        } // Fallback image
                      />
                    ) : (
                      <Image
                        src={"/images/placeholder.svg"} // Fallback if no image or no apiUrl
                        alt={item.product.nama}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  {/* Details */}
                  <div className="flex-1 mr-2">
                    <h3 className="font-semibold text-sm">
                      {item.product.nama}
                    </h3>
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
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleDirectQuantityChange(
                          item.product.id,
                          e.target.value
                        )
                      }
                      className="w-12 text-center font-medium mx-1 border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                      min="1"
                      max={item.product.stok}
                    />
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
        </>
      )}

      {/* Summary Section */}
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Pemasukan</span>
          <div className="flex items-center border rounded px-2 focus-within:border-blue-500">
            <span className="text-gray-500 text-sm mr-1">Rp</span>
            <input
              type="text"
              value={
                manualTotalPemasukan || formatHarga(calculatedTotalPemasukan)
              }
              onChange={(e) => handleTotalPemasukanChange(e.target.value)}
              className="font-semibold text-right w-24 py-1 focus:outline-none"
              placeholder={formatHarga(calculatedTotalPemasukan)}
            />
          </div>
        </div>

        {incomeType === "Penjualan Barang" && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Modal Tambahan</span>
            <div className="flex items-center border rounded px-2 focus-within:border-blue-500">
              <span className="text-gray-500 text-sm mr-1">Rp</span>
              <input
                type="text"
                value={manualTotalModal || formatHarga(calculatedTotalModal)}
                onChange={(e) => handleTotalModalChange(e.target.value)}
                className="text-gray-500 text-right w-24 py-1 focus:outline-none"
                placeholder={formatHarga(calculatedTotalModal)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status</span>
          <div className="flex bg-gray-100 rounded-full p-0.5">
            <button
              onClick={() => handleStatusChange("Lunas")}
              className={`px-4 py-1 rounded-full text-sm ${
                status === "Lunas"
                  ? "bg-green-500 text-white shadow"
                  : "text-gray-600"
              }`}
            >
              Lunas
            </button>
            <button
              onClick={() => handleStatusChange("Belum Lunas")}
              className={`px-4 py-1 rounded-full text-sm ${
                status === "Belum Lunas"
                  ? "bg-yellow-500 text-white shadow"
                  : "text-gray-600"
              }`}
            >
              Belum Lunas
            </button>
          </div>
        </div>

        {incomeType === "Penjualan Barang" && (
          <>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Keuntungan</span>
              <span className="font-bold text-lg text-green-600">
                Rp{formatHarga(keuntungan)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={
          isLoading ||
          (selectedProducts.length === 0 && incomeType === "Penjualan Barang")
        }
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-[calc(theme(maxWidth.md)-2rem)] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center z-20"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Menyimpan...
          </>
        ) : (
          "Simpan"
        )}
      </button>

      {/* Product Selector Modal - Only render when needed */}
      {incomeType === "Penjualan Barang" && (
        <ProductSelectorModal
          isOpen={isProductSelectorOpen}
          onClose={handleCloseProductSelector}
          onProductSelect={handleProductSelect}
          isExpenseContext={false}
        />
      )}
    </div>
  );
}
