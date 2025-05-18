import React, { FC } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavbarButton } from '@/src/components/elements/button/NavbarButton';
import { IconInterface } from '@/public/icons/type';

// Dummy icon for testing
const DummyIcon: FC<IconInterface> = ({ stroke }) => (
  <svg data-testid="dummy-icon" stroke={stroke || 'black'}></svg>
);

describe('NavbarButton', () => {
  it('renders correctly with valid props', () => {
    render(
      <NavbarButton
        isActive={true}
        toggleButton={() => {}}
        icon={DummyIcon}
        text="Test"
        route="/test"
      />
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('dummy-icon')).toHaveAttribute('stroke', 'white');
  });

  it('throws or fails gracefully when icon is missing', () => {
    const BrokenButton = () => (
      // @ts-expect-error icon is required
      <NavbarButton
        isActive={false}
        toggleButton={() => {}}
        text="Broken"
        route="/broken"
      />
    );

    expect(() => render(<BrokenButton />)).toThrow();
  });


  it('renders even if text is empty', () => {
    render(
      <NavbarButton
        isActive={false}
        toggleButton={() => {}}
        icon={DummyIcon}
        text=""
        route="/empty-text"
      />
    );

    expect(screen.getByTestId('dummy-icon')).toBeInTheDocument();
  });

  it('still calls toggleButton even when route is empty', () => {
    const toggleMock = jest.fn();

    render(
      <NavbarButton
        isActive={false}
        toggleButton={toggleMock}
        icon={DummyIcon}
        text="NoRoute"
        route=""
      />
    );

    const link = screen.getByText('NoRoute');
    fireEvent.click(link);
    expect(toggleMock).toHaveBeenCalled();
  });

  it('renders icon with black stroke when not active', () => {
    render(
      <NavbarButton
        isActive={false}
        toggleButton={() => {}}
        icon={DummyIcon}
        text="Inactive"
        route="/inactive"
      />
    );

    const icon = screen.getByTestId('dummy-icon');
    expect(icon).toHaveAttribute('stroke', 'black');
  });
});


