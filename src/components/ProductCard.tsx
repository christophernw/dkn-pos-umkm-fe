"use client"
import React from 'react';

interface Product {
  id: number;
  nama: string;
  foto: string;
  harga_modal: number;
  harga_jual: number;
  stok: number;
  satuan: string;
  kategori: string;
}

interface ProductCardProps {
  product: Product;
  onDelete: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete }) => {
  // Format the image URL
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder-image.jpg';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full mb-4 overflow-hidden">
        {product.foto ? (
          <img 
            src={getImageUrl(product.foto)} 
            alt={product.nama}
            className="h-full w-full object-cover rounded-md"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-lg">{product.nama}</h3>
      <p className="text-gray-600">Kategori: {product.kategori}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="font-medium">Rp{product.harga_jual.toLocaleString()}</span>
        <span className={`px-2 py-1 rounded ${
          product.stok < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {product.stok} {product.satuan}
        </span>
      </div>
      <div className="mt-4 flex justify-between">
        <button 
          onClick={() => window.location.href = `/produk/edit/${product.id}`}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit
        </button>
        <button 
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;