"use client";
import { useState, ChangeEvent } from "react";
import { ChevronDown, Check } from "lucide-react";
import TextInput from "./components/textInput";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/src/config";
import { useModal } from "@/contexts/ModalContext";

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

function Dropdown({
  selected,
  options,
  label,
  onSelect,
}: {
  selected: string;
  options: string[];
  label: string;
  onSelect: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {selected || `${label}`}
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                selected === option ? "bg-gray-100 font-semibold" : ""
              }`}
            >
              {option}
              {selected === option && <Check className="w-4 h-4" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AddProductPage() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [priceSell, setPriceSell] = useState("");
  const [priceCost, setPriceCost] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [unit, setUnit] = useState("");
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  // Add state for field errors
  const [errors, setErrors] = useState({
    productName: false,
    category: false,
    priceSell: false,
    priceCost: false,
    currentStock: false,
    unit: false,
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSizeMB = 3;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      showModal(
        "Format Tidak Didukung",
        "Silakan unggah PNG, JPG, atau JPEG.",
        "error"
      );
      return;
    }

    if (file.size > maxSizeBytes) {
      showModal(
        "File Terlalu Besar",
        `Ukuran file terlalu besar! Maksimal ${maxSizeMB}MB.`,
        "error"
      );
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

    // Validate fields
    const newErrors = {
      productName: !productName.trim(),
      category: !category.trim(),
      priceSell: !priceSell.trim(),
      priceCost: !priceCost.trim(),
      currentStock: !currentStock.trim(),
      unit: !unit.trim(), // Add unit validation
    };

    setErrors(newErrors);

    // Check if any errors exist
    if (Object.values(newErrors).some((error) => error)) {
      return; // Stop submission if there are errors
    }

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
    if (imageFile) formData.append("foto", imageFile);

    try {
      const response = await fetch(`${config.apiUrl}/produk/create`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 201) {
        showModal("Berhasil", "Produk berhasil ditambahkan!", "success", {
          label: "Lihat Semua Produk",
          onClick: () => {
            window.location.href = "/semuaBarang";
          },
        });
      } else {
        const errorData = await response.json();
        console.error("Error creating product:", errorData);
        showModal(
          "Gagal",
          `Gagal menambahkan produk: ${errorData.detail || "Unknown error"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      showModal(
        "Kesalahan Jaringan",
        "Terjadi kesalahan jaringan. Silakan coba lagi.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <header className="flex items-center mb-4">
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
          onChange={(value) => setProductName(value)}
          placeholder="Pie Jeruk"
          error={errors.productName}
          errorMessage="Nama produk tidak boleh kosong"
        />

        {/* Replace TextInput with Dropdown for category */}
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
          onChange={(_, raw) => setPriceCost(raw)}
          placeholder="9.000"
          type="number"
          currency
          error={errors.priceCost}
          errorMessage="Harga modal tidak boleh kosong"
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
            label="Satuan"
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
            {loading ? "Menambahkan Produk..." : "Lanjut"}
          </button>
        </div>
      </form>
    </div>
  );
}
