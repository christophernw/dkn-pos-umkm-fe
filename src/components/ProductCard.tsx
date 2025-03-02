"use client"

import Image from "next/image"

interface ProductCardProps {
  id: number
  name: string
  price: number
  stock: number
  image: string
}

export default function ProductCard() {
  const products: ProductCardProps[] = [
    {
      id: 1,
      name: "Roti Gandum",
      price: 15000,
      stock: 450,
      image: "https://img.freepik.com/free-photo/front-view-baked-bread-slices-grey-cloth_23-2148361603.jpg",
    },
    {
      id: 2,
      name: "Kue Apem",
      price: 25000,
      stock: 330,
      image: "https://img.freepik.com/premium-photo/lemon-muffins-with-blueberries-shtreisel-with-fresh-berries-white-wooden-background_114420-1227.jpg",
    },
  ]

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString()}/Pcs`
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-3xl flex overflow-hidden p-3 shadow-sm">
          <div className="w-28 h-28 relative rounded-2xl overflow-hidden mr-3">
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base">{product.name}</h3>
            <p className="text-gray-500 text-sm mt-2">Harga Jual</p>
            <p className="font-medium text-sm text-blue-700 mt-1">{formatPrice(product.price)}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded-lg">Stok : {product.stock}</span>
              <button className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                Perbarui Stok
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
