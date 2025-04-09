import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const TestComponent = () => {
    const { user, accessToken, refreshToken, isAuthenticated, setAuthData, logout } = useAuth();
    return (
        <div>
            <div data-testid="user">{user ? user.name : "null"}</div>
            <div data-testid="accessToken">{accessToken || "null"}</div>
            <div data-testid="refreshToken">{refreshToken || "null"}</div>
            <div data-testid="isAuthenticated">{isAuthenticated ? "true" : "false"}</div>
            <button onClick={() => setAuthData({
                    user: { id: 1, name: "TestUser", email: "test@example.com", role: "Pemilik" },
                    access: "access123",
                    refresh: "refresh123"
            })}>Set Auth</button>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
};

describe("AuthContext", () => {
    afterEach(() => {
        localStorage.clear();
    });

    it("throws error when useAuth is used outside AuthProvider", () => {
        // ErrorBoundary component to catch error
        const ErrorComponent = () => {
            useAuth();
            return <div>Should not render</div>;
        };

        const consoleError = console.error;
        console.error = jest.fn(); // Suppress error output

        expect(() => render(<ErrorComponent />)).toThrow("useAuth must be used within an AuthProvider");

        console.error = consoleError;
    });

    it("loads auth data from localStorage on initial mount", async () => {
        // Set localStorage items
        const storedUser = JSON.stringify({ id: 2, name: "StoredUser", email: "stored@example.com" });
        localStorage.setItem("user", storedUser);
        localStorage.setItem("accessToken", "storedAccess");
        localStorage.setItem("refreshToken", "storedRefresh");

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        expect(screen.getByTestId("user").textContent).toBe("StoredUser");
        expect(screen.getByTestId("accessToken").textContent).toBe("storedAccess");
        expect(screen.getByTestId("refreshToken").textContent).toBe("storedRefresh");
        expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    });

    it("setAuthData correctly updates the context state and localStorage", async () => {
        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        const setAuthButton = screen.getByText("Set Auth");
        await act(async () => {
            fireEvent.click(setAuthButton);
        });

        expect(screen.getByTestId("user").textContent).toBe("TestUser");
        expect(screen.getByTestId("accessToken").textContent).toBe("access123");
        expect(screen.getByTestId("refreshToken").textContent).toBe("refresh123");
        expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");

        // Verify localStorage updates
        const storedUser = localStorage.getItem("user");
        expect(storedUser).toBe(JSON.stringify({ id: 1, name: "TestUser", email: "test@example.com" }));
        expect(localStorage.getItem("accessToken")).toBe("access123");
        expect(localStorage.getItem("refreshToken")).toBe("refresh123");
    });

    it("logout correctly clears the context state and localStorage", async () => {
        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        // Set auth data first
        const setAuthButton = screen.getByText("Set Auth");
        await act(async () => {
            fireEvent.click(setAuthButton);
        });

        // Verify that values are set
        expect(screen.getByTestId("user").textContent).toBe("TestUser");
        expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");

        // Click logout button
        const logoutButton = screen.getByText("Logout");
        await act(async () => {
            fireEvent.click(logoutButton);
        });

        expect(screen.getByTestId("user").textContent).toBe("null");
        expect(screen.getByTestId("accessToken").textContent).toBe("null");
        expect(screen.getByTestId("refreshToken").textContent).toBe("null");
        expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");

        // Verify localStorage is cleared
        expect(localStorage.getItem("user")).toBeNull();
        expect(localStorage.getItem("accessToken")).toBeNull();
        expect(localStorage.getItem("refreshToken")).toBeNull();
    });
});