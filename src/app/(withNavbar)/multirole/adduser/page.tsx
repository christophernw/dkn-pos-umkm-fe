"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useAuth } from "@/contexts/AuthContext";
import { InvitationEmailService, sendInvitationEmail } from "@/src/app/lib/emailservice";
import { sanitizeInput, validateInputs } from "./utils/inputValidation";
import { 
  sendInvitation, 
  InvitationPayload, 
  InvitationResponse 
} from "../services/invitationService";
import { Modal } from '@/src/components/elements/modal/Modal'
import config from "@/src/config";
import { ConfirmModal, RoleType } from "./components/confirmmodal";
import Dropdown from "@/src/components/Dropdown";
import { AccessDeniedScreen } from "@/src/components/AccessDeniedScreen";

// Role options for dropdown
const roleOptions = ["Pengelola", "Karyawan"];

export default function AddUserPage() {
  const router = useRouter();
  const { accessToken, user } = useAuth();
  

  // Check if user is BPR
  if (user?.is_bpr) {
    return <AccessDeniedScreen userType="BPR" />;
  }
  const handleBack = () => router.back();

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
        role: role as "Pengelola" | "Karyawan",
        accessToken: accessToken as string,
      };

      const response = await sendInvitation(payload);
      const result: InvitationResponse = await response.json();

      if (response.ok && result.message === "Invitation sent") {
        const token = result.token!;
        const inviteLink = `${
          config.hostname
        }/auth/invite?token=${encodeURIComponent(token)}`;

        try {
          await sendInvitationEmail({
            to: email,
            inviteLink,
            senderName: user?.name || "LANCAR Admin",
            senderEmail: user?.email || "noreply@lancar.com",
          });

          setMessage("Pengguna berhasil ditambahkan dan undangan dikirim!");
          setName("");
          setRole("Karyawan");
          setEmail("");
          router.push("/multirole")
        } catch (error) {
          console.error("Gagal mengirim email:", error);
          setMessage("Terjadi kesalahan saat mengirim undangan.");
        }
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
        <label
          className="block text-gray-500 text-sm font-semibold mb-2"
          htmlFor="name"
        >
          Nama Lengkap
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full p-3 mb-2 border ${
            errors.name ? "border-red-500" : "border-gray-300"
          } rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-200 font-normal text-gray-700`}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-4">{errors.name}</p>
        )}

        <label
          className="block text-gray-500 text-sm font-semibold mb-2"
          htmlFor="role"
        >
          Role
        </label>
        <div className="mb-2">
          {/* Custom styled Dropdown */}
          <div className="relative">
            <Dropdown
              selected={role}
              options={roleOptions}
              label="Pilih Role"
              onSelect={setRole}
              showLabel={false}
            />
            <style jsx global>{`
              /* Override Dropdown button styling to match your design */
              .relative button {
                border-radius: 1.5rem !important; /* rounded-3xl */
                padding: 0.75rem 1rem !important; /* p-3 */
                font-weight: normal !important;
              }
              
              /* Override dropdown list styling */
              .relative ul {
                border-radius: 1rem !important;
                margin-top: 0.25rem !important;
              }
            `}</style>
          </div>
          {errors.role && (
            <p className="text-red-500 text-sm mb-4">{errors.role}</p>
          )}
        </div>

        <label
          className="block text-gray-500 text-sm font-semibold mb-2"
          htmlFor="email"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full p-3 mb-2 border ${
            errors.email ? "border-red-500" : "border-gray-300"
          } rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-200 font-normal text-gray-700`}
          placeholder="johndoe@gmail.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-4">{errors.email}</p>
        )}

        {message && (
          <p
            className={`text-sm mt-2 ${
              message.includes("berhasil") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          className={`mt-10 w-full p-3 rounded-3xl ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#3554C1] text-white hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Mengirim..." : "Lanjutkan"}
        </button>
      </form>
      {showConfirmModal && (
        <Modal onClose={() => setShowConfirmModal(false)}>
          <ConfirmModal
            name={name}
            role={role as RoleType}
            email={email}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={submitConfirmed}
          />
        </Modal>
      )}
    </div>
  );
}