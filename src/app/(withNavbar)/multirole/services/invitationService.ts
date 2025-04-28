// src/app/(withNavbar)/multirole/services/invitationService.ts

import config from "@/src/config";

export interface PendingInvitation {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
  expires_at: string;
}

export interface InvitationPayload {
  name: string;
  email: string;
  role: "Pengelola" | "Karyawan";
  accessToken: string;
}

export interface InvitationResponse {
  success: boolean;
  message?: string;
  token?: string;
  error?: string;
}

export async function sendInvitation(data: InvitationPayload): Promise<Response> {
  return fetch(`${config.apiUrl}/auth/send-invitation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.accessToken}`,
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      role: data.role,
    }),
  });
}

export async function getPendingInvitations(accessToken: string): Promise<PendingInvitation[]> {
  const response = await fetch(`${config.apiUrl}/auth/pending-invitations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch pending invitations");
  }

  return response.json();
}

export async function deleteInvitation(invitationId: number, accessToken: string): Promise<{ message: string }> {
  const response = await fetch(`${config.apiUrl}/auth/delete-invitation/${invitationId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete invitation");
  }

  return response.json();
}