"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"validating" | "success" | "error">("validating");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token undangan tidak ditemukan.");
      setTimeout(() => {
        router.push("/login?redirect=%2Fpengaturan");
      }, 2500);
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-invitation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token })
        });
        const result = await res.json();

        if (result.valid) {
          setStatus("success");
          setMessage("Undangan berhasil divalidasi. Mengarahkan ke login...");
          setTimeout(() => {
            router.push("/login?redirect=%2Fpengaturan");
          }, 1500);
        } else {
          setStatus("error");
          setMessage(result.error || "Undangan tidak valid.");
          setTimeout(() => {
            router.push("/login?redirect=%2Fpengaturan");
          }, 2500);
        }
      } catch (error) {
        console.error("Error validating invitation:", error);
        setStatus("error");
        setMessage("Terjadi kesalahan saat memvalidasi undangan.");
        setTimeout(() => {
          router.push("/login?redirect=%2Fpengaturan");
        }, 2500);
      }
    };

    validate();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#EDF1F9] text-gray-700 px-4">
      {status === "validating" && (
        <div className="flex flex-col items-center gap-4">
          <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-600" />
          <p className="text-base font-medium">Memvalidasi undangan...</p>
        </div>
      )}

      {status === "success" && (
        <p className="text-green-600 text-lg font-medium">Validasi Berhasil</p>
      )}

      {status === "error" && (
        <>
          <p className="text-red-600 text-lg font-medium">Validasi gagal</p>
          <p className="text-sm mt-2 text-center">{message}</p>
        </>
      )}
    </div>
  );
}
