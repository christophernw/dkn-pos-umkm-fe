"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/src/config";
import TextInput from "../../tambahProduk/components/textInput";

export default function EditProductPage() {
  const { id } = useParams();
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [priceSell, setPriceSell] = useState("");
  const [priceCost, setPriceCost] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [unit, setUnit] = useState("Kg");
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();

  // Fetch product data when component mounts
  useEffect(() => {
    async function fetchProduct() {
      if (!accessToken || !id) return;
      
      try {
        const response = await fetch(`${config.apiUrl}/produk/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const product = await response.json();
          
          // Populate form with existing data
          setProductName(product.nama || "");
          setCategory(product.kategori || "");
          setPriceSell(product.harga_jual?.toString() || "");
          setPriceCost(product.harga_modal?.toString() || "");
          setCurrentStock(product.stok?.toString() || "");
          setUnit(product.satuan || "Kg");
          
          // If product has an image, set the preview
          if (product.foto) {
            setPreviewImg(`${config.apiUrl}${product.foto.slice(4)}`);
          }
        } else {
          console.error("Failed to fetch product");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [id, accessToken]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    const payload = {
      nama: productName,
      kategori: category,
      harga_jual: parseFloat(priceSell),
      harga_modal: parseFloat(priceCost),
      stok: parseFloat(currentStock),
      satuan: unit,
    };

    formData.append("payload", JSON.stringify(payload));

    if (imageFile) {
      formData.append("foto", imageFile);
    }

    try {
      const response = await fetch(`${config.apiUrl}/produk/update/${id}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert("Produk berhasil diperbarui!");
        window.location.href = "/semuaBarang";
      } else {
        const errorData = await response.json();
        console.error("Error updating product:", errorData);
        alert(
          `Gagal memperbarui produk: ${errorData.detail || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 flex justify-center">
        <p>Loading...</p>
      </div>
    );
  }

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

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-4 shadow-sm space-y-4"
        encType="multipart/form-data"
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

        <TextInput
          id="productName"
          label="Nama Produk"
          value={productName}
          onChange={setProductName}
          placeholder="Pie Jeruk"
        />

        <TextInput
          id="category"
          label="Kategori"
          value={category}
          onChange={setCategory}
          placeholder="Makanan"
        />

        <TextInput
          id="priceSell"
          label="Harga Jual"
          value={priceSell}
          onChange={setPriceSell}
          placeholder="Rp 13.000"
          type="number"
        />

        <TextInput
          id="priceCost"
          label="Harga Modal"
          value={priceCost}
          onChange={setPriceCost}
          placeholder="Rp 9.000"
          type="number"
        />

        <div className="flex items-center justify-between space-x-4">
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

          <div className="w-2/3">
            <TextInput
              id="currentStock"
              label="Stok Saat Ini"
              value={currentStock}
              onChange={setCurrentStock}
              placeholder="450"
              type="number"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}