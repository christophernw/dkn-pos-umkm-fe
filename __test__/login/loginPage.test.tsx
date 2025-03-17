import LoginPage from "@/src/app/(auth)/login/page";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from 'next/navigation';
import { signIn, useSession } from "next-auth/react";

// Mock semua modul yang diperlukan
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  useSession: jest.fn(() => ({ data: null })), // Tambahkan mock untuk useSession
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock useAuth context jika diperlukan
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    setAuthData: jest.fn(),
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    // Reset semua mock sebelum setiap test
    jest.clearAllMocks();
  });

  it("renders login page correctly", () => {
    render(<LoginPage />);
    
    expect(screen.getByText("Masuk ke LANCAR")).toBeInTheDocument();
    expect(screen.getByText("Silahkan masuk dengan akun yang terdaftar di LANCAR")).toBeInTheDocument();
    expect(screen.getByText("Masuk dengan Google")).toBeInTheDocument();
  });

  it("calls signIn function when Google login button is clicked", () => {
    render(<LoginPage />);
    
    const googleButton = screen.getByText("Masuk dengan Google");
    fireEvent.click(googleButton);
    
    expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/login", redirect: false });
  });
});