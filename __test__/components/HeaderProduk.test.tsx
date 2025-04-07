import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import HeaderProduk from '@/src/components/HeaderProduk'

Object.defineProperty(window, 'location', {
  value: {
    href: '/semuaBarang'
  },
  writable: true
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve([]),
  } as Response)
);

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    toString: jest.fn()
  })),
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

import { usePathname, useSearchParams, useRouter } from 'next/navigation'

describe('HeaderProduk Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(),
      toString: jest.fn()
    });
  })
  
  it('highlights "Informasi Stok" link when on /daftarProduk page', () => {
    (usePathname as jest.Mock).mockReturnValue('/daftarProduk')
    
    render(<HeaderProduk />)
  
    const infoStokLink = screen.getByText('Informasi Stok')
    expect(infoStokLink).toHaveClass('font-bold')
    expect(infoStokLink).not.toHaveClass('font-medium')

    const semuaBarangLink = screen.getByText('Semua Barang')
    expect(semuaBarangLink).toHaveClass('font-medium')
    expect(semuaBarangLink).not.toHaveClass('font-bold')
  })
  
  it('highlights "Semua Barang" link when on /semuaBarang page', () => {
    (usePathname as jest.Mock).mockReturnValue('/semuaBarang')
    render(<HeaderProduk />)

    const semuaBarangLink = screen.getByText('Semua Barang')
    expect(semuaBarangLink).toHaveClass('font-bold')
    expect(semuaBarangLink).not.toHaveClass('font-medium')

    const infoStokLink = screen.getByText('Informasi Stok')
    expect(infoStokLink).toHaveClass('font-medium')
    expect(infoStokLink).not.toHaveClass('font-bold')
  })
  
  it('search input functions correctly', () => {
    (usePathname as jest.Mock).mockReturnValue('/semuaBarang')
    render(<HeaderProduk />)
 
    const searchInput = screen.getByPlaceholderText('Cari Produk...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    expect(searchInput).toHaveValue('test search')
  })

  it("should have a link to home with the correct href", () => {
    (usePathname as jest.Mock).mockReturnValue('/semuaBarang')
    render(<HeaderProduk />)

    const backButton = screen.getByLabelText("back")
    expect(backButton).toBeInTheDocument()
    expect(backButton).toHaveAttribute('href', '/')
  })

  it("should have a link to informasi stok with the correct href", () => {
    (usePathname as jest.Mock).mockReturnValue('/semuaBarang')
    render(<HeaderProduk />)

    const informasiStokLink = screen.getByRole("link", { name: /informasi stok/i })
    expect(informasiStokLink).toBeInTheDocument()
    expect(informasiStokLink).toHaveAttribute('href', '/daftarProduk')
  })
  
  it('filter button toggles dropdown', () => {
    (usePathname as jest.Mock).mockReturnValue('/semuaBarang')
    render(<HeaderProduk />)

    const filterButton = screen.getAllByRole('button').find(button => 
      button.querySelector('svg') && button.closest('.right-1\\.5')
    );
    expect(filterButton).toBeInTheDocument();
    
    expect(screen.queryByText(/Stok Terendah/i)).not.toBeInTheDocument();
    
    if (filterButton) {
      fireEvent.click(filterButton);
    }
    
    expect(screen.getByText(/Stok Terendah/i)).toBeInTheDocument();
    expect(screen.getByText(/Stok Tertinggi/i)).toBeInTheDocument();
  })

  it('should handle sort by ascending order', () => {

    (usePathname as jest.Mock).mockReturnValue('/semuaBarang');
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(),
      toString: jest.fn(() => 'sort=asc')
    });
    
    render(<HeaderProduk />)
    
    const filterButton = screen.getAllByRole('button').find(button => 
      button.querySelector('svg') && button.closest('.right-1\\.5')
    );
    if (filterButton) {
      fireEvent.click(filterButton);
    }
    
    const ascButton = screen.getByText(/Stok Terendah/i);
    fireEvent.click(ascButton);
    
    expect(mockPush).toHaveBeenCalled();
    expect(mockPush.mock.calls[0][0]).toContain('/semuaBarang?');
    expect(mockPush.mock.calls[0][0]).toContain('sort=asc');
  })

  it('should handle sort by descending order', () => {
    (usePathname as jest.Mock).mockReturnValue('/semuaBarang');
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(),
      toString: jest.fn(() => 'sort=desc')
    });
    
    render(<HeaderProduk />)
    
    const filterButton = screen.getAllByRole('button').find(button => 
      button.querySelector('svg') && button.closest('.right-1\\.5')
    );
    if (filterButton) {
      fireEvent.click(filterButton);
    }
    
    const descButton = screen.getByText(/Stok Tertinggi/i);
    fireEvent.click(descButton);
    
    expect(mockPush).toHaveBeenCalled();
    expect(mockPush.mock.calls[0][0]).toContain('/semuaBarang?');
    expect(mockPush.mock.calls[0][0]).toContain('sort=desc');
  })

  it('should add search term to URL when form submitted with non-empty search', () => {
    // Set up mocks
    (usePathname as jest.Mock).mockReturnValue('/semuaBarang');
    const mockToString = jest.fn(() => 'q=test%20search');
    
    // Create mock for URLSearchParams
    const mockSet = jest.fn();
    const mockDelete = jest.fn();
    const originalURLSearchParams = global.URLSearchParams;
    global.URLSearchParams = jest.fn().mockImplementation(() => ({
      set: mockSet,
      delete: mockDelete,
      toString: mockToString
    })) as any;
    
    render(<HeaderProduk />);
    
    // Fill in the search input
    const searchInput = screen.getByPlaceholderText('Cari Produk...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Submit the form
    const form = searchInput.closest('form');
    fireEvent.submit(form!);
    
    // Check that the search parameter was set
    expect(mockSet).toHaveBeenCalledWith('q', 'test search');
    
    // Check that router.push was called with the constructed URL
    expect(mockPush).toHaveBeenCalledWith('/semuaBarang?q=test%20search');
    
    // Restore original URLSearchParams
    global.URLSearchParams = originalURLSearchParams;
  });
})
