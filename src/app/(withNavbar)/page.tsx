"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CoinIcon } from "@/public/icons/CoinIcon";
import { StockIcon } from "@/public/icons/StockIcon";
import { NotesIcon } from "@/public/icons/notesIcon";
import Logo from "@/public/images/logo.png"; // Import the logo image
import Script from "next/script";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  
  return (
    <>
        <Script
        id="maze-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function (m, a, z, e) {
              var s, t;
              try {
                t = m.sessionStorage.getItem('maze-us');
              } catch (err) {}

              if (!t) {
                t = new Date().getTime();
                try {
                  m.sessionStorage.setItem('maze-us', t);
                } catch (err) {}
              }

              s = a.createElement('script');
              s.src = z + '?apiKey=' + e;
              s.async = true;
              a.getElementsByTagName('head')[0].appendChild(s);
              m.mazeUniversalSnippetApiKey = e;
            })(window, document, 'https://snippet.maze.co/maze-universal-loader.js', 'e31b53f6-c7fd-47f2-85df-d3c285f18b33');
          `,
        }}
      />
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
    </>
  );
}