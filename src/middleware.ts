import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Routes protected for regular users
  const PROTECTED_ROUTES = ["informasi", "semuaBarang","multirole","pengaturan", "tambahProduk", "transaksi", "report", ""];
  
  // Routes forbidden for BPR users
  const BPR_FORBIDDEN_ROUTES = ["tambahProduk", "tambahPemasukan", "tambahPengeluaran", "tambahTransaksi", "editProduk", "transaksi/detail", "informasi", "semuaBarang", "laporan"];

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
    
    // Check if user is BPR - using optional chaining to safely access properties
    const isBPRUser = token.user?.is_bpr === true;
    
    if (isBPRUser) {
      const isAccessingForbiddenRoute = BPR_FORBIDDEN_ROUTES.some(route => 
        pathname.includes(route)
      );
      
      // If BPR user is trying to access a forbidden route, redirect to BPR home
      if (isAccessingForbiddenRoute) {
        return NextResponse.redirect(new URL('/bpr', request.nextUrl.origin));
      }
      
      // If BPR user is at root, redirect to BPR home
      if (pathname === "/") {
        return NextResponse.redirect(new URL('/bpr', request.nextUrl.origin));
      }
    } else {
      // Regular user trying to access BPR routes
      const isAccessingBPRRoute = pathname.startsWith('/bpr');
      
      if (isAccessingBPRRoute) {
        return NextResponse.redirect(new URL('/', request.nextUrl.origin));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};