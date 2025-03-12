"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProduct, updateProduct } from "@/src/services/productServices";
import { validateProductData } from "@/src/services/validation";
import ConfirmDialog from "@/src/components/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";

// Definisikan tipe untuk data produk (untuk TypeScript)
interface Product {
  nama: string;
  kategori: string;
  harga_modal: string;
  harga_jual: string;
  stok: string;
  foto: string | null;
  satuan: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { accessToken } = useAuth() || { accessToken: "" };
  const [productId, setProductId] = useState<string | null>(null);
  const [product, setProduct] = useState<Product>({
    nama: "",
    kategori: "",
    harga_modal: "",
    harga_jual: "",
    stok: "",
    foto: null,
    satuan: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setProductId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!productId) return;
    if (accessToken) {
      fetchProduct(productId, accessToken)
      .then((data: Product) => setProduct(data))
    } else {
      console.error("Access token is missing");
    }
  }, [productId, accessToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setProduct({ ...product, foto: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMessage = validateProductData({
      price: product.harga_jual,
      stock: product.stok,
    });
    if (errorMessage) {
      alert(errorMessage);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmUpdate = async () => {
    if (!productId || !accessToken) {
      console.error("Product ID or access token is missing");
      return;
    }
    
    setShowConfirm(false);
    const response = await updateProduct(productId!, product, accessToken);
    if (response.ok) {
      alert("Produk berhasil diperbarui!");
      window.location.href="/semuaBarang";
    } else {
      alert("Gagal memperbarui produk");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <header className="flex items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="mr-2 text-gray-600 hover:text-gray-800"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold">Edit Produk</h1>
      </header>
      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleConfirmUpdate}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm space-y-4">
        <div className="flex justify-center">
          <label
            htmlFor="imageUpload"
            className="w-32 h-32 flex items-center justify-center border border-dashed border-gray-300 rounded cursor-pointer"
          >
            {product.foto ? (
              <img
                src={product.foto}
                alt="Product Preview"
                className="object-cover w-full h-full rounded"
              />
            ) : (
              <span className="text-gray-400 text-sm text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mx-auto mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upload
              </span>
            )}
          </label>
          <input
            type="file"
            id="imageUpload"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div>
          <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
            Nama Produk
          </label>
          <input
            id="nama"
            type="text"
            name="nama"
            value={product.nama}
            onChange={handleChange}
            placeholder={product.nama}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="kategori" className="block text-sm font-medium text-gray-700">
            Kategori
          </label>
          <input
            id="kategori"
            type="text"
            name="kategori"
            value={product.kategori}
            onChange={handleChange}
            placeholder={product.kategori}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="harga_jual" className="block text-sm font-medium text-gray-700">
            Harga Jual
          </label>
          <input
            id="harga_jual"
            type="number"
            name="harga_jual"
            value={product.harga_jual}
            onChange={handleChange}
            placeholder={product.harga_jual}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
          
        <div>
          <label htmlFor="harga_modal" className="block text-sm font-medium text-gray-700">
            Harga Modal
          </label>
          <input
            id="harga_modal"
            type="number"
            name="harga_modal"
            value={product.harga_modal}
            onChange={handleChange}
            placeholder={product.harga_modal}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="w-1/3">
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
              Pilih Satuan
            </label>
            <select
              id="unit"
              name="satuan"
              value={product.satuan}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Pcs">Pcs</option>
              <option value="Kg">Kg</option>
              <option value="Botol">Botol</option>
              <option value="Liter">Liter</option>
            </select>
          </div>

          <div>
            <label htmlFor="stok" className="block text-sm font-medium text-gray-700">
              Stok Saat Ini
            </label>
            <input
              id="stok"
              type="number"
              name="stok"
              value={product.stok}
              onChange={handleChange}
              placeholder={product.stok}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
