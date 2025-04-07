import React from 'react'

export default function TotalSummarySection() {
  return (
    <div className="flex flex-col gap-3">
        <div className="flex justify-between">
            <p className="text-sm text-[#818898]">Total Pemasukan</p>
            <p className="text-sm text-[#818898]">Rp35.000</p>
        </div>
        <div className="flex justify-between">
            <p className="text-sm text-[#818898]">Modal</p>
            <p className="text-sm text-[#818898]">Rp0</p>
        </div>
        <div className="flex justify-between">
            <p className="text-sm text-[#818898]">Status</p>
            <div className="bg-[#ECEFF3] rounded-2xl p-[2px] flex justify-between gap-2">
                <div className="bg-white rounded-xl flex px-2 items-center">
                    <p className="text-[9px]">Lunas</p>
                </div>
                <div className="rounded-2xl flex px-2">
                    <p className="text-[9px]">Belum Lunas</p>
                </div>
            </div>
        </div>
    </div>
  )
}
