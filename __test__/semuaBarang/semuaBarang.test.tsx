import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react"
import SemuaBarang from "../../src/app/semuaBarang/page"

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
    const tambahProdukButton =
      screen.getByText("+") || 
      screen.getByRole("button", { name: "+"});
    expect(tambahProdukButton).toBeInTheDocument();
});

})