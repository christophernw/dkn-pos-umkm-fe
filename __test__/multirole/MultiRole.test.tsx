// __tests__/MultiRolePage.test.tsx

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import MultiRolePage from "@/src/app/(withNavbar)/multirole/page";
import Header from "@/src/app/(withNavbar)/multirole/components/header";
import UserList from "@/src/app/(withNavbar)/multirole/components/userList";
import AddUserButton from "@/src/app/(withNavbar)/multirole/components/addUserButton";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { SessionProvider } from "next-auth/react";

// --- Mocks for next/navigation ---
const mockPush = jest.fn();
const mockBack = jest.fn();
global.fetch = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// --- Setup a helper render function that wraps components with providers ---
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <SessionProvider>
      <AuthProvider>
        <ModalProvider>{ui}</ModalProvider>
      </AuthProvider>
    </SessionProvider>
  );
};

// --- Mocking the useAuth context for testing UserList ---
jest.mock("@/contexts/AuthContext", () => {
  return {
    useAuth: () => ({
      user: { id: 1, name: "Owner", email: "owner@example.com", role: "Pemilik" },
      accessToken: "test-token",
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

// --- Mocking the useModal context ---
const mockShowModal = jest.fn();
const mockHideModal = jest.fn();
jest.mock("@/contexts/ModalContext", () => {
  return {
    useModal: () => ({
      showModal: mockShowModal,
      hideModal: mockHideModal,
    }),
    ModalProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

// --- Global fetch mock ---
// For user fetching and deletion in UserList.
const mockUsers = [
  { id: 2, email: "user1@example.com", name: "User One", role: "Administrator" },
  { id: 3, email: "user2@example.com", name: "User Two", role: "Karyawan" },
];
beforeEach(() => {
  jest.clearAllMocks();

  // 👇 Tambahkan ini untuk menghindari CLIENT_FETCH_ERROR dari next-auth
  (global.fetch as jest.Mock).mockImplementation((url) => {
    if (url === "/api/auth/session") {
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => [],
    });
  });
});

describe("MultiRolePage", () => {
  it("renders the header, user list and add user button", () => {
    renderWithProviders(<MultiRolePage />);
    expect(screen.getByText("Pengaturan Pengguna")).toBeInTheDocument();
    // Check for Add User button
    expect(screen.getByRole("button", { name: /\+ Tambah Akun/i })).toBeInTheDocument();
  });
});

describe("Header Component", () => {
  it("calls router.back when back button is clicked", () => {
    renderWithProviders(<Header />);
    const backButton = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backButton);
    expect(mockBack).toHaveBeenCalled();
  });
});

describe("AddUserButton Component", () => {
  it("navigates to the add user page when clicked", () => {
    renderWithProviders(<AddUserButton />);
    const addButton = screen.getByRole("button", { name: /\+ Tambah Akun/i });
    fireEvent.click(addButton);
    expect(mockPush).toHaveBeenCalledWith("/multirole/adduser");
  });
});

describe("UserList Component", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("shows loading state", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // never resolves
  
    renderWithProviders(<UserList />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows message when no users are returned", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  });

  renderWithProviders(<UserList />);

  await waitFor(() =>
    expect(screen.getByText(/no users found/i)).toBeInTheDocument()
  );
  });

  it("displays error message when fetch fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to fetch users" }),
    });

    await waitFor(() => renderWithProviders(<UserList />));

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch users/i)).toBeInTheDocument();
    });
  });

  it("triggers delete modal and calls delete API on confirmation", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      }) // initial fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "User removed" }),
      }) // delete user
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // after deletion
      });

    await waitFor(() => renderWithProviders(<UserList />));

    await waitFor(() => {
      expect(screen.getByText("User One")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle("Remove user");
    fireEvent.click(deleteButtons[0]);

    expect(mockShowModal).toHaveBeenCalledWith(
      "Konfirmasi",
      "Apakah Anda yakin ingin menghapus pengguna ini?",
      "info",
      expect.objectContaining({
        onClick: expect.any(Function),
      }),
      expect.any(Object)
    );

    // Simulate clicking confirm
    const confirmAction = mockShowModal.mock.calls[0][3].onClick;
    await act(async () => {
      await confirmAction();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/remove-user-from-toko"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer test-token`,
        }),
      })
    );

    expect(mockShowModal).toHaveBeenCalledWith(
      "Berhasil",
      "Pengguna berhasil dihapus!",
      "success"
    );
  });
});
