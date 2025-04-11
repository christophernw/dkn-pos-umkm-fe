import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import AddUserPage from "@/src/app/(withNavbar)/multirole/adduser/page";

// Mock console.log
const mockConsoleLog = jest.fn();
console.log = mockConsoleLog;

// Mock useRouter
const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

// Mock AuthContext
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    accessToken: "mock-token",
    user: {
      name: "Owner Test",
      email: "ownertest@example.com",
    },
  }),
}));

// Mock sendInvitation and sendEmail
jest.mock("@/src/app/lib/sendInvitationEmail", () => ({
    sendEmail: jest.fn(),
}));
jest.mock("@/src/app/(withNavbar)/multirole/adduser/services/invitationService", () => ({
    sendInvitation: jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: async () => ({ message: "Invitation sent", token: "mock-jwt-token" }),
        })
    ),
}));

describe("AddUserPage", () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
    mockBack.mockClear();
  });

  it("renders form fields and submit button", () => {
    render(<AddUserPage />);
    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lanjutkan/i })).toBeInTheDocument();
  });

  it("shows correct user data in confirmation modal", async () => {
    render(<AddUserPage />)
    fireEvent.change(screen.getByLabelText(/nama lengkap/i), {
      target: { value: "Hilmy Ammar" },
    })
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: "Karyawan" },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "hilmy@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: /lanjutkan/i }))
    const modal = screen.getByRole("dialog")
    expect(within(modal).getByText("Karyawan")).toBeInTheDocument()
    expect(within(modal).getByText("Hilmy Ammar")).toBeInTheDocument()
    expect(within(modal).getByText("hilmy@example.com")).toBeInTheDocument()
  })

  it("submits form after confirming in modal", async () => {
    const { sendEmail } = require("@/src/app/lib/sendInvitationEmail");
    const { sendInvitation } = require("@/src/app/(withNavbar)/multirole/adduser/services/invitationService");

    render(<AddUserPage />);
    fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), {
      target: { value: "Hilmy Ammar Darmawan" },
    });
    fireEvent.change(screen.getByLabelText(/Role/i), {
      target: { value: "Karyawan" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "hilmy@gmail.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Lanjutkan/i }));
    fireEvent.click(screen.getByRole("button", { name: /Ya, kirim/i }));

    await waitFor(() => {
      expect(sendInvitation).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });

    expect(screen.getByText(/Pengguna berhasil ditambahkan/i)).toBeInTheDocument();
  });

  it("does not submit when required fields are empty", () => {
    render(<AddUserPage />);
    fireEvent.click(screen.getByRole("button", { name: /Lanjutkan/i }));
    expect(screen.queryByText(/Ringkasan Pengguna Baru/i)).not.toBeInTheDocument();
  });

  it("can navigate back when back button is clicked", () => {
    render(<AddUserPage />);
    fireEvent.click(screen.getByLabelText("Back"));
    expect(mockBack).toHaveBeenCalled();
  });
});