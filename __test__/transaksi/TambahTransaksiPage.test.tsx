import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import TambahTransaksiPage from "@/src/app/tambahTransaksi/page";
import config from "@/src/config";

// Mock the next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the contexts
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/contexts/ModalContext", () => ({
  useModal: jest.fn(),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock ProductSelectorModal
jest.mock("@/src/components/ProductSelectorModal", () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onProductSelect }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="product-selector-modal">
        <button onClick={() => onProductSelect(mockProduct)}>
          Select Product
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  },
}));

// Mock data
const mockProduct = {
  id: 1,
  nama: "Test Product",
  foto: "/test.jpg",
  harga_modal: 1000,
  harga_jual: 2000,
  stok: 10,
  satuan: "pcs",
  kategori: "Test",
};

const mockRouter = {
  back: jest.fn(),
};

const mockAuth = {
  accessToken: "test-token",
};

const mockModal = {
  showModal: jest.fn(),
  hideModal: jest.fn(),
};

describe("TambahTransaksiPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
    (useModal as jest.Mock).mockReturnValue(mockModal);
  });

  it("renders the component correctly", () => {
    render(<TambahTransaksiPage />);
    expect(screen.getByText("Pemasukan Baru")).toBeInTheDocument();
  });

  it("switches between pemasukan and pengeluaran modes", () => {
    render(<TambahTransaksiPage />);

    // Initially in pemasukan mode
    expect(screen.getByText("Pemasukan Baru")).toBeInTheDocument();

    // Switch to pengeluaran mode
    fireEvent.click(screen.getByText("Pengeluaran"));
    expect(screen.getByText("Pengeluaran Baru")).toBeInTheDocument();
  });

  it("handles product selection and quantity changes", async () => {
    render(<TambahTransaksiPage />);

    // Open product selector
    fireEvent.click(screen.getByText("Tambah Barang"));

    // Select a product
    fireEvent.click(screen.getByText("Select Product"));

    // Verify product is added
    expect(screen.getByText("Test Product")).toBeInTheDocument();

    // Change quantity
    const quantityInput = screen.getByRole("spinbutton");
    fireEvent.change(quantityInput, { target: { value: "2" } });
    expect(quantityInput).toHaveValue(2);
  });

  it("handles manual total amount input", () => {
    render(<TambahTransaksiPage />);

    const totalInput = screen.getAllByPlaceholderText("0")[0];
    fireEvent.change(totalInput, { target: { value: "1000000" } });
    expect(totalInput).toHaveValue("1.000.000");
  });

  it("handles status changes", () => {
    render(<TambahTransaksiPage />);

    // Initially Lunas
    expect(screen.getByText("Lunas")).toHaveClass("bg-green-500");

    // Change to Belum Lunas
    fireEvent.click(screen.getByText("Belum Lunas"));
    expect(screen.getByText("Belum Lunas")).toHaveClass("bg-red-500");
  });

  it("handles category changes", () => {
    render(<TambahTransaksiPage />);

    const categorySelect = screen.getByRole("combobox");
    fireEvent.change(categorySelect, {
      target: { value: "Pendapatan Lain-Lain" },
    });
    expect(categorySelect).toHaveValue("Pendapatan Lain-Lain");
  });

  it("handles form submission successfully", async () => {
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    render(<TambahTransaksiPage />);

    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));

    // Submit form
    fireEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.apiUrl}/transaksi`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });
  });

  it("handles form submission error", async () => {
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Test error" }),
      })
    );

    render(<TambahTransaksiPage />);

    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));

    // Submit form
    fireEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });
  });

  it("validates form before submission", () => {
    render(<TambahTransaksiPage />);

    // Try to submit without products
    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));

    // Wait for the error message to appear
    waitFor(() => {
      expect(
        screen.getByText(/tambahkan setidaknya satu barang/i)
      ).toBeInTheDocument();
    });
  });

  it("handles product removal", () => {
    render(<TambahTransaksiPage />);

    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));

    // Remove the product
    const removeButton = screen.getByLabelText("Hapus item");
    fireEvent.click(removeButton);

    expect(screen.queryByText("Test Product")).not.toBeInTheDocument();
  });

  it("calculates profit correctly for pemasukan mode", () => {
    render(<TambahTransaksiPage />);

    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));

    // Set quantity to 2
    const quantityInput = screen.getByRole("spinbutton");
    fireEvent.change(quantityInput, { target: { value: "2" } });

    // Profit should be (2000 - 1000) * 2 = 2000
    expect(screen.getByText("Rp2.000")).toBeInTheDocument();
  });

  it("handles back button click", () => {
    const mockBack = jest.fn();
    window.history.back = mockBack;

    render(<TambahTransaksiPage />);
    const backButton = screen.getAllByRole("button")[0];
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it("formats manual modal input correctly", () => {
    render(<TambahTransaksiPage />);
    // Ensure mode and category are correct BEFORE adding product
    fireEvent.click(screen.getByText("Pemasukan"));
    const categorySelect = screen.getByRole("combobox");
    fireEvent.change(categorySelect, { target: { value: "Penjualan Barang" } });
    // Add a product to enable modal input
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    // Now find the modal input by its parent div structure
    const modalInput = screen
      .getByText("Modal")
      .closest("div")
      ?.querySelector("input") as HTMLInputElement;
    fireEvent.change(modalInput, { target: { value: "1234567" } });
    expect(modalInput.value).toBe("1.234.567");
  });


  it("shows error if no accessToken on submit", async () => {
    (useAuth as jest.Mock).mockReturnValue({ accessToken: null });
    render(<TambahTransaksiPage />);
    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    // Set total manually to nonzero
    const totalInput = screen
      .getByText("Total Pemasukan")
      .closest("div")
      ?.querySelector("input") as HTMLInputElement;
    fireEvent.change(totalInput, { target: { value: "1000" } });
    // Submit
    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));
    await waitFor(() => {
      expect(screen.getByText(/autentikasi diperlukan/i)).toBeInTheDocument();
    });
  });

  it("shows error if fetch throws an Error", async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => {
      throw new Error("Network error");
    });
    render(<TambahTransaksiPage />);
    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    // Set total manually to nonzero
    const totalInput = screen
      .getByText("Total Pemasukan")
      .closest("div")
      ?.querySelector("input") as HTMLInputElement;
    fireEvent.change(totalInput, { target: { value: "1000" } });
    // Submit
    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it("shows unknown error if fetch throws a non-Error", async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => {
      throw "some string error";
    });
    render(<TambahTransaksiPage />);
    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    // Set total manually to nonzero
    const totalInput = screen
      .getByText("Total Pemasukan")
      .closest("div")
      ?.querySelector("input") as HTMLInputElement;
    fireEvent.change(totalInput, { target: { value: "1000" } });
    // Submit
    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/terjadi kesalahan yang tidak diketahui/i)
      ).toBeInTheDocument();
    });
  });

  it("sets isLoading to false after save attempt (error)", async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => {
      throw new Error("Network error");
    });
    render(<TambahTransaksiPage />);
    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    // Set total manually to nonzero
    const totalInput = screen
      .getByText("Total Pemasukan")
      .closest("div")
      ?.querySelector("input") as HTMLInputElement;
    fireEvent.change(totalInput, { target: { value: "1000" } });
    // Submit
    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));
    // Wait for button to be enabled again
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /simpan/i })
      ).not.toBeDisabled();
    });
  });
});
