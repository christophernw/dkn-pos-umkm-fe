"use client";

import React from "react";
import { useSession } from "next-auth/react";
import UserRole from "./userRole";

const UserList = () => {
  const { data: session } = useSession();

  return (
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
  );
};

export default UserList;
