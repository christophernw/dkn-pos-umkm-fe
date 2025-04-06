export interface InvitationPayload {
    name: string;
    email: string;
    role: "Pemilik" | "Karyawan";
    accessToken: string;
  }
  
  export interface InvitationResponse {
    success: boolean;
    message?: string;
    token?: string;
    error?: string;
  }
  