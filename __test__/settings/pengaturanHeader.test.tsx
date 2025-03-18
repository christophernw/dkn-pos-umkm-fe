import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Header } from "@/src/app/(withNavbar)/pengaturan/module-element/Header";
import SettingsPage from "@/src/app/(withNavbar)/pengaturan/page";


jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));

describe("SettingsPage Component", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
  });

  test("renders settings page elements", () => {
    render(<SettingsPage />);

    expect(screen.getByText("Pengaturan Pengguna")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("opens modal when logout button is clicked", () => {
    render(<SettingsPage />);
    
    fireEvent.click(screen.getByText("Logout"));
    
    expect(screen.getByText("Apakah anda yakin ingin Logout?"))
      .toBeInTheDocument();
  });

  test("calls signOut and redirects on confirm logout", async () => {
    render(<SettingsPage />);
    
    fireEvent.click(screen.getByText("Logout"));
    fireEvent.click(screen.getByText("Ya"));
    
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  test("closes modal on cancel", () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByText("Logout"));
    fireEvent.click(screen.getByText("Tidak"));

    expect(screen.queryByText("Apakah anda yakin ingin Logout?"))
      .not.toBeInTheDocument();
  });
});

describe("Header Component", () => {
  test("renders header correctly", () => {
    render(<Header />);
    expect(screen.getByText("Pengaturan")).toBeInTheDocument();
  });

  test("calls router.back when back button is clicked", () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
    
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    
    expect(mockBack).toHaveBeenCalled();
  });
});
