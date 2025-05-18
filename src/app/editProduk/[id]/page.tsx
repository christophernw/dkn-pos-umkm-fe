"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import config from "@/src/config";
import TextInput from "../../tambahProduk/components/textInput";
import EnhancedDropdown from "@/src/components/elements/modal/EnhancedDropdown";
import Script from "next/script";

// Initial dropdown options
const initialUnitOptions = ["Pcs", "Kg", "Botol", "Liter"];
const initialCategoryOptions = [
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
  const router = useRouter();
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
  const [submitting, setSubmitting] = useState(false);
  
  // State for managing custom options - initialize with default options
  const [categoryOptions, setCategoryOptions] = useState([...initialCategoryOptions]);
  const [unitOptions, setUnitOptions] = useState([...initialUnitOptions]);
  
  // Add state for field validation errors
  const [errors, setErrors] = useState({
    productName: false,
    category: false,
    priceSell: false,
    currentStock: false,
    unit: false,
  });

  // Add effect to fetch categories and units from backend
  useEffect(() => {
    const fetchCategoriesAndUnits = async () => {
      if (!accessToken) return;
      
      try {
        // Fetch categories
        const categoryResponse = await fetch(`${config.apiUrl}/produk/categories`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        if (categoryResponse.ok) {
          const categories = await categoryResponse.json();
          // Merge API categories with initial categories
          if (categories && categories.length > 0) {
            setCategoryOptions(prevOptions => {
              // Create a Set to remove duplicates, then spread back to array
              const mergedOptions = [...new Set([...prevOptions, ...categories])];
              return mergedOptions;
            });
          }
        }
        
        // Fetch units
        const unitResponse = await fetch(`${config.apiUrl}/produk/units`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        if (unitResponse.ok) {
          const units = await unitResponse.json();
          // Merge API units with initial units
          if (units && units.length > 0) {
            setUnitOptions(prevOptions => {
              // Create a Set to remove duplicates, then spread back to array
              const mergedOptions = [...new Set([...prevOptions, ...units])];
              return mergedOptions;
            });
          }
        }
      } catch (error) {
        console.error("Error fetching categories and units:", error);
      }
    };
    
    fetchCategoriesAndUnits();
  }, [accessToken]);

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
          
          // Check if category exists in options, if not add it
          const productCategory = product.kategori || "";
          if (productCategory) {
            setCategory(productCategory);
            setCategoryOptions(prevOptions => {
              if (!prevOptions.includes(productCategory)) {
                return [...prevOptions, productCategory];
              }
              return prevOptions;
            });
          }
          
          setPriceSell(formatHarga(product.harga_jual?.toString()) || "");
          setPriceCost(formatHarga(product.harga_modal?.toString()) || "");
          setCurrentStock(product.stok?.toString() || "");
          
          // Check if unit exists in options, if not add it
          const productUnit = product.satuan || "";
          if (productUnit) {
            setUnit(productUnit);
            setUnitOptions(prevOptions => {
              if (!prevOptions.includes(productUnit)) {
                return [...prevOptions, productUnit];
              }
              return prevOptions;
            });
          }
          
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

  const handleAddCustomCategory = (newCategory: string) => {
    if (!categoryOptions.includes(newCategory)) {
      setCategoryOptions(prevOptions => [...prevOptions, newCategory]);
    }
    setCategory(newCategory);
    
    // Show success message
    showModal(
      "Berhasil",
      `Kategori "${newCategory}" berhasil ditambahkan`,
      "success"
    );
  };

  const handleAddCustomUnit = (newUnit: string) => {
    if (!unitOptions.includes(newUnit)) {
      setUnitOptions(prevOptions => [...prevOptions, newUnit]);
    }
    setUnit(newUnit);
    
    // Show success message
    showModal(
      "Berhasil",
      `Satuan "${newUnit}" berhasil ditambahkan`,
      "success"
    );
  };

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
    setSubmitting(true);

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
      setSubmitting(false);
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
        // Re-sync kategori & satuan toko sebelum redirect
        try {
          const catRes = await fetch(`${config.apiUrl}/produk/categories`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (catRes.ok) {
            const cats = await catRes.json();
            if (cats && cats.length > 0) {
              setCategoryOptions(prevOptions => {
                // Merge new categories with existing ones
                return [...new Set([...prevOptions, ...cats])];
              });
            }
          }

          const unitRes = await fetch(`${config.apiUrl}/produk/units`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (unitRes.ok) {
            const units = await unitRes.json();
            if (units && units.length > 0) {
              setUnitOptions(prevOptions => {
                // Merge new units with existing ones
                return [...new Set([...prevOptions, ...units])];
              });
            }
          }
        } catch (err) {
          console.error("Re-fetch kategori/satuan setelah update gagal:", err);
        }

        // Langsung redirect ke halaman semuaBarang tanpa menampilkan modal
        router.push("/semuaBarang");
      } else {
        const errorData = await response.json();
        showModal(
          "Gagal",
          `Gagal memperbarui produk: ${errorData.message || "Unknown error"}`,
          "error"
        );
        setSubmitting(false);
      }
    } catch (error) {
      showModal("Kesalahan Jaringan", "Silakan coba lagi.", "error");
      setSubmitting(false);
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
    <>
        <Script
        id="maze-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function (m, a, z, e) {
              var s, t;
              try {
                t = m.sessionStorage.getItem('maze-us');
              } catch (err) {}

              if (!t) {
                t = new Date().getTime();
                try {
                  m.sessionStorage.setItem('maze-us', t);
                } catch (err) {}
              }

              s = a.createElement('script');
              s.src = z + '?apiKey=' + e;
              s.async = true;
              a.getElementsByTagName('head')[0].appendChild(s);
              m.mazeUniversalSnippetApiKey = e;
            })(window, document, 'https://snippet.maze.co/maze-universal-loader.js', 'e31b53f6-c7fd-47f2-85df-d3c285f18b33');
          `,
        }}
      />
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

        {/* Enhanced Dropdown for category */}
        <div>
          <EnhancedDropdown
            selected={category}
            options={categoryOptions}
            label="Kategori"
            onSelect={setCategory}
            onAddCustom={handleAddCustomCategory}
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
          onChange={(value) => setPriceSell(value)}
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
          onChange={(value) => {}}
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

        {/* Enhanced Dropdown for unit */}
        <div>
          <EnhancedDropdown
            selected={unit}
            options={unitOptions}
            label="Satuan"
            onSelect={setUnit}
            onAddCustom={handleAddCustomUnit}
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
            disabled={loading || submitting}
          >
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
