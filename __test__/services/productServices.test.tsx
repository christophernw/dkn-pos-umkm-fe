import { fetchProduct, updateProduct } from "src/services/productServices";
import fetchMock from "jest-fetch-mock";

// Aktifkan mock untuk fetch
fetchMock.enableMocks();

describe("Product Service", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("fetchProduct should return product data when API call is successful", async () => {
    const mockProduct = { id: "1", name: "Test Product", price: 10000 };
    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));

    const product = await fetchProduct("1");
    expect(product).toEqual(mockProduct);
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/api/produk/1");
  });

  test("fetchProduct should throw an error when API call fails", async () => {
    fetchMock.mockResponseOnce("Not Found", { status: 404 });

    await expect(fetchProduct("999")).rejects.toThrow("Gagal mengambil data produk");
  });

  test("updateProduct should call the correct API endpoint with correct method and data", async () => {
    const mockProductData = { name: "Updated Product", price: 15000 };
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const response = await updateProduct("1", mockProductData);
    expect(response.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/produk/update/1",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockProductData),
      }
    );
  });
});
