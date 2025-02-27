import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react";
import DaftarProduk from "../app/daftarProduk/page"; 

describe("DaftarProduk Page", () => {
  beforeEach(() => {
    render(<DaftarProduk />);
  });

  it("renders the main elements", () => {
      expect(screen.getByText(/Informasi Stok/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Cari Produk.../i)).toBeInTheDocument();
      expect(screen.getByText(/February/i)).toBeInTheDocument();
      expect(screen.getByText(/2025/i)).toBeInTheDocument();
  });

  it("displays the 'Produk Paling Laku' section", () => {
      expect(screen.getByText(/Produk Paling Laku/i)).toBeInTheDocument();
      expect(screen.getByText(/Kue Cucur Bahagia/i)).toBeInTheDocument();
      expect(screen.getByText(/Donat Senyum/i)).toBeInTheDocument();
      expect(screen.getByText(/Kue Apem/i)).toBeInTheDocument();
      expect(screen.getByText(/Stok 175/i)).toBeInTheDocument();
      expect(screen.getByText(/Stok 98/i)).toBeInTheDocument();
      expect(screen.getByText(/Stok 52/i)).toBeInTheDocument();
  });

  it("displays the 'Produk Stok Rendah' section", () => {
      expect(screen.getByText(/Produk Stok Rendah/i)).toBeInTheDocument();
      expect(screen.getByText(/Roti Gandum/i)).toBeInTheDocument();
      expect(screen.getByText(/Roti Kentang/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Stok Rendah : 10/i)).toHaveLength(2);
  });

  it("displays the correct number of 'Perbarui Stok' buttons", () => {
      expect(screen.getAllByText(/Perbarui Stok/i)).toHaveLength(5);
  });

  it("renders the bottom navigation", () => {
      expect(screen.getByText(/Product/i)).toBeInTheDocument();
  });
});