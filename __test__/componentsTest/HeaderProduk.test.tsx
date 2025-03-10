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
}))

import { usePathname } from 'next/navigation'

describe('HeaderProduk Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {}) 
    jest.spyOn(console, 'error').mockImplementation(() => {}) 
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
  })

  it('logs sorting action in ascending order and calls fetch when clicked', () => {
    (usePathname as jest.Mock).mockReturnValue('/semuaBarang')
    render(<HeaderProduk />)

    const buttons = screen.getAllByRole('button')
    const menuButton = buttons.find(button =>
      button.querySelector('.bi-three-dots') !== null
    )

    expect(menuButton).toBeInTheDocument()
    if (menuButton) {
      fireEvent.click(menuButton)
    }

    const sortAscButton = screen.getByText(/stok terendah/i)
    fireEvent.click(sortAscButton)

    expect(console.log).toHaveBeenCalledWith("Sorting dengan order: asc")
    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/produk?sort=asc")
  })

  it('logs sorting action in descending order and calls fetch when clicked', () => {
    (usePathname as jest.Mock).mockReturnValue('/semuaBarang')
    render(<HeaderProduk />)

    const buttons = screen.getAllByRole('button')
    const menuButton = buttons.find(button =>
      button.querySelector('.bi-three-dots') !== null
    )

    expect(menuButton).toBeInTheDocument()
    if (menuButton) {
      fireEvent.click(menuButton)
    }

    const sortDescButton = screen.getByText(/stok tertinggi/i)
    fireEvent.click(sortDescButton)

    expect(console.log).toHaveBeenCalledWith("Sorting dengan order: desc")
    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/produk?sort=desc")
  })
})
