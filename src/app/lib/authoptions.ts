import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions, User } from "next-auth";
import { list } from "postcss";

export const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.users = user.users
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          ...session.user,
          name: token.name as string,
          email: token.email as string,
          picture: token.picture as string,
        };
      } 
      return session;
    },
  },
};
