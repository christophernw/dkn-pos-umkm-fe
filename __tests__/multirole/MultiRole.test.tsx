import { render, screen, fireEvent } from "@testing-library/react";
import MultiRolePage from "@/src/app/multirole/page"; 
import { useRouter } from "next/navigation";

const mockPush = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("User Accounts Page", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // 🔧 Bersihkan mock sebelum setiap test
  });

  it("should display the title 'User Accounts'", () => {
    render(<MultiRolePage/>);
    expect(screen.getByText("Pengaturan Pengguna")).toBeInTheDocument();
  });

  it("should display the list of users with roles and email", () => {
    render(<MultiRolePage/>);

    expect(screen.getByText("Hilmy Ammar Darmawan")).toBeInTheDocument();
    expect(screen.getByText("hilmyammardarmawan@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Pemilik")).toBeInTheDocument();
    
    expect(screen.getByText("Fadrian Yhoga Pratama")).toBeInTheDocument();
    expect(screen.getByText("fadrianyhogapratama@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Karyawan 1")).toBeInTheDocument();
    
    expect(screen.getByText("Nadhira Raihana Hafeez")).toBeInTheDocument();
    expect(screen.getByText("nadhiraraihanahafeez@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Karyawan 2")).toBeInTheDocument();
  });

  it("should display a button to add new accounts", () => {
    render(<MultiRolePage/>);
    expect(screen.getByText("+ Tambah Akun")).toBeInTheDocument();
  });

  it("should trigger action when the add account button is clicked", () => {
    render(<MultiRolePage />);
    const addButton = screen.getByText("+ Tambah Akun");
    
    fireEvent.click(addButton);
    
    expect(mockPush).toHaveBeenCalledWith("/multirole/add-user"); // Pastikan push dipanggil
  });
});
