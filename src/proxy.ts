import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;

    // 1. Check for Hidden Route Access (Admin Master only)
    if (pathname.startsWith("/master-admin")) {
      if (token?.role !== "ADMIN_MASTER") {
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
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/master-admin/:path*"],
};
