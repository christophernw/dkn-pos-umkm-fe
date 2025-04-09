"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { sendEmail } from "@/src/app/lib/sendInvitationEmail";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizeInput, validateInputs } from "./utils/inputValidation";
import { sendInvitation } from "../adduser/services/invitationService";
import { InvitationPayload, InvitationResponse } from "./types/types";

export default function AddUserPage() {
  const router = useRouter();
  const handleBack = () => router.back();
  const {accessToken, user} = useAuth(); 
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({ name: "", role: "", email: "" });

  const handleOpenModal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { valid, errors } = validateInputs({ name, role, email });
    setErrors(errors);
    if (valid) {
      setShowModal(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowModal(false);
    setLoading(true);
    setMessage("");

    try {
      const payload: InvitationPayload = {
        name: sanitizeInput(name),
        email: sanitizeInput(email),
        role: role as "Administrator" | "Karyawan",
        accessToken: accessToken as string,
      };

      const response = await sendInvitation(payload);
      const result: InvitationResponse = await response.json();
      
      if (response.ok && result.message === "Invitation sent") {
        const token = result.token!;
        const inviteLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/invite?token=${encodeURIComponent(token)}`;
  
        try {
          await sendEmail({ 
            to: email, 
            inviteLink,
            senderName: user?.name || 'LANCAR Admin', 
            senderEmail: user?.email || 'noreply@lancar.com'
          });
  
          setMessage("Pengguna berhasil ditambahkan dan undangan dikirim!");
          setName("");
          setRole("Karyawan");
          setEmail("");
        } catch (error) {
          console.error("Gagal mengirim email:", error);
          setMessage("Terjadi kesalahan saat mengirim undangan.");
        }
      } else {
        setMessage(result.error || "Error Disini");
      }
    } catch (error) {
      console.error("Gagal mengirim data:", error);
      setMessage("Terjadi kesalahan saat mengirim data.");
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

      <form onSubmit={handleOpenModal}>
        <label className="block text-gray-400 text-sm font-semibold mb-2" htmlFor="name">Nama lengkap</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full p-3 mb-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-200 font-normal text-gray-700`}
          placeholder="John Doe"
        />
        {errors.name && <p className="text-red-500 text-sm mb-4">{errors.name}</p>}

        <label className="block text-gray-400 text-sm font-semibold mb-2" htmlFor="role">Role</label>
        <div className={`w-full p-3 mb-2 border ${errors.role ? "border-red-500" : "border-gray-300"} rounded-3xl focus-within:border-blue-200 bg-white`}>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-3xl appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 font-normal text-gray-700 pr-10"
          >
            <option value="" disabled>Pilih Role</option>
            <option value="Administrator">Administrator</option>
            <option value="Karyawan">Karyawan</option>
          </select> 
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
        {errors.role && <p className="text-red-500 text-sm mb-4">{errors.role}</p>}

        <label className="block text-gray-500 text-sm font-semibold mb-2" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full p-3 mb-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-200 font-normal text-gray-700`}
          placeholder="johndoe@gmail.com"
        />
        {errors.email && <p className="text-red-500 text-sm mb-4">{errors.email}</p>}

        {message && <p className={`text-sm mt-2 ${message.includes("berhasil") ? "text-green-500" : "text-red-500"}`}>{message}</p>}

        <button
          type="submit"
          className={`mt-10 w-full p-3 rounded-3xl font-semibold ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Mengirim..." : "Lanjutkan"}
        </button>
        {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[50%] max-w-[402px] shadow-xl">
            <h2 className="text-xl font-semibold text-center mb-4">
              Ringkasan Pengguna Baru
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nama Lengkap</p>
                <p className="text-base font-medium">{name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-base font-medium">{role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium">{email}</p>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleConfirmSubmit}
                className="bg-[#3B82F6] text-white font-medium py-2 px-6 rounded-full"
              >
                Tambah
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="border border-[#3B82F6] text-[#3B82F6] font-medium py-2 px-6 rounded-full"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      </form>
      
    </div>
  );
}
