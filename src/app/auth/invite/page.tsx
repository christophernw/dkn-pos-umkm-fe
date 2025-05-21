"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import config from "@/src/config";
import { signOut } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import Script from "next/script";

interface ValidationResponse {
  valid: boolean;
  error?: string;
  message?: string;
}

type InvitationStatus = 'initial' | 'loading' | 'success' | 'error';

const INVITATION_MESSAGES = {
  LOADING: "Memproses undangan Anda...",
  SUCCESS: "Pendaftaran berhasil! Anda telah terdaftar dan terhubung dengan toko.",
  TOKEN_NOT_FOUND: "Token undangan tidak ditemukan.",
  INVALID_INVITATION: "Undangan tidak valid atau telah dihapus oleh pemilik. Silakan minta undangan baru.",
  GENERIC_ERROR: "Terjadi kesalahan saat memproses undangan Anda.",
  VALIDATION_ERROR: "Terjadi kesalahan saat memvalidasi undangan."
} as const;

const useInvitationValidation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<InvitationStatus>('initial');
  const [message, setMessage] = useState("");
  const validationAttempted = useRef(false);
  const { logout } = useAuth();
  const searchParams = useSearchParams();

  const validateInvitation = useCallback(async () => {
    if (validationAttempted.current) return;
    validationAttempted.current = true;

    try {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage(INVITATION_MESSAGES.TOKEN_NOT_FOUND);
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ValidationResponse = await response.json();

      if (data.valid) {
        setStatus('success');
        setMessage(INVITATION_MESSAGES.SUCCESS);
        
      } else {
        setStatus('error');
        
        if (data.error === "Invalid invitation") {
          setMessage(INVITATION_MESSAGES.INVALID_INVITATION);
        } else {
          setMessage(data.error || INVITATION_MESSAGES.VALIDATION_ERROR);
        }
      }
    } catch (error) {
      console.error("Error validating invitation:", error);
      setStatus('error');
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setMessage("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      } else if (error instanceof Error && error.name === 'AbortError') {
        setMessage("Permintaan timeout. Silakan coba lagi.");
      } else {
        setMessage(INVITATION_MESSAGES.GENERIC_ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, logout]);

  return { isLoading, status, message, validateInvitation };
};

const LoadingState = () => (
  <div className="text-center">
    <div 
      className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
      role="status"
      aria-label="Loading"
    />
    <p className="text-gray-600">{INVITATION_MESSAGES.LOADING}</p>
  </div>
);

const SuccessState = ({ message }: { message: string }) => (
  <div className="text-center">
    <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6" role="alert">
      <svg 
        className="h-12 w-12 text-green-500 mx-auto mb-2" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <p>{message}</p>
    </div>
    <Link 
      href="/login" 
      className="block w-full bg-blue-600 text-white py-3 px-4 rounded-3xl text-center font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Login ke Aplikasi
    </Link>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="text-center">
    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6" role="alert">
      <svg 
        className="h-12 w-12 text-red-500 mx-auto mb-2" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      <p>{message}</p>
    </div>
    <Link 
      href="/" 
      className="block w-full bg-blue-600 text-white py-3 px-4 rounded-3xl text-center font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Kembali ke Beranda
    </Link>
  </div>
);

export default function InvitePage() {
  const router = useRouter();
  const { isLoading, status, message, validateInvitation } = useInvitationValidation();

  useEffect(() => {
    validateInvitation();
  }, [validateInvitation]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }
    
    if (status === 'success') {
      return <SuccessState message={message} />;
    }
    
    return <ErrorState message={message} />;
  };

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
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Validasi Undangan
        </h1>
        {renderContent()}
      </div>
    </div>
    </>
  );
}