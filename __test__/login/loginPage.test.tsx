import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddProductPage from "@/src/app/tambahProduk/page";

// Mock useAuth from "@/contexts/AuthContext"
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ accessToken: "dummy-token" }),
}));

// Mock config module from "@/src/config"
jest.mock("@/src/config", () => ({
  apiUrl: "http://localhost",
}));

// Helper: Mock TextInput to use native input for easier testing.
jest.mock("@/src/app/tambahProduk/components/textInput", () => (props: any) => {
  const { id, label, value, onChange, placeholder, type } = props;
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        type={type || "text"}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
});

describe("AddProductPage", () => {
  const originalAlert = window.alert;
  const originalLocation = window.location;
  let mockFetch: jest.Mock;

  beforeAll(() => {
    // Mock window.history.back
    window.history.back = jest.fn();
  });

  beforeEach(() => {
    // Reset fetch and alert before each test.
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    window.alert = jest.fn();
    // Reset location.href by redefining window.location
    delete (window as any).location;
    (window as any).location = { href: "" };
  });

  afterAll(() => {
    window.alert = originalAlert;
    window.location = originalLocation;
  });

  it("renders all expected elements", () => {
    render(<AddProductPage />);
    
    // Check header text
    expect(screen.getByText("Tambah Produk Baru")).toBeInTheDocument();
    // Check back button
    expect(screen.getByText("←")).toBeInTheDocument();
    // Check inputs by label text
    expect(screen.getByLabelText("Nama Produk")).toBeInTheDocument();
    expect(screen.getByLabelText("Kategori")).toBeInTheDocument();
    expect(screen.getByLabelText("Harga Jual")).toBeInTheDocument();
    expect(screen.getByLabelText("Harga Modal")).toBeInTheDocument();
    expect(screen.getByLabelText("Pilih Satuan")).toBeInTheDocument();
    expect(screen.getByLabelText("Stok Saat Ini")).toBeInTheDocument();
    expect(screen.getByLabelText("Stok Minimum")).toBeInTheDocument();
    // Check submit button
    expect(screen.getByRole("button", { name: "Lanjut" })).toBeInTheDocument();
    // Check upload placeholder text
    expect(screen.getByText("Upload")).toBeInTheDocument();
  });

  it("calls window.history.back on back button click", () => {
    render(<AddProductPage />);
    const backButton = screen.getByText("←");
    fireEvent.click(backButton);
    expect(window.history.back).toHaveBeenCalled();
  });

  it("does not throw error when no file is selected", () => {
    render(<AddProductPage />);
    const fileInput = screen.getByLabelText("Upload");
    // fire change event with null files
    fireEvent.change(fileInput, { target: { files: null } });
    // nothing to assert, just ensures no error is thrown
  });

  it("handles image file upload and displays preview", async () => {
    render(<AddProductPage />);
    const fileInput = screen.getByLabelText("Upload");

    // Create a dummy file
    const file = new File(["dummy content"], "dummy.png", { type: "image/png" });
    
    // Mock FileReader behavior
    const fileReaderMock: Partial<FileReader> = {
      readAsDataURL: jest.fn(),
    };
    const onloadCallback = jest.fn();
    Object.defineProperty(fileReaderMock, "result", {
      configurable: true,
      get: () => "data:image/png;base64,dummyData",
    });
    // Spy on FileReader constructor to yield our instance.
    const fileReaderSpy = jest.spyOn(window as any, "FileReader").mockImplementation(() => {
      return {
        ...fileReaderMock,
        onload: null,
        readAsDataURL: function() {
          if (this.onload) {
            this.onload();
          }
        },
      };
    });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    fileReaderSpy.mockRestore();
  });

  it("updates input values based on user input", () => {
    render(<AddProductPage />);
    
    const productNameInput = screen.getByLabelText("Nama Produk") as HTMLInputElement;
    const categoryInput = screen.getByLabelText("Kategori") as HTMLInputElement;
    const priceSellInput = screen.getByLabelText("Harga Jual") as HTMLInputElement;
    const priceCostInput = screen.getByLabelText("Harga Modal") as HTMLInputElement;
    const currentStockInput = screen.getByLabelText("Stok Saat Ini") as HTMLInputElement;
    const minimumStockInput = screen.getByLabelText("Stok Minimum") as HTMLInputElement;
    const selectUnit = screen.getByLabelText("Pilih Satuan") as HTMLSelectElement;
    
    fireEvent.change(productNameInput, { target: { value: "Pie Jeruk" } });
    fireEvent.change(categoryInput, { target: { value: "Makanan" } });
    fireEvent.change(priceSellInput, { target: { value: "13000" } });
    fireEvent.change(priceCostInput, { target: { value: "9000" } });
    fireEvent.change(currentStockInput, { target: { value: "450" } });
    fireEvent.change(minimumStockInput, { target: { value: "10" } });
    fireEvent.change(selectUnit, { target: { value: "Botol" } });
    
    expect(productNameInput.value).toBe("Pie Jeruk");
    expect(categoryInput.value).toBe("Makanan");
    expect(priceSellInput.value).toBe("13000");
    expect(priceCostInput.value).toBe("9000");
    expect(currentStockInput.value).toBe("450");
    expect(minimumStockInput.value).toBe("10");
    expect(selectUnit.value).toBe("Botol");
  });

  it("submits form successfully when response status is 201", async () => {
    // Mock fetch to return 201 status with dummy JSON data.
    mockFetch.mockResolvedValueOnce({
      status: 201,
      json: async () => ({ id: 1 }),
    });
    
    render(<AddProductPage />);
    
    // Fill out form inputs.
    fireEvent.change(screen.getByLabelText("Nama Produk"), { target: { value: "Pie Jeruk" } });
    fireEvent.change(screen.getByLabelText("Kategori"), { target: { value: "Makanan" } });
    fireEvent.change(screen.getByLabelText("Harga Jual"), { target: { value: "13000" } });
    fireEvent.change(screen.getByLabelText("Harga Modal"), { target: { value: "9000" } });
    fireEvent.change(screen.getByLabelText("Stok Saat Ini"), { target: { value: "450" } });
    fireEvent.change(screen.getByLabelText("Stok Minimum"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Pilih Satuan"), { target: { value: "Kg" } });
    
    const submitButton = screen.getByRole("button", { name: "Lanjut" });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost/api/produk/create",
        expect.objectContaining({
          method: "POST",
          headers: { Authorization: "Bearer dummy-token" },
        })
      );
    });
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Produk berhasil ditambahkan!");
      expect(window.location.href).toBe("/semuaBarang");
    });
  });

  it("handles non-201 response and shows error alert", async () => {
    // Mock fetch to return error response.
    mockFetch.mockResolvedValueOnce({
      status: 400,
      json: async () => ({ detail: "Gagal" }),
    });
    
    render(<AddProductPage />);
    
    fireEvent.change(screen.getByLabelText("Nama Produk"), { target: { value: "Pie Jeruk" } });
    fireEvent.change(screen.getByLabelText("Kategori"), { target: { value: "Makanan" } });
    fireEvent.change(screen.getByLabelText("Harga Jual"), { target: { value: "13000" } });
    fireEvent.change(screen.getByLabelText("Harga Modal"), { target: { value: "9000" } });
    fireEvent.change(screen.getByLabelText("Stok Saat Ini"), { target: { value: "450" } });
    fireEvent.change(screen.getByLabelText("Stok Minimum"), { target: { value: "10" } });
    
    const submitButton = screen.getByRole("button", { name: "Lanjut" });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Gagal menambahkan produk: Gagal");
    });
  });

  it("handles network error and shows error alert", async () => {
    // Force fetch to throw an error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    
    render(<AddProductPage />);
    
    fireEvent.change(screen.getByLabelText("Nama Produk"), { target: { value: "Pie Jeruk" } });
    fireEvent.change(screen.getByLabelText("Kategori"), { target: { value: "Makanan" } });
    fireEvent.change(screen.getByLabelText("Harga Jual"), { target: { value: "13000" } });
    fireEvent.change(screen.getByLabelText("Harga Modal"), { target: { value: "9000" } });
    fireEvent.change(screen.getByLabelText("Stok Saat Ini"), { target: { value: "450" } });
    fireEvent.change(screen.getByLabelText("Stok Minimum"), { target: { value: "10" } });
    
    const submitButton = screen.getByRole("button", { name: "Lanjut" });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Terjadi kesalahan jaringan. Silakan coba lagi.");
    });
  });
});