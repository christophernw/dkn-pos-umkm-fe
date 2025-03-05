import { render, screen, fireEvent } from "@testing-library/react";
import AddUserForm from "@/src/app/multirole/adduser/page";
import { Irish_Grover } from "next/font/google";
import exp from "constants";

describe("AddUserForm", () => {
    it("renders form fields and submit button", () => {
        render(<AddUserForm onSubmit={() => {}} />);

        expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Lanjutkan/i })).toBeInTheDocument();
    });

    it("allows user input", () => {
        render(<AddUserForm onSubmit={() => {}} />);

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
        const handleSubmit = jest.fn();
        render(<AddUserForm onSubmit={handleSubmit} />);

        fireEvent.click(screen.getByRole("button", { name: /Lanjutkan/i }));

        expect(handleSubmit).toHaveBeenCalled();
    });

    it("prevents submission with empty fields", () => {
        const handleSubmit = jest.fn();
        render(<AddUserForm onSubmit={handleSubmit}/>);

        const submitButton = screen.getByRole("button", {name: /Lanjutkan/i})
        fireEvent.click(submitButton)

        expect(handleSubmit).not.toHaveBeenCalled();
        });

    it("should hide password input by default", () => {
        const handleSubmit = jest.fn();
        render(<AddUserForm onSubmit={handleSubmit}/>)

        const passwordInput = screen.getByLabelText(/Password/i);

        expect(passwordInput).toHaveAttribute("type", "password");
    })

    it("should toggle password visibility when clicking show password button", () => {
        render(<AddUserForm onSubmit={() => {}} />);
    
        const passwordInput = screen.getByLabelText(/Password/i);
        const toggleButton = screen.getByRole("button", { name: /Show Password/i });
    
        expect(passwordInput).toHaveAttribute("type", "password");
    
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute("type", "text");
    
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute("type", "password");
      });
    
      it("should not expose password in the DOM", () => {
        render(<AddUserForm onSubmit={() => {}} />);
    
        const passwordInput = screen.getByLabelText(/Password/i);
    
        fireEvent.change(passwordInput, { target: { value: "mysecurepassword" } });
    
        expect(passwordInput).toHaveValue("mysecurepassword");
    
        expect(passwordInput).not.toHaveAttribute("innerText", "mysecurepassword");
      });
});
