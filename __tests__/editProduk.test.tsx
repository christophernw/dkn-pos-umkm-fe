import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import EditProductPage from "../src/app/editProduk/page";

describe("EditProductPage", () => {
  it("Menampilkan input dengan data produk awal", async () => {
    render(<EditProductPage />);
    expect(await screen.findByLabelText(/Nama Produk/i)).toBeInTheDocument();
  });

  it("Mengedit nama produk", () => {
    render(<EditProductPage />);
    const nameInput = screen.getByLabelText(/Nama Produk/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Produk Baru" } });
    expect(nameInput.value).toBe("Produk Baru");
  });

  it("Menampilkan error jika harga di bawah 1000", () => {
    render(<EditProductPage />);
    const priceInput = screen.getByLabelText(/Harga/i) as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: "500" } });

    fireEvent.click(screen.getByRole("button", { name: /Simpan Perubahan/i }));

    expect(screen.getByText(/Harga harus minimal Rp 1000/i)).toBeInTheDocument();
  });

  it("Menampilkan error jika stok negatif", () => {
    render(<EditProductPage />);
    const stockInput = screen.getByLabelText(/Stok/i) as HTMLInputElement;
    fireEvent.change(stockInput, { target: { value: "-5" } });

    fireEvent.click(screen.getByRole("button", { name: /Simpan Perubahan/i }));

    expect(screen.getByText(/Stok tidak boleh negatif/i)).toBeInTheDocument();
  });

  it("Menolak input non-angka di harga", () => {
    render(<EditProductPage />);
    const priceInput = screen.getByLabelText(/Harga/i) as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: "abc" } });

    expect(priceInput.value).toBe(""); // Input harus kosong jika bukan angka
  });

  it("Menolak input non-angka di stok", () => {
    render(<EditProductPage />);
    const stockInput = screen.getByLabelText(/Stok/i) as HTMLInputElement;
    fireEvent.change(stockInput, { target: { value: "xyz" } });

    expect(stockInput.value).toBe(""); // Input harus kosong jika bukan angka
  });
});
