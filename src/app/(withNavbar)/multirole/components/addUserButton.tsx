"use client";

import React from "react";
import { useRouter } from "next/navigation";

const AddUserButton = () => {
  const router = useRouter();
  const handleAddUser = () => router.push("/multirole/adduser");

  return (
    <div className="mt-20 flex justify-center">
      <button
        onClick={handleAddUser}
        className="bg-[#3554C1] text-white px-6 py-3 rounded-full shadow-md w-full"
      >
        + Tambah Akun
      </button>
    </div>
  );
};

export default AddUserButton;
