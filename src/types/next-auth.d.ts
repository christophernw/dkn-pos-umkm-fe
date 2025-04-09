import NextAuth, { User } from "next-auth";

declare module "next-auth" {
    interface User extends DefaultUser {
        id: string;
        email: string;
        name: string;
        users: User[];
        picture: string;
    }

    interface Session {
        user: User;
    }
}