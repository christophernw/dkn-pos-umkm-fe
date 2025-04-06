"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/src/config";

interface User {
  id: number;
  email: string;
  name: string;
  role: "Pemilik" | "Karyawan";
}

const UserList = () => {
  const { user, accessToken } = useAuth(); // Access the accessToken from context
  const [users, setUsers] = useState<User[]>([]); // State to hold fetched users
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Reset error state

        // Check for token after loading has started
        if(!accessToken) {
          throw new Error("You are not authenticated");
        }

        const response = await fetch(`${config.apiUrl}/auth/get-users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data); 
      } catch (error: any) {
        setError(error.message); 
      } finally {
        setLoading(false); 
      }
    };

    fetchUsers();
  }, [accessToken]); 

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold pb-3 border-b">Informasi Pengguna</h2>
      <div>
        {loading ? (
          <p className="py-3 text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p> 
        ) : (
          <div>
            {users.length === 0 ? (
              <p>No users found.</p> 
            ) : (
              <ul>
                {users.map((user) => (
                  <li key={user.id} className="flex items-center justify-between pt-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500 font-extralight">{user.email}</p>
                    </div>
                    <span
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: user.role === "Pemilik" ? "#5ABC61" : "#3554C1", // Badge color based on role
                          color: "#fff",
                        }}
                      >{user.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;