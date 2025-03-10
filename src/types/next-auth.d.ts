// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { User } from "next-auth";

declare module "next-auth" {
    interface User extends DefaultUser {
        id: string;
        email: string;
        name: string;
        picture: string;
    }

    interface Session {
        user: User;
    }
}