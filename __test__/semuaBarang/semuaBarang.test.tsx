import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SemuaBarang from "@/src/app/(withNavbar)/semuaBarang/page";

// Mock HeaderProduk and ProductCard for predictable output.
jest.mock("@/src/components/HeaderProduk", () => () => <div>Header Produk</div>);
jest.mock("@/src/components/ProductCard", () => () => <div>Product Card</div>);

// Create a mutable window.location for testing button redirection
beforeEach(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { href: "" },
  });
});

// Mock the useAuth hook
const mockedUseAuth = {
  user: { name: "John Doe" },
};
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => mockedUseAuth),
}));

describe("SemuaBarang", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test("renders welcome message when user exists", () => {
    // Set useAuth to return a user
    const { useAuth } = require("@/contexts/AuthContext");
    useAuth.mockReturnValue({ user: { name: "John Doe" } });
    
    render(<SemuaBarang />);
    
    // Check HeaderProduk and ProductCard render (via mocks)
    expect(screen.getByText("Header Produk")).toBeInTheDocument();
    expect(screen.getByText("Product Card")).toBeInTheDocument();
    
    // Check welcome message is rendered
    expect(screen.getByText("Welcome, John Doe!")).toBeInTheDocument();
  });
  
  test("does not render welcome message when user is null", () => {
    const { useAuth } = require("@/contexts/AuthContext");
    useAuth.mockReturnValue({ user: null });
    
    render(<SemuaBarang />);
    
    // Check that welcome message is not present
    const welcomeMessage = screen.queryByText(/Welcome,/);
    expect(welcomeMessage).toBeNull();
  });
  
  test("redirects to /tambahProduk when the button is clicked", () => {
    const { useAuth } = require("@/contexts/AuthContext");
    useAuth.mockReturnValue({ user: { name: "John Doe" } });
    
    render(<SemuaBarang />);

    const button = screen.getByRole("button", { name: "tambah produk button" });
    fireEvent.click(button);
    
    // Check that window.location.href is updated
    expect(window.location.href).toBe("/tambahProduk");
  });
});