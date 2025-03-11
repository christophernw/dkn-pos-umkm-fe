"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProduct, updateProduct } from "@/src/services/productServices";
import { validateProductData } from "@/src/services/validation";
import ConfirmDialog from "@/src/components/ConfirmDialog";

// Definisikan tipe untuk data produk (untuk TypeScript)
interface Product {
  name: string;
  category: string;
  price: string;
  stock: string;
}

export default function EditProductPage({params} : {params : {id:string}}) {
  const router = useRouter();
  const productId = params.id

  const [product, setProduct] = useState<Product>({
    name: "",
    category: "",
    price: "",
    stock: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!productId) return;
    fetchProduct(productId)
      .then((data: Product) => setProduct(data))
      .catch((err: any) => console.error("Error fetching product:", err));
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMessage = validateProductData(product);
    if (errorMessage) {
      alert(errorMessage);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmUpdate = async () => {
    setShowConfirm(false);
    const response = await updateProduct(productId!, product);
    if (response.ok) {
      alert("Produk berhasil diperbarui!");
      router.push("/daftarProduk");
    } else {
      alert("Gagal memperbarui produk");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold">Edit Produk</h1>
      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleConfirmUpdate}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Nama Produk</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Kategori</label>
          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Harga</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Stok</label>
          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
