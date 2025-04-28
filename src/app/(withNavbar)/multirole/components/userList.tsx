"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import config from "@/src/config";
import { Trash, Clock } from "lucide-react";
import { getPendingInvitations, deleteInvitation, PendingInvitation } from "../services/invitationService";
import { sendRemovalNotificationEmail } from "@/src/app/lib/sendRemovalNotificationEmail";

interface User {
  id: number;
  email: string;
  name: string;
  role: "Pemilik" | "Pengelola" | "Karyawan";
}

const UserList = () => {
  const { user, accessToken } = useAuth();
  const { showModal, hideModal } = useModal();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error("You are not authenticated");
      }

      // Fetch users
      const usersResponse = await fetch(`${config.apiUrl}/auth/get-users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users");
      }

      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Fetch pending invitations
      if (user) {
        try {
          const pendingInvitationsData = await getPendingInvitations(accessToken);
          setPendingInvitations(pendingInvitationsData);
        } catch (invitationError) {
          console.error("Error fetching invitations:", invitationError);
          // Don't fail the whole component if just invitations fail
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accessToken, user]);

  const handleDeleteUser = async (userToRemove: User) => {
    showModal(
      "Konfirmasi",
      "Apakah Anda yakin ingin menghapus pengguna ini?",
      "info",
      {
        label: "Hapus",
        onClick: async () => {
          try {
            setIsDeleting(true);
            setError(null);
  
            const response = await fetch(
              `${config.apiUrl}/auth/remove-user-from-toko`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ user_id: userToRemove.id }),
              }
            );
  
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to remove user");
            }

            const responseData = await response.json();

            // Send email notification from the frontend in addition to backend email
            // This provides redundancy in case backend email delivery fails
            try {
              await sendRemovalNotificationEmail({
                to: userToRemove.email,
                userName: userToRemove.name,
                ownerName: user?.name || "Store Owner"
              });
            } catch (emailError) {
              console.error("Frontend email sending failed:", emailError);
              // Continue even if frontend email fails
            }

            // Refresh the user list after successful deletion
            await fetchData();

            // Show success message
            showModal("Berhasil", "Pengguna berhasil dihapus dan notifikasi telah dikirim!", "success");
          } catch (error: any) {
            setError(error.message);
            showModal(
              "Gagal",
              `Gagal menghapus pengguna: ${error.message}`,
              "error"
            );
          } finally {
            setIsDeleting(false);
          }
        },
      },
      {
        label: "Batal",
        onClick: () => {
          hideModal();
        },
      }
    );
  };
  

  const handleDeleteInvitation = async (invitationId: number) => {
    showModal(
      "Konfirmasi",
      "Apakah Anda yakin ingin menghapus undangan ini?",
      "info",
      {
        label: "Hapus",
        onClick: async () => {
          try {
            setIsDeleting(true);
            setError(null);

            await deleteInvitation(invitationId, accessToken || "");
            
            // Refresh the invitations list after successful deletion
            await fetchData();

            // Show success message
            showModal("Berhasil", "Undangan berhasil dihapus!", "success");
          } catch (error: any) {
            setError(error.message);
            showModal(
              "Gagal",
              `Gagal menghapus undangan: ${error.message}`,
              "error"
            );
          } finally {
            setIsDeleting(false);
          }
        },
      },
      {
        label: "Batal",
        onClick: () => {
          hideModal();
        },
      }
    );
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric", 
        month: "short", 
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
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
            {/* Active Users */}
            {users.length === 0 ? (
              <p className="py-3 text-gray-500">Tidak ada pengguna yang ditemukan.</p>
            ) : (
              <>
                <h3 className="font-medium text-sm mt-3 mb-2 text-gray-600">
                  Pengguna Aktif
                </h3>
                <ul>
                  {users.map((userItem) => (
                    <li
                      key={userItem.id}
                      className="flex items-center justify-between pt-3 pb-3 border-b border-gray-100"
                    >
                      <div>
                        <p className="font-medium">{userItem.name}</p>
                        <p className="text-sm text-gray-500 font-extralight">
                          {userItem.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              userItem.role === "Pemilik"
                                ? "#4CAF50"
                                : userItem.role === "Pengelola"
                                ? "#FFC107"
                                : "#3B82F6",
                            color:
                              userItem.role === "Pengelola" ? "#000" : "#fff",
                          }}
                        >
                          {userItem.role}
                        </span>

                        {/* Show delete button only if current user is Pemilik and not trying to delete themselves */}
                        {user &&
                          user.role === "Pemilik" &&
                          user.id !== userItem.id && (
                            <button
                              onClick={() => handleDeleteUser(userItem)}
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
              </>
            )}

            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <>
                <h3 className="font-medium text-sm mt-4 mb-2 text-gray-600">
                  Undangan Tertunda
                </h3>
                <ul>
                  {pendingInvitations.map((invitation) => (
                    <li
                      key={invitation.id}
                      className="flex items-center justify-between pt-3 pb-3 border-b border-gray-100"
                    >
                      <div>
                        <p className="font-medium">{invitation.name}</p>
                        <p className="text-sm text-gray-500 font-extralight">
                          {invitation.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Kadaluarsa: {formatDate(invitation.expires_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* <span
                          className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
                          style={{
                            backgroundColor: "#F3F4F6",
                            color: "#6B7280",
                          }}
                        >
                          <Clock size={12} />
                          Tertunda
                        </span> */}
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              invitation.role === "Pemilik"
                                ? "#4CAF50"
                                : invitation.role === "Pengelola"
                                ? "#FFC107"
                                : "#3B82F6",
                            color:
                              invitation.role === "Pengelola" ? "#000" : "#fff",
                          }}
                        >
                          {invitation.role}
                        </span>

                        <button
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          disabled={isDeleting}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete invitation"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;