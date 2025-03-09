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
  it("renders the header", () => {
    render(<SemuaBarang />);
    expect(screen.getByText(/Informasi Stok/i)).toBeInTheDocument();
    expect(screen.getByText(/Semua Barang/i)).toBeInTheDocument();
  });

  it("renders tambah produk button", () => {
    render(<SemuaBarang />);
    const tambahProdukButton =
      screen.getByText("+") || screen.getByRole("button", { name: "+" });
    expect(tambahProdukButton).toBeInTheDocument();
  });

  it("renders the product list", async () => {
    await act(async () => {
      render(<ProductCard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
      expect(screen.getByText("Rp 15000 / pcs")).toBeInTheDocument();
    });
  });

  it("handles pagination buttons correctly", async () => {
    await act(async () => {
      render(<ProductCard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });

    const nextButton = screen.getByRole("button", { name: "Next" });
    const prevButton = screen.getByRole("button", { name: "Prev" });

    expect(nextButton).toBeEnabled();
    expect(prevButton).toBeDisabled();

    await act(async () => {
      userEvent.click(nextButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/produk/page/2"
      );
    });
  });

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
    );

    await act(async () => {
      render(<ProductCard />);
    });

    await waitFor(() => {
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });
  });

  it("deletes a product when delete button is clicked", async () => {
    window.confirm = jest.fn(() => true);
    await act(async () => {
      render(<ProductCard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: /delete product/i });

    await act(async () => {
      userEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("Produk A")).not.toBeInTheDocument();
    });
  });

  it("does not delete product if user cancels confirmation", async () => {
    window.confirm = jest.fn(() => false);
    
    await act(async () => {
      render(<ProductCard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: /delete product/i });

    await act(async () => {
      userEvent.click(deleteButton);
    });
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });
  });
  
  it("shows an error message when deleting a product fails", async () => {
    window.confirm = jest.fn(() => true);
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
  
    await act(async () => {
      render(<ProductCard />);
    });
  
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );
  
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });
  
    const deleteButton = screen.getByRole("button", { name: /delete product/i });
  
    await act(async () => {
      userEvent.click(deleteButton);
    });
  
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed deleting produk");
      expect(screen.getByText("Produk A")).toBeInTheDocument(); // Product should still be there
    });
  
    consoleErrorMock.mockRestore(); 
  });

  it("handles network error when deleting a product", async () => {
    window.confirm = jest.fn(() => true);
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
  
    await act(async () => {
      render(<ProductCard />);
    });
  
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network Error"))
    );
  
    await waitFor(() => {
      expect(screen.getByText("Produk A")).toBeInTheDocument();
    });
  
    const deleteButton = screen.getByRole("button", { name: /delete product/i });
  
    await act(async () => {
      userEvent.click(deleteButton);
    });
  
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error deleting produk:", expect.any(Error));
      expect(screen.getByText("Produk A")).toBeInTheDocument(); // Product should still be there
    });

    consoleErrorMock.mockRestore();
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
});
