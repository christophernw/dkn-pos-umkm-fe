import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import SemuaBarang from "../../src/app/semuaBarang/page";

describe("Semua Barang Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<SemuaBarang />)
  });

  afterEach(() => {
    window.location.pathname = '/'
  });

  it("renders the search input and can type", () => {
    const searchInput = screen.getByPlaceholderText(/cari produk.../i)
    expect(searchInput).toBeInTheDocument()
    
    fireEvent.change(searchInput, { target: { value: 'test product input' } })
    expect(searchInput).toHaveValue('test product input')
  })

  it("renders the header cards", () => {
      expect(screen.getByText(/Informasi Stok/i)).toBeInTheDocument()
      expect(screen.getByText(/Semua Barang/i)).toBeInTheDocument()
  });

  it("should have a link to home with the correct href", () => {
    const informasiStokLink = screen.getByLabelText("back")
    expect(informasiStokLink).toBeInTheDocument()
    expect(informasiStokLink).toHaveAttribute('href', '/')
  });

  it("should have a link to informasi stok with the correct href", () => {
    const informasiStokLink = screen.getByRole("link", { name: /informasi stok/i });
    expect(informasiStokLink).toBeInTheDocument();
    expect(informasiStokLink).toHaveAttribute('href', '/daftarProduk');
  });

  it("renders the pagination button", () => {
    const paginationButtonNext = screen.getByRole('button', { name: /Next/i })
    const paginationButtonPrev = screen.getByRole('button', { name: /Prev/i })
    expect(paginationButtonNext).toBeInTheDocument()
    expect(paginationButtonPrev).toBeInTheDocument()
  })

  it("renders tambah produk button", () => {
    const tambahProdukButton =
      screen.getByText(/tambah produk/i) ||
      screen.getByRole("button", { name: /tambah produk/i })
    expect(tambahProdukButton).toBeInTheDocument()
  })
  
});