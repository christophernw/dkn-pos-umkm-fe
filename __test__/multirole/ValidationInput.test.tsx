import { sanitizeInput, validateInputs } from "@/src/app/(withNavbar)/multirole/adduser/utils/inputValidation";

describe("sanitizeInput", () => {
  it("trims and sanitizes input", () => {
    const dirty = "   <script>alert('xss')</script>Hilmy   ";
    const clean = sanitizeInput(dirty);
    expect(clean).toBe("Hilmy");
  });
});

describe("validateInputs", () => {
  it("returns valid if all fields are correctly filled", () => {
    const result = validateInputs({
      name: "Hilmy Ammar",
      role: "Karyawan",
      email: "hilmy@example.com",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({ name: "", role: "", email: "" });
  });

  it("fails if name is less than 3 characters", () => {
    const result = validateInputs({
      name: "Al",
      role: "Karyawan",
      email: "hilmy@example.com",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe("Nama minimal 3 karakter");
  });

  it("fails if email is invalid", () => {
    const result = validateInputs({
      name: "Hilmy Ammar",
      role: "Karyawan",
      email: "not-an-email",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.email).toBe("Format email tidak valid");
  });

  it("fails if any field is empty", () => {
    const result = validateInputs({
      name: "",
      role: "",
      email: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe("Nama lengkap wajib diisi");
    expect(result.errors.role).toBe("Pilih role terlebih dahulu");
    expect(result.errors.email).toBe("Email wajib diisi");
  });

  it("sanitizes name and email before validating", () => {
    const result = validateInputs({
      name: " <b>Hilmy</b> ",
      role: "Karyawan",
      email: "  hilmy@example.com ",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({ name: "", role: "", email: "" });
  });
});