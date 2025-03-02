import { render, screen, fireEvent } from "@testing-library/react";
import AddProductPage from "../src/app/tambahProduk/page";

describe("AddProductPage Component", () => {
  test("renders the form with all input fields", () => {
    render(<AddProductPage />);

    expect(screen.getByLabelText(/Nama Produk/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Harga Jual/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Harga Modal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pilih Satuan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stok Saat Ini/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stok Minimum/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lanjut/i })).toBeInTheDocument();
  });

  test("updates input values when typed into", () => {
    render(<AddProductPage />);

    const productNameInput = screen.getByLabelText(/Nama Produk/i);
    fireEvent.change(productNameInput, { target: { value: "Pie Jeruk" } });
    expect(productNameInput).toHaveValue("Pie Jeruk");

    const priceSellInput = screen.getByLabelText(/Harga Jual/i);
    fireEvent.change(priceSellInput, { target: { value: "13000" } });
    expect(priceSellInput).toHaveValue(13000);

    const priceCostInput = screen.getByLabelText(/Harga Modal/i);
    fireEvent.change(priceCostInput, { target: { value: "9000" } });
    expect(priceCostInput).toHaveValue(9000);
  });

  test("submits the form and displays an alert", () => {
    window.alert = jest.fn();
    render(<AddProductPage />);

    const submitButton = screen.getByRole("button", { name: /Lanjut/i });
    fireEvent.click(submitButton);

    expect(window.alert).toHaveBeenCalledWith("Product submitted!");
  });
});
