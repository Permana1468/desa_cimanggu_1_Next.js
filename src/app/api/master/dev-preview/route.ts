import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const rawTo = req.nextUrl.searchParams.get("to") || "/umkm";
  const safeTo = rawTo.startsWith("/") && !rawTo.startsWith("//") ? rawTo : "/umkm";
  const disable = req.nextUrl.searchParams.get("disable") === "1";

  const redirectUrl = new URL(safeTo, req.url);
  const res = NextResponse.redirect(redirectUrl);

  if (role !== "ADMIN_MASTER") {
    return res;
  }

  if (disable) {
    res.cookies.delete("dev_maintenance_bypass");
  } else {
    res.cookies.set("dev_maintenance_bypass", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 4, // 4 jam
    });
  }

  return res;
}

