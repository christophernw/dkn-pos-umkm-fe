"use client"
import React from 'react'
import { SelectedProduct } from '../types/selectedProduct'

interface TotalSummarySectionProps {
    selectedProducts: SelectedProduct[],
    status: 'Lunas' | 'Belum Lunas'
    onStatusChange: (newStatus: 'Lunas' | 'Belum Lunas') => void
}


export default function TotalSummarySection({selectedProducts, status, onStatusChange} : TotalSummarySectionProps) {
    const totalPemasukan = selectedProducts.reduce((acc, item) => {
        return acc + item.product.harga_jual * item.quantity;
    }, 0);

    const totalModal = selectedProducts.reduce((acc, item) => {
        return acc + item.product.harga_modal * item.quantity;
    }, 0);

    const keuntungan = totalPemasukan - totalModal;

    const toggleStatus = () => {
        const newStatus = status === 'Lunas' ? 'Belum Lunas' : 'Lunas';
        onStatusChange(newStatus);
    };

    return (
    <div className="flex flex-col gap-3">
        <div className="flex justify-between">
            <p className="text-sm text-[#818898]">Total Pemasukan</p>
            <p className="text-sm text-[#818898]">Rp{totalPemasukan.toLocaleString('id-ID')}</p>
        </div>
        <div className="flex justify-between">
            <p className="text-sm text-[#818898]">Modal</p>
            <p className="text-sm text-[#818898]">Rp{totalModal.toLocaleString('id-ID')}</p>
        </div>
        <div className="flex justify-between items-center">
                <p className="text-sm text-[#818898]">Status</p>
                <div 
                    className="bg-[#ECEFF3] rounded-2xl p-[2px] flex justify-between gap-2 cursor-pointer"
                    onClick={toggleStatus}
                >
                    <div className={`rounded-xl flex px-2 items-center  ${status === 'Lunas' ? 'bg-white' : ''}`}>
                        <p className="text-xs">Lunas</p>
                    </div>
                    <div className={`rounded-xl flex px-2 items-center ${status === 'Belum Lunas' ? 'bg-white' : ''}`}>
                        <p className="text-xs">Belum Lunas</p>
                    </div>
                </div>
            </div>
        <div className="border border-[#DFE1E7] w-full"/>
        <div className="flex justify-between">
            <p className="font-medium">Keuntungan</p>
            <p className="font-medium">Rp{keuntungan.toLocaleString('id-ID')}</p>
        </div>
    </div>
    )
}
