import { render, screen, fireEvent } from "@testing-library/react";
import AddUserPage from "@/src/app/multirole/adduser/page";

const mockConsoleLog = jest.fn();
console.log = mockConsoleLog;

const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({
      back: mockBack,
    }),
  }));

describe("AddUserForm", () => {
    beforeEach(() => {
        mockConsoleLog.mockClear();
        mockBack.mockClear();
    });

    it("renders form fields and submit button", () => {
        render(<AddUserPage />);

        expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Lanjutkan/i })).toBeInTheDocument();
    });

    it("allows user input", () => {
        render(<AddUserPage />);

        const nameInput = screen.getByLabelText(/Nama Lengkap/i);
        const roleSelect = screen.getByLabelText(/Role/i);
        const emailInput = screen.getByLabelText(/Email/i);

        fireEvent.change(nameInput, { target: { value: "Hilmy Ammar Darmawan" } });
        fireEvent.change(roleSelect, { target: { value: "Karyawan" } });
        fireEvent.change(emailInput, { target: { value: "hilmyammardarmawan@gmail.com" } });

        expect(nameInput).toHaveValue("Hilmy Ammar Darmawan");
        expect(roleSelect).toHaveValue("Karyawan");
        expect(emailInput).toHaveValue("hilmyammardarmawan@gmail.com");
    });

    it("calls onSubmit when form is submitted", () => {
        render(<AddUserPage />);

        fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), { target: { value: "Hilmy Ammar Darmawan" } });
        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: "Karyawan" } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "hilmyammardarmawan@gmail.com" } });

        fireEvent.click(screen.getByRole("button", { name: /Lanjutkan/i }));

        expect(mockConsoleLog).toHaveBeenCalledWith({
            name: "Hilmy Ammar Darmawan",
            role: "Karyawan",
            email: "hilmyammardarmawan@gmail.com",
        });
    });

    it("prevents submission with empty fields", () => {
        render(<AddUserPage />);

        const submitButton = screen.getByRole("button", {name: /Lanjutkan/i})
        fireEvent.click(submitButton)

        expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    // Test for handleBack function
    it("navigates back when back button is clicked", () => {
        render(<AddUserPage />);
        
        const backButton = screen.getByLabelText("Back");
        fireEvent.click(backButton);
        
        expect(mockBack).toHaveBeenCalledTimes(1);
    });
    
    // Test form submission via onSubmit event
    it("handles form submission via form onSubmit", () => {
        render(<AddUserPage />);
        
        // Fill all fields
        fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), { target: { value: "John Doe" } });
        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: "Pemilik" } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "john@example.com" } });
        
        // Submit via form submission (not button click)
        const form = screen.getByRole("button", { name: /Lanjutkan/i }).closest("form");
        fireEvent.submit(form!);
        
        expect(mockConsoleLog).toHaveBeenCalledWith({
            name: "John Doe",
            role: "Pemilik",
            email: "john@example.com",
        });
    });
    
    // Test partial field completion scenarios
    it("does not submit when only some fields are filled", () => {
        render(<AddUserPage />);
        
        // Test with only name filled
        fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), { target: { value: "John Doe" } });
        fireEvent.click(screen.getByRole("button", { name: /Lanjutkan/i }));
        expect(mockConsoleLog).not.toHaveBeenCalled();
        
        // Test with name and role but no email
        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: "Pemilik" } });
        fireEvent.click(screen.getByRole("button", { name: /Lanjutkan/i }));
        expect(mockConsoleLog).not.toHaveBeenCalled();
    });
});
