"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CoinIcon } from "@/public/icons/CoinIcon";
import { StockIcon } from "@/public/icons/StockIcon";
import { NotesIcon } from "@/public/icons/notesIcon";
import Logo from "@/public/images/logo.png"; // Import the logo image
import config from '@/src/config';
import { useModal } from "@/contexts/ModalContext";

export default function Home() {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const { showModal } = useModal();
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  
  // Function to create a new store for users without one
  const handleCreateNewStore = async () => {
    if (!accessToken) {
      return;
    }
    
    try {
      setIsCreatingStore(true);
      
      const response = await fetch(`${config.apiUrl}/auth/create-new-store`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Refresh the page to update user data
        window.location.reload();
      } else {
        const error = await response.json();
        showModal(
          "Error",
          error.message || "Failed to create store",
          "error"
        );
      }
    } catch (error) {
      console.error("Error creating store:", error);
      showModal(
        "Error",
        "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setIsCreatingStore(false);
    }
  };
  
  // If user is logged in but has no toko (removed user or new user)
  if (user && !user.toko_id) {
    return (
      <div className="p-4 flex flex-col gap-6 items-center justify-center min-h-screen">
        {/* Logo Section */}
        <div className="flex justify-center mb-4">
          <img src={Logo.src} alt="LANCAR Logo" className="h-32" />
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md w-full max-w-md text-center">
          <h1 className="text-xl font-bold mb-4">
            Selamat Datang, {user.name}!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Anda belum terhubung dengan toko. Anda dapat membuat toko baru atau menunggu undangan untuk bergabung dengan toko yang ada.
          </p>
          
          <button
            onClick={handleCreateNewStore}
            disabled={isCreatingStore}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {isCreatingStore ? "Membuat Toko..." : "Buat Toko Baru"}
          </button>
        </div>
      </div>
    );
  }
  
  // Regular home page for users with a toko
  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Logo Section */}
      <div className="flex justify-center mb-4">
        <img src={Logo.src} alt="LANCAR Logo" className="h-32" />
      </div>

      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">
          {user ? `Selamat Datang, ${user.name}!` : 'Selamat Datang di LANCAR'}
        </h1>
        <p className="text-gray-600 mt-1">
          Sistem manajemen bisnis UMKM untuk membantu mengelola produk, 
          transaksi, dan laporan keuangan Anda dengan lebih mudah.
        </p>
      </div>

      {/* Quick Actions - Only shown if user is logged in */}
      {user && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Menu Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/tambahProduk">
              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center justify-center gap-2 h-24 hover:bg-blue-50 transition-colors">
                <div className="bg-blue-100 p-2 rounded-full">
                  <StockIcon />
                </div>
                <span className="text-sm font-medium text-center">Tambah Produk</span>
              </div>
            </Link>
            
            <Link href="/tambahPemasukan">
              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center justify-center gap-2 h-24 hover:bg-green-50 transition-colors">
                <div className="bg-green-100 p-2 rounded-full">
                  <CoinIcon />
                </div>
                <span className="text-sm font-medium text-center">Tambah Pemasukan</span>
              </div>
            </Link>
            
            <Link href="/tambahPengeluaran">
              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center justify-center gap-2 h-24 hover:bg-red-50 transition-colors">
                <div className="bg-red-100 p-2 rounded-full">
                  <StockIcon />
                </div>
                <span className="text-sm font-medium text-center">Tambah Pengeluaran</span>
              </div>
            </Link>
            
            <Link href="/semuaBarang">
              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center justify-center gap-2 h-24 hover:bg-indigo-50 transition-colors">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <NotesIcon />
                </div>
                <span className="text-sm font-medium text-center">Kelola Produk</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* About the App */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Tentang LANCAR</h2>
        <p className="text-sm text-gray-600 mb-3">
          LANCAR adalah aplikasi point of sale (POS) yang dirancang khusus untuk UMKM di Indonesia.
          Kelola inventori, catat penjualan, dan pantau keuangan dalam satu platform.
        </p>
        
        <h3 className="text-md font-medium mb-2">Fitur Utama:</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          <li>Manajemen stok dan produk</li>
          <li>Pencatatan transaksi penjualan dan pembelian</li>
          <li>Laporan keuangan sederhana</li>
          <li>Pengelolaan pengguna dengan multi-role</li>
          <li>Pencatatan status pembayaran</li>
        </ul>
      </div>

      <div className="text-center text-xs text-gray-500 mt-4">
        <p>Versi 1.0 • PPL B - Kelompok 6</p>
      </div>
    </div>
  );
}