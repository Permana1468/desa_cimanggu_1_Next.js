import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";
import { NextRequest } from "next/server";

async function authHandler(req: NextRequest, context: any) {
    const host = req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
    
    // Dynamically update NEXTAUTH_URL to match the requesting device's IP / Host
    process.env.NEXTAUTH_URL = `${proto}://${host}`;

    return NextAuth(req as any, context, authOptions);
}

export { authHandler as GET, authHandler as POST };
