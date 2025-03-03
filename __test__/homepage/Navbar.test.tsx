import { NavbarButton } from "@/src/components/elements/button/NavbarButton";
import { Navbar } from "@/src/components/layout/Navbar";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/public/icons/navbar/HomeIcon", () => () => <svg data-testid="home-icon" />);
jest.mock("@/public/icons/navbar/TransactionIcon", () => () => <svg data-testid="transaction-icon" />);
jest.mock("@/public/icons/navbar/ProductIcon", () => () => <svg data-testid="product-icon" />);
jest.mock("@/public/icons/navbar/SettingsIcon", () => () => <svg data-testid="settings-icon" />);
jest.mock("@/public/icons/navbar/ReportIcon", () => () => <svg data-testid="report-icon" />);

describe("Navbar Component", () => {
    test("renders all navigation buttons", () => {
        render(<Navbar />);
        expect(screen.getByTestId("home-icon")).toBeInTheDocument();
        expect(screen.getByTestId("transaction-icon")).toBeInTheDocument();
        expect(screen.getByTestId("product-icon")).toBeInTheDocument();
        expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
        expect(screen.getByTestId("report-icon")).toBeInTheDocument();
    });

    test("changes active button on click", () => {
        render(<Navbar />);
        
        const homeButton = screen.getByTestId("home-icon");
        fireEvent.click(homeButton);
        expect(screen.getByText("Home"));
    });

    test("Navbar navigates to the correct route when the Product button is clicked", () => {
        render(<Navbar />);
      
        const productButton = screen.getByRole("link", { name: /product/i }); // Case-insensitive match
      
        expect(productButton).toHaveAttribute("href", "/daftarProduk"); // Ensure correct href
      

        waitFor(() => {
            fireEvent.click(productButton);
            expect(window.location.pathname).toBe("/daftarProduk");
          });
      });
});

describe("NavbarButton Component", () => {
    test("renders correctly with given props", () => {
        const mockToggleButton = jest.fn();
        render(
            <NavbarButton 
                isActive={false} 
                toggleButton={mockToggleButton} 
                icon={() => <svg data-testid="test-icon" />} 
                text="Test" 
                route="/"
            />
        );
        expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    test("calls toggleButton when clicked", () => {
        const mockToggleButton = jest.fn();
        render(
            <NavbarButton 
                isActive={false} 
                toggleButton={mockToggleButton} 
                icon={() => <svg data-testid="test-icon" />} 
                text="Test" 
                route="/"
            />
        );
        
        const button = screen.getByTestId("test-icon");
        fireEvent.click(button);
        expect(mockToggleButton).toHaveBeenCalledTimes(1);
    });
});
  