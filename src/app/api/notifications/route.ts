import { NextResponse } from "next/server";
import { getLiveNotifications } from "@/actions/notifications";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// In-memory 15s cache per user ID to eliminate redundant DB querying across multiple header/drawer components
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 15000;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ notifications: [] });
    }

    const userId = (session.user as any).id || (session.user as any).email || "anonymous";
    const now = Date.now();
    const cached = cache.get(userId);

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ notifications: cached.data });
    }

    const data = await getLiveNotifications();
    cache.set(userId, { timestamp: now, data });

    return NextResponse.json({ notifications: data });
  } catch (error) {
    console.error("[API_NOTIFICATIONS_ERROR]", error);
    return NextResponse.json({ notifications: [] });
  }
}

