"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Define the User interface
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

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/get-users`, {
          method: "GET",
          headers: {
            "Content-Type": "appl ication/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data); // Set the fetched users
      } catch (error: any) {
        setError(error.message); // Handle error
      } finally {
        setLoading(false); // Set loading to false once fetch is complete
      }
    };

    fetchUsers();
  }, [accessToken]); // Run again if the accessToken changes

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold pb-3 border-b">Informasi Pengguna</h2>
      <div>
        {!user ? (
          <p className="text-red-500">You are not authenticated</p>
        ) : loading ? (
          <p>Loading...</p> // Show loading message
        ) : error ? (
          <p className="text-red-500">{error}</p> // Show error if any
        ) : (
          <div>
            {users.length === 0 ? (
              <p>No users found.</p> // Show message if no users found
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
