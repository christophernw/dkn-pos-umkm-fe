import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from '@/src/components/elements/modal/Modal';

// Mock CloseIcon component
jest.mock('@/public/icons/CloseIcon', () => ({
  CloseIcon: () => <div data-testid="close-icon">X</div>
}));

describe('Modal Component', () => {
  it('renders children content correctly', () => {
    render(
      <Modal>
        <p>Test modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Test modal content')).toBeInTheDocument();
  });

  it('closes the modal when close button is clicked', () => {
    render(
      <Modal>
        <p>Test modal content</p>
      </Modal>
    );
    
    // Modal should be visible initially
    const modalContainer = screen.getByText('Test modal content').closest('div[class*="fixed"]');
    expect(modalContainer).not.toHaveClass('hidden');
    
    // Click the close button
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    // Modal should now be hidden
    expect(modalContainer).toHaveClass('hidden');
  });

  it('calls onClose callback when provided and close button is clicked', () => {
    const mockOnClose = jest.fn();
    
    render(
      <Modal onClose={mockOnClose}>
        <p>Test modal content</p>
      </Modal>
    );
    
    // Click the close button
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('applies custom className to the modal container', () => {
    render(
      <Modal className="custom-class">
        <p>Custom modal</p>
      </Modal>
    );
  
    // Ambil elemen div terdekat dari <p> yang memiliki className "custom-class"
    const modalBox = screen.getByText('Custom modal').closest('div.custom-class');
    expect(modalBox).toBeInTheDocument();
  });
  
  
  it('does not render modal after close button clicked (hides from DOM)', () => {
    render(
      <Modal>
        <p>Gone modal</p>
      </Modal>
    );
  
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
  
    // Setelah klik, modal container tetap ada (karena state internal), tapi harus punya class 'hidden'
    const modalContainer = screen.queryByText('Gone modal')?.closest('div[class*="fixed"]');
    expect(modalContainer).toHaveClass('hidden');
  });
});