import { InvitationPayload, InvitationResponse } from "../types/types";

export async function sendInvitation(data: InvitationPayload): Promise<Response> {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-invitation`, {
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
