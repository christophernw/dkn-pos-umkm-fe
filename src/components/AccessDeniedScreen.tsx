// src/components/AccessDeniedScreen.tsx
import React from "react";
import { useRouter } from "next/navigation";

interface AccessDeniedScreenProps {
  userType: "Karyawan" | "BPR";
  pageType?: string;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({ 
  userType, 
  pageType = "halaman ini" 
}) => {
  const router = useRouter();

  let message = "";
  if (userType === "Karyawan") {
    message = `Karyawan tidak diperbolehkan mengakses halaman ${pageType}.`;
  } else if (userType === "BPR") {
    message = `BPR tidak diperbolehkan mengakses halaman ini.`;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-sm">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Akses Ditolak
        </h1>
        <p className="mb-6">{message}</p>
        <button
          onClick={() => router.push(userType === "BPR" ? "/bpr" : "/")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};