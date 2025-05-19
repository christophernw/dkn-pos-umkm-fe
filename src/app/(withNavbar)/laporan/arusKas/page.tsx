"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import config from "@/src/config";
import Head from "next/head";
import { AccessDeniedScreen } from "@/src/components/AccessDeniedScreen";

interface CashflowTransaction {
  id: number;
  jenis: string;
  nominal: number;
  kategori: string;
  tanggal_transaksi: string;
  keterangan?: string;
}

interface CashflowReport {
  id: number;
  month: number;
  year: number;
  total_inflow: number;
  total_outflow: number;
  balance: number;
  transactions: CashflowTransaction[];
}

export default function ArusKasPage() {
  const {user,  accessToken } = useAuth();

  // Check if user is BPR
  if (user?.is_bpr) {
    return <AccessDeniedScreen userType="BPR" />;
  }
  const [cashflow, setCashflow] = useState<CashflowReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCashflow() {
      try {
        const res = await fetch(
          `${config.apiUrl}/laporan/aruskas-report?month=2025-04`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Gagal fetch data");
        }

        const data = await res.json();
        console.log(data);
        setCashflow(data);
      } catch (err: any) {
        console.error(err);
        setError("Gagal mengambil data laporan arus kas.");
      } finally {
        setLoading(false);
      }
    }

    if (accessToken) {
      fetchCashflow();
    }
  }, [accessToken]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const groupByKategori = (transactions: CashflowTransaction[]) => {
    const grouped: { [key: string]: number } = {};
    transactions.forEach((item) => {
      const nominal = item.jenis === "outflow" ? -item.nominal : item.nominal;
      if (grouped[item.kategori]) {
        grouped[item.kategori] += Number(nominal);
      } else {
        grouped[item.kategori] = Number(nominal);
      }
    });
    return grouped;
  };

  const operasionalTransaksi =
    cashflow?.transactions.filter(
      (item) => item.kategori === "Biaya operasional"
    ) || [];

  const penjualanBarangTransaksi =
    cashflow?.transactions.filter(
      (item) =>
        item.kategori === "Penjualan Barang" ||
        item.kategori === "Pembelian Stok"
    ) || [];


  const totalOperasional = operasionalTransaksi.reduce((total, item) => {
    const nominal = item.jenis === "outflow" ? -item.nominal : item.nominal;
    return Number(total) + Number(nominal);
  }, 0);

  const totalPenjualanBarang = penjualanBarangTransaksi.reduce(
    (total, item) => {
      const nominal = item.jenis === "outflow" ? -item.nominal : item.nominal;
      return Number(total) + Number(nominal);
    },
    0
  );

  const groupedOperasional = groupByKategori(operasionalTransaksi);
  const groupedPenjualan = groupByKategori(penjualanBarangTransaksi);

  return (
    <>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                    (function (m, a, z, e) {
                    var s, t;

                    try {
                    m.sessionStorage.setItem('maze-us', t);
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

      <div className="py-4 px-2 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Laporan Arus Kas</h1>

        <div className="flex flex-col gap-4 bg-white p-4 rounded shadow">
          <div className="flex flex-col gap-2">
            <p className="font-bold text-sm mb-2">
              Arus Kas dari Aktivitas Operasional
            </p>
            {Object.keys(groupedOperasional).length === 0 ? (
              <p className="text-gray-500 text-xs">Tidak ada transaksi.</p>
            ) : (
              Object.entries(groupedOperasional).map(([kategori, nominal]) => (
                <div key={kategori} className="flex justify-between">
                  <span className="text-xs">{kategori}</span>
                  <span className="text-xs">Rp {nominal.toLocaleString()}</span>
                </div>
              ))
            )}
            <div className="flex justify-between font-bold text-sm mt-2">
              <span>Total Arus Kas Operasional</span>
              <span>Rp {totalOperasional.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <p className="font-bold text-sm mb-2">
              Arus Kas dari Penjualan Barang
            </p>
            {Object.keys(groupedPenjualan).length === 0 ? (
              <p className="text-gray-500 text-xs">Tidak ada transaksi.</p>
            ) : (
              Object.entries(groupedPenjualan).map(([kategori, nominal]) => (
                <div key={kategori} className="flex justify-between">
                  <span className="text-xs">{kategori}</span>
                  <span className="text-xs">Rp {nominal.toLocaleString()}</span>
                </div>
              ))
            )}
            <div className="flex justify-between font-bold text-sm mt-2">
              <span>Total Arus Kas Penjualan Barang</span>
              <span>Rp {totalPenjualanBarang.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
