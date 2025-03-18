import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EditProductPage from '@/src/app/editProduk/[id]/page';
import { fetchProduct, updateProduct } from '@/src/services/productServices';
import { validateProductData } from '@/src/services/validation';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/src/services/productServices', () => ({
  fetchProduct: jest.fn(),
  updateProduct: jest.fn(),
}));

jest.mock('@/src/services/validation', () => ({
  validateProductData: jest.fn(),
}));

jest.mock('@/src/components/ConfirmDialog', () => {
  return function MockConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
    return (
      <div data-testid="confirm-dialog">
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );
  };
});

describe('EditProductPage Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  const mockProduct = {
    nama: 'Test Product',
    kategori: 'Test Category',
    harga_modal: '10000',
    harga_jual: '15000',
    stok: '50',
    foto: null,
    satuan: 'Pcs',
  };

  // Create a resolved promise for params
  const mockParams = Promise.resolve({ id: '123' });

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (fetchProduct as jest.Mock).mockResolvedValue(mockProduct);
    (validateProductData as jest.Mock).mockReturnValue(null); // No validation errors
    global.alert = jest.fn();
    global.FileReader = class {
      onload: (() => void) | null = null;
      result: string | null = null;
      readAsDataURL = jest.fn(() => {
        this.result = 'data:image/jpeg;base64,testImageData';
        if (this.onload) this.onload();
      });
    } as unknown as typeof FileReader;
    Object.defineProperty(window, 'history', {
      value: { back: jest.fn() },
      writable: true,
    });
  });

  test('renders product form with correct initial state', async () => {
    // Use act to wrap the initial render
    await act(async () => {
      render(<EditProductPage params={mockParams} />);
    });
    
    // Wait for the product data to be fetched and rendered
    await waitFor(() => {
      expect(fetchProduct).toHaveBeenCalledWith('123');
    });
    
    // Check if form elements are rendered with correct values
    await waitFor(() => {
      expect(screen.getByLabelText(/Nama Produk/i)).toHaveValue('Test Product');
      expect(screen.getByLabelText(/Kategori/i)).toHaveValue('Test Category');
      expect(screen.getByLabelText(/Harga Modal/i)).toHaveValue(10000);
      expect(screen.getByLabelText(/Harga Jual/i)).toHaveValue(15000);
      expect(screen.getByLabelText(/Stok Saat Ini/i)).toHaveValue(50);
      expect(screen.getByLabelText(/Pilih Satuan/i)).toHaveValue('Pcs');
    });
  });

  test('updates form fields when user types into inputs', async () => {
    await act(async () => {
      render(<EditProductPage params={mockParams} />);
    });
    
    await waitFor(() => {
      expect(fetchProduct).toHaveBeenCalledWith('123');
    });
    
    // Change form field values
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Nama Produk/i), { target: { value: 'Updated Product' } });
      fireEvent.change(screen.getByLabelText(/Kategori/i), { target: { value: 'Updated Category' } });
      fireEvent.change(screen.getByLabelText(/Harga Jual/i), { target: { value: '20000' } });
    });
    
    // Check if the form fields were updated
    expect(screen.getByLabelText(/Nama Produk/i)).toHaveValue('Updated Product');
    expect(screen.getByLabelText(/Kategori/i)).toHaveValue('Updated Category');
    expect(screen.getByLabelText(/Harga Jual/i)).toHaveValue(20000);
  });

  test('shows validation error message on form submission with invalid data', async () => {
    (validateProductData as jest.Mock).mockReturnValue('Invalid product data');
    
    await act(async () => {
      render(<EditProductPage params={mockParams} />);
    });
    
    await waitFor(() => {
      expect(fetchProduct).toHaveBeenCalledWith('123');
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByText('Simpan Perubahan'));
    });
    
    // Check if validation was called and alert was shown
    expect(validateProductData).toHaveBeenCalled();
    expect(global.alert).toHaveBeenCalledWith('Invalid product data');
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });

  test('shows confirm dialog when form is submitted with valid data', async () => {
    await act(async () => {
      render(<EditProductPage params={mockParams} />);
    });
    
    await waitFor(() => {
      expect(fetchProduct).toHaveBeenCalledWith('123');
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByText('Simpan Perubahan'));
    });
    
    // Check if confirm dialog is shown
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
  });

  test('calls updateProduct service when user confirms update', async () => {
    // Mock successful update
    (updateProduct as jest.Mock).mockResolvedValue({ ok: true });
    
    await act(async () => {
      render(<EditProductPage params={mockParams} />);
    });
    
    await waitFor(() => {
      expect(fetchProduct).toHaveBeenCalledWith('123');
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByText('Simpan Perubahan'));
    });
    
    // Confirm the update
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-button'));
    });
    
    // Wait for the asynchronous update to complete
    await waitFor(() => {
      // Check if updateProduct was called with correct parameters
      expect(updateProduct).toHaveBeenCalledWith('123', mockProduct);
      expect(global.alert).toHaveBeenCalledWith('Produk berhasil diupdate!');
      expect(mockRouter.push).toHaveBeenCalledWith('/semuaBarang');
    });
  });

  test('shows error message when update fails', async () => {
    // Mock failed update
    (updateProduct as jest.Mock).mockResolvedValue({ ok: false });
    
    await act(async () => {
      render(<EditProductPage params={mockParams} />);
    });
    
    await waitFor(() => {
      expect(fetchProduct).toHaveBeenCalledWith('123');
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByText('Simpan Perubahan'));
    });
    
    // Confirm the update
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-button'));
    });
    
    // Wait for the asynchronous update to complete
    await waitFor(() => {
      // Check if error alert was shown
      expect(global.alert).toHaveBeenCalledWith('Gagal mengupdate produk.');
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  test('closes confirm dialog when user cancels update', async () => {
    await act(async () => {
      render(<EditProductPage params={mockParams} />);
    });
    
    await waitFor(() => {
      expect(fetchProduct).toHaveBeenCalledWith('123');
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByText('Simpan Perubahan'));
    });
    
    // Cancel the update
    await act(async () => {
      fireEvent.click(screen.getByTestId('cancel-button'));
    });
    
    // Check if confirm dialog is closed
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    expect(updateProduct).not.toHaveBeenCalled();
  });

  test('navigates back when back button is clicked', async () => {
    await act(async () => {
      render(<EditProductPage params={mockParams} />);
    });
    
    // Click back button
    await act(async () => {
      fireEvent.click(screen.getByText('←'));
    });
    
    // Check if window.history.back was called
    expect(window.history.back).toHaveBeenCalled();
  });

  test('handles image upload correctly', async () => {
    await act(async () => {
      render(<EditProductPage params={mockParams} />);
    });
    
    await waitFor(() => {
      expect(fetchProduct).toHaveBeenCalledWith('123');
    });
    
    // Create a test file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Upload the file
    await act(async () => {
      const fileInput = screen.getByLabelText(/Upload/i);
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    
    // Check if the image preview is updated
    await waitFor(() => {
      expect(screen.getByAltText('Product Preview')).toBeInTheDocument();
    });
  });
});