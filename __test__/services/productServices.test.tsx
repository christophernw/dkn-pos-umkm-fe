import { fetchProduct, updateProduct } from "../../src/app/services/productServices";
import fetchMock from "jest-fetch-mock";
import config from "@/src/config";

fetchMock.enableMocks();

describe("Product Service", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("fetchProduct should return product data when API call is successful", async () => {
    const mockProduct = { id: "1", name: "Test Product", price: 10000 };
    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));

    const product = await fetchProduct("1", "your-access-token");

    expect(product).toEqual(mockProduct);
    expect(fetchMock).toHaveBeenCalledWith(`${config.apiUrl}/produk/1`, {
      method: "GET",
      headers: {
        Authorization: "Bearer your-access-token",
      },
    });
  });

  test("fetchProduct should throw an error when API call fails", async () => {
    fetchMock.mockResponseOnce("Not Found", { status: 404 });

    await expect(fetchProduct("999", "your-access-token")).rejects.toThrow(
      "Gagal mengambil data produk"
    );
  });

  test("updateProduct should call the correct API endpoint with correct method and data", async () => {
    const mockProductData = { name: "Updated Product", price: 15000 };
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const response = await updateProduct("1", mockProductData, "your-access-token");

    expect(response.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      `${config.apiUrl}/produk/update/1`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your-access-token",
        },
        body: JSON.stringify(mockProductData),
      }
    );
  });
});