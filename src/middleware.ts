import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
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

    if ((token as any).isFirstLogin && pathname !== "/dashboard/setup-account") {
      return NextResponse.redirect(new URL("/dashboard/setup-account", req.url));
    }
  }

  // 2. Protection for /master-admin
  if (pathname.startsWith("/master-admin")) {
    if (!isAuth || role !== "ADMIN_MASTER") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 3. Protection for /resident
  if (pathname.startsWith("/resident")) {
    if (!isAuth || role !== "WARGA") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 4. Protection for /kelembagaan
  const institutionalRoles = ["RT", "RW", "PKK", "POSYANDU", "KARANG_TARUNA", "LPM", "BPD"];
  if (pathname.startsWith("/kelembagaan")) {
    if (!isAuth || !institutionalRoles.includes(role)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 5. API Protection — public routes exempt from auth
  const publicApiRoutes = ["/api/auth", "/api/village-profile"];
  if (pathname.startsWith("/api") && !publicApiRoutes.some(r => pathname.startsWith(r))) {
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
