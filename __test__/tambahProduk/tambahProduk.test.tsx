import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddProductPage from "../../src/app/tambahProduk/page";
import config from "@/src/config";

const mockedUseAuth = {
  user: { name: "John Doe" },
  accessToken: "dummy-token",
};
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => mockedUseAuth),
}));

describe("AddProductPage", () => {
  const mockHistoryBack = jest.fn();
  beforeAll(() => {
    window.history.back = mockHistoryBack;
  });

  beforeEach(() => {
    window.alert = jest.fn();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("menampilkan semua input dan tombol yang diharapkan", () => {
    render(<AddProductPage />);

    expect(screen.getByText("Tambah Produk Baru")).toBeInTheDocument();
    expect(screen.getByLabelText(/nama produk/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kategori/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/harga jual/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/harga modal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pilih satuan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stok saat ini/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stok minimum/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lanjut/i })).toBeInTheDocument();
  });

  it("menampilkan placeholder upload jika previewImg masih null", () => {
    render(<AddProductPage />);
    expect(screen.getByText("Upload")).toBeInTheDocument();
  });

  it("dapat mengisi input teks", () => {
    render(<AddProductPage />);
    const productNameInput = screen.getByLabelText(/nama produk/i) as HTMLInputElement;
    const categoryInput = screen.getByLabelText(/kategori/i) as HTMLInputElement;
    const priceSellInput = screen.getByLabelText(/harga jual/i) as HTMLInputElement;
    const priceCostInput = screen.getByLabelText(/harga modal/i) as HTMLInputElement;
    const currentStockInput = screen.getByLabelText(/stok saat ini/i) as HTMLInputElement;
    const minimumStockInput = screen.getByLabelText(/stok minimum/i) as HTMLInputElement;

    fireEvent.change(productNameInput, { target: { value: "Pie Jeruk" } });
    fireEvent.change(categoryInput, { target: { value: "Makanan" } });
    fireEvent.change(priceSellInput, { target: { value: "13000" } });
    fireEvent.change(priceCostInput, { target: { value: "9000" } });
    fireEvent.change(currentStockInput, { target: { value: "450" } });
    fireEvent.change(minimumStockInput, { target: { value: "10" } });

    expect(productNameInput.value).toBe("Pie Jeruk");
    expect(categoryInput.value).toBe("Makanan");
    expect(priceSellInput.value).toBe("13000");
    expect(priceCostInput.value).toBe("9000");
    expect(currentStockInput.value).toBe("450");
    expect(minimumStockInput.value).toBe("10");
  });

  it("bisa memilih satuan yang berbeda", () => {
    render(<AddProductPage />);
    const selectUnit = screen.getByLabelText(/pilih satuan/i) as HTMLSelectElement;
    expect(selectUnit.value).toBe("Kg");
    fireEvent.change(selectUnit, { target: { value: "Pcs" } });
    expect(selectUnit.value).toBe("Pcs");

    fireEvent.change(selectUnit, { target: { value: "Botol" } });
    expect(selectUnit.value).toBe("Botol");
  });

  it("memanggil window.history.back saat tombol back ditekan", () => {
    render(<AddProductPage />);
    const backButton = screen.getByText("←");

    fireEvent.click(backButton);
    expect(mockHistoryBack).toHaveBeenCalled();
  });

  it("tidak crash ketika file gambar tidak dipilih (null files)", () => {
    render(<AddProductPage />);
    const fileInput = screen.getByLabelText("Upload") as HTMLInputElement;
    
    fireEvent.change(fileInput, { target: { files: null } });
  });

  it("menghandle upload gambar dengan benar dan menampilkan preview", async () => {
    render(<AddProductPage />);
    const fileInput = screen.getByLabelText("Upload") as HTMLInputElement;

    const mockFile = new File(["(⌐□_□)"], "pie.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByAltText("Product Preview")).toBeInTheDocument();
    });
  });

  it("mensubmit data form dengan benar", () => {
    render(<AddProductPage />);
    const productNameInput = screen.getByLabelText(/nama produk/i) as HTMLInputElement;
    const categoryInput = screen.getByLabelText(/kategori/i) as HTMLInputElement;
    const priceSellInput = screen.getByLabelText(/harga jual/i) as HTMLInputElement;
    const priceCostInput = screen.getByLabelText(/harga modal/i) as HTMLInputElement;
    const currentStockInput = screen.getByLabelText(/stok saat ini/i) as HTMLInputElement;
    const minimumStockInput = screen.getByLabelText(/stok minimum/i) as HTMLInputElement;
    const selectUnit = screen.getByLabelText(/pilih satuan/i) as HTMLSelectElement;

    fireEvent.change(productNameInput, { target: { value: "Pie Jeruk" } });
    fireEvent.change(categoryInput, { target: { value: "Makanan" } });
    fireEvent.change(priceSellInput, { target: { value: "13000" } });
    fireEvent.change(priceCostInput, { target: { value: "9000" } });
    fireEvent.change(currentStockInput, { target: { value: "450" } });
    fireEvent.change(minimumStockInput, { target: { value: "10" } });
    fireEvent.change(selectUnit, { target: { value: "Botol" } });

    const submitButton = screen.getByRole("button", { name: /lanjut/i });
    fireEvent.click(submitButton);
  });

  it("mengubah nilai negatif menjadi 0 untuk input number", () => {
    render(<AddProductPage />);
    const minimumStockInput = screen.getByLabelText(/stok minimum/i) as HTMLInputElement;

    fireEvent.change(minimumStockInput, { target: { value: "-5" } });
    expect(minimumStockInput.value).toBe("0");
  });

  it("membiarkan input string non-numerik (parseFloat -> NaN) tanpa perubahan", () => {
    render(<AddProductPage />);
    const priceSellInput = screen.getByLabelText(/harga jual/i) as HTMLInputElement;
    fireEvent.change(priceSellInput, { target: { value: "abc" } });
    expect(priceSellInput.value).toBe("abc");
  });
});

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => mockedUseAuth),
}));

