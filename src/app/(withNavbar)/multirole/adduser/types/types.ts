export interface InvitationPayload {
    name: string;
    email: string;
    role: "Manajer" | "Karyawan";
    accessToken: string;
  }
  
  export interface InvitationResponse {
    success: boolean;
    token?: string;
    error?: string;
  }
  