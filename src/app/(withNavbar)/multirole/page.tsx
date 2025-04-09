"use client";

import React from "react";
import { SessionProvider, useSession } from "next-auth/react";
import Header from "./components/header";
import UserList from "./components/userList";
import AddUserButton from "./components/addUserButton";
import { useAuth } from "@/contexts/AuthContext";

const MultiRolePageContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen pt-4 mt-4">
      <Header />
      <UserList />
      {user?.role === "Pemilik" && <AddUserButton />}
    </div>
  );
};

const MultiRolePage: React.FC = () => (
  <SessionProvider>
    <MultiRolePageContent />
  </SessionProvider>
);

export default MultiRolePage;
