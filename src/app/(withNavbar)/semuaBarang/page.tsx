"use client";

import HeaderProduk from "@/src/components/HeaderProduk";
import ProductCard from "@/src/components/ProductCard";
import React, { Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@/public/icons/PlusIcon";

const SemuaBarang = () => {
  const { user } = useAuth();
  const router = useRouter();

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
      
      {/* Updated button to match Transaksi page styling */}
      <button
        className="bg-primary-indigo rounded-full w-fit fixed bottom-4 right-4 sm:right-[calc(50%-(420px/2)+1rem)] p-4 mb-24"
        onClick={() => router.push("/tambahProduk")}
      >
        <PlusIcon />
      </button>
    </div>
  );
};

export default SemuaBarang;