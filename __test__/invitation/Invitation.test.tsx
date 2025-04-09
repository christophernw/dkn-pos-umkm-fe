import { render, screen, waitFor } from "@testing-library/react";
import InvitePage from "@/src/app/auth/invite/page";
import { useRouter, useSearchParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe("InvitationPage", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers(); // Enable fake timers
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers
  });

  it("shows error when token is missing", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => null,
    });

    render(<InvitePage />);

    expect(await screen.findByText(/Token undangan tidak ditemukan/i)).toBeInTheDocument();

    jest.advanceTimersByTime(2500); // Simulate delay for redirect
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login?redirect=%2Fpengaturan");
    });
  });

  it("validates token successfully", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => "valid-token",
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ valid: true }),
      })
    ) as jest.Mock;

    render(<InvitePage />);

    expect(screen.getByText(/Memvalidasi undangan/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Validasi Berhasil/i)).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1500);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login?redirect=%2Fpengaturan");
    });
  });

  it("handles invalid token response", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => "invalid-token",
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ valid: false, error: "Undangan tidak valid" }),
      })
    ) as jest.Mock;

    render(<InvitePage />);

    await waitFor(() => {
      expect(screen.getByText(/Validasi gagal/i)).toBeInTheDocument();
      expect(screen.getByText(/Undangan tidak valid/i)).toBeInTheDocument();
    });

    jest.advanceTimersByTime(2500);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login?redirect=%2Fpengaturan");
    });
  });

  it("handles fetch failure", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => "any-token",
    });

    global.fetch = jest.fn(() => Promise.reject(new Error("API Error"))) as jest.Mock;

    render(<InvitePage />);

    await waitFor(() => {
      expect(screen.getByText(/Validasi gagal/i)).toBeInTheDocument();
      expect(screen.getByText(/Terjadi kesalahan saat memvalidasi undangan/i)).toBeInTheDocument();
    });

    jest.advanceTimersByTime(2500);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login?redirect=%2Fpengaturan");
    });
  });
});
