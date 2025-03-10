
import { options } from "@/src/app/lib/authoptions";
import NextAuth from "next-auth/next";

const handler = NextAuth(options);

export { handler as GET, handler as POST };