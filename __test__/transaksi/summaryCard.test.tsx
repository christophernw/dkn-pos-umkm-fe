import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SummaryCard } from '@/src/app/(withNavbar)/transaksi/module-elements/SummaryCard'

// Mock untuk ikon
jest.mock('@/public/icons/CoinIcon', () => ({
  CoinIcon: () => <span data-testid="coin-icon">CoinIcon</span>
}))

// Mock untuk ikon kustom
const MockCustomIcon = () => <span data-testid="custom-icon">CustomIcon</span>

describe('SummaryCard Component', () => {
  const defaultProps = {
    title: 'Total Pendapatan',
    nominal: 5000000,
    percentage: 12.5
  }

  it('should render with default props', () => {
    render(<SummaryCard {...defaultProps} />)
    
    // Verifikasi teks utama
    expect(screen.getByText('Total Pendapatan')).toBeInTheDocument()
    expect(screen.getByText('Rp5000000')).toBeInTheDocument()
    expect(screen.getByText('12.5%')).toBeInTheDocument()
    expect(screen.getByText('vs bulan lalu.')).toBeInTheDocument()
    
    // Verifikasi ikon default (CoinIcon)
    expect(screen.getByTestId('coin-icon')).toBeInTheDocument()
    
    // Verifikasi styling dasar
    const card = screen.getByText('Total Pendapatan').closest('div')
    expect(card).toHaveClass('flex items-center gap-2')
    expect(card).toHaveClass('flex items-center gap-2')
  })

  it('should render with custom icon when provided', () => {
    render(<SummaryCard {...defaultProps} logo={MockCustomIcon} />)
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('coin-icon')).not.toBeInTheDocument()
  })

  it('should format nominal correctly', () => {
    render(<SummaryCard {...defaultProps} nominal={7500000} />)
    
    expect(screen.getByText('Rp7500000')).toBeInTheDocument()
  })

  it('should display percentage with correct styling', () => {
    render(<SummaryCard {...defaultProps} percentage={-5} />)
    
    const percentageBadge = screen.getByText('-5%')
    expect(percentageBadge).toHaveClass('bg-primary-green')
    expect(percentageBadge).toHaveClass('text-white')
    expect(percentageBadge).toHaveClass('rounded-full')
  })

  it('should have correct container styling', () => {
    render(<SummaryCard {...defaultProps} />)
    
    const iconContainer = screen.getByTestId('coin-icon').closest('div')
    expect(iconContainer).toHaveClass('bg-primary-blue')
    expect(iconContainer).toHaveClass('rounded-full')
    expect(iconContainer).toHaveClass('p-3')
  })

  it('should render with different title', () => {
    render(<SummaryCard {...defaultProps} title="Total Pengeluaran" />)
    
    expect(screen.getByText('Total Pengeluaran')).toBeInTheDocument()
  })
})