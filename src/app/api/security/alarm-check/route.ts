import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { consumeUserWarning } from "@/lib/cyberSecurityBridge";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ alarm: null });
    }
    const user = session.user as any;
    const ids = [user.id, user.email, user.name].filter(Boolean);

    for (const id of ids) {
      const warning = consumeUserWarning(String(id));
      if (warning) {
        return NextResponse.json({ alarm: warning });
      }
    }
    return NextResponse.json({ alarm: null });
  } catch {
    return NextResponse.json({ alarm: null });
  }
}

