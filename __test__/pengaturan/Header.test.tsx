import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { Header } from '@/src/app/(withNavbar)/pengaturan/module-element/Header';

// Mock the next/navigation hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Header Component', () => {
  // Setup router mock
  const mockBack = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });
  });

  it('renders the header with correct title', () => {
    render(<Header />);
    
    // Check that the title is rendered
    expect(screen.getByText('Pengaturan')).toBeInTheDocument();
  });

  it('calls router.back when back button is clicked', () => {
    render(<Header />);
    
    // Find the back button
    const backButton = screen.getByLabelText('back');
    
    // Click the back button
    fireEvent.click(backButton);
    
    // Verify router.back was called
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});