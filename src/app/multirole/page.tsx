"use client";

import React from "react";
import { useRouter } from "next/navigation";

const users = [
  {
    id: 1,
    name: "Hilmy Ammar Darmawan",
    email: "hilmyammardarmawan@gmail.com",
    role: "Pemilik",
    roleColor: "bg-green-500",
  },
  {
    id: 2,
    name: "Fadrian Yhoga Pratama",
    email: "fadrianyhogapratama@gmail.com",
    role: "Karyawan 1",
    roleColor: "bg-blue-500",
  },
  {
    id: 3,
    name: "Nadhira Raihana Hafeez",
    email: "nadhiraraihanahafeez@gmail.com",
    role: "Karyawan 2",
    roleColor: "bg-blue-500",
  },
];

export default function MultiRolePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center mb-4">
        <button onClick={() => router.back()} className="text-gray-600 mr-2">⬅</button>
        <h1 className="text-xl font-semibold">Pengaturan Pengguna</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">{users.length} Pengguna</h2>
        <div>
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border-b last:border-none"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <span
                className={`text-white text-sm px-3 py-1 rounded-full ${user.roleColor}`}
              >
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => router.push("/multirole/add-user")}
          className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-md"
        >
          + Tambah Akun
        </button>
      </div>
    </div>
  );
}
