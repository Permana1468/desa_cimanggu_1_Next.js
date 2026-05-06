import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuth = !!token;
  const role = (token as any)?.role;

  // 1. Protection for /dashboard (Village Admin & Officials)
  const officialRoles = ["ADMIN_DESA", "KADES", "SEKDES", "RT", "RW", "PKK", "POSYANDU", "LPM", "BPD", "KASI", "KAUR", "KADUS", "KARANG_TARUNA"];
  
  if (pathname.startsWith("/dashboard")) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    if (!officialRoles.includes(role)) {
      if (role === "ADMIN_MASTER") return NextResponse.redirect(new URL("/master-admin", req.url));
      if (role === "WARGA") return NextResponse.redirect(new URL("/resident", req.url));
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Redirect to setup-account if first login
    if ((token as any).isFirstLogin && pathname !== "/dashboard/setup-account") {
      return NextResponse.redirect(new URL("/dashboard/setup-account", req.url));
    }
  }

  // 2. Protection for /master-admin (Admin Master only)
  if (pathname.startsWith("/master-admin")) {
    if (!isAuth || role !== "ADMIN_MASTER") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 3. Protection for /resident (Warga)
  if (pathname.startsWith("/resident")) {
    if (!isAuth || role !== "WARGA") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 4. Protection for /kelembagaan (Specific institutional roles)
  const institutionalRoles = ["RT", "RW", "PKK", "POSYANDU", "KARANG_TARUNA", "LPM", "BPD"];
  if (pathname.startsWith("/kelembagaan")) {
    if (!isAuth || !institutionalRoles.includes(role)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 5. API Protection (Except for auth)
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    if (!isAuth) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized access" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/master-admin/:path*", 
    "/resident/:path*", 
    "/kelembagaan/:path*",
    "/api/:path*"
  ],
};
