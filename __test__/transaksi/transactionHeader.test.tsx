import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TransactionHeader } from '@/src/app/(withNavbar)/transaksi/module-elements/TransactionHeader'

// Mock untuk ikon
jest.mock('@/public/icons/notesIcon', () => ({
  NotesIcon: () => <span data-testid="notes-icon">NotesIcon</span>
}))

jest.mock('@/public/icons/OptionsIcon', () => ({
  OptionsIcon: () => <span data-testid="options-icon">OptionsIcon</span>
}))

describe('TransactionHeader Component', () => {
  it('should render the transaction header correctly', () => {
    render(<TransactionHeader />)
    
    // Verifikasi teks "Transaksi"
    expect(screen.getByText('Transaksi')).toBeInTheDocument()
    
    // Verifikasi ikon-ikon
    expect(screen.getByTestId('notes-icon')).toBeInTheDocument()
    expect(screen.getByTestId('options-icon')).toBeInTheDocument()
  })

  it('should have correct styling for the main container', () => {
    render(<TransactionHeader />)
    
    const headerContainer = screen.getByText('Transaksi').closest('div')
    expect(headerContainer).toHaveClass('flex p-1 bg-white rounded-full items-center gap-2 w-fit')
    expect(headerContainer).toHaveClass('flex')
  })

  it('should have correct styling for the left section', () => {
    render(<TransactionHeader />)
    
    const leftSection = screen.getByText('Transaksi').closest('div')
    expect(leftSection).toHaveClass('bg-white')
    expect(leftSection).toHaveClass('rounded-full')
    expect(leftSection).toHaveClass('p-1')
    expect(leftSection).toHaveClass('items-center')
    expect(leftSection).toHaveClass('gap-2')
  })

  it('should have correct styling for the notes icon container', () => {
    render(<TransactionHeader />)
    
    const iconContainer = screen.getByTestId('notes-icon').closest('div')
    expect(iconContainer).toHaveClass('bg-primary-indigo')
    expect(iconContainer).toHaveClass('rounded-full')
    expect(iconContainer).toHaveClass('p-2')
  })

  it('should have correct styling for the options button', () => {
    render(<TransactionHeader />)
    
    const optionsButton = screen.getByTestId('options-icon').closest('div')
    expect(optionsButton).toHaveClass('bg-white')
    expect(optionsButton).toHaveClass('rounded-full')
    expect(optionsButton).toHaveClass('p-3')
  })

  it('should have proper spacing for the text', () => {
    render(<TransactionHeader />)
    
    const textElement = screen.getByText('Transaksi')
    expect(textElement).toHaveClass('pr-3')
  })
})