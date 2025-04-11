import React from 'react'
import { Header } from './module-element/Header'
import { CoinIcon } from '@/public/icons/CoinIcon'
import BarangSection from './module-element/BarangSection'
import TotalSummarySection from './module-element/TotalSummarySection'

export default function TambahPengeluaranPage() {
  return (
    <div className="max-h-screen overflow-hidden flex flex-col gap-4">
      <Header/>
      <div className="flex flex-col gap-2 px-3 -mt-4">
        <div className="bg-white p-3 rounded-full flex flex-col gap-3 w-full">
          <div className="flex items-center gap-2">
              <div className="bg-primary-blue p-3 rounded-full">
                <CoinIcon />
              </div>
              <p className="text-[#818898]">12 Febuari 2024  11:51 am</p>
          </div>
        </div>
      </div>
      <div className="bg-[#F8FAFE] px-3 rounded-t-2xl flex flex-col gap-3 pb-24">
        <div className="flex justify-between pt-3">
          <p className="font-medium">Barang</p>
          <div className="bg-primary-blue px-3 rounded-full border border-primary-indigo flex items-center">
            <p className="text-primary-indigo text-[9px]">Ubah/Tambah Barang</p>
          </div>
        </div>
        <BarangSection />
        <TotalSummarySection />
        <div className="bg-primary-indigo rounded-full p-3 flex justify-center mt-4">
          <p className="text-white">Simpan</p>
        </div>
      </div>
    </div>
  )
}
