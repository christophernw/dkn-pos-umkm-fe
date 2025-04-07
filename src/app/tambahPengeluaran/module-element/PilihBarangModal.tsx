"use client"
import { useAuth } from '@/contexts/AuthContext'
import config from '@/src/config'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Product, ProductListResponse } from '../types/product'
import { SelectedProduct } from '../types/selectedProduct'


interface Props {
  isOpen: boolean
  onClose: () => void
  selectedProducts: SelectedProduct[]
  setSelectedProducts: (products: SelectedProduct[]) => void
}

export const PilihBarangModal = ({
  isOpen,
  onClose,
  selectedProducts,
  setSelectedProducts
}: Props) => {
  const { accessToken } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [searchInput, setSearchInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`${config.apiUrl}/produk`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ProductListResponse = await response.json()
        setProducts(data.items || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
        console.error("Fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchProducts()
    }
  }, [accessToken, isOpen])

  const handleSelectProduct = (product: Product) => {
    const isSelected = selectedProducts.some(p => p.product.id === product.id);
    
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p.product.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, { product, quantity: 1 }])
  };

  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Pilih Barang</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <input
            type="text"
            placeholder="Cari barang..."
            className="w-full mt-2 p-2 border rounded"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="p-4 text-center">Memuat...</div>
        ) : error ? (
          <div className="p-4 text-red-500 text-center">{error}</div>
        ) : (
          <div className="divide-y">
            {products
              .filter(product => 
                product.nama.toLowerCase().includes(searchInput.toLowerCase())
              )
              .map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-16 h-16 relative rounded-md overflow-hidden">
                      <Image
                        src={
                            product.foto
                            ? `${config.apiUrl}${product.foto.slice(4)}`
                            : "/images/placeholder.svg"
                        }
                        alt={product.nama}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.nama}</p>
                      <p className="text-sm text-gray-600">
                        Rp {product.harga_jual.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedProducts.some(p => p.product.id === product.id)
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                    onClick={() => handleSelectProduct(product)}
                  >
                    {selectedProducts.some(p => p.product.id === product.id) ? 'Hapus' : 'Pilih'}
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}