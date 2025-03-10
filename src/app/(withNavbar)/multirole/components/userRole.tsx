"use client";

import React from "react";

const UserRole = ({ name, email }: { name: string; email: string }) => (
  <div className="flex items-center justify-between pb-3 pt-3 border-b">
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-sm text-gray-500 font-extralight">{email}</p>
    </div>
    <span className="bg-[#3554C1] text-white text-xs px-3 py-1 rounded-full">Pengguna</span>
  </div>
);

export default UserRole;
