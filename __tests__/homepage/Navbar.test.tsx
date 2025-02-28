import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/router";
import { Navbar } from "../components/Navbar";
import { NavbarButton } from "../components/elements/button/NavbarButton";

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
        expect(homeButton).toHaveStyle("color: white");
        expect(screen.getByText("Home"));
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
        expect(screen.getByText("Test")).toBeInTheDocument();
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

jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));
  
describe("Navbar Navigation", () => {
    it("navigates to the correct route when a button is clicked", () => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

        render(<Navbar />);

        const productButton = screen.getByTestId("home-icon");

        fireEvent.click(productButton);

        expect(mockPush).toHaveBeenCalledWith("/");
    });
});
