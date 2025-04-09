import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import EditProductPage from "../../src/app/editProduk/[id]/page";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/src/config";

// Mock the useParams and useAuth hooks
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        nama: "Test Product",
        kategori: "Test Category",
        harga_jual: 10000,
        harga_modal: 5000,
        stok: 10,
        satuan: "Kg",
        foto: "/images/test.jpg",
      }),
  })
) as jest.Mock;

describe("EditProductPage", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({ id: "1" });
    (useAuth as jest.Mock).mockReturnValue({ accessToken: "test-token" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(<EditProductPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders the form with product data after loading", async () => {
    render(<EditProductPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Nama Produk")).toHaveValue("Test Product");
      expect(screen.getByLabelText("Kategori")).toHaveValue("Test Category");
      expect(screen.getByLabelText("Harga Jual")).toHaveValue("10000");
      expect(screen.getByLabelText("Harga Modal")).toHaveValue("5000");
      expect(screen.getByLabelText("Stok Saat Ini")).toHaveValue("10");
      expect(screen.getByLabelText("Pilih Satuan")).toHaveValue("Kg");
    });
  });

  it("updates product name when input changes", async () => {
    render(<EditProductPage />);

    await waitFor(() => {
      const productNameInput = screen.getByLabelText("Nama Produk");
      fireEvent.change(productNameInput, { target: { value: "New Product Name" } });
      expect(productNameInput).toHaveValue("New Product Name");
    });
  });

  it("submits the form with updated data", async () => {
    render(<EditProductPage />);

    await waitFor(() => {
      const productNameInput = screen.getByLabelText("Nama Produk");
      fireEvent.change(productNameInput, { target: { value: "New Product Name" } });

      const submitButton = screen.getByText("Simpan Perubahan");
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.apiUrl}/produk/update/1`,
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );
    });
  });

  it("handles image upload and displays preview", async () => {
    render(<EditProductPage />);
  
    // Wait for the form to load
    await waitFor(() => {
      expect(screen.getByLabelText("Nama Produk")).toBeInTheDocument();
    });
  
    // Create a dummy file
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
  
  
    // Simulate file upload
    const fileInput = screen.getByTestId("upload-input");
    fireEvent.change(fileInput, { target: { files: [file] } });
  
    // Check if the preview image is displayed
    await waitFor(() => {
      expect(screen.getByAltText("Product Preview")).toBeInTheDocument();
    });
  });

  it("shows alert when required fields are empty", async () => {
    // Mock window.alert
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
  
    render(<EditProductPage />);
  
    // Wait for the form to load
    await waitFor(() => {
      expect(screen.getByLabelText("Nama Produk")).toBeInTheDocument();
    });
  
    // Clear required fields
    fireEvent.change(screen.getByLabelText("Nama Produk"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Kategori"), { target: { value: "" } });
  
    // Submit the form
    fireEvent.click(screen.getByText("Simpan Perubahan"));
  
    // Check if alert was called with the correct message
    expect(alertMock).toHaveBeenCalledWith(
      "Semua kolom harus diisi sebelum menyimpan perubahan."
    );
  
    // Restore the original alert function
    alertMock.mockRestore();
  });
});