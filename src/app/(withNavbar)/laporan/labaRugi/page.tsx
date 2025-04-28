"use client"

import { useState } from "react"
import Link from "next/link"
import DatePicker from "@/src/components/DatePicker" 

export default function LaporanAkuntansi() {
  const today = new Date()
  const [startDate, setStartDate] = useState<string>(today.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState<string>(today.toISOString().split("T")[0])

  const financialData = {
    totalPenjualan: 0,
    totalPendapatanPinjaman: 0,
    totalPendapatanLainLain: 0,
    totalHargaModal: 0,
    labaKotor: 0,
    totalBiayaOperasional: 0,
    totalBebanLainLain: 0,
    totalLabaBersih: 0,
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Laporan Akuntansi</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <DatePicker label="Tanggal Mulai" value={startDate} onChange={setStartDate} />
            <DatePicker label="Tanggal Akhir" value={endDate} onChange={setEndDate} />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Laporan Laba Rugi</h2>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2 font-bold">Keterangan</th>
                    <th className="text-left py-2 font-medium"></th>
                    <th className="text-right py-2 font-medium">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-2 font-bold">PENDAPATAN</td>             
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Total Penjualan</td>
                    <td className="py-2"></td>
                    <td className="py-2 text-right">Rp {financialData.totalPenjualan}</td>
                  </tr>

                  <tr className="border-t">
                    <td className="py-2 font-bold">PENDAPATAN LAIN-LAIN</td>              
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Pendapatan Pinjaman</td>
                    <td></td>
                    <td className="py-2 text-right">Rp {financialData.totalPendapatanPinjaman}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 font-bold">TOTAL PENDAPATAN</td>
                    <td className="py-2"></td>
                    <td className="py-2 text-right">Rp {financialData.totalPendapatanLainLain}</td>
                  </tr>

                  <tr>
                    <td className="py-4"></td>
                  </tr>

                  <tr className="">
                    <td className="py-2 font-bold">BEBAN POKOK PENJUALAN (HPP)</td>
                    <td></td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Total Harga Modal Produk Terjual</td>
                    <td></td>
                    <td className="py-2 text-right">Rp {financialData.totalHargaModal}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 font-bold">LABA KOTOR (Penjualan - HPP)</td>
                    <td className="py-2"></td>
                    <td className="py-2 text-right">Rp {financialData.labaKotor}</td>
                  </tr>

                  <tr>
                    <td className="py-4"></td>
                  </tr>

                  <tr className="">
                  <td className="py-2">
                    <span className="font-bold">BEBAN LAIN-LAIN</span> <span>(Operasional)</span>
                  </td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Biaya Operasional</td>
                    <td></td>
                    <td className="py-2 text-right">Rp {financialData.totalBiayaOperasional}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 font-bold">TOTAL BEBAN LAIN-LAIN</td>
                    <td></td>
                    <td className="py-2 text-right">Rp {financialData.totalBebanLainLain}</td>
                  </tr>

                  <tr>
                    <td className="py-4"></td>
                  </tr>

                  <tr className="border-t">
                    <td className="py-2 font-bold">LABA / RUGI BERSIH</td>
                    <td></td>
                    <td className="py-2 text-right">Rp {financialData.totalLabaBersih}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Link href="/laporan/arusKas" className="inline-flex items-center text-gray-600 hover:text-gray-900 mt-4">
          <span>Lihat Laporan Arus Kas</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
