import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserList from "@/src/app/(withNavbar)/multirole/components/userList"
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import { sendRemovalNotificationEmail } from "@/src/app/lib/emailservice";
import config from "@/src/config";

jest.mock("@/contexts/AuthContext");
jest.mock("@/contexts/ModalContext");
jest.mock("@/src/app/lib/emailservice");
jest.mock("@/src/config", () => ({
  apiUrl: "http://test-api.com"
}));

global.fetch = jest.fn();

describe("UserList Component - Remove User Flow", () => {
  const mockUsers = [
    { id: 1, name: "Owner User", email: "owner@example.com", role: "Pemilik" },
    { id: 2, name: "Employee User", email: "employee@example.com", role: "Karyawan" }
  ];

  const mockUser = { 
    id: 1, 
    name: "Owner User", 
    email: "owner@example.com", 
    role: "Pemilik" 
  };

  const mockAccessToken = "test-token";
  const mockShowModal = jest.fn();
  const mockHideModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      accessToken: mockAccessToken
    });

    (useModal as jest.Mock).mockReturnValue({
      showModal: mockShowModal,
      hideModal: mockHideModal
    });

    (sendRemovalNotificationEmail as jest.Mock).mockResolvedValue({ status: 200 });

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === `${config.apiUrl}/auth/get-users`) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsers)
        });
      }
      return Promise.reject(new Error("Unhandled fetch"));
    });
  });

  test("Pemilik should remove a Karyawan and the user should no longer appear in the list", async () => {
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText("Employee User")).toBeInTheDocument();
    });
    const deleteButton = screen.getByTitle("Remove user");
    
    fireEvent.click(deleteButton);

    expect(mockShowModal).toHaveBeenCalledWith(
      "Konfirmasi",
      "Apakah Anda yakin ingin menghapus pengguna ini?",
      "info",
      expect.objectContaining({ label: "Hapus" }),
      expect.objectContaining({ label: "Batal" })
    );

    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url === `${config.apiUrl}/auth/remove-user-from-toko`) {
        const body = JSON.parse(options.body);
        if (body.user_id === 2) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          });
        }
      } else if (url === `${config.apiUrl}/auth/get-users`) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockUsers[0]]) 
        });
      }
      return Promise.reject(new Error("Unhandled fetch"));
    });

    const confirmCallback = mockShowModal.mock.calls[0][3].onClick;
    await confirmCallback();

    expect(global.fetch).toHaveBeenCalledWith(
      `${config.apiUrl}/auth/remove-user-from-toko`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockAccessToken}`
        }),
        body: JSON.stringify({ user_id: 2 }) 
      })
    );

    expect(sendRemovalNotificationEmail).toHaveBeenCalledWith({
      to: "employee@example.com",
      senderName: "Owner User",
      senderEmail: "owner@example.com",
      userName: "Employee User",
      ownerName: "Owner User"
    });

    expect(mockShowModal).toHaveBeenCalledWith(
      "Berhasil", 
      "Pengguna berhasil dihapus dan notifikasi telah dikirim!", 
      "success"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${config.apiUrl}/auth/get-users`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockAccessToken}`
        })
      })
    );

    await waitFor(() => {
      expect(screen.queryByText("Employee User")).not.toBeInTheDocument();
      expect(screen.getByText("Owner User")).toBeInTheDocument();
    });
  });
});

