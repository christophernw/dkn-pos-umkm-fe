import NextAuth, { DefaultSession, DefaultUser, JWT } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    users: User[];
    picture: string;
    is_bpr?: boolean;
    role?: string;
  }

  interface Session extends DefaultSession {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user?: {
      id: string;
      email: string;
      name: string;
      users?: any[];
      picture?: string;
      is_bpr?: boolean;
      role?: string;
    }
  }
}