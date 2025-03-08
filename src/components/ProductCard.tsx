"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

interface ProductCardProps {
  id: number;
  nama: string;
  foto: string;
  harga_modal: number;
  harga_jual: number;
  stok: number;
  satuan: string;
  kategori: string;
}

export default function ProductCard() {
  const [data, setData] = useState<ProductCardProps[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:8000/api/produk");
        const result: ProductCardProps[] = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error Fetching Data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className={`max-w-md mx-auto space-y-4 ${data.length === 0 ? "flex justify-center items-center h-60" : ""}`}>
      {data.length > 0 ? (
        data.map((product) => (
          <div key={product.id} className="bg-white rounded-3xl flex overflow-hidden p-3 shadow-sm">
            <div className="w-28 h-28 relative rounded-2xl overflow-hidden mr-3">
              <Image 
                src={product.foto} 
                alt={product.nama} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">{product.nama}</h3>
              <p className="text-gray-500 text-sm mt-2">Harga Jual</p>
              <p className="font-medium text-sm text-blue-700 mt-1">Rp {product.harga_jual} / {product.satuan}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded-lg">Stok : {product.stok}</span>
                <button className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  Perbarui Stok
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-lg">Tidak ada produk tersedia</p>
      )}
    </div>
  )
}
