import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Roles classification
const CORE_ADMIN_ROLES = ["ADMIN_DESA", "KADES", "SEKDES", "KASI", "KAUR", "OPERATOR_DESA", "RT", "RW", "KADUS", "POSYANDU", "PUSKESOS"];
const INSTITUTIONAL_ROLES = ["PKK", "LPM", "BPD", "KARANG_TARUNA", "PETUGAS_SENSUS", "TP_PKK"];
const MASTER_ROLES = ["ADMIN_MASTER"];
const RESIDENT_ROLES = ["WARGA"];

interface CustomJWT {
  role?: string;
  isFirstLogin?: boolean;
}

// Simple in-memory rate limiter with automatic stale key eviction
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // max requests per window per IP
const MAX_MAP_SIZE = 2000;

function cleanupRateLimitMap(now: number) {
  if (rateLimitMap.size > MAX_MAP_SIZE) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.delete(key);
      }
    }
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      cleanupRateLimitMap(now);
      const record = rateLimitMap.get(ip);
      
      if (record) {
          if (now - record.timestamp > RATE_LIMIT_WINDOW) {
              rateLimitMap.set(ip, { count: 1, timestamp: now });
          } else {
              record.count++;
              if (record.count > MAX_REQUESTS) {
                  return new NextResponse('Too Many Requests - Rate limit exceeded. Please try again later.', { 
                      status: 429,
                      headers: {
                          'Retry-After': '60',
                          'Content-Type': 'text/plain'
                      }
                  });
              }
          }
      } else {
          rateLimitMap.set(ip, { count: 1, timestamp: now });
      }
  }
  
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuth = !!token;
  const role = (token as CustomJWT)?.role || "";

    // 1. Public routes & API auth
    if (pathname === "/login" || pathname === "/" || pathname.startsWith("/api/auth")) {
    if (isAuth && (pathname === "/login" || pathname === "/")) {
      if (CORE_ADMIN_ROLES.includes(role)) return NextResponse.redirect(new URL("/dashboard", req.url));
      if (INSTITUTIONAL_ROLES.includes(role)) return NextResponse.redirect(new URL("/kelembagaan", req.url));
      if (MASTER_ROLES.includes(role)) return NextResponse.redirect(new URL("/master-admin", req.url));
      if (RESIDENT_ROLES.includes(role)) return NextResponse.redirect(new URL("/resident", req.url));
    }
    return NextResponse.next();
  }

  // Auth Guard
  if (!isAuth) {
    if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 1. Core Dashboard Guard
  if (pathname.startsWith("/dashboard")) {
    if (!CORE_ADMIN_ROLES.includes(role)) {
      if (INSTITUTIONAL_ROLES.includes(role)) return NextResponse.redirect(new URL("/kelembagaan", req.url));
      if (MASTER_ROLES.includes(role)) return NextResponse.redirect(new URL("/master-admin", req.url));
      if (RESIDENT_ROLES.includes(role)) return NextResponse.redirect(new URL("/resident", req.url));
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 2. Kelembagaan Guard
  if (pathname.startsWith("/kelembagaan")) {
    if (!INSTITUTIONAL_ROLES.includes(role)) {
      if (CORE_ADMIN_ROLES.includes(role)) return NextResponse.redirect(new URL("/dashboard", req.url));
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 3. Master Admin Guard
  if (pathname.startsWith("/master-admin")) {
    if (!MASTER_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 4. Resident Guard
  if (pathname.startsWith("/resident")) {
    if (!RESIDENT_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // First Login Check
  if ((token as CustomJWT)?.isFirstLogin && !pathname.includes("/setup-account") && !pathname.startsWith("/api")) {
    const setupPath = INSTITUTIONAL_ROLES.includes(role) ? "/kelembagaan/setup-account" : "/dashboard/setup-account";
    return NextResponse.redirect(new URL(setupPath, req.url));
  }

  const response = NextResponse.next();
  // Add extra dynamic Security Headers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/master-admin/:path*", 
    "/resident/:path*", 
    "/kelembagaan/:path*",
    "/login",
    "/api/:path*"
  ],
};
