"use client";

import HeaderProduk from "@/src/components/HeaderProduk";
import ProductCard from "@/src/components/ProductCard";
import React, { Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
const SemuaBarang = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <HeaderProduk />
      </Suspense>
      {/* Display username */}
      {user && (
        <div className="bg-blue-100 p-4 m-4 rounded-md">
          <p className="text-blue-800 font-medium">Welcome, {user.name}!</p>
        </div>
      )}
      <Suspense fallback={<div>Loading...</div>}>
        <ProductCard />
      </Suspense>
      <div className="fixed bottom-4 flex justify-end px-4 pb-24">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white text-4xl flex items-center justify-center h-14 w-14 font-medium rounded-full shadow-md"
          onClick={() => (window.location.href = "/tambahProduk")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 256 256">
            <path fill="currentColor" d="M228 128a12 12 0 0 1-12 12h-76v76a12 12 0 0 1-24 0v-76H40a12 12 0 0 1 0-24h76V40a12 12 0 0 1 24 0v76h76a12 12 0 0 1 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SemuaBarang;