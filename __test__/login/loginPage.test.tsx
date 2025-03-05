import LoginPage from "@/src/app/login/page";
import { render, screen, fireEvent } from "@testing-library/react";

import { signIn } from "next-auth/react";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("LoginPage", () => {
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
