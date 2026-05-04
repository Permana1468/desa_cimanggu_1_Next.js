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
    
    // Check if the role is allowed for dashboard
    if (!officialRoles.includes(role)) {
      // Redirect to their respective dashboards
      if (role === "ADMIN_MASTER") return NextResponse.redirect(new URL("/master-admin", req.url));
      if (role === "WARGA") return NextResponse.redirect(new URL("/resident", req.url));
      // Default fallback
      return NextResponse.redirect(new URL("/", req.url));
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

  const response = NextResponse.next();

  // SECURITY HEADERS
  // ---------------------------------------------------------
  // 1. Content Security Policy (Anti-XSS & Injection)
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://images.unsplash.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, " ").trim();
  response.headers.set("Content-Security-Policy", csp);

  // 2. Anti-Clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // 3. Anti-MIME Sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // 4. Privacy & Tracking Protection
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 5. Secure Transport (HSTS)
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  // 6. Feature Control
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

  return response;
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*", 
    "/master-admin",
    "/master-admin/:path*", 
    "/resident",
    "/resident/:path*", 
    "/kelembagaan",
    "/kelembagaan/:path*"
  ],
};
