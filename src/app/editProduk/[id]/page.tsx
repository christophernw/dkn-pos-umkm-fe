"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import config from "@/src/config";
import { ChevronDown, Check } from "lucide-react";
import TextInput from "../../tambahProduk/components/textInput";
import Dropdown from "@/src/components/Dropdown";

// Dropdown Options
const unitOptions = ["Pcs", "Kg", "Botol", "Liter"];
const categoryOptions = [
  "Sembako",
  "Perawatan Diri",
  "Pakaian & Aksesori",
  "Peralatan Rumah Tangga",
  "Makanan & Minuman",
  "Lainnya",
];

function formatHarga(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function EditProductPage() {
  const { id } = useParams();
  const { showModal } = useModal();
  const { accessToken } = useAuth();
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [priceSell, setPriceSell] = useState("");
  const [priceCost, setPriceCost] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [unit, setUnit] = useState("");
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Add state for field validation errors
  const [errors, setErrors] = useState({
    productName: false,
    category: false,
    priceSell: false,
    currentStock: false,
    unit: false,
  });

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
          setProductName(product.nama || "");
          setCategory(product.kategori || "");
          setPriceSell(formatHarga(product.harga_jual?.toString()) || "");
          setPriceCost(formatHarga(product.harga_modal?.toString()) || "");
          setCurrentStock(product.stok?.toString() || "");
          setUnit(product.satuan || "Kg");
          if (product.foto) {
            setPreviewImg(`${config.apiUrl}${product.foto.slice(4)}`);
          }
        } else {
          showModal("Error", "Gagal mengambil data produk", "error");
        }
      } catch (error) {
        showModal("Error", "Terjadi kesalahan saat mengambil data", "error");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, accessToken, showModal]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSizeMB = 3;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      showModal(
        "Format Tidak Didukung",
        "Gunakan PNG, JPG, atau JPEG",
        "error"
      );
      return;
    }

    if (file.size > maxSizeBytes) {
      showModal("File Terlalu Besar", `Maksimal ${maxSizeMB}MB.`, "error");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewImg(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields before submission
    const newErrors = {
      productName: !productName.trim(),
      category: !category.trim(),
      priceSell: !priceSell.trim(),
      currentStock: !currentStock.trim(),
      unit: !unit.trim(),
    };

    setErrors(newErrors);

    // Check if any errors exist
    if (Object.values(newErrors).some((error) => error)) {
      return; // Stop submission if there are errors
    }

    const formData = new FormData();
    const payload: Record<string, any> = {};
    if (productName) payload.nama = productName;
    if (category) payload.kategori = category;
    if (priceSell)
      payload.harga_jual = parseFloat(priceSell.replace(/\./g, ""));
    if (priceCost)
      payload.harga_modal = parseFloat(priceCost.replace(/\./g, ""));
    if (currentStock) payload.stok = parseFloat(currentStock);
    if (unit) payload.satuan = unit;

    formData.append("payload", JSON.stringify(payload));
    if (imageFile) formData.append("foto", imageFile);

    try {
      const response = await fetch(`${config.apiUrl}/produk/update/${id}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        showModal("Berhasil", "Produk berhasil diperbarui!", "success", {
          label: "Lihat Semua Produk",
          onClick: () => (window.location.href = "/semuaBarang"),
        });
      } else {
        const errorData = await response.json();
        showModal(
          "Gagal",
          `Gagal memperbarui produk: ${errorData.message || "Unknown error"}`,
          "error"
        );
      }
    } catch (error) {
      showModal("Kesalahan Jaringan", "Silakan coba lagi.", "error");
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
          className="bg-white hover:bg-gray-200 font-medium rounded-full text-sm p-2.5 inline-flex items-center me-2"
        >
          <svg
            className="w-4 h-4 transform scale-x-[-1]"
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
        <h1 className="text-xl font-semibold">Edit Produk</h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-4 shadow-sm space-y-4"
        encType="multipart/form-data"
      >
        {/* Gambar */}
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
          error={errors.productName}
          errorMessage="Nama produk tidak boleh kosong"
        />

        <div>
          <Dropdown
            selected={category}
            options={categoryOptions}
            label="Kategori"
            onSelect={setCategory}
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              Kategori tidak boleh kosong
            </p>
          )}
        </div>

        <TextInput
          id="priceSell"
          label="Harga Jual"
          value={priceSell}
          onChange={(_, raw) => setPriceSell(raw)}
          placeholder="13.000"
          type="number"
          currency
          error={errors.priceSell}
          errorMessage="Harga jual tidak boleh kosong"
        />

        <TextInput
          id="priceCost"
          label="Harga Modal"
          value={priceCost}
          onChange={() => {}}
          placeholder="9.000"
          type="number"
          currency
          disabled
        />

        <TextInput
          id="currentStock"
          label="Stok"
          value={currentStock}
          onChange={setCurrentStock}
          placeholder="450"
          type="number"
          error={errors.currentStock}
          errorMessage="Stok tidak boleh kosong"
        />

        <div>
          <Dropdown
            selected={unit}
            options={unitOptions}
            label="Pilih Satuan"
            onSelect={setUnit}
          />
          {errors.unit && (
            <p className="mt-1 text-sm text-red-600">
              Satuan tidak boleh kosong
            </p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
