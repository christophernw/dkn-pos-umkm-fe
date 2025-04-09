import { render, screen, fireEvent } from "@testing-library/react";
import MultiRolePage from "@/src/app/(withNavbar)/multirole/page";
import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

jest.mock("next-auth/react", () => ({
  ...jest.requireActual("next-auth/react"),
  useSession: jest.fn(),
}));

describe("User Accounts Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithSession = (user: { name: string; email: string }) => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user },
      status: "authenticated",
    });

    return render(
      <SessionProvider session={null}>
        <MultiRolePage />
      </SessionProvider>
    );
  };

  it("should display the logged-in user's name and email", () => {
    const user = { name: "John Doe", email: "johndoe@example.com" };
    renderWithSession(user);

    expect(screen.getByText(user.name)).toBeInTheDocument();
    expect(screen.getByText(user.email)).toBeInTheDocument();
  });

  it("should display a button to add new accounts", () => {
    renderWithSession({ name: "Jane Doe", email: "janedoe@example.com" });
    expect(screen.getByText("+ Tambah Akun")).toBeInTheDocument();
  });

  it("should navigate to add user page when add account button is clicked", () => {
    renderWithSession({ name: "Jane Doe", email: "janedoe@example.com" });
    const addButton = screen.getByText("+ Tambah Akun");

    fireEvent.click(addButton);

    expect(mockPush).toHaveBeenCalledWith("/multirole/adduser");
  });

  it("should navigate back when the back button is clicked", () => {
    renderWithSession({ name: "John Doe", email: "johndoe@example.com" });
    const backButton = screen.getByLabelText("Back");

    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });
});
