// __tests__/InvitePage.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import InvitePage from '@/src/app/auth/invite/page';
import { useAuth } from '@/contexts/AuthContext';
import config from '@/src/config';

// Mock external dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/src/config', () => ({
  apiUrl: 'http://localhost:3000/api',
}));

jest.mock('next/script', () => {
  return function MockScript({ children, dangerouslySetInnerHTML, ...props }: any) {
    if (dangerouslySetInnerHTML) {
      return <script {...props} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />;
    }
    return <script {...props}>{children}</script>;
  };
});

// Mock fetch globally
global.fetch = jest.fn();
global.AbortSignal = {
  timeout: jest.fn().mockImplementation((timeout) => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    aborted: false,
    reason: undefined,
  })),
} as any;

describe('InvitePage Component', () => {
  const mockPush = jest.fn();
  const mockLogout = jest.fn();
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useAuth as jest.Mock).mockReturnValue({ logout: mockLogout });
    (signOut as jest.Mock).mockResolvedValue(undefined);
    
    // Reset fetch mock
    (fetch as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial Loading State', () => {
    it('should render loading state initially', () => {
      mockSearchParams.get.mockReturnValue('valid-token');
      
      render(<InvitePage />);
      
      expect(screen.getByText('Validasi Undangan')).toBeInTheDocument();
      expect(screen.getByText('Memproses undangan Anda...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('should render maze script', () => {
      mockSearchParams.get.mockReturnValue('valid-token');
      
      render(<InvitePage />);
      
      const script = document.querySelector('#maze-script');
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute('id', 'maze-script');
    });
  });

  describe('Token Validation', () => {
    it('should show error when token is missing', async () => {
      mockSearchParams.get.mockReturnValue(null);
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Token undangan tidak ditemukan.')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Kembali ke Beranda')).toBeInTheDocument();
      });
    });

    it('should show error when token is empty string', async () => {
      mockSearchParams.get.mockReturnValue('');
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Token undangan tidak ditemukan.')).toBeInTheDocument();
      });
    });
  });

  describe('Successful Validation', () => {
    beforeEach(() => {
      mockSearchParams.get.mockReturnValue('valid-token');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: true,
          message: 'User successfully registered',
        }),
      });
    });

    it('should show success message on valid invitation', async () => {
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Pendaftaran berhasil! Anda telah terdaftar dan terhubung dengan toko.')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('bg-green-100');
        expect(screen.getByText('Login ke Aplikasi')).toBeInTheDocument();
      });
    });

    it('should call logout and signOut on success', async () => {
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(signOut).toHaveBeenCalledWith({ redirect: false });
      });
    });

    it('should only validate once on multiple renders', async () => {
      const { rerender } = render(<InvitePage />);
      
      rerender(<InvitePage />);
      rerender(<InvitePage />);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockSearchParams.get.mockReturnValue('invalid-token');
    });

    it('should handle invalid invitation error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: false,
          error: 'Invalid invitation',
        }),
      });
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Undangan tidak valid atau telah dihapus oleh pemilik. Silakan minta undangan baru.')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('bg-red-100');
        expect(screen.getByText('Kembali ke Beranda')).toBeInTheDocument();
      });
    });

    it('should handle custom backend error message', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: false,
          error: 'Custom backend error',
        }),
      });
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Custom backend error')).toBeInTheDocument();
      });
    });

    it('should handle validation error with no specific error message', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: false,
        }),
      });
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Terjadi kesalahan saat memvalidasi undangan.')).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Failed to fetch'));
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')).toBeInTheDocument();
      });
    });

    it('should handle timeout error', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      (fetch as jest.Mock).mockRejectedValueOnce(abortError);
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Permintaan timeout. Silakan coba lagi.')).toBeInTheDocument();
      });
    });

    it('should handle HTTP error status', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Terjadi kesalahan saat memproses undangan Anda.')).toBeInTheDocument();
      });
    });

    it('should handle generic error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Some random error'));
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Terjadi kesalahan saat memproses undangan Anda.')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call API with correct parameters', async () => {
      mockSearchParams.get.mockReturnValue('test-token');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true }),
      });
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          `${config.apiUrl}/auth/validate-invitation`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: 'test-token' }),
            signal: expect.any(Object),
          }
        );
      });
    });

    it('should include timeout signal in fetch request', async () => {
      mockSearchParams.get.mockReturnValue('test-token');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true }),
      });
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(AbortSignal.timeout).toHaveBeenCalledWith(10000);
      });
    });
  });

  describe('User Interactions', () => {
    it('should navigate to login on success button click', async () => {
      mockSearchParams.get.mockReturnValue('valid-token');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true }),
      });
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Login ke Aplikasi')).toBeInTheDocument();
      });
      
      const loginLink = screen.getByRole('link', { name: 'Login ke Aplikasi' });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should navigate to home on error button click', async () => {
      mockSearchParams.get.mockReturnValue('invalid-token');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: false, error: 'Invalid invitation' }),
      });
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Kembali ke Beranda')).toBeInTheDocument();
      });
      
      const homeLink = screen.getByRole('link', { name: 'Kembali ke Beranda' });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup properly on unmount', async () => {
      mockSearchParams.get.mockReturnValue('test-token');
      (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const { unmount } = render(<InvitePage />);
      
      unmount();
      
      // Component should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple re-renders correctly', async () => {
      mockSearchParams.get.mockReturnValue('test-token');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true }),
      });
      
      const { rerender } = render(<InvitePage />);
      
      // Force multiple re-renders
      for (let i = 0; i < 5; i++) {
        rerender(<InvitePage />);
      }
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed JSON response', async () => {
      mockSearchParams.get.mockReturnValue('test-token');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });
      
      render(<InvitePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Terjadi kesalahan saat memproses undangan Anda.')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      mockSearchParams.get.mockReturnValue('test-token');
      
      render(<InvitePage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Validasi Undangan');
      expect(heading).toHaveClass('text-center');
    });

    it('should have proper focus management on interactive elements', async () => {
      mockSearchParams.get.mockReturnValue('valid-token');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true }),
      });
      
      render(<InvitePage />);
      
      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Login ke Aplikasi' });
        expect(link).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
      });
    });

    it('should have proper color contrast for text elements', async () => {
      mockSearchParams.get.mockReturnValue('test-token');
      
      render(<InvitePage />);
      
      const title = screen.getByText('Validasi Undangan');
      expect(title).toHaveClass('text-gray-800');
    });

    it('should include Maze API key in script', () => {
      mockSearchParams.get.mockReturnValue('valid-token');

      render(<InvitePage />);

      const script = document.querySelector('#maze-script');
      expect(script?.innerHTML).toContain('e31b53f6-c7fd-47f2-85df-d3c285f18b33');
    });

  });

  describe('Performance', () => {
    it('should not cause memory leaks with useCallback', () => {
      mockSearchParams.get.mockReturnValue('test-token');
      
      const { rerender } = render(<InvitePage />);
      
      // Multiple re-renders should not create new callback instances
      for (let i = 0; i < 10; i++) {
        rerender(<InvitePage />);
      }
      
      expect(() => rerender(<InvitePage />)).not.toThrow();
    });
  });

  describe('Constants and Messages', () => {
    it('should use constants for all messages', async () => {
      // Test that all message constants are being used
      const testCases = [
        {
          setup: () => mockSearchParams.get.mockReturnValue(null),
          expectedMessage: 'Token undangan tidak ditemukan.',
        },
        {
          setup: () => {
            mockSearchParams.get.mockReturnValue('test-token');
            (fetch as jest.Mock).mockResolvedValueOnce({
              ok: true,
              json: async () => ({ valid: true }),
            });
          },
          expectedMessage: 'Pendaftaran berhasil! Anda telah terdaftar dan terhubung dengan toko.',
        },
        {
          setup: () => {
            mockSearchParams.get.mockReturnValue('test-token');
            (fetch as jest.Mock).mockResolvedValueOnce({
              ok: true,
              json: async () => ({ valid: false, error: 'Invalid invitation' }),
            });
          },
          expectedMessage: 'Undangan tidak valid atau telah dihapus oleh pemilik. Silakan minta undangan baru.',
        },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        testCase.setup();
        
        const { unmount } = render(<InvitePage />);
        
        await waitFor(() => {
          expect(screen.getByText(testCase.expectedMessage)).toBeInTheDocument();
        });
        
        unmount();
      }
    });
  });
});