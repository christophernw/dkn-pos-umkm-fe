"use client"

import { DotIcon } from '@/public/icons/DotIcon'
import React, { useState } from 'react'
import { TransactionHeader } from './module-elements/TransactionHeader'
import { TransactionSummary } from './module-elements/TransactionSummary'
import { PlusIcon } from '@/public/icons/PlusIcon'
import Link from 'next/link'

export default function TransactionMainPage() {
    const [modalOpen, setModalOpen] = useState(false)
  return (
    <div className="mt-8 flex flex-col gap-4">
        <TransactionHeader />
        <TransactionSummary />
        <div>
            <p className="font-medium">80 Results</p>
        </div>
        <div className="flex flex-col gap-3 ">
            <div className="bg-white py-3 px-5 rounded-xl flex flex-col gap-1">
                <div className="flex justify-between items-center">
                    <p className="font-medium text-sm text-primary-indigo">Transaksi #8726AB</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-primary-gray">Tue, 10 Dec 2024</p>
                        <DotIcon />
                        <p className="text-xs  text-primary-gray">11:51 am</p>
                    </div>
                </div>
                <div className="justify-between flex">                
                    <p className="bg-primary-green rounded-full px-2 py-1 font-medium text-white w-fit text-xs">+ Rp200.000</p>
                    <p className="text-primary-green rounded-full px-2 py-1 font-medium bg-secondary-green w-fit text-xs">Lunas</p>
                </div>
            </div>
            <div className="bg-white py-3 px-5 rounded-xl flex flex-col gap-1">
                <div className="flex justify-between items-center">
                    <p className="font-medium text-sm text-primary-indigo">Transaksi #8726AB</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-primary-gray">Tue, 10 Dec 2024</p>
                        <DotIcon />
                        <p className="text-xs  text-primary-gray">11:51 am</p>
                    </div>
                </div>
                <div className="justify-between flex">                
                    <p className="bg-primary-green rounded-full px-2 py-1 font-medium text-white w-fit text-xs">+ Rp200.000</p>
                    <p className="text-primary-green rounded-full px-2 py-1 font-medium bg-secondary-green w-fit text-xs">Lunas</p>
                </div>
            </div>
        </div>
        <button className="bg-primary-indigo rounded-full w-fit fixed bottom-4 right-4 sm:right-[calc(50%-(420px/2)+1rem)] p-4 mb-24" onClick={() => setModalOpen(!modalOpen)}>
            <PlusIcon/>
        </button>
        {modalOpen && (
            <>
                {/* Backdrop overlay */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 z-40" 
                    onClick={() => setModalOpen(false)}
                />
                
                {/* Modal popup */}
                <div className="fixed bottom-24 right-4 sm:right-[calc(50%-(420px/2)+1rem)] z-50 flex flex-col gap-3 bg-white p-4 rounded-xl shadow-lg">
                    <Link 
                        href="/tambahPemasukan" 
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg text-primary-indigo font-medium"
                    >
                        <span className="p-1 bg-green-100 rounded-full text-green-500 w-6 h-6 flex items-center justify-center font-semibold">+</span>
                        <span>Tambah Pemasukan</span>
                    </Link>
                    <Link 
                        href="/tambahPengeluaran" 
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg text-primary-indigo font-medium"
                    >
                        <span className="p-1 bg-red-100 rounded-full text-red-500 w-6 h-6 flex items-center justify-center font-semibold">-</span>
                        <span>Tambah Pengeluaran</span>
                    </Link>
                </div>
            </>
        )}
    </div>
  )
}