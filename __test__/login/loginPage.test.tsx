import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/src/app/(auth)/login/page';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import config from '@/src/config';

// Mock all the necessary dependencies
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('LoginPage Component', () => {
  // Setup default mocks before each test
  beforeEach(() => {
    // Mock useSession to return null data (not logged in)
    (useSession as jest.Mock).mockReturnValue({
      data: null,
    });

    // Mock useRouter
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock useAuth
    const mockSetAuthData = jest.fn();
    const mockLogout = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      setAuthData: mockSetAuthData,
      logout: mockLogout,
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  // Test 1: Basic rendering test
  it('renders login page with correct elements', () => {
    render(<LoginPage />);
    
    // Check for main heading
    expect(screen.getByText('Masuk ke LANCAR')).toBeInTheDocument();
    
    // Check for subtitle
    expect(screen.getByText('Silahkan masuk dengan akun yang terdaftar di LANCAR')).toBeInTheDocument();
    
    // Check for Google login button
    expect(screen.getByText('Masuk dengan Google')).toBeInTheDocument();
    
    // Check for Google icon
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Test 2: Test Google login button click
  it('calls signIn with correct parameters when Google button is clicked', () => {
    render(<LoginPage />);
    
    // Find and click the Google login button
    const googleButton = screen.getByText('Masuk dengan Google').closest('button');
    fireEvent.click(googleButton!);
    
    // Check if signIn was called with the correct parameters
    expect(signIn).toHaveBeenCalledWith(
      'google',
      { callbackUrl: '/login', redirect: false }
    );
  });

  // Test 3: Test loading state when processing session - FIXED VERSION
  it('shows loading state when processing session', () => {
    // Mock useSession to return session data
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' }
      },
    });
    
    // Create a promise that never resolves for this test
    // This keeps the component in loading state
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(() => {
        // This promise intentionally never resolves
      })
    );
    
    render(<LoginPage />);
    
    // Check if loading text is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Check that the Google button is not visible during loading
    expect(screen.queryByText('Masuk dengan Google')).not.toBeInTheDocument();
  });

  // Test 4: Test session processing success with toko_id
  it('processes session data and redirects to home when user has a toko', async () => {
    // Mock useSession to return session data
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' }
      },
    });
    
    // Mock successful API response with toko_id
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          toko_id: 123
        },
        access: 'test-access-token',
        refresh: 'test-refresh-token'
      })
    });
    
    // Get mocked functions for assertions
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    const mockSetAuthData = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      setAuthData: mockSetAuthData,
      logout: jest.fn(),
    });
    
    render(<LoginPage />);
    
    // Wait for API call and state updates to complete
    await waitFor(() => {
      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.apiUrl}/auth/process-session`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: { name: 'Test User', email: 'test@example.com' }
          }),
        })
      );
      
      // Verify auth data was set correctly
      expect(mockSetAuthData).toHaveBeenCalledWith({
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          toko_id: 123
        },
        access: 'test-access-token',
        refresh: 'test-refresh-token'
      });
      
      // Verify redirect to home page
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  // Test 5: Test session processing for user without toko_id
  it('processes session data and still redirects to home for new users without toko_id', async () => {
    // Mock useSession to return session data
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'New User', email: 'new@example.com' }
      },
    });
    
    // Mock successful API response without toko_id
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        user: {
          id: 2,
          name: 'New User',
          email: 'new@example.com',
          // No toko_id here
        },
        access: 'test-access-token',
        refresh: 'test-refresh-token'
      })
    });
    
    // Get mocked functions for assertions
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    const mockSetAuthData = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      setAuthData: mockSetAuthData,
      logout: jest.fn(),
    });
    
    render(<LoginPage />);
    
    // Wait for API call and state updates to complete
    await waitFor(() => {
      // Verify auth data was set correctly
      expect(mockSetAuthData).toHaveBeenCalledWith({
        user: {
          id: 2,
          name: 'New User',
          email: 'new@example.com'
        },
        access: 'test-access-token',
        refresh: 'test-refresh-token'
      });
      
      // Verify redirect to home page (treated as a new user)
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  // Test 6: Test error handling during API call
  it('handles API errors during session processing', async () => {
    // Mock useSession to return session data
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' }
      },
    });
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock failed API response
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    
    render(<LoginPage />);
    
    // Wait for API call to fail
    await waitFor(() => {
      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith(
        'Authentication error:',
        expect.any(Error)
      );
    });
    
    // Restore original console.error
    console.error = originalConsoleError;
  });
});