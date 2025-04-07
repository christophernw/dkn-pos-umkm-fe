"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/src/config";
import { Trash } from "lucide-react"; // Import trash icon

interface User {
  id: number;
  email: string;
  name: string;
  role: "Pemilik" | "Administrator" | "Karyawan";
}

const UserList = () => {
  const { user, accessToken } = useAuth(); // Access the accessToken from context
  const [users, setUsers] = useState<User[]>([]); // State to hold fetched users
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // Deletion state

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

  useEffect(() => {
    fetchUsers();
  }, [accessToken]); 

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this user?")) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`${config.apiUrl}/auth/remove-user-from-toko`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove user");
      }

      // Refresh the user list after successful deletion
      await fetchUsers();
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

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
                {users.map((userItem) => (
                  <li key={userItem.id} className="flex items-center justify-between pt-3 pb-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium">{userItem.name}</p>
                      <p className="text-sm text-gray-500 font-extralight">{userItem.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: 
                            userItem.role === "Pemilik" ? "#4CAF50" : 
                            userItem.role === "Administrator" ? "#FFC107" : 
                            "#3B82F6",
                          color: userItem.role === "Administrator" ? "#000" : "#fff",
                        }}
                      >{userItem.role}</span>
                      
                      {/* Show delete button only if current user is Pemilik and not trying to delete themselves */}
                      {user && user.role === "Pemilik" && user.id !== userItem.id && (
                        <button
                          onClick={() => handleDeleteUser(userItem.id)}
                          disabled={isDeleting}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Remove user"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
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