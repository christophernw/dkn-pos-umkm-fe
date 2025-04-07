export interface InvitationPayload {
    name: string;
    email: string;
    role: "Administrator" | "Karyawan";
    accessToken: string;
  }
  
  export interface InvitationResponse {
    success: boolean;
    message?: string;
    token?: string;
    error?: string;
  }
  