import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuth = !!token;
  const { pathname } = req.nextUrl;

  // 1. Check for Hidden Route Access (Admin Master only)
  if (pathname.startsWith("/master-admin")) {
    if (!isAuth || (token as any).role !== "ADMIN_MASTER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 2. Check for General Dashboard Access
  if (pathname.startsWith("/dashboard")) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/master-admin/:path*"],
};
