"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import config from "@/src/config";
import Script from "next/script";

interface ShopData {
  id: number;
  owner: string;
  created_at: string;
  user_count: number;
}

export default function BPRHomePage() {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const [shops, setShops] = useState<ShopData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not a BPR user
    if (user && !user.is_bpr) {
      router.push("/");
      return;
    }

    // Fetch shops list if user is a BPR user
    const fetchShops = async () => {
      if (!accessToken) return;

      setIsLoading(true);
      try {
        const response = await fetch(`${config.apiUrl}/auth/bpr/shops`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch shops data");
        }

        const data = await response.json();
        setShops(data);
      } catch (err) {
        console.error("Error fetching shops:", err);
        setError("Failed to load shops data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.is_bpr && accessToken) {
      fetchShops();
    }
  }, [user, accessToken, router]);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard BPR</h1>
        
        {/* Stats overview */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h2 className="font-semibold text-lg mb-3">Ringkasan</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{shops.length}</p>
              <p className="text-sm text-gray-600">Total Toko</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">
                {shops.reduce((sum, shop) => sum + shop.user_count, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Pengguna</p>
            </div>
          </div>
        </div>

        {/* Shops list */}
        <h2 className="font-semibold text-lg mb-3">Daftar Toko UMKM</h2>
        <div className="space-y-4">
          {shops.length === 0 ? (
            <div className="bg-white p-4 rounded-lg text-center text-gray-500">
              Tidak ada toko yang terdaftar
            </div>
          ) : (
            shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                onClick={() => router.push(`/bpr/shop/${shop.id}`)}             
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{shop.owner}</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    ID: {shop.id}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <p className="text-gray-500">Tanggal Dibuat</p>
                    <p>{formatDate(shop.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jumlah Pengguna</p>
                    <p>{shop.user_count} orang</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}