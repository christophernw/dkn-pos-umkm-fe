"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import config from "@/src/config";
import { Trash } from "lucide-react";
import {
  getPendingInvitations,
  deleteInvitation,
  PendingInvitation,
} from "../services/invitationService";
import { sendRemovalNotificationEmail } from "@/src/app/lib/emailservice";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!accessToken) throw new Error("Not authenticated");

      const userRes = await fetch(`${config.apiUrl}/auth/get-users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userRes.ok) throw new Error("Failed to fetch users");
      setUsers(await userRes.json());

      const invitations = await getPendingInvitations(accessToken);
      setPendingInvitations(invitations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) fetchData();
  }, [accessToken, fetchData]);

  const confirmAction = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>
  ) => {
    showModal(title, message, "info", {
      label: "Hapus",
      onClick: async () => {
        try {
          setIsDeleting(true);
          await onConfirm();
        } catch (err: any) {
          setError(err.message);
          showModal("Gagal", err.message, "error");
        } finally {
          setIsDeleting(false);
        }
      },
    }, { label: "Batal", onClick: hideModal });
  };

  const handleDeleteUser = (userToRemove: User) => {
    confirmAction("Konfirmasi", "Apakah Anda yakin ingin menghapus pengguna ini?", async () => {
      const res = await fetch(`${config.apiUrl}/auth/remove-user-from-toko`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ user_id: userToRemove.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus pengguna");
      }

      await sendRemovalNotificationEmail({
        to: userToRemove.email,
        senderName: user?.name || "Store Owner",
        senderEmail: user?.email || "no-reply@example.com",
        userName: userToRemove.name,
        ownerName: user?.name || "Store Owner",
      }).catch(console.error);

      await fetchData();
      showModal("Berhasil", "Pengguna berhasil dihapus!", "success");
    });
  };

  const handleDeleteInvitation = (id: number) => {
    confirmAction("Konfirmasi", "Apakah Anda yakin ingin menghapus undangan ini?", async () => {
      await deleteInvitation(id, accessToken || "");
      await fetchData();
      showModal("Berhasil", "Undangan berhasil dihapus!", "success");
    });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const renderUserRoleTag = (role: User["role"]) => {
    const color = {
      Pemilik: "#4CAF50",
      Pengelola: "#FFC107",
      Karyawan: "#3B82F6",
    }[role];
    const textColor = role === "Pengelola" ? "#000" : "#fff";

    return (
      <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: color, color: textColor }}>
        {role}
      </span>
    );
  };

  const renderUserItem = (userItem: User) => (
    <li key={userItem.id} className="flex justify-between items-center py-3 border-b">
      <div>
        <p className="font-medium">{userItem.name}</p>
        <p className="text-sm text-gray-500">{userItem.email}</p>
      </div>
      <div className="flex gap-2 items-center">
        {renderUserRoleTag(userItem.role)}
        {user?.role === "Pemilik" && user.id !== userItem.id && (
          <button
            onClick={() => handleDeleteUser(userItem)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
            title="Remove user"
          >
            <Trash size={16} />
          </button>
        )}
      </div>
    </li>
  );

  const renderInvitationItem = (inv: PendingInvitation) => (
    <li key={inv.id} className="flex justify-between items-center py-3 border-b">
      <div>
        <p className="font-medium">{inv.name}</p>
        <p className="text-sm text-gray-500">{inv.email}</p>
        <p className="text-xs text-gray-400 mt-1">Kadaluarsa: {formatDate(inv.expires_at)}</p>
      </div>
      <div className="flex items-center gap-2">
        {renderUserRoleTag(inv.role as "Pemilik" | "Pengelola" | "Karyawan")}
        <button
          onClick={() => handleDeleteInvitation(inv.id)}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
          title="Delete invitation"
        >
          <Trash size={16} />
        </button>
      </div>
    </li>
  );

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold pb-3 border-b">Informasi Pengguna</h2>
      {loading ? (
        <p className="py-3 text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <h3 className="font-medium text-sm mt-3 mb-2 text-gray-600">Pengguna Aktif</h3>
          <ul>{users.length > 0 ? users.map(renderUserItem) : <p className="py-3 text-gray-500">Tidak ada pengguna yang ditemukan.</p>}</ul>

          {pendingInvitations.length > 0 && (
            <>
              <h3 className="font-medium text-sm mt-4 mb-2 text-gray-600">Undangan Tertunda</h3>
              <ul>{pendingInvitations.map(renderInvitationItem)}</ul>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default UserList;