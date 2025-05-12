import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from '@/src/app/(withNavbar)/multirole/components/userList';
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import {
  getPendingInvitations,
  deleteInvitation,
  PendingInvitation,
} from "@/src/app/(withNavbar)/multirole/services/invitationService";
import { sendRemovalNotificationEmail } from "@/src/app/lib/emailservice";
import config from "@/src/config";

// Mock dependencies
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn()
}));

jest.mock("@/contexts/ModalContext", () => ({
  useModal: jest.fn()
}));

jest.mock("@/src/app/(withNavbar)/multirole/services/invitationService", () => ({
  getPendingInvitations: jest.fn(),
  deleteInvitation: jest.fn()
}));

jest.mock("@/src/app/lib/emailservice", () => ({
  sendRemovalNotificationEmail: jest.fn()
}));

// Create a type for the mocked fetch
type MockedFetch = jest.MockedFunction<typeof globalThis.fetch>;

describe('UserList Component', () => {
  const mockUser = {
    id: 1,
    email: 'owner@example.com',
    name: 'Store Owner',
    role: 'Pemilik'
  };

  const mockUsers = [
    mockUser,
    {
      id: 2,
      email: 'manager@example.com',
      name: 'Store Manager',
      role: 'Pengelola'
    },
    {
      id: 3,
      email: 'employee@example.com',
      name: 'Employee',
      role: 'Karyawan'
    }
  ];

  const mockPendingInvitations = [
    {
      id: 1,
      name: 'Pending User',
      email: 'pending@example.com',
      role: 'Karyawan',
      expires_at: '2024-12-31T00:00:00Z'
    }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      accessToken: 'mock-token'
    });

    // Use custom implementation for showModal to simulate button click
    const mockShowModal = jest.fn((title, message, type, confirmButton, cancelButton) => {
      // Simulate calling the confirm button's onClick
      if (confirmButton && confirmButton.onClick) {
        confirmButton.onClick();
      }
    });

    (useModal as jest.Mock).mockReturnValue({
      showModal: mockShowModal,
      hideModal: jest.fn()
    });

    (getPendingInvitations as jest.Mock).mockResolvedValue(mockPendingInvitations);

    // Type the fetch mock correctly
    const fetchMock = jest.fn() as MockedFetch;
    fetchMock.mockImplementation((url) => {
      if (url.toString().includes('/auth/get-users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsers)
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      } as Response);
    });

    // Replace global fetch with our mock
    global.fetch = fetchMock;
  });

  afterEach(() => {
    // Restore original fetch after each test
    global.fetch = globalThis.fetch;
  });

  test('renders loading state initially', async () => {
    render(<UserList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders users and pending invitations successfully', async () => {
    render(<UserList />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('Store Manager')).toBeInTheDocument();
      expect(screen.getByText('Employee')).toBeInTheDocument();
    });

    // Check role tags - use more specific queries
    const karyawanTags = screen.getAllByText('Karyawan');
    expect(karyawanTags.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Pemilik')).toBeInTheDocument();
    expect(screen.getByText('Pengelola')).toBeInTheDocument();

    // Check pending invitation
    await waitFor(() => {
      expect(screen.getByText('Pending User')).toBeInTheDocument();
      expect(screen.getByText(/Kadaluarsa:/)).toBeInTheDocument();
    });
  });

  test('handles invitation deletion', async () => {
    const mockDeleteInvitation = jest.fn().mockResolvedValue({});
    (deleteInvitation as jest.Mock).mockImplementation(mockDeleteInvitation);

    render(<UserList />);

    // Wait for pending invitations to load
    await waitFor(() => {
      expect(screen.getByText('Pending User')).toBeInTheDocument();
    });

    // Find and click delete button for pending invitation
    const deleteButtons = screen.getAllByTitle('Delete invitation');
    fireEvent.click(deleteButtons[0]);

    // Check that invitation was deleted
    await waitFor(() => {
      expect(mockDeleteInvitation).toHaveBeenCalled();
    });
  });

  test('handles error state', async () => {
    // Replace fetch with a new mock for this test
    const fetchMock = jest.fn() as MockedFetch;
    fetchMock.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch users' })
      } as Response)
    );
    global.fetch = fetchMock;

    render(<UserList />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
    });
  });

  test('does not show delete button for owner user', async () => {
    render(<UserList />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('Store Owner')).toBeInTheDocument();
    });

    // Find all delete buttons
    const deleteButtons = screen.queryAllByTitle('Remove user');
    
    // Owner's own user should not have a delete button
    const ownerDeleteButton = deleteButtons.find(button => 
      button.closest('li')?.textContent?.includes('Store Owner')
    );
    expect(ownerDeleteButton).toBeUndefined();
  });

  test('handles failed user deletion correctly', async () => {
    // Mock fetch to return failure when removing user
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.toString().includes('/auth/remove-user-from-toko')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Deletion failed' })
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      } as Response);
    });

    render(<UserList />);
    await waitFor(() => screen.getByText('manager@example.com'));

    const deleteButtons = screen.getAllByTitle('Remove user');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('manager@example.com')).toBeInTheDocument();
    });

    expect(screen.queryByText('Pengguna berhasil dihapus!')).not.toBeInTheDocument();
  });
});