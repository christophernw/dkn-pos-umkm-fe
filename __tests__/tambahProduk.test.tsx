import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddProductPage from "../src/app/tambahProduk/page";

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

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const submitButton = screen.getByRole("button", { name: /lanjut/i });
    fireEvent.click(submitButton);

    expect(consoleSpy).toHaveBeenCalledWith("Product Data:", {
      productName: "Pie Jeruk",
      category: "Makanan",
      priceSell: "13000",
      priceCost: "9000",
      currentStock: "450",
      minimumStock: "10",
      unit: "Botol",
    });

    expect(window.alert).toHaveBeenCalledWith("Product submitted!");

    consoleSpy.mockRestore();
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
