import NextAuth from "next-auth";
import { options } from "./authoptions";

const handler = NextAuth(options);

export const auth = handler.auth;