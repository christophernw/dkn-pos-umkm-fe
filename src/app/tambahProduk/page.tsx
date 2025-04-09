"use client";
import { useState, ChangeEvent } from "react";
import TextInput from "./components/textInput";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/src/config";

export default function AddProductPage() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [priceSell, setPriceSell] = useState("");
  const [priceCost, setPriceCost] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [unit, setUnit] = useState("Kg");
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSizeMB = 3;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert("Format file tidak didukung! Silakan unggah PNG, JPG, atau JPEG.");
      return;
    }

    if (file.size > maxSizeBytes) {
      alert(`Ukuran file terlalu besar! Maksimal ${maxSizeMB}MB.`);
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

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
      const response = await fetch(`${config.apiUrl}/produk/create`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 201) {
        alert("Produk berhasil ditambahkan!");
        window.location.href = "/semuaBarang";
      } else {
        const errorData = await response.json();
        console.error("Error creating product:", errorData);
        alert(
          `Gagal menambahkan produk: ${errorData.detail || "Unknown error"}`
        );
      }
    } catch (error) {
      console.log(error);
      console.error("Network error:", error);
      alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mt-8">
      <header className="flex items-center mb-5">
        <button
          onClick={() => window.history.back()}
          className="bg-white hover:bg-gray-200 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2"
        >
          <svg
            className="w-4 h-4 transform scale-x-[-1]"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Tambah Produk Baru</h1>
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

        {/* Rest of the form remains the same */}
        <TextInput
          id="productName"
          label="Nama Produk"
          value={productName}
          onChange={(value) => setProductName(value)}
          placeholder="Pie Jeruk"
        />

        {/* Other fields remain the same... */}

        <TextInput
          id="category"
          label="Kategori"
          value={category}
          onChange={(value) => setCategory(value)}
          placeholder="Makanan"
        />

        <TextInput
          id="priceSell"
          label="Harga Jual"
          value={priceSell}
          onChange={(_, raw) => setPriceSell(raw)}
          placeholder="13.000"
          type="number"
          currency
        />

        <TextInput
          id="priceCost"
          label="Harga Modal"
          value={priceCost}
          onChange={(_, raw) => setPriceCost(raw)}
          placeholder="9.000"
          type="number"
          currency
        />

        <TextInput
          id="currentStock"
          label="Stok"
          value={currentStock}
          onChange={setCurrentStock}
          placeholder="450"
          type="number"
        />

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

        {/* Tombol Submit */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Menambahkan Produk..." : "Lanjut"}
          </button>
        </div>
      </form>
    </div>
  );
}
