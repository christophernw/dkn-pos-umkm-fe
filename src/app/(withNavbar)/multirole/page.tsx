"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { useSession, SessionProvider } from "next-auth/react";

const UserRole = ({ name, email }: { name: string; email: string }) => (
  <div className="flex items-center justify-between pb-3 pt-3 border-b">
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-sm text-gray-500 font-extralight">{email}</p>
    </div>
    <span className="bg-[#3554C1] text-white text-xs px-3 py-1 rounded-full">Pengguna</span>
  </div>
);

const MultiRolePageContent: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleBack = () => router.back();
  const handleAddUser = () => router.push("/multirole/adduser");

  return (
    <div className="relative min-h-screen pt-4 mt-4">
      <div className="w-full flex justify-between mb-6">
        <button
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white hover:bg-gray-300 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className="text-xl font-semibold flex items-center justify-center">
          Pengaturan Pengguna
        </h1>
        <button className="w-10 h-10 rounded-full bg-white hover:bg-gray-300 flex items-center justify-center">
          <MoreHorizontal className="w-5 h-5 text-black" />
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold pb-3 border-b">Pengguna</h2>
        <div>
          {session ? (
            <UserRole name={session.user.name} email={session.user.email} />
          ) : (
            <p className="text-red-500">Session not found</p>
          )}
        </div>
      </div>

      <div className="mt-20 flex justify-center">
        <button
          onClick={handleAddUser}
          className="bg-[#3554C1] text-white px-6 py-3 rounded-full shadow-md w-full"
        >
          + Tambah Akun
        </button>
      </div>
    </div>
  );
};

const MultiRolePage: React.FC = () => (
  <SessionProvider>
    <MultiRolePageContent />
  </SessionProvider>
);

export default MultiRolePage;
