import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Modal } from "@/src/components/elements/modal/Modal";


// Mock CloseIcon component to prevent import errors
jest.mock("@/public/icons/CloseIcon", () => ({
  CloseIcon: () => <svg data-testid="close-icon" />,
}));

describe("Modal Component", () => {
  test("renders children content", () => {
    render(
      <Modal>
        <p>Modal Content</p>
      </Modal>
    );

    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  test("closes when close button is clicked", () => {
    const handleClose = jest.fn();
    render(
      <Modal onClose={handleClose}>
        <p>Modal Content</p>
      </Modal>
    );

    const closeButton = screen.getByTestId("close-icon");
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test("is hidden when closed", () => {
    render(
      <Modal>
        <p>Modal Content</p>
      </Modal>
    );

    const modal = screen.getByText("Modal Content").closest("div");
    expect(modal).toBeVisible();

    fireEvent.click(screen.getByTestId("close-icon"));
    expect(modal).not.toBeVisible();
  });
});
