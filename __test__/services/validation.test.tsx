import { validateProductData } from "src/services/validation";

describe("validateProductData", () => {
  test("should return null for valid product data", () => {
    const result = validateProductData({ price: 1500, stock: 10 });
    expect(result).toBeNull();
  });

  test("should return error for price less than 1000", () => {
    const result = validateProductData({ price: 500, stock: 10 });
    expect(result).toBe("Harga harus minimal Rp 1000 dan berupa angka");
  });

  test("should return error for non-numeric price", () => {
    const result = validateProductData({ price: "abc", stock: 10 });
    expect(result).toBe("Harga harus minimal Rp 1000 dan berupa angka");
  });

  test("should return error for negative stock", () => {
    const result = validateProductData({ price: 1500, stock: -5 });
    expect(result).toBe("Stok tidak boleh negatif dan harus berupa angka");
  });

  test("should return error for non-numeric stock", () => {
    const result = validateProductData({ price: 1500, stock: "xyz" });
    expect(result).toBe("Stok tidak boleh negatif dan harus berupa angka");
  });
});