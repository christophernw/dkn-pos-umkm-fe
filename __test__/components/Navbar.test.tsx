import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/src/components/layout/Navbar';

// Mock the next/navigation hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock the icon components
jest.mock('@/public/icons/navbar/HomeIcon', () => () => <div data-testid="home-icon" />);
jest.mock('@/public/icons/navbar/TransactionIcon', () => () => <div data-testid="transaction-icon" />);
jest.mock('@/public/icons/navbar/ProductIcon', () => () => <div data-testid="product-icon" />);
jest.mock('@/public/icons/navbar/ReportIcon', () => () => <div data-testid="report-icon" />);
jest.mock('@/public/icons/navbar/SettingsIcon', () => () => <div data-testid="settings-icon" />);

// Mock NavbarButton component
jest.mock('@/src/components/elements/button/NavbarButton', () => ({
    NavbarButton: ({ text, isActive, route }: { 
      text: string; 
      isActive: boolean; 
      route: string;
      icon: React.ComponentType;
      toggleButton: () => void;
    }) => (
      <div data-testid={`navbar-button-${text}`} data-active={isActive} data-route={route}>
        {text} {isActive ? '(active)' : ''}
      </div>
    ),
  }));

describe('Navbar Component', () => {
  it('correctly sets active item based on pathname', () => {
    // Mock pathname to match the "Product" route
    (usePathname as jest.Mock).mockReturnValue('/daftarProduk');

    render(<Navbar />);

    // Check that the Product button is active
    const productButton = screen.getByTestId('navbar-button-Produk');
    expect(productButton).toHaveAttribute('data-active', 'true');
    
    // And other buttons should not be active
    const homeButton = screen.getByTestId('navbar-button-Beranda');
    const transactionButton = screen.getByTestId('navbar-button-Transaksi');
    expect(homeButton).toHaveAttribute('data-active', 'false');
    expect(transactionButton).toHaveAttribute('data-active', 'false');
  });

  it('does not set active item when pathname does not match any route', () => {
    // Mock pathname to a route that doesn't exist in navItems
    (usePathname as jest.Mock).mockReturnValue('/nonexistent-route');

    render(<Navbar />);

    // All buttons should be inactive
    const homeButton = screen.getByTestId('navbar-button-Beranda');
    const productButton = screen.getByTestId('navbar-button-Produk');
    expect(homeButton).toHaveAttribute('data-active', 'false');
    expect(productButton).toHaveAttribute('data-active', 'false');
  });
});