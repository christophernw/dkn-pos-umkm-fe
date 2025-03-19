// services/validation.ts
export interface ProductData {
    price: number;
    stock: number;
  }
  
  export function validateProductData(product: { price: number | string; stock: number | string }): string | null {
    const price = Number(product.price);
    const stock = Number(product.stock);
    if (isNaN(price) || price < 1000) {
      return "Harga harus minimal Rp 1000 dan berupa angka";
    }
    if (isNaN(stock) || stock < 0) {
      return "Stok tidak boleh negatif dan harus berupa angka";
    }
    return null;
  }