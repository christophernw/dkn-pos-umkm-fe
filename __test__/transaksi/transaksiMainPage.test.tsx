import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import TransactionMainPage from '@/src/app/(withNavbar)/transaksi/page'

// Mock komponen dan ikon dengan implementasi yang lebih baik
jest.mock('@/src/app/(withNavbar)/transaksi/module-elements/TransactionHeader', () => ({
  TransactionHeader: () => <div data-testid="transaction-header">TransactionHeader</div>
}))

jest.mock('@/src/app/(withNavbar)/transaksi/module-elements/TransactionSummary', () => ({
  TransactionSummary: () => <div data-testid="transaction-summary">TransactionSummary</div>
}))

jest.mock('@/public/icons/DotIcon', () => ({
  DotIcon: () => <span data-testid="dot-icon">DotIcon</span>
}))

jest.mock('@/public/icons/PlusIcon', () => ({
  PlusIcon: () => <span data-testid="plus-icon">PlusIcon</span>
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

describe('TransactionMainPage', () => {
  beforeEach(() => {
    // Reset modal state sebelum setiap test
    jest.clearAllMocks()
  })

  it('should render all main components', () => {
    render(<TransactionMainPage />)
    
    expect(screen.getByTestId('transaction-header')).toBeInTheDocument()
    expect(screen.getByTestId('transaction-summary')).toBeInTheDocument()
    expect(screen.getByText('80 Results')).toBeInTheDocument()
  })

  it('should render transaction items correctly', () => {
    render(<TransactionMainPage />)
    
    const transactionItems = screen.getAllByText(/Transaksi #8726AB/i)
    expect(transactionItems).toHaveLength(2)
    
    const dateElements = screen.getAllByText(/Tue, 10 Dec 2024/i)
    expect(dateElements).toHaveLength(2)
    
    const amountElements = screen.getAllByText(/\+ Rp200\.000/i)
    expect(amountElements).toHaveLength(2)
    
    const statusElements = screen.getAllByText(/Lunas/i)
    expect(statusElements).toHaveLength(2)
  })

  it('should toggle modal when plus button is clicked', async () => {
    render(<TransactionMainPage />)
    
    // Pastikan modal belum muncul
    expect(screen.queryByText('Tambah Pengeluaran')).not.toBeInTheDocument()
    expect(screen.queryByText('Tambah Pemasukan')).not.toBeInTheDocument()
    
    // Klik tombol plus
    const plusButton = screen.getByRole('button', { name: /plus/i })
    fireEvent.click(plusButton)
    
    // Verifikasi modal muncul
    expect(screen.getByText('Tambah Pengeluaran')).toBeInTheDocument()
    expect(screen.getByText('Tambah Pemasukan')).toBeInTheDocument()
    
    // Klik lagi untuk menutup modal
    fireEvent.click(plusButton)
    expect(screen.queryByText('Tambah Pengeluaran')).not.toBeInTheDocument()
  })

  it('should have correct transaction item styling', () => {
    render(<TransactionMainPage />)
    
    const transactionItem = screen.getAllByText(/Transaksi #8726AB/i)[0].closest('div')
    expect(transactionItem).toHaveClass('flex justify-between items-center')
    expect(transactionItem).toHaveClass('flex justify-between items-center')
    
    const amountBadge = screen.getAllByText(/\+ Rp200\.000/i)[0]
    expect(amountBadge).toHaveClass('bg-primary-green')
    expect(amountBadge).toHaveClass('text-white')
    
    const statusBadge = screen.getAllByText(/Lunas/i)[0]
    expect(statusBadge).toHaveClass('text-primary-green')
    expect(statusBadge).toHaveClass('bg-secondary-green')
  })

  it('should have floating action button with correct positioning', () => {
    render(<TransactionMainPage />)
    
    const floatingButton = screen.getByRole('button', { name: /plus/i })
    expect(floatingButton).toHaveClass('fixed')
    expect(floatingButton).toHaveClass('bottom-4')
    expect(floatingButton).toHaveClass('right-4')
  })

  it('should render correct links in modal', () => {
    render(<TransactionMainPage />)
    
    // Buka modal dulu
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    const expenseLink = screen.getByText('Tambah Pengeluaran')
    const incomeLink = screen.getByText('Tambah Pemasukan')
    
    expect(expenseLink.closest('a')).toHaveAttribute('href', '/tambahPengeluaran')
    expect(incomeLink.closest('a')).toHaveAttribute('href', '/tambahPemasukkan')
  })
})