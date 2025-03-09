import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MultiRolePage from "@/src/app/(withNavbar)/multirole/page"; 

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack
  }),
}));

describe("User Accounts Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    
    expect(mockPush).toHaveBeenCalledWith("/multirole/adduser"); 
  });

  it("should back to home page when back button is clicked", () => {
    render(<MultiRolePage />);
    const backButton = screen.getByLabelText("Back");
    
    fireEvent.click(backButton);
    
    expect(mockBack).toHaveBeenCalledWith(); 
  });
});
