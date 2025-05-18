"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import config from "@/src/config";
import { signOut } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import Script from "next/script";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'initial' | 'success' | 'error'>('initial');
  const [message, setMessage] = useState("");
  const { logout } = useAuth();
  const validationAttempted = useRef(false);

  useEffect(() => {
    const validateInvitation = async () => {
      if (validationAttempted.current) return;
      validationAttempted.current = true;

      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage("Token undangan tidak ditemukan.");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${config.apiUrl}/auth/validate-invitation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.valid) {
          setStatus('success');
          setMessage("Pendaftaran berhasil! Anda telah terdaftar dan terhubung dengan toko.");
          
          logout();
          await signOut({ redirect: false });
        } else {
          setStatus('error');
          // Check if the error indicates the invitation doesn't exist or was deleted
          if (data.error === "Invalid invitation") {
            setMessage("Undangan tidak valid atau telah dihapus oleh pemilik. Silakan minta undangan baru.");
          } else {
            setMessage(data.error || "Terjadi kesalahan saat memvalidasi undangan.");
          }
        }
      } catch (error) {
        console.error("Error validating invitation:", error);
        setStatus('error');
        setMessage("Terjadi kesalahan saat memproses undangan Anda.");
      } finally {
        setIsLoading(false);
      }
    };

    validateInvitation();
  }, [searchParams, logout]);

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

    <div className="min-h-screen bg-[#EDF1F9] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Validasi Undangan</h1>
        
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memproses undangan Anda...</p>
          </div>
        ) : status === 'success' ? (
          <div className="text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
              <svg className="h-12 w-12 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>{message}</p>
            </div>
            <Link href="/login" className="block w-full bg-blue-600 text-white py-3 px-4 rounded-3xl text-center font-semibold hover:bg-blue-700 transition">
              Login ke Aplikasi
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              <svg className="h-12 w-12 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p>{message}</p>
            </div>
            <Link href="/" className="block w-full bg-blue-600 text-white py-3 px-4 rounded-3xl text-center font-semibold hover:bg-blue-700 transition">
              Kembali ke Beranda
            </Link>
          </div>
        )}
      </div>
    </div>
    </>
  );
}