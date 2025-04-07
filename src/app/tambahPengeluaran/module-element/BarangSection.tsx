import { NegativeIcon } from '@/public/icons/NegativeIcon'
import { PlusIcon } from '@/public/icons/PlusIcon'
import React from 'react'
import Image from 'next/image'
import config from '@/src/config'
import { SelectedProduct } from '../types/selectedProduct'

interface BarangSectionProps {
  selectedProducts: SelectedProduct[]
  onQuantityChange: (productId: number, newQuantity: number) => void
}

export default function BarangSection({ 
  selectedProducts,
  onQuantityChange
}: BarangSectionProps) {
  const handleQuantityChange = (productId: number, change: number) => {
    const product = selectedProducts.find(p => p.product.id === productId)
    if (product) {
      const newQuantity = Math.max(1, (product.quantity || 1) + change)
      onQuantityChange(productId, newQuantity)
    }
  }

  return (
    <div className="h-[calc(100vh-480px)] overflow-y-scroll flex flex-col gap-3">
      {selectedProducts?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Belum ada barang dipilih
        </div>
      ) : (
        selectedProducts?.map((p) => (
          <div key={p.product.id} className="bg-white flex rounded-2xl p-2 gap-3">
            <div className="w-28 h-28 relative rounded-2xl overflow-hidden">
              <Image
                src={
                  p.product.foto
                    ? `${config.apiUrl}${p.product.foto.slice(4)}`
                    : "/images/placeholder.svg"
                }
                alt={p.product.nama}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/placeholder.svg"
                }}
              />
            </div>
            <div className="flex flex-col justify-between flex-1">
              <div>
                <p className="text-sm">{p.product.nama}</p>
                <p className="text-[10px] text-[#818898] line-clamp-2">
                  {p.product.kategori} • {p.product.satuan}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[#3554C1] font-medium">
                  Rp{(p.product.harga_modal*p.quantity).toLocaleString('id-ID')}
                </p>
                <div className="flex bg-[#ECEFF3] rounded-full gap-2 justify-center items-center p-1">
                  <button 
                    className="bg-white rounded-full p-1"
                    onClick={() => handleQuantityChange(p.product.id, -1)}
                  >
                    <NegativeIcon />
                  </button>
                  <p>{p.quantity || 1}</p>
                  <button 
                    className="bg-white rounded-full p-1"
                    onClick={() => handleQuantityChange(p.product.id, 1)}
                  >
                    <PlusIcon stroke='black' width={16} height={16}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}