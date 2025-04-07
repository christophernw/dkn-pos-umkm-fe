"use client"  

import React from 'react'
import { Header } from './module-element/Header'
import { CoinIcon } from '@/public/icons/CoinIcon'
import BarangSection from './module-element/BarangSection'
import TotalSummarySection from './module-element/TotalSummarySection'
import { PilihBarangModal } from './module-element/PilihBarangModal'
import { SelectedProduct } from './types/selectedProduct'
import { CreateTransactionRequest } from './types/transaction'
import { TransactionService } from './service/transactionService'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { BoxIcon } from '@/public/icons/BoxIcon'


export default function TambahPemasukanPage() {
  const { accessToken } = useAuth()
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [transaction, setTransaction] = React.useState<CreateTransactionRequest>({
    transaction_type: 'pemasukan',
    category: 'Penjualan Barang',
    total_amount: 0,
    total_modal: 0,
    amount: 0,
    status: 'Lunas',
    items: []
  })

  const [selectedProducts, setSelectedProducts] = React.useState<SelectedProduct[]>([])

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const updatedProducts = selectedProducts.map(p =>
      p.product.id === productId ? { ...p, quantity: newQuantity } : p
    )
    setSelectedProducts(updatedProducts)
    updateTransactionItems(updatedProducts)
  }

  const updateTransactionItems = (selectedProducts: SelectedProduct[]) => {
    const items = selectedProducts.map(product => ({
      product_id: product.product.id,
      quantity: product.quantity,
      harga_jual_saat_transaksi: product.product.harga_jual,
      harga_modal_saat_transaksi: product.product.harga_modal
    }))

    const total_amount = selectedProducts.reduce(
      (sum, product) => sum + (product.product.harga_jual * product.quantity),
      0
    )
    
    const total_modal = selectedProducts.reduce(
      (sum, product) => sum + (product.product.harga_modal * product.quantity),
      0
    )

    setTransaction(prev => ({
      ...prev,
      items,
      total_amount,
      total_modal,
      amount: total_amount
    }))
  }
  
  const handleSelectProduct = (products: SelectedProduct[]) => {
    setSelectedProducts(products)
    updateTransactionItems(products)
  }

  const handleSubmit = async () => {
    if (transaction.items.length === 0) {
      alert('Pilih minimal satu barang')
      return
    }

    setIsLoading(true)
    
    try {
      await TransactionService.createTransaction(transaction, accessToken || '')
      setIsOpen(false)
      alert('Transaksi berhasil disimpan!')
      
      setSelectedProducts([])
      setTransaction({
        transaction_type: 'pemasukan',
        category: 'Penjualan Barang',
        total_amount: 0,
        total_modal: 0,
        amount: 0,
        status: 'Selesai',
        items: []
      })
      router.push('/transaksi');
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Gagal menyimpan transaksi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-h-screen overflow-hidden flex flex-col gap-4">
      <Header/>
      <div className="flex flex-col gap-2 px-3 -mt-4">
        <div className="flex justify-between gap-3">
          <div className="bg-green-100 text-green-700 p-3 rounded-full flex flex-col gap-3 w-full">
            <div className="flex items-center gap-2">
                <div className="bg-primary-blue p-3 rounded-full">
                  <CoinIcon />
                </div>
                <p>Pemasukan</p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-full flex flex-col gap-3 w-full">
            <div className="flex items-center gap-2">
                <div className="bg-primary-blue p-3 rounded-full">
                  <BoxIcon />
                </div>
                <p>Pengeluaran</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-full flex flex-col gap-3 w-full">
          <div className="flex items-center gap-2">
              <div className="bg-primary-blue p-3 rounded-full">
                <CoinIcon />
              </div>
              <p>Penjualan Barang</p>
          </div>
        </div>
      </div>
      <div className="bg-[#F8FAFE] px-3 rounded-t-2xl flex flex-col gap-3 pb-24">
        <div className="flex justify-between pt-3">
          <p className="font-medium">Barang</p>
          <div className="bg-primary-blue px-3 rounded-full border border-primary-indigo flex items-center" onClick={() => setIsOpen(true)}>
            <p className="text-primary-indigo text-[9px]">Ubah/Tambah Barang</p>
          </div>
        </div>
        <BarangSection selectedProducts={selectedProducts} onQuantityChange={handleQuantityChange}/>
        <TotalSummarySection selectedProducts={selectedProducts} 
                              status={transaction.status as 'Lunas' | 'Belum Lunas'}
                              onStatusChange={(newStatus) => setTransaction(prev => ({
                                ...prev,
                                status: newStatus
                            }))}/>
        <button className="bg-primary-indigo rounded-full p-3 flex justify-center" onClick={handleSubmit} disabled={isLoading}>
          <p className="text-white">Simpan</p>
        </button>
      </div>
      <PilihBarangModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedProducts={selectedProducts}
        setSelectedProducts={handleSelectProduct}
      />
    </div>
  )
}
