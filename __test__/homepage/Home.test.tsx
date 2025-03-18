import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import Home from '@/src/app/(withNavbar)/page';

describe('Home Component', () => {
  // Standard test case - Component renders correctly
  it('renders the home page correctly', () => {
    render(<Home />);
    
    // Check if header is present
    expect(screen.getByText('Warung Rifda Kurnia')).toBeInTheDocument();
    
    // Check if main menu items are present
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Catat')).toBeInTheDocument();
    expect(screen.getByText('Pinjam')).toBeInTheDocument();
    
    // Check financial summaries
    expect(screen.getByText('Pemasukan')).toBeInTheDocument();
    expect(screen.getByText('Pengeluaran')).toBeInTheDocument();
    
    // Check quick actions
    expect(screen.getByText('Tambah Barang')).toBeInTheDocument();
    expect(screen.getByText('Riwayat Pinjaman')).toBeInTheDocument();
    expect(screen.getByText('Laporan Keuangan')).toBeInTheDocument();
    
    // Check low stock items
    expect(screen.getByText('Stok Menipis')).toBeInTheDocument();
  });

  // Navigation test case
  it('navigates correctly when clicking on inventory', () => {
    render(<Home />);

    const inventoryLink = screen.getByRole('link', { name: /inventory/i });

    expect(inventoryLink).toHaveAttribute("href", "/semuaBarang"); 

    waitFor(() => {
        fireEvent.click(inventoryLink);
        expect(window.location.pathname).toBe("/semuaBarang");
    });
  });

  // Navigation test case
  it('navigates correctly when clicking on tambah barang', () => {
    render(<Home />);

    const inventoryLink = screen.getByRole('link', { name: /tambah barang/i });

    expect(inventoryLink).toHaveAttribute("href", "/tambahProduk"); 

    waitFor(() => {
        fireEvent.click(inventoryLink);
        expect(window.location.pathname).toBe("/tambahProduk");
    });
  });
});