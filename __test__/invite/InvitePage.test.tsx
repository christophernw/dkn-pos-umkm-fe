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
});