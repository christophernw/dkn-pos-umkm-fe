"use client";

import { useState} from "react";
import { useRouter } from "next/navigation";
import { AiOutlineArrowLeft } from "react-icons/ai";

export default function AddUserPage() {
  const router = useRouter();
  
  const handleBack = () => router.back();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name && role && email) {
      console.log({ name, role, email });
    }
  };

  return (
      <div className="min-h-screen bg-[#EDF1F9] p-4">
        <div className="w-full flex mb-3">
          <button onClick={handleBack}
          aria-label="Back" 
          className="w-10 h-10 rounded-full bg-white hover:bg-gray-300 flex items-center justify-center">
            <AiOutlineArrowLeft className="text-xl" />
          </button>
        </div>

        <h1 className="text-xl font-semibold mb-6">Tambah Pengguna</h1>
        <form onSubmit={handleSubmit}>
          <label className="block text-gray-400 text-sm font-semibold mb-2" htmlFor="name" >Nama lengkap</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-3xl focus:outline-none font-light text-gray-400"
            placeholder="Nama lengkap"
          />

          <label className="block text-gray-400 text-sm font-semibold mb-2" htmlFor="role">Role</label>
          <div className="w-full p-3 mb-4 border border-gray-300 rounded-3xl focus-within:border-blue-200 bg-white">
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

          <label className="block text-gray-400 text-sm font-semibold mb-2" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-6 border border-gray-300 rounded-3xl focus:outline-none font-light text-gray-400"
            placeholder="Email"
          />

          <button
          id="lanjutkan"
          type="submit"
          onClick={handleSubmit} 
          className="mt-20 w-full bg-blue-600 text-white p-3 rounded-3xl font-semibold">
            Lanjutkan
          </button>
        </form>
      </div>
  );
}
