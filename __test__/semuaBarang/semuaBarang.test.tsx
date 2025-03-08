import { act, render, screen, waitFor } from '@testing-library/react';
import SemuaBarang from '@/src/app/semuaBarang/page';
import ProductCard from '@/src/components/ProductCard';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve([
      {
        id: 1,
        nama: 'Produk A',
        foto: '/produk-a.jpg',
        harga_modal: 10000,
        harga_jual: 15000,
        stok: 10,
        satuan: 'pcs',
        kategori: 'Elektronik',
      },
    ]),
  } as Response)
);

describe('Semua Barang Page', () => {
  it('renders the header', () => {
    render(<SemuaBarang />);
    expect(screen.getByText(/Informasi Stok/i)).toBeInTheDocument();
    expect(screen.getByText(/Semua Barang/i)).toBeInTheDocument();
  });

  it('renders pagination buttons', () => {
    render(<SemuaBarang />);
    expect(screen.getByText('Prev')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('renders tambah produk button', () => {
    render(<SemuaBarang />);
    const tambahProdukButton =
      screen.getByText("+") || 
      screen.getByRole("button", { name: "+"});
    expect(tambahProdukButton).toBeInTheDocument();
  });

  it('renders the product list', async () => {
    await act(async () => {
      render(<ProductCard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Produk A')).toBeInTheDocument();
      expect(screen.getByText('Rp 15000 / pcs')).toBeInTheDocument();
    });
  });

  it('deletes a product when delete button is clicked', async () => {
    window.confirm = jest.fn(() => true);
    await act(async () => {
      render(<ProductCard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Produk A')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete product/i });

    await act(async () => {
      userEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('Produk A')).not.toBeInTheDocument();
    });
  });

  it('does not delete product if user cancels confirmation', async () => {
    window.confirm = jest.fn(() => false);
    await act(async () => {
      render(<ProductCard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Produk A')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete product/i });

    await act(async () => {
      userEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Produk A')).toBeInTheDocument();
    });
  });
});
