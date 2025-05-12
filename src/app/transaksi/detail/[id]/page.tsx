"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import config from "@/src/config";
import { CoinIcon } from "@/public/icons/CoinIcon";
import { StockIcon } from "@/public/icons/StockIcon";
import { BellIcon } from "@/public/icons/BellIcon";

interface ProductItem {
  id: number;
  product_id: number;
  quantity: number;
  harga_modal_saat_transaksi: number;
  harga_jual_saat_transaksi: number;
  product: {
    id: number;
    nama: string;
    foto: string;
    kategori: string;
    satuan: string;
  };
  product_name: string; // Added for direct access
  product_image_url: string; // Added for direct image access
}

interface Transaction {
  id: number;
  transaction_type: "pemasukan" | "pengeluaran";
  category: string;
  total_amount: number;
  total_modal: number;
  amount: number;
  items: ProductItem[];
  status: "Lunas" | "Belum Lunas";
  created_at: string;
  is_deleted: boolean; // Added is_deleted property
}

function formatHarga(num: number): string {
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function TransaksiDetailPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;
  const { accessToken } = useAuth();
  const { showModal, hideModal } = useModal();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingAsPaid, setIsMarkingAsPaid] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const fetchTransactionDetail = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${config.apiUrl}/transaksi/${transactionId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch transaction details: ${response.status}`
          );
        }

        const data = await response.json();
        setTransaction(data);
      } catch (err) {
        showModal(
          "Gagal Memuat Data",
          "Gagal memuat detail transaksi",
          "error"
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionDetail();
  }, [transactionId, accessToken, showModal]);

  const handleDelete = async () => {
    showModal(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus transaksi ini?",
      "info",
      {
        label: "Hapus",
        onClick: async () => {
          setIsDeleting(true);

          try {
            const response = await fetch(
              `${config.apiUrl}/transaksi/${transactionId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error(
                `Failed to delete transaction: ${response.status}`
              );
            }

            showModal("Berhasil", "Transaksi berhasil dihapus!", "success", {
              label: "Kembali ke Daftar Transaksi",
              onClick: () => (window.location.href = "/transaksi"),
            });
          } catch (err) {
            showModal("Gagal Menghapus", "Transaksi tidak dapat dihapus", "error");
            console.error(err);
          } finally {
            setIsDeleting(false);
          }
        },
      },
      {
        label: "Batal",
        onClick: () => {
          hideModal();
        },
      }
    );
  };

  const handleMarkAsPaid = async () => {
    showModal(
      "Konfirmasi Status",
      "Tandai transaksi ini sebagai Lunas?",
      "info",
      {
        label: "Ya, Tandai Lunas",
        onClick: async () => {
          setIsMarkingAsPaid(true);

          try {
            const response = await fetch(
              `${config.apiUrl}/transaksi/${transactionId}/toggle-payment-status`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error(
                `Failed to update payment status: ${response.status}`
              );
            }

            await response.json();

            if (transaction) {
              setTransaction({
                ...transaction,
                status: "Lunas",
              });
            }

            showModal(
              "Berhasil",
              "Status transaksi berhasil diubah menjadi Lunas!",
              "success",
              {
                label: "Kembali",
                onClick: () => {
                  hideModal(); // First close the modal
                  window.history.back(); // Then navigate back
                }
              }
            );
          } catch (err) {
            showModal(
              "Gagal Mengubah Status",
              "Gagal mengubah status transaksi",
              "error"
            );
            console.error(err);
          } finally {
            setIsMarkingAsPaid(false);
          }
        },
      },
      {
        label: "Batal",
        onClick: () => {
          hideModal();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-600 mb-4"
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
          <p className="text-gray-600">Memuat detail transaksi...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen">
        <div className="flex items-center mb-4">
          <button
            onClick={() => window.history.back()}
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
          <h1 className="text-xl font-semibold text-center flex-grow">
            Detail Transaksi
          </h1>
          <div className="w-6"></div>
        </div>

        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">
            {"Tidak dapat memuat data transaksi"}
          </span>
        </div>

        <button
          onClick={() => router.back()}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-[calc(theme(maxWidth.md)-2rem)] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md"
        >
          Kembali
        </button>
      </div>
    );
  }

  const isPemasukan = transaction.transaction_type === "pemasukan";
  const isPenjualanBarang =
    isPemasukan && transaction.category === "Penjualan Barang";
  const isPembelianStok =
    !isPemasukan && transaction.category === "Pembelian Stok";

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => window.history.back()}
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
        <h1 className="text-xl font-semibold text-center flex-grow">
          Detail Transaksi
        </h1>
        {!transaction.is_deleted ? (
          <button
            onClick={handleDelete}
            className="text-red-500 p-1 hover:text-red-700"
            disabled={isDeleting}
          >
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        ) : (
          <div className="w-6"></div>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          className={`shadow-sm rounded-3xl py-3 px-4 text-sm font-medium text-center flex items-center justify-center ${
            isPemasukan
              ? "bg-green-100 text-green-700"
              : "bg-white text-gray-500"
          }`}
          disabled
        >
          <div
            className={`p-1.5 rounded-full mr-2 ${
              isPemasukan ? "bg-primary-blue" : "bg-gray-200"
            }`}
          >
            <CoinIcon />
          </div>
          Pemasukan
        </button>
        <button
          className={`shadow-sm rounded-3xl py-3 px-4 text-sm font-medium text-center flex items-center justify-center ${
            !isPemasukan ? "bg-red-100 text-red-700" : "bg-white text-gray-500"
          }`}
          disabled
        >
          <div
            className={`p-1.5 rounded-full mr-2 ${
              !isPemasukan ? "bg-primary-red" : "bg-gray-200"
            }`}
          >
            <StockIcon />
          </div>
          Pengeluaran
        </button>
      </div>

      {/* Type Display */}
      <div className="relative mb-6">
        <div className="w-full bg-white shadow-sm rounded-3xl py-3 px-4 text-sm font-medium text-gray-500 flex items-center">
          <div className="bg-gray-200 p-1.5 rounded-full mr-2">
            <BellIcon />
          </div>
          <span>{transaction.category}</span>
        </div>
      </div>

      {/* Date and Time */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tanggal</span>
          <span className="font-medium">
            {new Date(transaction.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Waktu</span>
          <span className="font-medium">
            {new Date(transaction.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Items Section - Only show for specific transaction types */}
      {(isPenjualanBarang || isPembelianStok) &&
        transaction.items.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Barang</h2>
            </div>

            <div className="space-y-3 mb-6">
              {transaction.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl flex items-center p-3 shadow-sm"
                >
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden mr-3 flex-shrink-0 bg-gray-100">
                    {item.product_image_url ? (
                      <Image
                        src={`${config.apiUrl}${item.product_image_url.slice(
                          4
                        )}`}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        onError={(e) =>
                          (e.currentTarget.src = "/images/placeholder.svg")
                        }
                      />
                    ) : (
                      <Image
                        src={"/images/placeholder.svg"}
                        alt={item.product_name || "Produk"}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 mr-2">
                    <h3 className="font-semibold text-sm">
                      {item.product_name || "Produk tidak ditemukan"}
                    </h3>
                    <p className="font-medium text-sm mt-1 text-gray-600">
                      {item.quantity} x Rp{" "}
                      {formatHarga(
                        isPemasukan
                          ? item.harga_jual_saat_transaksi
                          : item.harga_modal_saat_transaksi
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-medium ${
                        isPemasukan ? "text-blue-700" : "text-red-700"
                      }`}
                    >
                      Rp{" "}
                      {formatHarga(
                        item.quantity *
                          (isPemasukan
                            ? item.harga_jual_saat_transaksi
                            : item.harga_modal_saat_transaksi)
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      {/* Summary Section */}
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            {isPemasukan ? "Total Pemasukan" : "Total Pengeluaran"}
          </span>
          <span
            className={`font-semibold ${
              isPemasukan ? "text-blue-700" : "text-red-700"
            }`}
          >
            Rp {formatHarga(transaction.total_amount)}
          </span>
        </div>

        {isPenjualanBarang && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Modal</span>
            <span className="text-gray-500">
              Rp {formatHarga(transaction.total_modal)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status</span>
          <span
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              transaction.status === "Lunas"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {transaction.status}
          </span>
        </div>

        {isPenjualanBarang && (
          <>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Keuntungan</span>
              <span className="font-bold text-lg text-green-600">
                Rp {formatHarga(transaction.amount)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Mark as Paid Button - only show for transactions with "Belum Lunas" status */}
      {transaction.status === "Belum Lunas" && !transaction.is_deleted && (
        <button
          onClick={handleMarkAsPaid}
          disabled={isMarkingAsPaid}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md mb-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isMarkingAsPaid ? (
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
              Memproses...
            </>
          ) : (
            "Tandai Lunas"
          )}
        </button>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        disabled={isDeleting || isMarkingAsPaid}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-[calc(theme(maxWidth.md)-2rem)] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center z-20"
      >
        {isDeleting ? (
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
            Menghapus...
          </>
        ) : (
          "Kembali"
        )}
      </button>
    </div>
  );
}
