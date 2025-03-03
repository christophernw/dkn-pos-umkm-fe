"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal } from "lucide-react";

const users = [
  {
    id: 1,
    name: "Hilmy Ammar Darmawan",
    email: "hilmyammardarmawan@gmail.com",
    role: "Pemilik",
    roleColor: "bg-[#5ABC61]",
  },
  {
    id: 2,
    name: "Fadrian Yhoga Pratama",
    email: "fadrianyhogapratama@gmail.com",
    role: "Karyawan 1",
    roleColor: "bg-[#3554C1]",
  },
  {
    id: 3,
    name: "Nadhira Raihana Hafeez",
    email: "nadhiraraihanahafeez@gmail.com",
    role: "Karyawan 2",
    roleColor: "bg-[#3554C1]",
  },
];

export default function MultiRolePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#EDF1F9] p-4 ">
      <div className="w-full flex justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white hover:bg-gray-300 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className="text-xl font-semibold ">Pengaturan Pengguna</h1>
        <button className="w-10 h-10 rounded-full bg-white hover:bg-gray-300 flex items-center justify-center">
          <MoreHorizontal className="w-5 h-5 text-black" />
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold pb-3 border-b">{users.length} Pengguna</h2>
        <div>
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between pb-3 pt-3 border-b"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500 font-extralight">{user.email}</p>
              </div>
              <span
                className={`text-white text-xs px-3 py-1 rounded-full ${user.roleColor}`}
              >
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 flex justify-center">
        <button
          onClick={() => router.push("/multirole/add-user")}
          className="bg-[#3554C1] text-white px-6 py-3 rounded-full shadow-md w-full"
        >
          + Tambah Akun
        </button>
      </div>
    </div>
  );
}
