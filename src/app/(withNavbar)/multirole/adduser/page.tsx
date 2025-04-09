"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmail } from "@/src/app/lib/sendInvitationEmail";
import { sanitizeInput, validateInputs } from "./utils/inputValidation";
import { sendInvitation } from "../adduser/services/invitationService";
import { InvitationPayload, InvitationResponse } from "./types/types";
import { Modal } from '@/src/components/elements/modal/Modal'
import config from "@/src/config";

export default function AddUserPage() {
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    role: "",
    email: "",
  });

  const handleBack = () => router.back();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { valid, errors } = validateInputs({ name, role, email });
    setErrors(errors);
    if (!valid) return;
    setShowConfirmModal(true);
  };

  const submitConfirmed = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setShowConfirmModal(false);
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

      console.log("Response from server:", result);
      if (response.ok && result.message === "Invitation sent") {
        const token = result.token!;
        const inviteLink = `http://localhost:3000/auth/invite?token=${encodeURIComponent(token)}`;

        await sendEmail({
          to: email,
          inviteLink,
          senderName: user?.name || "LANCAR Admin",
          senderEmail: user?.email || "noreply@lancar.com",
        });

        setMessage("Pengguna berhasil ditambahkan dan undangan dikirim!");
        setName("");
        setRole("Karyawan");
        setEmail("");
      } else {
        setMessage(result.error || "Terjadi kesalahan.");
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

      <form onSubmit={handleSubmit}>
        <label className="block text-gray-500 text-sm font-semibold mb-2" htmlFor="name">
          Nama Lengkap
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full p-3 mb-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-200 font-normal text-gray-700`}
          placeholder="John Doe"
        />
        {errors.name && <p className="text-red-500 text-sm mb-4">{errors.name}</p>}

        <label className="block text-gray-500 text-sm font-semibold mb-2" htmlFor="role">
          Role
        </label>
        <div className={`relative w-full mb-2 ${errors.role ? "border-red-500" : "border-gray-300"}`}>
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
      </form>
      {showConfirmModal && (
      <Modal onClose={() => setShowConfirmModal(false)}>
          <form
          onSubmit={(e) => {
            e.preventDefault();
            submitConfirmed(e);
          }}
          className="w-full max-w-md"
          >
          <div role="dialog">
            <h2 className="text-base font-semibold text-center">Ringkasan Pengguna Baru</h2>

            <div className="space-y-3 w-full text-left text-sm">
              <div>
                <p className="text-gray-500">Nama</p>
                <p className="font-semibold break-words">{name}</p>
              </div>
              <div>
                <p className="text-gray-500">Role</p>
                <p className="font-semibold">{role}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-semibold break-words">{email}</p>
              </div>
            </div>

            <div className="flex justify-between gap-4 w-full mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Ya, kirim
              </button>
            </div>
          </div>
        </form>
      </Modal>
    )}

    </div>
  );
}
