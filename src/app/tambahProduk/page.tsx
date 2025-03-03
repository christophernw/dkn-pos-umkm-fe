"use client";
import { useState, ChangeEvent, FormEvent } from "react";

export default function AddProductPage() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [priceSell, setPriceSell] = useState("");
  const [priceCost, setPriceCost] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [unit, setUnit] = useState("Kg");
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const productData = {
      productName,
      category,
      priceSell,
      priceCost,
      currentStock,
      minimumStock,
      unit,

    };
    console.log("Product Data:", productData);
    alert("Product submitted!");
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
        <h1 className="text-xl font-semibold">Tambah Produk Baru</h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-4 shadow-sm space-y-4"
      >
        {/* Placeholder/gambar */}
        <div className="flex justify-center">
          <label
            htmlFor="imageUpload"
            className="w-32 h-32 flex items-center justify-center border border-dashed border-gray-300 rounded cursor-pointer"
          >
            {previewImg ? (
              <img
                src={previewImg}
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

        {/* Nama Produk */}
        <div>
          <label
            htmlFor="productName"
            className="block text-sm font-medium text-gray-700"
          >
            Nama Produk
          </label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Pie Jeruk"
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Kategori */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Kategori
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Makanan"
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Harga Jual */}
        <div>
          <label
            htmlFor="priceSell"
            className="block text-sm font-medium text-gray-700"
          >
            Harga Jual
          </label>
          <input
            id="priceSell"
            type="number"
            value={priceSell}
            onChange={(e) => setPriceSell(e.target.value)}
            placeholder="Rp 13.000"
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Harga Modal */}
        <div>
          <label
            htmlFor="priceCost"
            className="block text-sm font-medium text-gray-700"
          >
            Harga Modal
          </label>
          <input
            id="priceCost"
            type="number"
            value={priceCost}
            onChange={(e) => setPriceCost(e.target.value)}
            placeholder="Rp 9.000"
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Satuan (Unit) dan Stok */}
        <div className="flex items-center justify-between space-x-4">
          {/* Pilih Satuan */}
          <div className="w-1/3">
            <label
              htmlFor="unit"
              className="block text-sm font-medium text-gray-700"
            >
              Pilih Satuan
            </label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Pcs">Pcs</option>
              <option value="Kg">Kg</option>
              <option value="Botol">Botol</option>
              <option value="Liter">Liter</option>
            </select>
          </div>

          {/* Stok Saat Ini */}
          <div className="w-1/3">
            <label
              htmlFor="currentStock"
              className="block text-sm font-medium text-gray-700"
            >
              Stok Saat Ini
            </label>
            <input
              id="currentStock"
              type="number"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              placeholder="450"
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Stok Minimum */}
          <div className="w-1/3">
            <label
              htmlFor="minimumStock"
              className="block text-sm font-medium text-gray-700"
            >
              Stok Minimum
            </label>
            <input
              id="minimumStock"
              type="number"
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
              placeholder="10"
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tombol Submit */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Lanjut
          </button>
        </div>
      </form>
    </div>
  );
}
