import config from "../config";

// services/productService.ts
export async function fetchProduct(productId: string, accessToken: string) {
  const response = await fetch(`${config.apiUrl}/produk/${productId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Gagal mengambil data produk");
  }
  return response.json();
}

export async function updateProduct(productId: string, productData: any, accessToken: string) {
  return await fetch(`${config.apiUrl}/produk/update/${productId}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(productData),
  });
}