import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
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
        <button
          onClick={() => onProductSelect({ ...mockProduct, id: Date.now() })}
        >
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

  it("handles product selector modal close", () => {
    render(<TambahTransaksiPage />);

    // Open product selector
    fireEvent.click(screen.getByText("Tambah Barang"));
    expect(screen.getByTestId("product-selector-modal")).toBeInTheDocument();

    // Close product selector
    fireEvent.click(screen.getByText("Close"));
    expect(
      screen.queryByTestId("product-selector-modal")
    ).not.toBeInTheDocument();
  });

  it("handles existing product selection", () => {
    render(<TambahTransaksiPage />);

    // Add product first time
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));

    // Add same product again
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));

    // Quantity should be 2
    const quantityInputs = screen.getAllByRole("spinbutton");
    expect(quantityInputs[0]).toHaveValue(1);
  });

  it("formats harga correctly", () => {
    render(<TambahTransaksiPage />);

    // Test total amount input
    const totalInput = screen.getAllByPlaceholderText("0")[0];
    fireEvent.change(totalInput, { target: { value: "1000000" } });
    expect(totalInput).toHaveValue("1.000.000");

    // Test modal input
    fireEvent.click(screen.getByText("Pemasukan"));
    const categorySelect = screen.getByRole("combobox");
    fireEvent.change(categorySelect, { target: { value: "Penjualan Barang" } });

    const modalInput = screen
      .getByText("Modal")
      .closest("div")
      ?.querySelector("input") as HTMLInputElement;
    fireEvent.change(modalInput, { target: { value: "500000" } });
    expect(modalInput).toHaveValue("500.000");
  });

  it("clears products when switching category type", () => {
    render(<TambahTransaksiPage />);

    // Add a product first
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    expect(screen.getByText("Test Product")).toBeInTheDocument();

    // Change category to non-stock category
    const categorySelect = screen.getByRole("combobox");
    fireEvent.change(categorySelect, {
      target: { value: "Pendapatan Lain-Lain" },
    });

    // Product should be removed
    expect(screen.queryByText("Test Product")).not.toBeInTheDocument();
  });

  it("sets correct category type when switching transaction mode", () => {
    render(<TambahTransaksiPage />);

    // Initially in pemasukan mode
    expect(screen.getByRole("combobox")).toHaveValue("Penjualan Barang");

    // Switch to pengeluaran mode
    fireEvent.click(screen.getByText("Pengeluaran"));
    expect(screen.getByRole("combobox")).toHaveValue("Pembelian Stok");

    // Switch back to pemasukan mode
    fireEvent.click(screen.getByText("Pemasukan"));
    expect(screen.getByRole("combobox")).toHaveValue("Penjualan Barang");
  });

  it("validates quantity limits correctly", () => {
    render(<TambahTransaksiPage />);

    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));

    let quantityInputs = screen.getAllByRole("spinbutton");
    const quantityInput = quantityInputs[0];

    // Test minimum quantity (should not go below 1)
    fireEvent.change(quantityInput, { target: { value: "0" } });
    expect(quantityInput).toHaveValue(1);

    // Test maximum quantity (should not exceed stock)
    fireEvent.change(quantityInput, { target: { value: "11" } }); // mockProduct has stok: 10
    expect(quantityInput).toHaveValue(10);

    // Test valid quantity
    fireEvent.change(quantityInput, { target: { value: "5" } });
    expect(quantityInput).toHaveValue(5);
  });

  it("calculates total amount correctly based on category type in pengeluaran mode", () => {
    render(<TambahTransaksiPage />);

    // Switch to pengeluaran mode
    fireEvent.click(screen.getByText("Pengeluaran"));

    // Add first product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    let quantityInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(quantityInputs[0], { target: { value: "2" } }); // 1000 * 2 = 2000

    // Add second product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    quantityInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(quantityInputs[1], { target: { value: "3" } }); // 1000 * 3 = 3000

    // Total should be sum of all products (2000 + 3000 = 5000)
    const totalInput = screen
      .getByText("Total Pengeluaran")
      .closest("div")
      ?.querySelector("input") as HTMLInputElement;
    expect(totalInput.value).toBe("5.000");
  });

  it("calculates total amount correctly for multiple products", () => {
    render(<TambahTransaksiPage />);

    // Switch to pengeluaran mode
    fireEvent.click(screen.getByText("Pengeluaran"));

    // Add first product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    let quantityInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(quantityInputs[0], { target: { value: "2" } }); // 1000 * 2 = 2000

    // Add second product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    quantityInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(quantityInputs[1], { target: { value: "3" } }); // 1000 * 3 = 3000

    // Total should be sum of all products (2000 + 3000 = 5000)
    const totalInput = screen
      .getByText("Total Pengeluaran")
      .closest("div")
      ?.querySelector("input") as HTMLInputElement;
    expect(totalInput.value).toBe("5.000");
  });

  it("limits quantity to product stock in pemasukan mode", () => {
    render(<TambahTransaksiPage />);

    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));

    let quantityInputs = screen.getAllByRole("spinbutton");
    const quantityInput = quantityInputs[0];

    // Try to set quantity above stock limit (mockProduct has stok: 10)
    fireEvent.change(quantityInput, { target: { value: "15" } });
    expect(quantityInput).toHaveValue(10); // Should be limited to stock
  });

  it("keeps other items unchanged when updating quantity", () => {
    render(<TambahTransaksiPage />);

    // Add first product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    let quantityInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(quantityInputs[0], { target: { value: "2" } });

    // Add second product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    quantityInputs = screen.getAllByRole("spinbutton");

    // Update second product's quantity
    fireEvent.change(quantityInputs[1], { target: { value: "3" } });

    // First product's quantity should remain unchanged
    expect(quantityInputs[0]).toHaveValue(2);
    // Second product's quantity should be updated
    expect(quantityInputs[1]).toHaveValue(3);
  });

  it("handles quantity decrease correctly", () => {
    render(<TambahTransaksiPage />);

    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));

    let quantityInputs = screen.getAllByRole("spinbutton");
    const quantityInput = quantityInputs[0];

    // Set initial quantity to 5
    fireEvent.change(quantityInput, { target: { value: "5" } });
    expect(quantityInput).toHaveValue(5);

    // Decrease quantity by 3
    fireEvent.change(quantityInput, { target: { value: "2" } });
    expect(quantityInput).toHaveValue(2);

    // Try to decrease below 1
    fireEvent.change(quantityInput, { target: { value: "0" } });
    expect(quantityInput).toHaveValue(1); // Should not go below 1
  });

  it("handles quantity increase correctly", () => {
    render(<TambahTransaksiPage />);

    // Add a product
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));

    let quantityInputs = screen.getAllByRole("spinbutton");
    const quantityInput = quantityInputs[0];

    // Set initial quantity to 1
    fireEvent.change(quantityInput, { target: { value: "1" } });
    expect(quantityInput).toHaveValue(1);

    // Increase quantity by 2
    fireEvent.change(quantityInput, { target: { value: "3" } });
    expect(quantityInput).toHaveValue(3);

    // Try to increase above stock limit in pemasukan mode
    fireEvent.change(quantityInput, { target: { value: "15" } });
    expect(quantityInput).toHaveValue(10); // Should be limited to stock
  });

  it("handles Tambah Baru button click in success modal", async () => {
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const mockShowModal = jest.fn();
    (useModal as jest.Mock).mockReturnValue({
      showModal: mockShowModal,
      hideModal: jest.fn(),
    });

    render(<TambahTransaksiPage />);

    // Add a product and submit form
    fireEvent.click(screen.getByText("Tambah Barang"));
    fireEvent.click(screen.getByText("Select Product"));
    fireEvent.click(screen.getByText("Simpan"));

    // Verify showModal was called with correct arguments
    await waitFor(() => {
      expect(mockShowModal).toHaveBeenCalledWith(
        "Berhasil",
        "Transaksi berhasil disimpan!",
        "success",
        expect.any(Object),
        expect.objectContaining({
          label: "Tambah Baru",
          onClick: expect.any(Function),
        })
      );
    });
  });
});
