'use client'

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
      <div className='fixed bottom-4 flex justify-end px-4 pb-24'>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-4xl just flex items-center justify-center h-14 w-14 font-medium rounded-full shadow-md">
          +
        </button>
      </div>
    </div>
  );
};

export default SemuaBarang