// Mock window.location
const mockLocationHref = jest.fn();
Object.defineProperty(window, 'location', {
  value: { href: mockLocationHref },
  writable: true
});

describe("AddProductPage handleSubmit functionality", () => {
  let originalFetch: any;
  let mockFetch: jest.Mock;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  beforeEach(() => {
    window.alert = jest.fn();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("should append image file to FormData when available", async () => {
    // Mock successful fetch response
    mockFetch.mockResolvedValueOnce({
      status: 201,
      json: jest.fn().mockResolvedValueOnce({ message: "Product created" }),
    });

    render(<AddProductPage />);
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/nama produk/i), { target: { value: "Test Product" } });
    fireEvent.change(screen.getByLabelText(/kategori/i), { target: { value: "Test Category" } });
    fireEvent.change(screen.getByLabelText(/harga jual/i), { target: { value: "10000" } });
    fireEvent.change(screen.getByLabelText(/harga modal/i), { target: { value: "5000" } });
    fireEvent.change(screen.getByLabelText(/stok saat ini/i), { target: { value: "100" } });
    
    // Upload an image
    const mockFile = new File(["test image content"], "test.png", { type: "image/png" });
    const fileInput = screen.getByLabelText("Upload") as HTMLInputElement;
    
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    
    // Wait for image preview to appear
    await waitFor(() => {
      expect(screen.getByAltText("Product Preview")).toBeInTheDocument();
    });
    
    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: /lanjut/i }));
    
    // Wait for fetch to be called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    
    // Verify fetch was called with correct arguments
    expect(mockFetch).toHaveBeenCalledWith(
      `${config.apiUrl}/produk/create`,
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: `Bearer ${mockedUseAuth.accessToken}`,
        },
      })
    );
    
    // Verify FormData construction (indirectly through fetch call)
    const fetchCall = mockFetch.mock.calls[0];
    const formData = fetchCall[1].body;
    
    // FormData can't be easily inspected directly, so we check that it's an instance of FormData
    expect(formData instanceof FormData).toBe(true);
    
    // Verify success path redirect
    expect(window.alert).toHaveBeenCalledWith("Produk berhasil ditambahkan!");
    expect(window.location.href).toBe("/semuaBarang");
  });

  it("should submit form without image when no image is uploaded", async () => {
    // Mock successful fetch response
    mockFetch.mockResolvedValueOnce({
      status: 201,
      json: jest.fn().mockResolvedValueOnce({ message: "Product created" }),
    });

    render(<AddProductPage />);
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/nama produk/i), { target: { value: "Test Product" } });
    fireEvent.change(screen.getByLabelText(/kategori/i), { target: { value: "Test Category" } });
    fireEvent.change(screen.getByLabelText(/harga jual/i), { target: { value: "10000" } });
    fireEvent.change(screen.getByLabelText(/harga modal/i), { target: { value: "5000" } });
    fireEvent.change(screen.getByLabelText(/stok saat ini/i), { target: { value: "100" } });
    
    // Submit without uploading an image
    fireEvent.click(screen.getByRole("button", { name: /lanjut/i }));
    
    // Wait for fetch to be called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    
    // Verify upload placeholder is still present (no image preview)
    expect(screen.getByText("Upload")).toBeInTheDocument();
  });

  it("should reject non-image files (e.g., PDF) and alert the user", () => {
    render(<AddProductPage />);
    const fileInput = screen.getByLabelText("Upload") as HTMLInputElement;
    const pdfFile = new File(["dummy content"], "test.pdf", { type: "application/pdf" });
    window.alert = jest.fn();
    fireEvent.change(fileInput, { target: { files: [pdfFile] } });
    expect(window.alert).toHaveBeenCalledWith("Format file tidak didukung! Silakan unggah PNG, JPG, atau JPEG.");
    // Verify that no preview image is shown
    expect(screen.queryByAltText("Product Preview")).toBeNull();
  });

  it("should handle error response from server with missing error detail", async () => {
    // Simulate an error response with status not equal to 201 and no 'detail' property
    mockFetch.mockResolvedValueOnce({
      status: 400,
      json: jest.fn().mockResolvedValueOnce({}),
    });
    
    render(<AddProductPage />);
    
    // Fill minimal required data
    fireEvent.change(screen.getByLabelText(/nama produk/i), { target: { value: "Test Product" } });
    
    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /lanjut/i }));
    
    // Wait for fetch to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    
    // Verify that the fallback message "Unknown error" is used
    expect(window.alert).toHaveBeenCalledWith("Gagal menambahkan produk: Unknown error");
  });  

  it("should handle error response from server", async () => {
    // Mock error fetch response
    const errorMessage = "Invalid product data";
    mockFetch.mockResolvedValueOnce({
      status: 400,
      json: jest.fn().mockResolvedValueOnce({ detail: errorMessage }),
    });

    render(<AddProductPage />);
    
    // Fill in minimal form data
    fireEvent.change(screen.getByLabelText(/nama produk/i), { target: { value: "Test Product" } });
    
    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /lanjut/i }));
    
    // Wait for fetch to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    
    // Verify error alert
    expect(window.alert).toHaveBeenCalledWith(`Gagal menambahkan produk: ${errorMessage}`);
    // expect(window.location.href).not.toBe("/semuaBarang");
  });

  it("should handle network errors during submission", async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error("Network failure"));

    render(<AddProductPage />);
    
    // Fill in minimal form data
    fireEvent.change(screen.getByLabelText(/nama produk/i), { target: { value: "Test Product" } });
    
    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /lanjut/i }));
    
    // Wait for fetch to fail
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    
    // Verify error message
    expect(window.alert).toHaveBeenCalledWith("Terjadi kesalahan jaringan. Silakan coba lagi.");
  });

  it("should display image preview with correct attributes when image is uploaded", async () => {
    render(<AddProductPage />);
    
    // Create mock image file
    const mockFile = new File(["image content"], "product.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByLabelText("Upload") as HTMLInputElement;
    
    // Upload the image
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    
    // Check that image preview appears with correct attributes
    await waitFor(() => {
      const previewImg = screen.getByAltText("Product Preview");
      expect(previewImg).toBeInTheDocument();
      expect(previewImg).toHaveClass("object-cover");
      expect(previewImg).toHaveClass("w-full");
      expect(previewImg).toHaveClass("h-full");
      expect(previewImg).toHaveClass("rounded");
    });
  });

  it("rejects a file larger than 3MB", async () => {
    render(<AddProductPage />);

    // Create a mock 4MB file (should be rejected)
    const largeFile = new File([new Uint8Array(4 * 1024 * 1024)], "large.jpg", {
      type: "image/jpeg",
    });

    const fileInput = screen.getByLabelText("Upload") as HTMLInputElement;

    // Try to upload a file
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    // Check if alert is triggered
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Ukuran file terlalu besar! Maksimal 3MB."
      );
    });
  });
  
  it("accepts a valid image file (<=3MB)", async () => {
    render(<AddProductPage />);

    // Create a mock valid image file (2MB)
    const validFile = new File([new Uint8Array(2 * 1024 * 1024)], "image.png", {
      type: "image/png",
    });

    const fileInput = screen.getByLabelText("Upload") as HTMLInputElement;

    // Try to upload a file
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Ensure no alert is triggered
    await waitFor(() => {
      expect(window.alert).not.toHaveBeenCalled();
    });

    // Check if image preview is displayed
    expect(screen.getByAltText("Product Preview")).toBeInTheDocument();
  });
});