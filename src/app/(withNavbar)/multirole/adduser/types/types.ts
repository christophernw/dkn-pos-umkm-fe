export interface InvitationPayload {
    name: string;
    email: string;
    role: "Pemilik" | "Karyawan";
    accessToken: string;
  }
  
  export interface InvitationResponse {
    success: boolean;
    token?: string;
    error?: string;
  }
  