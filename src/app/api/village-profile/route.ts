import { NextResponse } from "next/server";
import { getVillageProfile } from "@/actions/landing";

export async function GET() {
    try {
        const profile = await getVillageProfile();
        return NextResponse.json(profile);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch village profile" }, { status: 500 });
    }
}
