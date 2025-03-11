import { act, render, screen, waitFor } from "@testing-library/react"
import SemuaBarang from "@/src/app/semuaBarang/page"
import ProductCard from "@/src/components/ProductCard"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"

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
)

describe("Semua Barang Page", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  it("renders the header", () => {
    render(<SemuaBarang />)
    expect(screen.getByText(/Informasi Stok/i)).toBeInTheDocument()
    expect(screen.getByText(/Semua Barang/i)).toBeInTheDocument()
  })
<<<<<<< HEAD
=======

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
    })
  })

  it("handles pagination buttons correctly", async () => {
    await act(async () => {
      render(<ProductCard />)
    })

    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument()
    })

    const nextButton = screen.getByRole("button", { name: "Next" })
    const prevButton = screen.getByRole("button", { name: "Prev" })

    expect(nextButton).toBeEnabled()
    expect(prevButton).toBeDisabled()

    await act(async () => {
      userEvent.click(nextButton)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/produk/page/2"
      )
    })
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

  it("deletes a product when delete button is clicked", async () => {
    window.confirm = jest.fn(() => true);

    const mockFetch = jest.fn();
    const originalFetch = global.fetch;
    global.fetch = mockFetch;
   
    mockFetch.mockImplementation((url, options) => {
      if (options?.method === "DELETE" && url.includes('/api/produk/delete/')) {
        return Promise.resolve({ ok: true });
      }
      return originalFetch(url, options);
    });
    
    await act(async () => {
      render(<ProductCard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });

    mockFetch.mockClear();
    
    const deleteButton = screen.getByRole("button", { name: /delete product/i });
  
    await act(async () => {
      userEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/produk/delete/"),
        expect.objectContaining({ method: "DELETE" })
      );
  });
<<<<<<< HEAD
>>>>>>> 6c5c6c94239cfb930cc29f70b3fd7b5a2467d25f
})
=======
  
  // Verify product is removed from the UI
  await waitFor(() => {
    expect(screen.queryByText("Produk A")).not.toBeInTheDocument();
  });
  
  // Restore the original fetch
  global.fetch = originalFetch;
  })

  it("does not delete product if user cancels confirmation", async () => {
    window.confirm = jest.fn(() => false)

    const mockFetch = jest.fn()
    const originalFetch = global.fetch
    global.fetch = mockFetch

    mockFetch.mockImplementation((url, options) => {
      if (options?.method === "DELETE") {
        return Promise.resolve({ ok: true })
      }
      return originalFetch(url, options)
    })
    
    await act(async () => {
      render(<ProductCard />)
    })
    
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument()
    })
 
    mockFetch.mockClear()
    
    const deleteButton = screen.getByRole("button", { name: /delete product/i })

    await act(async () => {
      userEvent.click(deleteButton)
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    expect(mockFetch).not.toHaveBeenCalled()
    expect(screen.getByText("Produk A")).toBeInTheDocument()

    global.fetch = originalFetch
  })
  
  it("shows an error message when deleting a product fails", async () => {
    window.confirm = jest.fn(() => true)
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {})
  
    await act(async () => {
      render(<ProductCard />)
    });
  
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    )
  
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument()
    })
  
    const deleteButton = screen.getByRole("button", { name: /delete product/i })
  
    await act(async () => {
      userEvent.click(deleteButton)
    })
  
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed deleting produk")
      expect(screen.getByText("Produk A")).toBeInTheDocument() // Product should still be there
    })
  
    consoleErrorMock.mockRestore() 
  })

  it("handles network error when deleting a product", async () => {
    window.confirm = jest.fn(() => true)
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {})
  
    await act(async () => {
      render(<ProductCard />)
    });
  
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network Error"))
    )
  
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument()
    })
  
    const deleteButton = screen.getByRole("button", { name: /delete product/i })
  
    await act(async () => {
      userEvent.click(deleteButton)
    })
  
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error deleting produk:", expect.any(Error))
      expect(screen.getByText("Produk A")).toBeInTheDocument() // Product should still be there
    })

    consoleErrorMock.mockRestore()
  })

  it("logs an error when fetching data fails", async () => {
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network Error"))
    )

    await act(async () => {
      render(<ProductCard />)
    })

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error Fetching Data:", expect.any(Error))
    })
    
    consoleErrorMock.mockRestore()
  })
})
>>>>>>> 8eaa6eca6d704a53f1fd5304a4ef72b368c9fbf8
