import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import SettingsPage from "@/src/app/(withNavbar)/pengaturan/page";

// Mock signOut dari next-auth
jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));

// Mock useRouter dari next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("SettingsPage Component", () => {
  let pushMock : jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    
    const mockedUseRouter = jest.mocked(useRouter);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseRouter.mockReturnValue({ push: pushMock } as any); 
  });
  test("Render halaman Settings dengan benar", () => {
    render(<SettingsPage />);
    
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("Modal muncul saat tombol Logout diklik", () => {
    render(<SettingsPage />);
    
    fireEvent.click(screen.getByText("Logout"));
    
    expect(screen.getByText("Apakah anda yakin ingin Logout?")).toBeInTheDocument();
  });

  test("Memanggil signOut dan redirect ke '/' setelah logout", async () => {
    render(<SettingsPage />);
    
    fireEvent.click(screen.getByText("Logout")); 
    fireEvent.click(screen.getByText("Ya")); 
    
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1)); 
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/")); 
  });

  test("Modal tertutup saat tombol Tidak diklik", () => {
    render(<SettingsPage />);
    
    fireEvent.click(screen.getByText("Logout"));
    fireEvent.click(screen.getByText("Tidak")); 
    
    expect(screen.queryByText("Apakah anda yakin ingin Logout?")).not.toBeInTheDocument();
  });
});
