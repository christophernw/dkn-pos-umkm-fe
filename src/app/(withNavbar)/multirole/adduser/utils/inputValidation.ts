import DOMPurify from "dompurify";

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input.trim());
}

export function validateInputs({ name, role, email }: { name: string; role: string; email: string }) {
  let valid = true;
  const errors = { name: "", role: "", email: "" };

  const cleanName = sanitizeInput(name);
  const cleanEmail = sanitizeInput(email);

  if (!cleanName) {
    errors.name = "Nama lengkap wajib diisi";
    valid = false;
  } else if (cleanName.length < 3) {
    errors.name = "Nama minimal 3 karakter";
    valid = false;
  }

  if (!role) {
    errors.role = "Pilih role terlebih dahulu";
    valid = false;
  }

  if (!cleanEmail) {
    errors.email = "Email wajib diisi";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    errors.email = "Format email tidak valid";
    valid = false;
  }

  return { valid, errors };
}
