// services/productService.ts
export async function fetchProduct(productId: string) {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error("Gagal mengambil data produk");
    }
    return response.json();
  }
  
  export async function updateProduct(productId: string, productData: any) {
    return await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
  }
  