import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsPage from "@/src/app/(withNavbar)/pengaturan/page";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(() => Promise.resolve({})), // Tambahkan mock resolve
}));

describe("SettingsPage Component", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ 
      push: mockPush,
      back: jest.fn() 
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
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
    
    // Buka modal
    fireEvent.click(screen.getByText("Logout"));
    
    // Gunakan act untuk wrap operasi async
    await act(async () => {
      fireEvent.click(screen.getByText("Ya"));
    });

    // Beri waktu untuk proses async
    await new Promise(resolve => setTimeout(resolve, 0));
    
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


