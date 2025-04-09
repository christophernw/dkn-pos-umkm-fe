import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SettingsPage from '@/src/app/(withNavbar)/pengaturan/page';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signOut: jest.fn().mockResolvedValue(true)
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the Modal component
jest.mock('@/src/components/elements/modal/Modal', () => ({
    Modal: ({ children, onClose }: { 
      children: React.ReactNode; 
      onClose: () => void 
    }) => (
      <div data-testid="modal">
        {children}
        <button data-testid="close-modal" onClick={onClose}>Close</button>
      </div>
    )
  }));

// Mock the Header component
jest.mock('@/src/app/(withNavbar)/pengaturan/module-element/Header', () => ({
  Header: () => <div data-testid="header">Header Component</div>
}));

describe('SettingsPage', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders the settings page with navigation links', () => {
    render(<SettingsPage />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Modal should not be visible initially
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('opens the modal when logout is clicked', () => {
    render(<SettingsPage />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // Modal should now be visible
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Apakah anda yakin ingin Logout?')).toBeInTheDocument();
    expect(screen.getByText('Ya')).toBeInTheDocument();
    expect(screen.getByText('Tidak')).toBeInTheDocument();
  });

  it('closes the modal when "Tidak" button is clicked', () => {
    render(<SettingsPage />);
    
    // Open the modal first
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // Modal should be visible
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    
    // Click "Tidak"
    const noButton = screen.getByText('Tidak');
    fireEvent.click(noButton);
    
    // Modal should be closed
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('signs out when "Ya" button is clicked', async () => {
    render(<SettingsPage />);
    
    // Open the modal first
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // Click "Ya"
    const yesButton = screen.getByText('Ya');
    fireEvent.click(yesButton);
    
    // Check if signOut was called
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});