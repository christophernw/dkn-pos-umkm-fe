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

  async function handleDelete (id: number) {
    const isConfirmed = window.confirm("Are you sure you want to delete this product?");
    
    if (!isConfirmed) return; 
    try {
      const response = await fetch(`http://localhost:8000/api/produk/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setData((prevData) => prevData.filter((product) => product.id !== id));
      } else {
        console.error("Failed deleting produk");
      }
    } catch (error) {
      console.error("Error deleting produk:", error);
    }
  };

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
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-base">{product.nama}</h3>
                <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDelete(product.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" x2="10" y1="11" y2="17"/>
                  <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
              </button>
              </div>
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
