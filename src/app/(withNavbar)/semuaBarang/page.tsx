"use client";

import HeaderProduk from "@/src/components/HeaderProduk";
import ProductCard from "@/src/components/ProductCard";
import React, { Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@/public/icons/PlusIcon";
import Head from "next/head";

const SemuaBarang = () => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <>
        <Head>
            <script
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
            </Head> 
    <div className="relative min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <HeaderProduk />
      </Suspense>
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
    </>
  );
};

export default SemuaBarang;