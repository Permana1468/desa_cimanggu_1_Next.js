import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isMasterAdmin = token?.role === "ADMIN_MASTER";
    const isMasterPath = req.nextUrl.pathname.startsWith("/master-admin");

    if (isMasterPath && !isMasterAdmin) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/master-admin/:path*", "/dashboard/:path*"],
};
