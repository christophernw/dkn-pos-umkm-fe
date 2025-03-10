import { act, render, screen, waitFor } from "@testing-library/react";
import ProductCard from "@/src/components/ProductCard";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SemuaBarang from "@/src/app/(withNavbar)/semuaBarang/page";

global.fetch = jest.fn((url) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve(
        (typeof url === "string" && url.includes("page"))
          ? {
              items: [
                {
                  id: 1,
                  nama: "Produk A",
                  foto: "/produk-a.jpg",
                  harga_modal: 10000,
                  harga_jual: 15000,
                  stok: 10,
                  satuan: "pcs",
                  kategori: "Elektronik",
                },
              ],
              total: 1,
              page: 1,
              per_page: 10,
              total_pages: 3,
            }
          : []
      ),
  } as Response)
);

describe("Semua Barang Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    render(<SemuaBarang />)
  })

  afterEach(() => {
    window.location.pathname = '/'
  })

  it("renders the header cards", () => {
      expect(screen.getByText(/Informasi Stok/i)).toBeInTheDocument()
      expect(screen.getByText(/Semua Barang/i)).toBeInTheDocument()
  })

  it("renders the pagination button", () => {
    const paginationButtonNext = screen.getByRole('button', { name: /Next/i })
    const paginationButtonPrev = screen.getByRole('button', { name: /Prev/i })
    expect(paginationButtonNext).toBeInTheDocument()
    expect(paginationButtonPrev).toBeInTheDocument()
  })

  it("renders tambah produk button", () => {
    render(<SemuaBarang />);
    const tambahProdukButton =
      screen.getByText("+") || screen.getByRole("button", { name: "+" });
    expect(tambahProdukButton).toBeInTheDocument();
  });
})