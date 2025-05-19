import { render, screen, waitFor } from '@testing-library/react';
import TransactionMainPage from '@/src/app/(withNavbar)/transaksi/page';
import '@testing-library/jest-dom';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    accessToken: 'mocked-token',
  }),
}));

beforeEach(() => {
  global.fetch = jest.fn((url: RequestInfo) => {
    if (typeof url === 'string' && url.includes('/transaksi/summary/monthly')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          pemasukan: { amount: 1000000, change: 10 },
          pengeluaran: { amount: 500000, change: -5 },
          status: 'untung',
          amount: 500000,
        }),
      });
    }

    // Fallback ke transaksi list
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        items: [
          {
            id: '1',
            transaction_type: 'pemasukan',
            category: 'Penjualan',
            total_amount: 150000,
            status: 'Lunas',
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        per_page: 10,
        total_pages: 1,
      }),
    });
  }) as jest.Mock;
});


describe('TransactionMainPage', () => {
  it('renders transaction and filters', async () => {
    render(<TransactionMainPage />);

    await waitFor(() =>
      expect(screen.getByText((text) =>
        text.includes('Transaksi #1')
      )).toBeInTheDocument()
    );

    expect(screen.getByText('Semua')).toBeInTheDocument();
    expect(screen.getAllByText('Lunas').length).toBeGreaterThan(0);
    expect(screen.getByText('Belum Lunas')).toBeInTheDocument();
  });
});

it('shows error when fetching transactions fails', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({ ok: false, status: 500 })
  );

  render(<TransactionMainPage />);

  await waitFor(() => {
    expect(screen.getByText(/Failed to load summary data/i)).toBeInTheDocument();
  });
});

it('shows error when fetching summary data fails', async () => {
  (global.fetch as jest.Mock).mockImplementation((url: RequestInfo) => {
    if (typeof url === 'string' && url.includes('/transaksi/summary/monthly')) {
      return Promise.resolve({ ok: false, status: 500 });
    }

    // fallback transaksi OK
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        items: [],
        total: 0,
        page: 1,
        per_page: 10,
        total_pages: 1,
      }),
    });
  });

  render(<TransactionMainPage />);
  await waitFor(() => {
    expect(screen.getByText(/Failed to load summary data/i)).toBeInTheDocument();
  });
});



it('shows message when no transactions are available', async () => {
  (global.fetch as jest.Mock).mockImplementation((url: RequestInfo) => {
    if (typeof url === 'string' && url.includes('/transaksi/summary/monthly')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          pemasukan: { amount: 0, change: 0 },
          pengeluaran: { amount: 0, change: 0 },
          status: 'rugi',
          amount: 0,
        }),
      });
    }
  
    if (typeof url === 'string' && url.includes('/transaksi')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: [],
          total: 0,
          page: 1,
          per_page: 10,
          total_pages: 1,
        }),
      });
    }
  
    // Default
    return Promise.reject(new Error('Unhandled fetch URL'));
  });
  

  render(<TransactionMainPage />);

  await waitFor(() => {
    expect(screen.getByText(/No transactions found/i)).toBeInTheDocument();
  });

  expect(screen.getByText('Kerugian')).toBeInTheDocument();
  const rp0Elements = screen.getAllByText((text) => text.includes('Rp') && text.includes('0'));
  expect(rp0Elements.length).toBeGreaterThanOrEqual(2);
});

