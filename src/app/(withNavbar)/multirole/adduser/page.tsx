"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineArrowLeft } from "react-icons/ai";
import DOMPurify from "dompurify";
import { sendEmail } from "@/src/app/lib/sendInvitationEmail";

export default function AddUserPage() {
  const router = useRouter();
  const handleBack = () => router.back();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    role: "",
    email: "",
  });

  const sanitizeInput = (input: string) => DOMPurify.sanitize(input.trim());

  const validateInputs = () => {
    let valid = true;
    const newErrors = { name: "", role: "", email: "" };

    const cleanName = sanitizeInput(name);
    const cleanEmail = sanitizeInput(email);

    if (!cleanName) {
      newErrors.name = "Nama lengkap wajib diisi";
      valid = false;
    } else if (cleanName.length < 3) {
      newErrors.name = "Nama minimal 3 karakter";
      valid = false;
    }

    if (!role) {
      newErrors.role = "Pilih role terlebih dahulu";
      valid = false;
    }

    if (!cleanEmail) {
      newErrors.email = "Email wajib diisi";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = "Format email tidak valid";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateInputs()) return;
  
    setLoading(true);
    setMessage("");
  
    try {
      const inviteLink = `${process.env.NEXT_PUBLIC_EMAILJS_URL}/auth/invite?email=${encodeURIComponent(email)}`;
  
      await sendEmail({ to: email, inviteLink });
  
      setMessage("Undangan berhasil dikirim!");
      setName("");
      setRole("");
      setEmail("");
    } catch (error) {
      console.error("Email sending failed:", error);
      setMessage("Terjadi kesalahan saat mengirim undangan.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-[#EDF1F9] p-4">
      <div className="w-full flex mb-3">
        <button
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white hover:bg-gray-300 flex items-center justify-center"
        >
          <AiOutlineArrowLeft className="text-xl" />
        </button>
      </div>

      <h1 className="text-xl font-semibold mb-6">Tambah Pengguna</h1>

      <form onSubmit={handleSubmit}>
        <label className="block text-gray-400 text-sm font-semibold mb-2" htmlFor="name">
          Nama lengkap
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full p-3 mb-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-3xl focus:outline-none font-light text-gray-400`}
          placeholder="Nama lengkap"
        />
        {errors.name && <p className="text-red-500 text-sm mb-4">{errors.name}</p>}

        <label className="block text-gray-400 text-sm font-semibold mb-2" htmlFor="role">
          Role
        </label>
        <div className={`w-full p-3 mb-2 border ${errors.role ? "border-red-500" : "border-gray-300"} rounded-3xl focus-within:border-blue-200 bg-white`}>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full outline-none font-light text-gray-400"
          >
            <option value="" disabled>Pilih Role</option>
            <option value="Pemilik">Pemilik</option>
            <option value="Karyawan">Karyawan</option>
          </select> 
        </div>
        {errors.role && <p className="text-red-500 text-sm mb-4">{errors.role}</p>}

        <label className="block text-gray-400 text-sm font-semibold mb-2" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full p-3 mb-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-3xl focus:outline-none font-light text-gray-400`}
          placeholder="Email"
        />
        {errors.email && <p className="text-red-500 text-sm mb-4">{errors.email}</p>}

        {message && <p className={`text-sm mt-2 ${message.includes("berhasil") ? "text-green-500" : "text-red-500"}`}>{message}</p>}

        <button
          type="submit"
          className={`mt-10 w-full p-3 rounded-3xl font-semibold ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white"
          }`}
          disabled={loading}
        >
          {loading ? "Mengirim..." : "Lanjutkan"}
        </button>
      </form>
    </div>
  );
}
