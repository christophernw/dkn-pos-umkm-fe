import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import UserList from "@/src/app/(withNavbar)/multirole/components/userList";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import config from "@/src/config";

jest.mock("@/contexts/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("@/contexts/ModalContext", () => ({
    useModal: jest.fn(),
}));

jest.mock("@/src/config", () => ({
    apiUrl: "http://test-api.example.com",
}));

jest.mock("lucide-react", () => ({
    Trash: () => <div data-testid="trash-icon" />,
    MailX: () => <div data-testid="mail-x-icon" />,
}));

global.fetch = jest.fn();

describe("UserList", () => {
    const mockUsers = [
        { id: 1, email: "owner@example.com", name: "Owner User", role: "Pemilik", status: "active" },
        { id: 2, email: "manager@example.com", name: "Manager User", role: "Pengelola", status: "active" },
        { id: 3, email: "pending@example.com", name: "Pending User", role: "Karyawan", status: "pending" },
    ];

    const mockAuthContext = {
        user: {
            id: 1,
            role: "Pemilik",
            email: "owner@example.com",
            name: "Owner User",
        },
        accessToken: "fake-token",
        refreshToken: "fake-refresh-token",
        isAuthenticated: true,
        logout: jest.fn(),
        setAuthData: jest.fn(),
    };

    const mockModalContext = {
        showModal: jest.fn(),
        hideModal: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue(mockAuthContext);
        (useModal as jest.Mock).mockReturnValue(mockModalContext);
        (global.fetch as jest.Mock).mockImplementation((url) => {
            if (url === `${config.apiUrl}/auth/get-users`) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockUsers),
                    status: 200,
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true }),
                status: 200,
            });
        });
    });

    it("fetches and displays users correctly", async () => {
        render(<UserList />);

        // Check loading state
        expect(screen.getByText("Loading...")).toBeInTheDocument();

        // Wait for users to be fetched and displayed
        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
            expect(screen.getByText("Owner User")).toBeInTheDocument();
            expect(screen.getByText("Manager User")).toBeInTheDocument();
            expect(screen.getByText("Pending User")).toBeInTheDocument();
            expect(screen.getByText("(Pending)")).toBeInTheDocument();
        });

        // Verify emails are displayed
        expect(screen.getByText("owner@example.com")).toBeInTheDocument();
        expect(screen.getByText("manager@example.com")).toBeInTheDocument();
        expect(screen.getByText("pending@example.com")).toBeInTheDocument();

        // Verify roles are displayed
        expect(screen.getAllByText("Pemilik")[0]).toBeInTheDocument();
        expect(screen.getByText("Pengelola")).toBeInTheDocument();
        expect(screen.getByText("Karyawan")).toBeInTheDocument();
    });

    // Handles fetch users error correctly
    it("handles fetch users error correctly", async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 403,
                json: () => Promise.resolve({ error: "Access denied" }),
            })
        );

        render(<UserList />);

        await waitFor(() => {
            expect(screen.getByText("Failed to fetch users")).toBeInTheDocument();
        });
    });

    // Displays specific error messages from API
    it("displays specific error messages from API", async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.reject(new Error("Network error"))
        );

        render(<UserList />);

        await waitFor(() => {
            expect(screen.getByText("Network error")).toBeInTheDocument();
        });
    });

    // Refetches users when accessToken changes
    it("refetches users when accessToken changes", async () => {
        const { rerender } = render(<UserList />);

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);

        const updatedAuthContext = {
            ...mockAuthContext,
            accessToken: "new-token",
        };

        (useAuth as jest.Mock).mockReturnValue(updatedAuthContext);

        rerender(<UserList />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenCalledWith(
                `${config.apiUrl}/auth/get-users`,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: "Bearer new-token",
                    }),
                })
            );
        });
    });

    // Uses correct actions configuration for different user statuses
    it("uses correct actions configuration for different user statuses", async () => {
        render(<UserList />);

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        const cancelButton = screen.getAllByTitle("Cancel invitation")[0];
        fireEvent.click(cancelButton);

        expect(mockModalContext.showModal).toHaveBeenCalledWith(
            "Konfirmasi",
            "Apakah Anda yakin ingin batalkan?",
            "info",
            expect.objectContaining({ label: "Batalkan" }),
            expect.objectContaining({ label: "Batal" })
        );

        jest.clearAllMocks();

        const removeButton = screen.getAllByTitle("Remove user")[0];
        fireEvent.click(removeButton);

        expect(mockModalContext.showModal).toHaveBeenCalledWith(
            "Konfirmasi",
            "Apakah Anda yakin ingin hapus?",
            "info",
            expect.objectContaining({ label: "Hapus" }),
            expect.objectContaining({ label: "Batal" })
        );
    });

    // Only shows action buttons when logged in user is the owner
    it("only shows action buttons when logged in user is the owner", async () => {
        const { unmount } = render(<UserList />);

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        expect(screen.getAllByTitle(/Remove user|Cancel invitation/).length).toBe(2);

        unmount();

        (useAuth as jest.Mock).mockReturnValue({
            ...mockAuthContext,
            user: {
                ...mockAuthContext.user,
                role: "Pengelola",
            },
        });

        render(<UserList />);

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        expect(screen.queryByTitle(/Remove user|Cancel invitation/)).toBeNull();
    });

    // Disables action buttons during deletion
    it("disables action buttons during deletion", async () => {
        render(<UserList />);

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        const removeButton = screen.getAllByTitle("Remove user")[0];
        fireEvent.click(removeButton);

        const onClickConfirm = mockModalContext.showModal.mock.calls[0][3].onClick;

        let resolveDeletePromise: Function;
        const deletePromise = new Promise<Response>((resolve) => {
            resolveDeletePromise = resolve;
        });

        (global.fetch as jest.Mock).mockImplementationOnce(() => deletePromise);

        const confirmPromise = onClickConfirm();

        render(<UserList />);

        resolveDeletePromise!({
            ok: true,
            json: () => Promise.resolve({ success: true }),
            status: 200,
        });

        await confirmPromise;

        render(<UserList />);

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        const newRemoveButton = screen.getAllByTitle("Remove user")[0];
        expect(newRemoveButton).toBeEnabled();
    });

    // Exports the UserList component correctly
    it("exports the UserList component correctly", () => {
        expect(UserList).toBeDefined();
        expect(typeof UserList).toBe("function");
    });

    it("handles authentication errors correctly", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            ...mockAuthContext,
            accessToken: null,
        });

        render(<UserList />);

        await waitFor(() => {
            expect(screen.getByText("You are not authenticated")).toBeInTheDocument();
        });
    });

    it("shows success message after cancel invitation", async () => {
        render(<UserList />);

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        const cancelButton = screen.getAllByTitle("Cancel invitation")[0];
        fireEvent.click(cancelButton);

        const onClickConfirm = mockModalContext.showModal.mock.calls[0][3].onClick;
        await onClickConfirm();

        expect(mockModalContext.showModal).toHaveBeenCalledWith(
            "Berhasil",
            "Undangan berhasil dibatalkan!",
            "success"
        );
    });

    it("displays no users message when user list is empty", async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
                status: 200,
            })
        );

        render(<UserList />);

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        expect(screen.getByText("No users found.")).toBeInTheDocument();
    });
});
