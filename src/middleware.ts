import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Explicitly define routes middleware should run on
export const config = {
  matcher: [
    // Match exact paths and their sub-paths
    '/informasi/:path*', '/informasi',
    '/semuaBarang/:path*', '/semuaBarang',
    '/multirole/:path*', '/multirole',
    '/pengaturan/:path*', '/pengaturan',
    '/tambahProduk/:path*', '/tambahProduk',
    '/transaksi/:path*', '/transaksi',
    '/tambahTransaksi/:path*', '/tambahTransaksi',
  ]
};

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for login page
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Check for token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL(`${request.nextUrl.origin}/login`);
    loginUrl.searchParams.set("redirect", pathname);
    
    // Add cache control headers to prevent caching
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  // User is authenticated
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}