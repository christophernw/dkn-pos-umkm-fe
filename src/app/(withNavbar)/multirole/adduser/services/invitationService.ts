import config from "@/src/config";
import { InvitationPayload, InvitationResponse } from "../types/Invitation";

const INVITE_ENDPOINT = `${config.apiUrl}/auth/send-invitation`;

export async function sendInvitation(data: InvitationPayload): Promise<Response> {
  try {
    const response = await fetch(INVITE_ENDPOINT, {
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

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Error sending invitation:", error);
    throw error;
  }
}

