import { render, screen, fireEvent } from '@testing-library/react';
import LaporanLabaRugi from '@/src/app/(withNavbar)/laporan/labaRugi/page'; 

// Mock DatePicker karena kita tidak mau test internal dia
jest.mock('@/src/components/DatePicker', () => {
  return ({ label, value, onChange }: any) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`datepicker-${label}`}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
});

describe('LaporanLabaRugi', () => {
  it('render judul halaman', () => {
    render(<LaporanLabaRugi />);
    expect(screen.getByText('Laporan Akuntansi')).toBeInTheDocument();
  });

  it('render kedua DatePicker', () => {
    render(<LaporanLabaRugi />);
    expect(screen.getByTestId('datepicker-Tanggal Mulai')).toBeInTheDocument();
    expect(screen.getByTestId('datepicker-Tanggal Akhir')).toBeInTheDocument();

  });

  it('bisa mengganti tanggal pada DatePicker', () => {
    render(<LaporanLabaRugi />);
    const startDatePicker = screen.getByTestId('datepicker-Tanggal Mulai') as HTMLInputElement;
    const endDatePicker = screen.getByTestId('datepicker-Tanggal Akhir') as HTMLInputElement;

    fireEvent.change(startDatePicker, { target: { value: '2025-01-01' } });
    fireEvent.change(endDatePicker, { target: { value: '2025-01-10' } });

    expect(startDatePicker.value).toBe('2025-01-01');
    expect(endDatePicker.value).toBe('2025-01-10');
  });

  it('render semua bagian laporan', () => {
    render(<LaporanLabaRugi />);
    expect(screen.getByText('Laporan Laba Rugi')).toBeInTheDocument();
    expect(screen.getByText('PENDAPATAN')).toBeInTheDocument();
    expect(screen.getByText('BEBAN POKOK PENJUALAN (HPP)')).toBeInTheDocument();
    expect(screen.getByText('BEBAN LAIN-LAIN')).toBeInTheDocument();
    expect(screen.getByText('LABA / RUGI BERSIH')).toBeInTheDocument();
  });

  it('render link ke laporan arus kas', () => {
    render(<LaporanLabaRugi />);
    const link = screen.getByRole('link', { name: /lihat laporan arus kas/i });
    expect(link).toHaveAttribute('href', '/laporan/arusKas');
  });
});
