import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProductCard from "@/src/components/ProductCard";
import "@testing-library/jest-dom";
import SemuaBarang from "@/src/app/(withNavbar)/semuaBarang/page";

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

window.confirm = jest.fn();

global.fetch = jest.fn();

describe("Semua Barang Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url) =>
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
  });
  
  it("renders the header", () => {
    render(<SemuaBarang />)
    expect(screen.getByText(/Informasi Stok/i)).toBeInTheDocument()
    expect(screen.getByText(/Semua Barang/i)).toBeInTheDocument()
  })

  it("renders tambah produk button", () => {
    render(<SemuaBarang />)
    const tambahProdukButton =
      screen.getByText("+") || screen.getByRole("button", { name: "+" })
    expect(tambahProdukButton).toBeInTheDocument()
  })

  it("renders the product list", async () => {
    await act(async () => {
      render(<ProductCard />)
    })

    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument()
      expect(screen.getByText("Rp 15000 / pcs")).toBeInTheDocument()
      expect(screen.getByText("Stok : 10")).toBeInTheDocument()
      expect(screen.getByAltText("Produk A")).toBeInTheDocument()
    })
  })

  it("displays loading state before data is fetched", async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        items: [],
        total: 0,
        page: 1,
        per_page: 10,
        total_pages: 1 
      })
    };

    const createDelayedResponse = () => {
      return new Promise(resolve => {
        delayedResolve(resolve, mockResponse);
      });
    };

    const delayedResolve = (resolve: (value: unknown) => void, response: unknown) => {
      setTimeout(() => resolve(response), 100);
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() => createDelayedResponse());
    
    await act(async () => {
      render(<ProductCard />);
    });
    
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    }, { timeout: 200 });
  })

  it("shows empty state message when no products are available", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [],
            total: 0,
            page: 1,
            per_page: 10,
            total_pages: 1,
          }),
      })
    )

    await act(async () => {
      render(<ProductCard />)
    })

    await waitFor(() => {
      expect(screen.getByText("No data available")).toBeInTheDocument()
    })
  })

  it("renders pagination correctly", async () => {
    await act(async () => {
      render(<ProductCard />);
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    });

    const prevButton = screen.getByRole("button", { name: "Prev" });
    const nextButton = screen.getByRole("button", { name: "Next" });
    
    expect(prevButton).toBeDisabled(); 
    expect(nextButton).not.toBeDisabled();
    
    const page1Button = screen.getByRole("button", { name: "1" });
    expect(page1Button).toHaveClass("bg-blue-700", "text-white");
    
    const page2Button = screen.getByRole("button", { name: "2" });
    expect(page2Button).not.toHaveClass("bg-blue-700");
    expect(page2Button).toHaveClass("border-slate-300");
  })

  it("handles click on pagination buttons correctly", async () => {
    await act(async () => {
      render(<ProductCard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockClear();
    
    const pageButton = screen.getByRole("button", { name: "2" });
    
    await act(async () => {
      fireEvent.click(pageButton);
    });
    
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/api/produk/page/2");
  });

  it("handles click on Next button correctly", async () => {
    await act(async () => {
      render(<ProductCard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockClear();
    
    const nextButton = screen.getByRole("button", { name: "Next" });
    
    await act(async () => {
      fireEvent.click(nextButton);
    });
    
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/api/produk/page/2");
  });

  it("handles click on Prev button correctly when on page 2", async () => {
    await act(async () => {
      render(<ProductCard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });
    
    const page2Button = screen.getByRole("button", { name: "2" });
    await act(async () => {
      fireEvent.click(page2Button);
    });
    
    (global.fetch as jest.Mock).mockClear();
    
    const prevButton = screen.getByRole("button", { name: "Prev" });
    await act(async () => {
      fireEvent.click(prevButton);
    });
    
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/api/produk/page/1");
  });

  it("handles sorting by search parameters", async () => {
    const useSearchParamsMock = jest.requireMock('next/navigation').useSearchParams;
    useSearchParamsMock.mockReturnValue({
      get: jest.fn(param => param === 'sort' ? 'desc' : null),
    });
    
    await act(async () => {
      render(<ProductCard />);
    });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/api/produk/page/1?sort=desc");
    });
  });

  it("deletes a product when delete button is clicked and confirmed", async () => {
    (window.confirm as jest.Mock).mockReturnValue(true);
    
    (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
      if (options?.method === "DELETE") {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
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
        })
      });
    });
    
    await act(async () => {
      render(<ProductCard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockClear();
    
    const deleteButton = screen.getByRole("button", { name: /delete product/i });
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    
    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this product?");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/produk/delete/1",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("does not delete product if user cancels confirmation", async () => {
    (window.confirm as jest.Mock).mockReturnValue(false);
    
    await act(async () => {
      render(<ProductCard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });
   
    (global.fetch as jest.Mock).mockClear();
    
    const deleteButton = screen.getByRole("button", { name: /delete product/i });
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    
    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this product?");
    expect(global.fetch).not.toHaveBeenCalled();
  });
  
  it("handles failed deletion when API returns error", async () => {
    (window.confirm as jest.Mock).mockReturnValue(true);
    
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: [{ id: 1, nama: "Produk A", foto: "/produk-a.jpg", harga_modal: 10000, harga_jual: 15000, stok: 10, satuan: "pcs", kategori: "Elektronik" }],
          total: 1, page: 1, per_page: 10, total_pages: 3
        })
      })
    );
    
    await act(async () => {
      render(<ProductCard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });
    
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({ ok: false })
    );
    
    const deleteButton = screen.getByRole("button", { name: /delete product/i });
    
    await act(async () => {
      fireEvent.click(deleteButton);
      await new Promise(r => setTimeout(r, 10));
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed deleting produk");
    
    consoleErrorSpy.mockRestore();
  });

  it("handles network error when deleting a product", async () => {
    (window.confirm as jest.Mock).mockReturnValue(true);
    
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: [{ id: 1, nama: "Produk A", foto: "/produk-a.jpg", harga_modal: 10000, harga_jual: 15000, stok: 10, satuan: "pcs", kategori: "Elektronik" }],
          total: 1, page: 1, per_page: 10, total_pages: 3
        })
      })
    );
    
    await act(async () => {
      render(<ProductCard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });
    
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error("Network Error"))
    );
    
    const deleteButton = screen.getByRole("button", { name: /delete product/i });
    
    await act(async () => {
      fireEvent.click(deleteButton);
      await new Promise(r => setTimeout(r, 10));
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting produk:", expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });

  it("logs an error when fetching data fails", async () => {
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network Error"))
    );

    await act(async () => {
      render(<ProductCard />);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error Fetching Data:", expect.any(Error));
    });
    
    consoleErrorMock.mockRestore();
  });
  
  it("clicks the 'Perbarui Stok' button", async () => {
    await act(async () => {
      render(<ProductCard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });
    
    const perbaruiStokButton = screen.getByText("Perbarui Stok");
    expect(perbaruiStokButton).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(perbaruiStokButton);
    });
  });
})
