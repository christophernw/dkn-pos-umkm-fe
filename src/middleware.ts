import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const PROTECTED_ROUTES = ["daftarProduk", "semuaBarang"];

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.includes(route)
  );

  if (isProtectedRoute) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        const loginUrl = new URL(`${request.nextUrl.origin}/login`);
        loginUrl.searchParams.set("redirect", pathname);
        
        return NextResponse.redirect(loginUrl);
      }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};