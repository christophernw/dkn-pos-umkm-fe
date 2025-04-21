"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import config from "@/src/config";
import { Trash, MailX } from "lucide-react";

interface User {
  id: number | null;
  email: string;
  name: string;
  role: "Pemilik" | "Pengelola" | "Karyawan";
  status: "active" | "pending";
}

const UserList = () => {
  const { user, accessToken } = useAuth();
  const { showModal, hideModal } = useModal();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error("You are not authenticated");
      }

      const response = await fetch(`${config.apiUrl}/auth/get-users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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

  // OCP (60-117)
  const actions = {
    pending: {
      label: "Batalkan",
      endpoint: `${config.apiUrl}/auth/cancel-invitation`,
      successMessage: "Undangan berhasil dibatalkan!",
      errorMessage: "Gagal membatalkan undangan",
    },
    active: {
      label: "Hapus",
      endpoint: `${config.apiUrl}/auth/remove-user-from-toko`,
      successMessage: "Pengguna berhasil dihapus!",
      errorMessage: "Gagal menghapus pengguna",
    },
  };

  const handleActionOnUser = async (userItem: User) => {
    const action = userItem.status === "pending" ? actions.pending : actions.active;
    const body = { user_id: userItem.id };

    showModal(
      "Konfirmasi",
      `Apakah Anda yakin ingin ${action.label.toLowerCase()}?`,
      "info",
      {
        label: action.label,
        onClick: async () => {
          try {
            setIsDeleting(true);
            setError(null);

            const response = await fetch(action.endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(body),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Request failed");
            }

            await fetchUsers();
            showModal("Berhasil", action.successMessage, "success");
          } catch (error: any) {
            setError(error.message);
            showModal("Gagal", `${action.errorMessage}: ${error.message}`, "error");
          } finally {
            setIsDeleting(false);
          }
        },
      },
      { label: "Batal", onClick: hideModal }
    );
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold pb-3 border-b">
        Informasi Pengguna
      </h2>
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
                  <li
                    key={userItem.email}
                    className="flex items-center justify-between pt-3 pb-3 border-b border-gray-100"
                  >
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {userItem.name}
                        {userItem.status === "pending" && (
                          <span className="text-xs text-gray-400">(Pending)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 font-extralight">
                        {userItem.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            userItem.status === "pending"
                              ? "#9CA3AF"
                              : userItem.role === "Pemilik"
                              ? "#4CAF50"
                              : userItem.role === "Pengelola"
                              ? "#FFC107"
                              : "#3B82F6",
                          color:
                            userItem.status === "pending"
                              ? "#000"
                              : userItem.role === "Pengelola"
                              ? "#000"
                              : "#fff",
                        }}
                      >
                        {userItem.role}
                      </span>

                      {user &&
                        user.role === "Pemilik" &&
                        user.id !== userItem.id && (
                          <button
                            onClick={() => handleActionOnUser(userItem)}
                            disabled={isDeleting}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title={userItem.status === "pending" ? "Cancel invitation" : "Remove user"}
                          >
                            {userItem.status === "pending" ? (
                              <MailX size={16} />
                            ) : (
                              <Trash size={16} />
                            )}
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
