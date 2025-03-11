import LoginPage from "@/src/app/(auth)/login/page";
import { render, screen, fireEvent } from "@testing-library/react";
import { signIn, useSession } from "next-auth/react";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  useSession: jest.fn(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: "unauthenticated" });
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
    
    expect(signIn).toHaveBeenCalledWith("google");
  });
});
