"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import Header from "./components/header";
import UserList from "./components/userList";
import { useAuth } from "@/contexts/AuthContext";
import AddUserButton from "./components/addUserButton";

const MultiRolePageContent: React.FC = () => {
  const { user } = useAuth();

  const isPemilikOrPengelola = user?.role === "Pemilik" || user?.role === "Pengelola"; 

  return (
    <div className="relative min-h-screen pt-4 mt-4">
      <Header />
      <UserList />
      {isPemilikOrPengelola && <AddUserButton />}
    </div>
  );
};

const MultiRolePage: React.FC = () => (
  <SessionProvider>
    <MultiRolePageContent />
  </SessionProvider>
);

export default MultiRolePage;
