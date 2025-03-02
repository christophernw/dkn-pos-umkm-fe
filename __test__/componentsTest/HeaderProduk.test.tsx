import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import HeaderProduk from '@/src/components/HeaderProduk'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

import { usePathname } from 'next/navigation'

describe('HeaderProduk Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

    const informasiStokLink = screen.getByLabelText("back")
    expect(informasiStokLink).toBeInTheDocument()
    expect(informasiStokLink).toHaveAttribute('href', '/')
  })

  it("should have a link to informasi stok with the correct href", () => {
    (usePathname as jest.Mock).mockReturnValue('/semuaBarang')
    render(<HeaderProduk />)

    const informasiStokLink = screen.getByRole("link", { name: /informasi stok/i })
    expect(informasiStokLink).toBeInTheDocument()
    expect(informasiStokLink).toHaveAttribute('href', '/daftarProduk')
  })
  
  it('three dots button is clickable', () => {
    (usePathname as jest.Mock).mockReturnValue('/semuaBarang')
    render(<HeaderProduk />)

    const buttons = screen.getAllByRole('button')
    const threeDotsButton = buttons.find(button => 
      button.querySelector('.bi-three-dots') !== null
    )
    expect(threeDotsButton).toBeInTheDocument()
    if (threeDotsButton) {
      fireEvent.click(threeDotsButton)
    }
  })})