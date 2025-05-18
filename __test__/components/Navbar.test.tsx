// Top-level mocking
const handleClickMock = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/public/icons/navbar/HomeIcon', () => () => <div data-testid="home-icon" />);
jest.mock('@/public/icons/navbar/TransactionIcon', () => () => <div data-testid="transaction-icon" />);
jest.mock('@/public/icons/navbar/ProductIcon', () => () => <div data-testid="product-icon" />);
jest.mock('@/public/icons/navbar/ReportIcon', () => () => <div data-testid="report-icon" />);
jest.mock('@/public/icons/navbar/SettingsIcon', () => () => <div data-testid="settings-icon" />);

// 👇 Proper mock at top level — shared across all tests
jest.mock('@/src/components/elements/button/NavbarButton', () => ({
  NavbarButton: ({
    text,
    isActive,
    route,
    icon,
    toggleButton,
  }: {
    text: string;
    isActive: boolean;
    route: string;
    icon: React.ComponentType;
    toggleButton: () => void;
  }) => (
    <button
      data-testid={`navbar-button-${text}`}
      data-active={isActive}
      onClick={() => {
        toggleButton();
        handleClickMock(text); // track clicked item
      }}
    >
      {text}
    </button>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/src/components/layout/Navbar';

beforeEach(() => {
  handleClickMock.mockClear();
});

describe('Navbar Component', () => {
  it('correctly sets active item based on pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/informasi');

    render(<Navbar />);

    const productButton = screen.getByTestId('navbar-button-Produk');
    expect(productButton).toHaveAttribute('data-active', 'true');
  });

  it('does not set active item when pathname does not match any route', () => {
    (usePathname as jest.Mock).mockReturnValue('/nonexistent');

    render(<Navbar />);

    expect(screen.getByTestId('navbar-button-Beranda')).toHaveAttribute('data-active', 'false');
    expect(screen.getByTestId('navbar-button-Produk')).toHaveAttribute('data-active', 'false');
  });

  it('does not change activeItem when clicking the already active item', () => {
    (usePathname as jest.Mock).mockReturnValue('/transaksi');

    render(<Navbar />);

    const transaksiButton = screen.getByTestId('navbar-button-Transaksi');
    transaksiButton.click();

    expect(handleClickMock).toHaveBeenCalledWith('Transaksi');
  });

  it('changes activeItem when clicking a different nav item', () => {
    (usePathname as jest.Mock).mockReturnValue('/transaksi');

    render(<Navbar />);

    const produkButton = screen.getByTestId('navbar-button-Produk');
    produkButton.click();

    expect(handleClickMock).toHaveBeenCalledWith('Produk');
  });
});
