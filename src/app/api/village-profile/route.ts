import { NextResponse } from "next/server";
import { getVillageProfile, updateVillageProfile } from "@/actions/landing";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const profile = await getVillageProfile();
        return NextResponse.json(profile);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch village profile" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const updated = await updateVillageProfile(data);
        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Failed to update village profile" }, { status: 500 });
    }
}
