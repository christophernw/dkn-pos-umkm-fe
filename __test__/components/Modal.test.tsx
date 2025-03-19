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
});