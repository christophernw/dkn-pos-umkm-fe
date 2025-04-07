"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal } from "lucide-react";

const Header = () => {
  const router = useRouter();
  const handleBack = () => router.back();

  return (
    <div className="w-full flex justify-between mb-6">
      <button
        onClick={handleBack}
        aria-label="Back"
        className="w-10 h-10 rounded-full bg-white hover:bg-gray-300 flex items-center justify-center"
      >
        <ArrowLeft className="w-5 h-5 text-black" />
      </button>
      <h1 className="text-xl font-semibold flex items-center justify-center">
        Pengaturan Pengguna
      </h1>
      <button className="w-10 h-10 rounded-full bg-white hover:bg-gray-300 flex items-center justify-center">
        <MoreHorizontal className="w-5 h-5 text-black" />
      </button>
    </div>
  );
};

export default Header;
